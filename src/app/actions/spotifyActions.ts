'use server';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getAccessToken() {
    if (!CLIENT_ID || !CLIENT_SECRET) return null;
    try {
        const id = CLIENT_ID.trim();
        const secret = CLIENT_SECRET.trim();
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
            },
            body: 'grant_type=client_credentials',
            cache: 'no-store',
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.access_token;
    } catch (e) { return null; }
}

/**
 * Resilient Artist Fetch: Omit sub-info if it fails, but fail entirely if main info fails.
 */
async function getArtistById(artistId: string, fetchOptions: RequestInit) {
    try {
        // Step 1: Main Artist Info (Required)
        const artistRes = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, fetchOptions);

        if (!artistRes.ok) {
            const errBody = await artistRes.text();
            return { error: `Artist fetch failed (${artistRes.status}): ${errBody.substring(0, 50)}` };
        }

        const artistData = await artistRes.json();

        // Step 2: Optional Sub-info (Albums) - Omit if failed
        let latestReleases = [];
        try {
            const albumsRes = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?limit=5&include_groups=album,single&market=US`, fetchOptions);
            if (albumsRes.ok) {
                const albumsData = await albumsRes.json();
                latestReleases = (albumsData.items || []).slice(0, 3).map((a: any) => ({
                    id: a.id,
                    name: a.name,
                    release_date: a.release_date,
                    image: a.images?.[0]?.url,
                    type: a.album_group || a.album_type
                }));
            }
        } catch (subErr) {
            console.warn("Sub-fetch failed, omitting latest releases.");
        }

        return {
            name: artistData.name,
            followers: artistData.followers?.total || 0,
            genres: artistData.genres?.slice(0, 3) || [],
            image: artistData.images?.[0]?.url,
            secondary_image: artistData.images?.[1]?.url || artistData.images?.[0]?.url,
            popularity: artistData.popularity,
            external_url: artistData.external_urls?.spotify || `https://open.spotify.com/artist/${artistId}`,
            topTracks: [],
            latestReleases
        };
    } catch (e: any) {
        return { error: `Network exception: ${e.message}` };
    }
}

function parseSpotifyLink(input: string) {
    if (!input) return null;
    const trimmed = input.trim();
    if (trimmed.includes('open.spotify.com/')) {
        const parts = trimmed.split('open.spotify.com/')[1].split('?')[0].split('/');
        if (parts.length >= 2) return { type: parts[0], id: parts[1] };
    }
    if (trimmed.startsWith('spotify:')) {
        const parts = trimmed.split(':');
        if (parts.length >= 3) return { type: parts[1], id: parts[2] };
    }
    return null;
}

export async function getArtistStats(
    uriOrUrl: string,
    artistName?: string,
    artistSpotifyId?: string
) {
    try {
        const token = await getAccessToken();
        if (!token) return { error: "Authentication failed: Check Spotify credentials." };

        const fetchOptions = {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store' as RequestInit['cache']
        };

        // 1. Priority: Manual Artist ID
        if (artistSpotifyId?.trim()) {
            return await getArtistById(artistSpotifyId.trim(), fetchOptions);
        }

        // 2. Secondary: Auto-resolve from Audio Link
        const parsed = parseSpotifyLink(uriOrUrl);
        if (parsed) {
            let targetId = parsed.type === 'artist' ? parsed.id : null;

            if (!targetId && (parsed.type === 'track' || parsed.type === 'album')) {
                const res = await fetch(`https://api.spotify.com/v1/${parsed.type}s/${parsed.id}`, fetchOptions);
                if (res.ok) {
                    const data = await res.json();
                    targetId = data.artists?.[0]?.id || null;
                }
            }

            if (targetId) {
                return await getArtistById(targetId, fetchOptions);
            }
        }

        return { error: "DATA_UNAVAILABLE: No ID or resolvable link provided." };

    } catch (error: any) {
        return { error: `Server exception: ${error.message}` };
    }
}
