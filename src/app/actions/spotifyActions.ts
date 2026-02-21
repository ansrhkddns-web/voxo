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

/**
 * Robust helper to extract Spotify Type and ID from diverse URL/URI formats
 */
function parseSpotifyId(input: string) {
    if (!input) return null;
    const trimmed = input.trim().replace(/\/$/, ''); // Remove trailing slashes and spaces

    // Handle URI format: spotify:track:xxx
    if (trimmed.startsWith('spotify:')) {
        const parts = trimmed.split(':');
        if (parts.length >= 3) {
            return { type: parts[1], id: parts[2] };
        }
    }

    // Handle URL format: https://open.spotify.com/intl-ko/track/xxx?si=...
    if (trimmed.includes('open.spotify.com')) {
        try {
            const url = new URL(trimmed);
            const pathParts = url.pathname.split('/').filter(Boolean);

            // Search for type keyword
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

export async function getSpotifyData(uriOrUrl: string) {
    const parsed = parseSpotifyId(uriOrUrl);
    if (!parsed) return null;

    try {
        const token = await getAccessToken();
        if (!token) return null;

        const response = await fetch(`https://api.spotify.com/v1/${parsed.type}s/${parsed.id}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store'
        });

        if (!response.ok) return null;
        return response.json();
    } catch (error) {
        return null;
    }
}

export async function getArtistStats(uriOrUrl: string, artistName?: string) {
    if (!uriOrUrl && !artistName) return { error: "No URI or Artist Name provided" };

    const parsed = uriOrUrl ? parseSpotifyId(uriOrUrl) : null;

    try {
        const token = await getAccessToken();
        if (!token) return { error: "Authentication failed (Check keys)" };

        const fetchOptions = { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' as RequestCache };
        let artistId = (parsed?.type === 'artist') ? parsed.id : null;

        // Resolution Phase 1: Try resolving via Link
        if (!artistId && parsed) {
            const { type, id } = parsed;
            console.log(`VOXO_DEBUG: Resolving ${type} ID: ${id}`);

            if (type === 'track') {
                const res = await fetch(`https://api.spotify.com/v1/tracks/${id}`, fetchOptions);
                if (res.ok) {
                    const data = await res.json();
                    artistId = data.artists?.[0]?.id || null;
                }
            } else if (type === 'album') {
                const res = await fetch(`https://api.spotify.com/v1/albums/${id}`, fetchOptions);
                if (res.ok) {
                    const data = await res.json();
                    artistId = data.artists?.[0]?.id || null;
                }
            } else if (type === 'playlist') {
                const res = await fetch(`https://api.spotify.com/v1/playlists/${id}/tracks?limit=1`, fetchOptions);
                if (res.ok) {
                    const data = await res.json();
                    artistId = data.items?.[0]?.track?.artists?.[0]?.id || null;
                }
            }
        }

        // Resolution Phase 2: Fallback to Search by Name
        if (!artistId && artistName) {
            console.log(`VOXO_DEBUG: Falling back to search for artist: ${artistName}`);
            const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`, fetchOptions);
            if (searchRes.ok) {
                const searchData = await searchRes.json();
                artistId = searchData.artists?.items?.[0]?.id || null;
            }
        }

        if (!artistId) {
            return { error: `Could not reach artist signal for ${artistName || parsed?.type || 'unknown'}` };
        }

        // Fetch Phase: Details + Top Tracks
        const [artistRes, topTracksRes] = await Promise.all([
            fetch(`https://api.spotify.com/v1/artists/${artistId}`, fetchOptions),
            fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, fetchOptions)
        ]);

        if (!artistRes.ok) {
            return { error: `Spotify API error: ${artistRes.status}` };
        }

        const artistData = await artistRes.json();
        const topTracksData = topTracksRes.ok ? await topTracksRes.json() : { tracks: [] };

        return {
            name: artistData.name,
            followers: artistData.followers?.total || 0,
            genres: artistData.genres?.slice(0, 3) || [],
            image: artistData.images?.[0]?.url,
            external_url: artistData.external_urls?.spotify || `https://open.spotify.com/artist/${artistId}`,
            topTracks: (topTracksData.tracks || []).slice(0, 3).map((t: any) => ({
                id: t.id,
                title: t.name,
                duration: formatDuration(t.duration_ms)
            }))
        };
    } catch (error: any) {
        console.error("VOXO_SYSTEM: getArtistStats Critical Error ->", error);
        return { error: `System Exception: ${error.message?.substring(0, 30)}` };
    }
}

function formatDuration(ms: number) {
    if (!ms) return "0:00";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
