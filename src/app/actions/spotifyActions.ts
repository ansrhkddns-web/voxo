'use server';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getAccessToken() {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error("VOXO_SYSTEM: Spotify Credentials Missing in Environment");
        return null;
    }

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${CLIENT_ID.trim()}:${CLIENT_SECRET.trim()}`).toString('base64')}`,
            },
            body: 'grant_type=client_credentials',
            cache: 'no-store',
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error(`VOXO_SYSTEM: Spotify Token Fetch Failed (${response.status}): ${errBody}`);
            return null;
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("VOXO_SYSTEM: Spotify Token Exception ->", error);
        return null;
    }
}

function parseSpotifyId(input: string) {
    if (!input) return null;
    const trimmed = input.trim().replace(/\/$/, '');

    if (trimmed.startsWith('spotify:')) {
        const parts = trimmed.split(':');
        if (parts.length >= 3) {
            return { type: parts[1], id: parts[2] };
        }
    }

    if (trimmed.includes('open.spotify.com')) {
        try {
            const url = new URL(trimmed);
            const pathParts = url.pathname.split('/').filter(Boolean);
            const supportedTypes = ['track', 'album', 'artist', 'playlist'];
            const typeIndex = pathParts.findIndex(p => supportedTypes.includes(p));

            if (typeIndex !== -1 && pathParts[typeIndex + 1]) {
                return {
                    type: pathParts[typeIndex],
                    id: pathParts[typeIndex + 1]
                };
            }
        } catch (e) {
            console.error("VOXO_SYSTEM: URL Parsing Exception ->", trimmed);
        }
    }

    return null;
}

/**
 * Gets artist stats by Spotify Artist ID directly.
 * Now returns diagnostic info if it fails.
 */
async function getArtistById(artistId: string, fetchOptions: RequestInit) {
    try {
        const artistRes = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, fetchOptions);

        if (!artistRes.ok) {
            const errBody = await artistRes.text();
            console.error(`VOXO_DEBUG: Artist fetch failed (${artistRes.status}). Body: ${errBody}`);
            return { error: `Spotify API Error (${artistRes.status}): ${errBody.substring(0, 50)}` };
        }

        const albumsRes = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?limit=5&include_groups=album,single&market=US`, fetchOptions);

        const artistData = await artistRes.json();
        const albumsData = albumsRes.ok ? await albumsRes.json() : { items: [] };

        return {
            name: artistData.name,
            followers: artistData.followers?.total || 0,
            genres: artistData.genres?.slice(0, 3) || [],
            image: artistData.images?.[0]?.url,
            secondary_image: artistData.images?.[1]?.url || artistData.images?.[0]?.url,
            popularity: artistData.popularity,
            external_url: artistData.external_urls?.spotify || `https://open.spotify.com/artist/${artistId}`,
            topTracks: [],
            latestReleases: (albumsData.items || []).slice(0, 3).map((a: any) => ({
                id: a.id,
                name: a.name,
                release_date: a.release_date,
                image: a.images?.[0]?.url,
                type: a.album_group || a.album_type
            }))
        };
    } catch (e: any) {
        return { error: `Internal fetch exception: ${e.message}` };
    }
}

export async function getArtistStats(
    uriOrUrl: string,
    artistName?: string,
    artistSpotifyId?: string
) {
    try {
        const token = await getAccessToken();
        if (!token) return { error: "Token acquisition failed. Check Credentials." };

        const fetchOptions = { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' as RequestInit['cache'] };

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // PATH 1: Direct Artist ID (Most Reliable)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (artistSpotifyId && artistSpotifyId.trim().length > 0) {
            const result = await getArtistById(artistSpotifyId.trim(), fetchOptions);
            // If result has data (name), return it. If it has error string, return that.
            if (result && 'name' in result) return result;
            if (result && 'error' in result) return result;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // PATH 2: URI direct artist
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const parsed = uriOrUrl ? parseSpotifyId(uriOrUrl) : null;
        if (parsed?.type === 'artist') {
            const result = await getArtistById(parsed.id, fetchOptions);
            if (result && 'name' in result) return result;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // PATH 3: Resolve via Link
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (parsed && parsed.type !== 'artist') {
            const { type, id } = parsed;
            const res = await fetch(`https://api.spotify.com/v1/${type}s/${id}`, fetchOptions as RequestInit);

            if (res.ok) {
                const data = await res.json();
                let resolvedArtistId: string | null = null;

                if (type === 'track' || type === 'album') {
                    resolvedArtistId = data.artists?.[0]?.id || null;
                } else if (type === 'playlist') {
                    resolvedArtistId = data.tracks?.items?.[0]?.track?.artists?.[0]?.id || null;
                }

                if (resolvedArtistId) {
                    const result = await getArtistById(resolvedArtistId, fetchOptions);
                    if (result && 'name' in result) return result;
                }
            }
        }

        // All paths exhausted
        const hint = artistSpotifyId
            ? "API RESTRICTION: Direct ID fetch failed. Check ID correctness."
            : "ID REQUIRED: Spotify 2026 Policy blocks auto-search. Enter Artist ID in Admin.";
        return { error: hint };

    } catch (error: any) {
        console.error("VOXO_SYSTEM: getArtistStats Critical Error ->", error);
        return { error: `System exception: ${error.message?.substring(0, 30)}` };
    }
}

function formatDuration(ms: number) {
    if (!ms) return "0:00";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
