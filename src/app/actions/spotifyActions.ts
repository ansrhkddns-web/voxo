'use server';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STATIC FALLBACK DATA: For "Voxyn"
// Ensure the UI works even if Spotify API is restricted (403)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const VOXY_STATIC_DATA = {
    name: "Voxyn",
    followers: 128450,
    genres: ["AI Pop", "Cyber-Vocal", "Electronic"],
    image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop", // Cyber vibes
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

        if (!response.ok) return null;
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        return null;
    }
}

async function getArtistById(artistId: string, fetchOptions: RequestInit) {
    try {
        const artistRes = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, fetchOptions);

        if (!artistRes.ok) {
            const errBody = await artistRes.text();
            // If it's a 403 (restricted) and we are looking for Voxyn, use static data
            if (artistRes.status === 403 && (artistId === '5rA9ZtIDl4KshP9N39pD8N' || artistId === 'Voxyn')) {
                return VOXY_STATIC_DATA;
            }
            return { error: `Spotify API Error (${artistRes.status}): CHECK SETTINGS ON DEVELOPER.SPOTIFY.COM/DASHBOARD` };
        }

        const artistData = await artistRes.json();
        const albumsRes = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?limit=5&include_groups=album,single&market=US`, fetchOptions);
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
    // SECURITY FALLBACK: If API is restricted, but it's Voxyn, SHOW HER!
    const isVoxyn = artistName?.toLowerCase().includes('voxyn') ||
        artistSpotifyId === '5rA9ZtIDl4KshP9N39pD8N';

    try {
        const token = await getAccessToken();

        // If token fails but it's Voxyn, return static data anyway
        if (!token) {
            return isVoxyn ? VOXY_STATIC_DATA : { error: "Security validation failed. Check Credentials." };
        }

        const fetchOptions = { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' as RequestInit['cache'] };

        // Priority 1: Direct ID
        if (artistSpotifyId && artistSpotifyId.trim().length > 0) {
            const id = artistSpotifyId.trim();
            const result = await getArtistById(id, fetchOptions);

            // If API 403 occurs but it's Voxyn, result will be VOXY_STATIC_DATA
            if (result && ('name' in result || 'error' in result)) return result;
        }

        // Priority 2: Voxyn Search Fallback (Even if API 403)
        if (isVoxyn) return VOXY_STATIC_DATA;

        return { error: "ID REQUIRED: Spotify 2026 Policy blocks auto-search. Enter Artist ID in Admin." };

    } catch (error: any) {
        return isVoxyn ? VOXY_STATIC_DATA : { error: `System exception: ${error.message?.substring(0, 30)}` };
    }
}
