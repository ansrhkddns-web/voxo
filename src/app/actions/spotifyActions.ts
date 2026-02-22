'use server';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Helper to scrape public Spotify page for stats when API is 403
async function scrapeSpotifyStats(url: string, type: 'artist' | 'album' | 'track') {
    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
            cache: 'no-store'
        });

        if (!response.ok) return null;
        const html = await response.text();

        // 1. Extract Monthly Listeners from meta or text
        let monthly_listeners = 0;
        const listenMatch = html.match(/([\d,.]+)\s*monthly listeners/i);
        if (listenMatch) {
            monthly_listeners = parseInt(listenMatch[1].replace(/,/g, ''));
        }

        // 2. Extract Followers from text
        let followers = 0;
        const followMatch = html.match(/([\d,.]+)\s*Followers/i);
        if (followMatch) {
            followers = parseInt(followMatch[1].replace(/,/g, ''));
        }

        // 3. Extract Artist Name
        let name = "";
        const titleMatch = html.match(/<title>(.*?)\s*\|\s*Spotify<\/title>/i);
        if (titleMatch) name = titleMatch[1].replace(/ - Album by.*/i, '').replace(/ - Single by.*/i, '').trim();

        // 4. Extract Top Tracks (for Albums)
        let tracks: any[] = [];
        const trackRegex = /"name":"([^"]+)"/g;
        let match;
        const seen = new Set();
        while ((match = trackRegex.exec(html)) !== null && tracks.length < 5) {
            const tName = match[1];
            if (!seen.has(tName) && !tName.includes(name)) {
                tracks.push({ id: Math.random().toString(36), title: tName, duration: "3:00" });
                seen.add(tName);
            }
        }

        // 5. Extract Artist ID from URL for Follow button
        let artist_id = "";
        const idMatch = url.match(/artist\/([a-zA-Z0-9]+)/);
        if (idMatch) artist_id = idMatch[1];

        return {
            name,
            followers,
            monthly_listeners,
            topTracks: tracks,
            image: "",
            artist_id, // Added for Follow button
            is_rescue: true,
            is_scraped: true
        };
    } catch (e) {
        return null;
    }
}

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
    const parsed = parseSpotifyId(uriOrUrl);
    const publicUrl = uriOrUrl?.startsWith('http') ? uriOrUrl : (parsed ? `https://open.spotify.com/${parsed.type}/${parsed.id}` : null);

    try {
        const token = await getAccessToken();

        // --- FALLBACK 1: TOKEN FAIL ---
        if (!token) {
            if (publicUrl) return await scrapeSpotifyStats(publicUrl, parsed?.type as any || 'artist');
            return { error: "AUTH_FAILED" };
        }

        const fetchOptions = { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' as RequestCache };
        let artistId = targetId || null;

        // 1. Resolve ID from Link/URI
        if (!artistId && parsed) {
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

        // 2. Resolve from Search
        if (!artistId && artistName) {
            const cleanName = artistName.split(/[/|]/)[0].trim();
            const sRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(cleanName)}&type=artist&limit=1`, fetchOptions);
            if (sRes.ok) {
                const sData = await sRes.json();
                artistId = sData.artists?.items?.[0]?.id || null;
            }
        }

        // --- FALLBACK 2: RESOLUTION FAIL BUT URL EXISTS ---
        if (!artistId) {
            if (publicUrl) return await scrapeSpotifyStats(publicUrl, parsed?.type as any || 'artist');
            return { error: "ARTIST_NOT_FOUND" };
        }

        // 3. Final Fetch with Scraper Fallback for 403s
        const artistRes = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, fetchOptions);
        if (!artistRes.ok) {
            if (publicUrl) return await scrapeSpotifyStats(publicUrl, 'artist');
            if (artistId) return await scrapeSpotifyStats(`https://open.spotify.com/artist/${artistId}`, 'artist');
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
            monthly_listeners: (artistData as any).monthly_listeners || 0,
            genres: artistData.genres?.slice(0, 3) || [],
            image: artistData.images?.[0]?.url,
            external_url: artistData.external_urls?.spotify,
            artist_id: artistId,
            topTracks: (topTracksData.tracks || []).slice(0, 5).map((t: any) => ({
                id: t.id,
                title: t.name,
                duration: formatDuration(t.duration_ms)
            }))
        };
    } catch (error) {
        if (publicUrl) return await scrapeSpotifyStats(publicUrl, 'artist');
        return { error: "SYSTEM_EXCEPTION" };
    }
}

function formatDuration(ms: number) {
    if (!ms) return "0:00";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
