'use server';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getAccessToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        },
        body: 'grant_type=client_credentials',
        cache: 'no-store',
    });

    const data = await response.json();
    return data.access_token;
}

export async function getSpotifyData(uri: string) {
    if (!uri) return null;

    try {
        const token = await getAccessToken();
        let type = '';
        let id = '';

        if (uri.startsWith('spotify:')) {
            const parts = uri.split(':');
            type = parts[1];
            id = parts[2];
        } else if (uri.includes('open.spotify.com')) {
            const url = new URL(uri);
            const pathParts = url.pathname.split('/').filter(Boolean);
            type = pathParts[0];
            id = pathParts[1];
        }

        if (!type || !id) return null;

        const response = await fetch(`https://api.spotify.com/v1/${type}s/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) return null;
        return response.json();
    } catch (error) {
        console.error("Spotify API Error:", error);
        return null;
    }
}

export async function getArtistStats(uriOrUrl: string) {
    if (!uriOrUrl) return null;

    try {
        const token = await getAccessToken();
        let type = '';
        let id = '';

        if (uriOrUrl.startsWith('spotify:')) {
            const parts = uriOrUrl.split(':');
            type = parts[1];
            id = parts[2];
        } else if (uriOrUrl.includes('open.spotify.com')) {
            const url = new URL(uriOrUrl);
            const pathParts = url.pathname.split('/').filter(Boolean);
            type = pathParts[0];
            id = pathParts[1];
        }

        if (!type || !id) return null;

        let artistId = id;

        // If it's a track or album, find the artist ID first
        if (type === 'track' || type === 'album') {
            const itemResponse = await fetch(`https://api.spotify.com/v1/${type}s/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (itemResponse.ok) {
                const itemData = await itemResponse.json();
                artistId = itemData.artists[0].id;
            }
        }

        // Fetch Artist Details
        const artistResponse = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch Top Tracks
        const topTracksResponse = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!artistResponse.ok) return null;

        const artistData = await artistResponse.json();
        const topTracksData = await topTracksResponse.json();

        return {
            name: artistData.name,
            followers: artistData.followers.total,
            genres: artistData.genres.slice(0, 3),
            image: artistData.images[0]?.url,
            external_url: artistData.external_urls.spotify,
            topTracks: topTracksData.tracks.slice(0, 3).map((t: any) => ({
                id: t.id,
                title: t.name,
                duration: formatDuration(t.duration_ms)
            }))
        };
    } catch (error) {
        console.error("Spotify Artist Stats Error:", error);
        return null;
    }
}

function formatDuration(ms: number) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
}
