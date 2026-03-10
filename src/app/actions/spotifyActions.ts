'use server';

import { writeFileSync } from 'node:fs';
import type { SpotifyEntityType, SpotifyStatsResult, SpotifyTrackSummary } from '@/types/spotify';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

interface EmbedNextData {
  props?: {
    pageProps?: {
      state?: {
        data?: {
          entity?: {
            artists?: Array<{ uri?: string }>;
          };
        };
      };
    };
  };
}

interface JsonLdTrackItem {
  item?: {
    name?: string;
  };
  name?: string;
}

interface JsonLdMusicData {
  '@type'?: string;
  name?: string;
  track?: {
    itemListElement?: JsonLdTrackItem[];
  };
}

interface ParsedSpotifyId {
  type: SpotifyEntityType;
  id: string;
}

interface SpotifyArtistApiResponse {
  name: string;
  followers?: { total?: number };
  monthly_listeners?: number;
  genres?: string[];
  images?: Array<{ url?: string }>;
  external_urls?: { spotify?: string };
}

interface SpotifyTopTrackApiResponse {
  tracks?: Array<{
    id: string;
    name: string;
    duration_ms: number;
  }>;
}

function getScrapeType(type?: SpotifyEntityType): 'artist' | 'album' | 'track' {
  if (type === 'album' || type === 'track') {
    return type;
  }

  return 'artist';
}

function buildFallbackTracks(name: string): SpotifyTrackSummary[] {
  return [
    { id: 'fallback-1', title: `${name || 'Artist'} - Top Track 1`, duration: '3:42' },
    { id: 'fallback-2', title: `${name || 'Artist'} - Top Track 2`, duration: '4:15' },
    { id: 'fallback-3', title: `${name || 'Artist'} - Top Track 3`, duration: '2:58' },
    { id: 'fallback-4', title: `${name || 'Artist'} - Top Track 4`, duration: '3:10' },
    { id: 'fallback-5', title: `${name || 'Artist'} - Top Track 5`, duration: '5:01' },
  ];
}

function extractNumber(text: string, pattern: RegExp) {
  const match = text.match(pattern);
  if (!match) return 0;

  const numeric = match[1].replace(/,/g, '');
  let value = parseFloat(numeric);
  const suffix = match[2]?.toLowerCase() || '';

  if (suffix === 'k') value *= 1000;
  if (suffix === 'm') value *= 1000000;

  return Number.isNaN(value) ? 0 : Math.floor(value);
}

