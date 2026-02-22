'use server';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// VOXYN RESCUE DATA: Ensuring the main artist always appears even if API is 403
const VOXYN_MOCK_DATA = {
    name: "Voxyn",
    followers: 124580,
    genres: ["Cyber-Pop", "AI-Core", "Electronic"],
    image: "https://i.scdn.co/image/ab67616d0000b273b7a66f07a7a5a8a6a6a6a6a6", // Representative placeholder
    external_url: "https://open.spotify.com/artist/15Vp5TfG6R9vKDR2hbeF5W",
    topTracks: [
        { id: "1", title: "Default Life", duration: "3:42" },
        { id: "2", title: "Algorithm Heart", duration: "4:01" },
        { id: "3", title: "Binary Echo", duration: "3:15" }
    ],
    is_mock: true
};

async function getAccessToken() {
    if (!CLIENT_ID || !CLIENT_SECRET) return null;
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
                const id = pathParts[typeIndex + 1].split(/[?#]/)[0];
                return { type: pathParts[typeIndex], id: id };
            }
        } catch (e) { }
    }
    return null;
}

export async function getArtistStats(uriOrUrl: string, artistName?: string, manualArtistId?: string) {
    const targetId = manualArtistId?.trim();
    const isVoxyn = targetId === "15Vp5TfG6R9vKDR2hbeF5W" || artistName?.toLowerCase().includes("voxyn");

    try {
        const token = await getAccessToken();
        if (!token) {
            if (isVoxyn) return { ...VOXYN_MOCK_DATA, error: "AUTH_FAIL_RESCUE_ACTIVE" };
            return { error: "AUTH_FAILED" };
        }

        const fetchOptions = { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' as RequestCache };
        let artistId = targetId || null;

        // 1. Resolve ID from Link/URI
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

        // 2. Resolve from Search (Optimized)
        if (!artistId && artistName) {
            const cleanName = artistName.split(/[/|]/)[0].trim();
            const sRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(cleanName)}&type=artist&limit=1`, fetchOptions);
            if (sRes.ok) {
                const sData = await sRes.json();
                artistId = sData.artists?.items?.[0]?.id || null;
            }
        }

        if (!artistId) {
            if (isVoxyn) return { ...VOXYN_MOCK_DATA, error: "NO_ID_RESCUE_ACTIVE" };
            return { error: "ARTIST_NOT_FOUND" };
        }

        // 3. Final Fetch with Rescue Fallback
        const artistRes = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, fetchOptions);
        if (!artistRes.ok) {
            if (isVoxyn || artistId === "15Vp5TfG6R9vKDR2hbeF5W") return { ...VOXYN_MOCK_DATA, error: `RESCUE_ACTIVE_${artistRes.status}` };
            return { error: `API_ERROR_${artistRes.status}` };
        }

        const artistData = await artistRes.json();
        let topTracksData = { tracks: [] };
        const tRes = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, fetchOptions);
        if (tRes.ok) {
            topTracksData = await tRes.json();
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
    } catch (error) {
        if (isVoxyn) return { ...VOXYN_MOCK_DATA, error: "EXCEPTION_RESCUE_ACTIVE" };
        return { error: "SYSTEM_EXCEPTION" };
    }
}

function formatDuration(ms: number) {
    if (!ms) return "0:00";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
