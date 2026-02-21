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

export async function getArtistStats(uriOrUrl: string, artistName?: string) {
    if (!uriOrUrl && !artistName) return { error: "No signal provided" };

    try {
        const token = await getAccessToken();
        if (!token) return { error: "Security validation failed" };

        const fetchOptions = { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' as RequestCache };
        const parsed = uriOrUrl ? parseSpotifyId(uriOrUrl) : null;
        let artistId = (parsed?.type === 'artist') ? parsed.id : null;
        let diagnosticMsg = "";

        // Stage 1: Link Resolution with Deep Logging
        if (!artistId && parsed) {
            const { type, id } = parsed;
            const res = await fetch(`https://api.spotify.com/v1/${type}s/${id}`, fetchOptions);

            if (res.ok) {
                const data = await res.json();
                if (type === 'track' || type === 'album') {
                    artistId = data.artists?.[0]?.id || null;
                } else if (type === 'playlist') {
                    const tracksRes = await fetch(`https://api.spotify.com/v1/playlists/${id}/tracks?limit=1`, fetchOptions);
                    if (tracksRes.ok) {
                        const tracksData = await tracksRes.json();
                        artistId = tracksData.items?.[0]?.track?.artists?.[0]?.id || null;
                    }
                }
            } else {
                const errBody = await res.text();
                // CRITICAL LOG: Why is it 403?
                console.error(`VOXO_DEBUG: Link sync failed (${res.status}) for ${type}/${id}. Body: ${errBody}`);
                diagnosticMsg = `Link sync failed (${res.status}). `;
            }
        }

        // Stage 2: Identity Search with Deep Logging
        if (!artistId && artistName && artistName.trim().length > 0 && artistName !== '1') {
            const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`, fetchOptions);
            if (searchRes.ok) {
                const searchData = await searchRes.json();
                artistId = searchData.artists?.items?.[0]?.id || null;
            } else {
                const errBody = await searchRes.text();
                console.error(`VOXO_DEBUG: Identity search failed (${searchRes.status}) for [${artistName}]. Body: ${errBody}`);
                diagnosticMsg += `Identity search failed (${searchRes.status}). `;
            }
        }

        if (!artistId) {
            return { error: `${diagnosticMsg || 'Resolution failure'}: [${artistName || uriOrUrl || 'Unknown Target'}]` };
        }

        // Stage 3: Data Fetching with error capture
        const [artistRes, topTracksRes, albumsRes] = await Promise.all([
            fetch(`https://api.spotify.com/v1/artists/${artistId}`, fetchOptions),
            fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, fetchOptions),
            fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?limit=5&include_groups=album,single`, fetchOptions)
        ]);

        if (!artistRes.ok) {
            const errBody = await artistRes.text();
            console.error(`VOXO_DEBUG: Artist fetch failed (${artistRes.status}). Body: ${errBody}`);
            return { error: `Target profile lock failure (${artistRes.status})` };
        }

        const artistData = await artistRes.json();
        const topTracksData = topTracksRes.ok ? await topTracksRes.json() : { tracks: [] };
        const albumsData = albumsRes.ok ? await albumsRes.json() : { items: [] };

        return {
            name: artistData.name,
            followers: artistData.followers?.total || 0,
            genres: artistData.genres?.slice(0, 3) || [],
            image: artistData.images?.[0]?.url,
            secondary_image: artistData.images?.[1]?.url || artistData.images?.[0]?.url,
            popularity: artistData.popularity,
            external_url: artistData.external_urls?.spotify || `https://open.spotify.com/artist/${artistId}`,
            topTracks: (topTracksData.tracks || []).slice(0, 3).map((t: any) => ({
                id: t.id,
                name: t.name,
                duration: formatDuration(t.duration_ms)
            })),
            latestReleases: (albumsData.items || []).slice(0, 2).map((a: any) => ({
                id: a.id,
                name: a.name,
                release_date: a.release_date,
                image: a.images?.[0]?.url,
                type: a.album_group || a.album_type
            }))
        };
    } catch (error: any) {
        console.error("VOXO_SYSTEM: getArtistStats Critical Error ->", error);
        return { error: `System link exception: ${error.message?.substring(0, 20)}` };
    }
}

function formatDuration(ms: number) {
    if (!ms) return "0:00";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
