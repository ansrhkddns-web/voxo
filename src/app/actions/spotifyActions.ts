'use server';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getAccessToken() {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error("VOXO_SYSTEM: Spotify Credentials Missing");
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

        if (!response.ok) {
            const errBody = await response.text();
            console.error(`VOXO_SYSTEM: Token Error (${response.status}): ${errBody}`);
            return null;
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("VOXO_SYSTEM: Token Exception ->", error);
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

export async function getArtistStats(uriOrUrl: string, artistName?: string, manualArtistId?: string) {
    console.log(`VOXO_DIAGNOSTIC v2.9: Deep Resolving for [${artistName}] | ManualID: [${manualArtistId}]`);

    try {
        const token = await getAccessToken();
        if (!token) return { error: "AUTH_FAILED: Check .env.local keys" };

        const fetchOptions = { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' as RequestCache };
        let artistId = manualArtistId?.trim() || null;
        let diagnosticError = "";

        // Step 1: Priority Manual ID (Bypass everything)
        if (artistId) {
            console.log(`VOXO_DIAGNOSTIC: Using Manual ID -> ${artistId}`);
        } else if (uriOrUrl) {
            // Step 2: Link
            const parsed = parseSpotifyId(uriOrUrl);
            if (parsed) {
                const { type, id } = parsed;
                const path = type === 'artist' ? `artists/${id}` : `${type}s/${id}`;
                const res = await fetch(`https://api.spotify.com/v1/${path}`, fetchOptions);
                if (res.ok) {
                    const data = await res.json();
                    artistId = type === 'artist' ? id : (data.artists?.[0]?.id || null);
                } else {
                    const body = await res.text();
                    console.error(`VOXO_FATAL: Link Fetch [${res.status}]: ${body}`);
                    diagnosticError = `Link Error ${res.status}: ${body.substring(0, 30)}`;
                }
            }
        }

        // Step 3: Search (If ID still null)
        if (!artistId && artistName) {
            const baseName = artistName.split(/[/|]/)[0].trim();
            const targets = Array.from(new Set([artistName.trim(), baseName])).filter(t => t.length >= 2);

            for (const target of targets) {
                const sRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(target)}&type=artist&limit=1`, fetchOptions);
                if (sRes.ok) {
                    const sData = await sRes.json();
                    artistId = sData.artists?.items?.[0]?.id || null;
                    if (artistId) break;
                } else {
                    const sBody = await sRes.text();
                    console.error(`VOXO_FATAL: Search [${sRes.status}] for [${target}]: ${sBody}`);
                    diagnosticError = `Search ${sRes.status}: ${sBody.substring(0, 40)}`;
                }
            }
        }

        if (!artistId) return { error: `MISSING_ID: ${diagnosticError || 'Artist not found'}` };

        // Step 4: Final Fetch
        const artistRes = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, fetchOptions);
        if (!artistRes.ok) {
            const errBody = await artistRes.text();
            return { error: `FETCH_403: Artist restricted. Reason: ${errBody.substring(0, 50)}` };
        }

        const artistData = await artistRes.json();

        let topTracksData = { tracks: [] };
        const tRes = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=KR`, fetchOptions);
        if (tRes.ok) topTracksData = await tRes.json();

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
        console.error("VOXO_SYSTEM_FATAL:", error);
        return { error: `EXCEPTION: ${error.message?.substring(0, 20)}` };
    }
}

function formatDuration(ms: number) {
    if (!ms) return "0:00";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
