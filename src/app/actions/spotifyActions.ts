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

    const token = await getAccessToken();
    const parts = uri.split(':');
    const type = parts[1];
    const id = parts[2];

    const response = await fetch(`https://api.spotify.com/v1/${type}s/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) return null;
    return response.json();
}