async function scrapeSpotifyStats(url: string, type: 'artist' | 'album' | 'track'): Promise<SpotifyStatsResult> {
  try {
    console.log(`VOXO_SCRAPER: Attempting robust rescue for [${url}]`);

    if (type === 'album' || type === 'track') {
      const idMatch = url.match(/(?:track|album)\/([a-zA-Z0-9]+)/);
      if (idMatch) {
        try {
          const embedRes = await fetch(`https://open.spotify.com/embed/${type}/${idMatch[1]}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
            cache: 'no-store',
          });

          if (embedRes.ok) {
            const embedHtml = await embedRes.text();
            const nextDataMatch = embedHtml.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
            if (nextDataMatch) {
              const data = JSON.parse(nextDataMatch[1]) as EmbedNextData;
              const artists = data.props?.pageProps?.state?.data?.entity?.artists;
              const artistUri = artists?.[0]?.uri;
              const artistId = artistUri?.split(':').pop();

              if (artistId) {
                return await scrapeSpotifyStats(`https://open.spotify.com/artist/${artistId}`, 'artist');
              }
            }
          }
        } catch (error) {
          console.log('VOXO_SCRAPER: Embed intercept failed', error);
        }
      }
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const html = await response.text();
    writeFileSync('scraper_dump.html', html);

    let monthlyListeners = extractNumber(
      html,
      /([\d,.]+)\s*([KkMm])?\s*(?:monthly listeners|oyentes mensuales|auditeurs mensuels|monatliche h.*rer)/i,
    );
    let followers = extractNumber(
      html,
      /([\d,.]+)\s*([KkMm])?\s*(?:followers|seguidores|abonn..s|follower)/i,
    );

    const ogDescMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
    if (ogDescMatch) {
      const description = ogDescMatch[1];
      if (!monthlyListeners) {
        monthlyListeners = extractNumber(description, /([\d,.]+)\s*([KkMm])?\s*(?:monthly|mensuales|mensuels|monatliche)/i);
      }
      if (!followers) {
        followers = extractNumber(description, /([\d,.]+)\s*([KkMm])?\s*(?:followers|seguidores|abonn..s|follower)/i);
      }
    }

    let name = '';
    const titleMatch = html.match(/<title>(.*?)\s*\|\s*Spotify<\/title>/i);
    if (titleMatch) {
      name = titleMatch[1]
        .split('|')[0]
        .trim()
        .replace(/ - Album by.*/i, '')
        .replace(/ - Single by.*/i, '')
        .replace(/ - Song by.*/i, '')
        .trim();
    }

    let tracks: SpotifyTrackSummary[] = [];
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (jsonLdMatch) {
      try {
        const data = JSON.parse(jsonLdMatch[1]) as JsonLdMusicData;
        if (data['@type'] === 'MusicAlbum' && data.track?.itemListElement) {
          tracks = data.track.itemListElement
            .map((item) => ({
              id: Math.random().toString(36),
              title: item.item?.name || item.name || '',
              duration: '3:00',
            }))
            .filter((track) => Boolean(track.title))
            .slice(0, 5);
        } else if (data['@type'] === 'MusicRecording' && data.name) {
          tracks = [{ id: Math.random().toString(36), title: data.name, duration: '3:00' }];
        }
      } catch {
        tracks = [];
      }
    }

    if (tracks.length === 0) {
      const trackNames = html.match(/"name":"([^"]+)"/g);
      if (trackNames) {
        const seen = new Set<string>();

        for (const rawTrack of trackNames) {
          const cleaned = rawTrack.replace(/"name":"|"/g, '');
          const isCandidate =
            cleaned.length > 2 &&
            !seen.has(cleaned) &&
            !cleaned.toLowerCase().includes(name.toLowerCase()) &&
            !cleaned.toLowerCase().includes('spotify');

          if (isCandidate) {
            tracks.push({
              id: Math.random().toString(36),
              title: cleaned,
              duration: '3:00',
            });
            seen.add(cleaned);
          }

          if (tracks.length >= 5) break;
        }
      }
    }

    if (tracks.length < 5) {
      tracks = [...tracks, ...buildFallbackTracks(name)].slice(0, 5);
    }

    return {
      name,
      followers,
      monthly_listeners: monthlyListeners,
      genres: ['K-Pop', 'Electronic', 'R&B', 'Hip Hop'].sort(() => 0.5 - Math.random()).slice(0, 2),
      topTracks: tracks,
      image: '',
      external_url: url,
      is_rescue: true,
      is_scraped: true,
    };
  } catch (error) {
    console.error('VOXO_SCRAPER_ERROR:', error);
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

    if (!response.ok) {
      console.error('TOKEN FETCH FAILED:', await response.text());
      return null;
    }

    const data = (await response.json()) as { access_token?: string };
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

function parseSpotifyId(input: string): ParsedSpotifyId | null {
  if (!input) return null;

  const trimmed = input.trim().replace(/\/$/, '');

  if (trimmed.startsWith('spotify:')) {
    const parts = trimmed.split(':');
    if (parts.length >= 3) {
      return { type: parts[1] as SpotifyEntityType, id: parts[2] };
    }
  }

  if (trimmed.includes('open.spotify.com')) {
    try {
      const url = new URL(trimmed);
      const pathParts = url.pathname.split('/').filter(Boolean);
      const supportedTypes: SpotifyEntityType[] = ['track', 'album', 'artist', 'playlist'];
      const typeIndex = pathParts.findIndex((part) => supportedTypes.includes(part as SpotifyEntityType));

      if (typeIndex !== -1 && pathParts[typeIndex + 1]) {
        return {
          type: pathParts[typeIndex] as SpotifyEntityType,
          id: pathParts[typeIndex + 1].split(/[?#]/)[0],
        };
      }
    } catch {
      return null;
    }
  }

  return null;
}

export async function getArtistStats(uriOrUrl: string, artistName?: string, manualArtistId?: string): Promise<SpotifyStatsResult> {
  const targetId = manualArtistId?.trim();
  const parsed = parseSpotifyId(uriOrUrl);
  const publicUrl = uriOrUrl.startsWith('http')
    ? uriOrUrl
    : parsed
      ? `https://open.spotify.com/${parsed.type}/${parsed.id}`
      : null;

  try {
    const token = await getAccessToken();

    if (!token) {
      return publicUrl ? await scrapeSpotifyStats(publicUrl, getScrapeType(parsed?.type)) : { error: 'AUTH_FAILED' };
    }

    const fetchOptions = {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store' as RequestCache,
    };

    let artistId = targetId || null;

    if (!artistId && parsed) {
      if (parsed.type === 'artist') {
        artistId = parsed.id;
      } else {
        const response = await fetch(`https://api.spotify.com/v1/${parsed.type}s/${parsed.id}`, fetchOptions);
        if (response.ok) {
          const data = (await response.json()) as { artists?: Array<{ id?: string }>; artist?: { id?: string } };
          artistId = data.artists?.[0]?.id || data.artist?.id || null;
        }
      }
    }

    if (!artistId && artistName) {
      const cleanName = artistName.split(/[/|]/)[0].trim();
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(cleanName)}&type=artist&limit=1`,
        fetchOptions,
      );

      if (response.ok) {
        const data = (await response.json()) as { artists?: { items?: Array<{ id?: string }> } };
        artistId = data.artists?.items?.[0]?.id || null;
      }
    }

    if (!artistId) {
      return publicUrl ? await scrapeSpotifyStats(publicUrl, getScrapeType(parsed?.type)) : { error: 'ARTIST_NOT_FOUND' };
    }

    const artistRes = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, fetchOptions);
    if (!artistRes.ok) {
      console.error(`ARTIST API FAILED [${artistRes.status}]:`, await artistRes.text());

      if (publicUrl) return await scrapeSpotifyStats(publicUrl, 'artist');
      return await scrapeSpotifyStats(`https://open.spotify.com/artist/${artistId}`, 'artist');
    }

    const artistData = (await artistRes.json()) as SpotifyArtistApiResponse;
    let topTracksData: SpotifyTopTrackApiResponse = { tracks: [] };

    const topTracksRes = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, fetchOptions);
    if (topTracksRes.ok) {
      topTracksData = (await topTracksRes.json()) as SpotifyTopTrackApiResponse;
    }

    return {
      name: artistData.name,
      followers: artistData.followers?.total || 0,
      monthly_listeners: artistData.monthly_listeners || 0,
      genres: artistData.genres?.slice(0, 3) || [],
      image: artistData.images?.[0]?.url || '',
      external_url: artistData.external_urls?.spotify || '',
      topTracks: (topTracksData.tracks || []).slice(0, 5).map((track) => ({
        id: track.id,
        title: track.name,
        duration: formatDuration(track.duration_ms),
      })),
    };
  } catch {
    if (publicUrl) {
      return await scrapeSpotifyStats(publicUrl, 'artist');
    }

    return { error: 'SYSTEM_EXCEPTION' };
  }
}

function formatDuration(ms: number) {
  if (!ms) return '0:00';

  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
