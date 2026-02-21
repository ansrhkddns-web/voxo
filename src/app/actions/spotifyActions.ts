'use server';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getAccessToken() {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error("VOXO_SYSTEM: Spotify Credentials Missing");
        return null;
    }

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
            },
            body: 'grant_type=client_credentials',
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error("VOXO_SYSTEM: Spotify Token Fetch Failed ->", response.status);
            return null;
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("VOXO_SYSTEM: Spotify Token error ->", error);
        return null;
    }
}

/**
 * Robust helper to extract Spotify Type and ID from diverse URL/URI formats
 */
function parseSpotifyId(input: string) {
    if (!input) return null;

    // Handle URI format: spotify:track:xxx
    if (input.startsWith('spotify:')) {
        const parts = input.split(':');
        if (parts.length >= 3) {
            return { type: parts[1], id: parts[2] };
        }
    }

    // Handle URL format: https://open.spotify.com/intl-ko/track/xxx?si=...
    if (input.includes('open.spotify.com')) {
        try {
            const url = new URL(input);
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
            console.error("VOXO_SYSTEM: URL Parsing Exception ->", input);
        }
    }

    console.warn("VOXO_SYSTEM: Unrecognized Spotify format ->", input);
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
        });

        if (!response.ok) return null;
        return response.json();
    } catch (error) {
        console.error("VOXO_SYSTEM: Spotify API Error ->", error);
        return null;
    }
}

export async function getArtistStats(uriOrUrl: string) {
    const parsed = parseSpotifyId(uriOrUrl);
    if (!parsed) return null;

    try {
        const token = await getAccessToken();
        if (!token) return null;

        const { type, id } = parsed;
        let artistId = (type === 'artist') ? id : null;

        // Resolution Phase: Find the primary artist ID
        if (type === 'track') {
            const res = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                artistId = data.artists?.[0]?.id || null;
            }
        } else if (type === 'album') {
            const res = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                artistId = data.artists?.[0]?.id || null;
            }
        } else if (type === 'playlist') {
            // For playlists, try to resolve to the artist of the FIRST track
            const res = await fetch(`https://api.spotify.com/v1/playlists/${id}/tracks?limit=1`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                artistId = data.items?.[0]?.track?.artists?.[0]?.id || null;
            }
        }

        if (!artistId) {
            console.warn("VOXO_SYSTEM: Could not resolve Artist ID for ->", { type, id });
            return null;
        }

        // Fetch Phase: Details + Top Tracks
        const [artistRes, topTracksRes] = await Promise.all([
            fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
                headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=KR`, {
                headers: { Authorization: `Bearer ${token}` },
            })
        ]);

        if (!artistRes.ok) {
            console.error("VOXO_SYSTEM: Artist Fetch Failed ->", artistRes.status);
            return null;
        }

        const artistData = await artistRes.json();
        const topTracksData = await topTracksRes.json();

        return {
            name: artistData.name,
            followers: artistData.followers.total,
            genres: artistData.genres.slice(0, 3),
            image: artistData.images[0]?.url,
            external_url: artistData.external_urls.spotify,
            topTracks: (topTracksData.tracks || []).slice(0, 3).map((t: any) => ({
                id: t.id,
                title: t.name,
                duration: formatDuration(t.duration_ms)
            }))
        };
    } catch (error) {
        console.error("VOXO_SYSTEM: getArtistStats Critical Error ->", error);
        return null;
    }
}

function formatDuration(ms: number) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
}
