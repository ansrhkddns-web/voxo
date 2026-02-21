'use server';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const VOXY_STATIC_DATA = {
    name: "Voxyn",
    followers: 128450,
    genres: ["AI Pop", "Cyber-Vocal", "Electronic"],
    image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop",
    secondary_image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop",
    popularity: 92,
    external_url: "https://open.spotify.com/artist/5rA9ZtIDl4KshP9N39pD8N",
    topTracks: [
        { id: "1", name: "Until It Stops", duration: "3:17" },
        { id: "2", name: "Sync Mode", duration: "2:45" },
        { id: "3", name: "Default Error", duration: "4:02" }
    ],
    latestReleases: [
        {
            id: "a1",
            name: "[Default]",
            release_date: "2024-02-21",
            image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500&auto=format&fit=crop",
            type: "album"
        },
        {
            id: "a2",
            name: "Pulse Signal",
            release_date: "2024-01-15",
            image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=500&auto=format&fit=crop",
            type: "single"
        }
    ]
};

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

async function getArtistById(artistId: string, fetchOptions: RequestInit) {
    try {
        const [artistRes, albumsRes] = await Promise.all([
            fetch(`https://api.spotify.com/v1/artists/${artistId}`, fetchOptions),
            fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?limit=5&include_groups=album,single&market=US`, fetchOptions)
        ]);

        if (!artistRes.ok) return null;

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
    } catch (e) { return null; }
}

/**
 * Parses URL or URI to find Spotify ID and Type
 */
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
    const isVoxyn = artistName?.toLowerCase().includes('voxyn');

    try {
        const token = await getAccessToken();
        if (!token) return isVoxyn ? VOXY_STATIC_DATA : { error: "Access Denied: Check Credentials" };

        const fetchOptions = { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' as RequestInit['cache'] };

        // 1. Try Direct Artist ID first
        if (artistSpotifyId?.trim()) {
            const result = await getArtistById(artistSpotifyId.trim(), fetchOptions);
            if (result) return result;
        }

        // 2. Try to resolve from URI/URL (can be Track, Album, or Artist link)
        const parsed = parseSpotifyLink(uriOrUrl);
        if (parsed) {
            let artistId = parsed.type === 'artist' ? parsed.id : null;

            // If it's a track or album, fetch it to find the artist ID
            if (!artistId && (parsed.type === 'track' || parsed.type === 'album')) {
                const res = await fetch(`https://api.spotify.com/v1/${parsed.type}s/${parsed.id}`, fetchOptions);
                if (res.ok) {
                    const data = await res.json();
                    artistId = data.artists?.[0]?.id || null;
                }
            }

            if (artistId) {
                const result = await getArtistById(artistId, fetchOptions);
                if (result) return result;
            }
        }

        // 3. Last Resort Fallback
        if (isVoxyn) return VOXY_STATIC_DATA;

        return { error: "RESOLVE_FAILED: Manual ID may be required due to API limits." };

    } catch (error) {
        return isVoxyn ? VOXY_STATIC_DATA : { error: "System Error" };
    }
}
