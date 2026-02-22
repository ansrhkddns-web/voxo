'use server';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getAccessToken() {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        return null;
    }

    try {
        const authString = Buffer.from(`${CLIENT_ID.trim()}:${CLIENT_SECRET.trim()}`).toString('base64');
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${authString}`,
            },
            body: 'grant_type=client_credentials',
            cache: 'no-store',
        });

        if (!response.ok) return null;
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        return null;
    }
}

function parseSpotifyId(input: string) {
    if (!input) return null;
    const trimmed = input.trim().replace(/\/$/, '');
    if (trimmed.startsWith('spotify:')) {
        const parts = trimmed.split(':');
        if (parts.length >= 3) return { type: parts[1], id: parts[2] };
    }
    if (trimmed.includes('open.spotify.com')) {
        try {
            const url = new URL(trimmed);
            const pathParts = url.pathname.split('/').filter(Boolean);
            const supportedTypes = ['track', 'album', 'artist', 'playlist'];
            const typeIndex = pathParts.findIndex(p => supportedTypes.includes(p));
            if (typeIndex !== -1 && pathParts[typeIndex + 1]) {
                const id = pathParts[typeIndex + 1].split('?')[0];
                return { type: pathParts[typeIndex], id: id };
            }
        } catch (e) { }
    }
    return null;
}

export async function getArtistStats(uriOrUrl: string, artistName?: string, manualArtistId?: string) {
    console.log(`VOXO_SPOTIFY: Processing [${artistName || 'Unknown'}]`);

    try {
        const token = await getAccessToken();
        if (!token) return { error: "Authentication Error" };

        const fetchOptions = { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' as RequestCache };
        let artistId = manualArtistId?.trim() || null;

        // 1. Resolve from Link/URI if ID not provided
        if (!artistId && uriOrUrl) {
            const parsed = parseSpotifyId(uriOrUrl);
            if (parsed) {
                if (parsed.type === 'artist') {
                    artistId = parsed.id;
                } else {
                    const res = await fetch(`https://api.spotify.com/v1/${parsed.type}s/${parsed.id}`, fetchOptions);
                    if (res.ok) {
                        const data = await res.json();
                        artistId = data.artists?.[0]?.id || data.artist?.id || null;
                    }
                }
            }
        }

        // 2. Fallback to Search (Quietly)
        if (!artistId && artistName) {
            const cleanName = artistName.split(/[/|]/)[0].trim();
            const sRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(cleanName)}&type=artist&limit=1`, fetchOptions);
            if (sRes.ok) {
                const sData = await sRes.json();
                artistId = sData.artists?.items?.[0]?.id || null;
            }
        }

        if (!artistId) return { error: "Artist not found" };

        // 3. Fetch Data
        const artistRes = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, fetchOptions);
        if (!artistRes.ok) {
            const status = artistRes.status;
            if (status === 403) return { error: "Access Denied (Check Spotify Dashboard)" };
            return { error: `API Error (${status})` };
        }

        const artistData = await artistRes.json();

        // Fetch Top Tracks (KR fallback to Global)
        let topTracksData = { tracks: [] };
        const tRes = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=KR`, fetchOptions);
        if (tRes.ok) {
            topTracksData = await tRes.json();
        } else {
            const tResAlt = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks`, fetchOptions);
            if (tResAlt.ok) topTracksData = await tResAlt.json();
        }

        return {
            name: artistData.name,
            followers: artistData.followers?.total || 0,
            genres: artistData.genres?.slice(0, 3) || [],
            image: artistData.images?.[0]?.url,
            external_url: artistData.external_urls?.spotify,
            topTracks: (topTracksData.tracks || []).slice(0, 3).map((t: any) => ({
                id: t.id,
                title: t.name,
                duration: formatDuration(t.duration_ms)
            }))
        };
    } catch (error: any) {
        return { error: "Network/System Error" };
    }
}

function formatDuration(ms: number) {
    if (!ms) return "0:00";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
