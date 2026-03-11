'use server';

import { getArtistStats } from '@/app/actions/spotifyActions';
import type { ArtistImageCandidate } from '@/features/admin-editor/artist-image';

interface WikipediaSummaryResponse {
    title?: string;
    thumbnail?: { source?: string };
    originalimage?: { source?: string };
    content_urls?: { desktop?: { page?: string } };
    description?: string;
}

interface WikimediaSearchPage {
    pageid: number;
    title?: string;
    imageinfo?: Array<{ thumburl?: string; descriptionurl?: string; url?: string }>;
}

interface WikimediaSearchResponse {
    query?: {
        pages?: Record<string, WikimediaSearchPage>;
    };
}

interface DeezerArtistItem {
    id: number;
    name?: string;
    picture_xl?: string;
    picture_big?: string;
    picture_medium?: string;
    link?: string;
}

interface DeezerSearchResponse {
    data?: DeezerArtistItem[];
}

interface SearchDiversificationProfile {
    label: string;
    focus: 'artist' | 'album' | 'track';
    modifiers: string[];
}

function buildSearchSeed(artistName: string, trackTitle?: string, albumTitle?: string) {
    return [artistName.trim(), trackTitle?.trim(), albumTitle?.trim()].filter(Boolean).join(' ').trim();
}

function buildSubtitle(trackTitle?: string, albumTitle?: string) {
    return [trackTitle?.trim(), albumTitle?.trim()].filter(Boolean).join(' / ');
}

function buildSearchDiversificationProfile(
    retryIndex: number,
    artistName: string,
    trackTitle?: string,
    albumTitle?: string
): SearchDiversificationProfile {
    const profiles: SearchDiversificationProfile[] = [
        {
            label: 'artist-portrait',
            focus: 'artist',
            modifiers: ['portrait', 'singer', 'musician', 'press photo'],
        },
        {
            label: 'album-era',
            focus: albumTitle ? 'album' : 'artist',
            modifiers: ['album era', 'photoshoot', 'album cover', 'editorial'],
        },
        {
            label: 'track-performance',
            focus: trackTitle ? 'track' : 'artist',
            modifiers: ['live', 'performance', 'music video', 'stage'],
        },
        {
            label: 'candid-daily',
            focus: 'artist',
            modifiers: ['candid', 'daily', 'backstage', 'street style'],
        },
        {
            label: 'studio-monochrome',
            focus: 'artist',
            modifiers: ['studio portrait', 'black and white', 'close up', 'editorial'],
        },
        {
            label: 'festival-scene',
            focus: trackTitle ? 'track' : 'artist',
            modifiers: ['concert', 'festival', 'tour', 'live shot'],
        },
    ];

    return profiles[Math.max(retryIndex, 0) % profiles.length];
}

function buildWikipediaTitles(
    artistName: string,
    trackTitle: string | undefined,
    albumTitle: string | undefined,
    profile: SearchDiversificationProfile
) {
    const titles = [
        artistName,
        `${artistName} (singer)`,
        `${artistName} (musician)`,
        `${artistName} (band)`,
    ];

    if (profile.focus === 'album' && albumTitle) {
        titles.unshift(`${albumTitle} (album)`, albumTitle);
    }

    if (profile.focus === 'track' && trackTitle) {
        titles.unshift(`${trackTitle} (${artistName} song)`, `${trackTitle} (song)`, trackTitle);
    }

    return Array.from(new Set(titles.map((title) => title.trim()).filter(Boolean)));
}

function buildWikimediaQueries(
    artistName: string,
    trackTitle: string | undefined,
    albumTitle: string | undefined,
    profile: SearchDiversificationProfile
) {
    const focusSeed =
        profile.focus === 'album' && albumTitle
            ? albumTitle.trim()
            : profile.focus === 'track' && trackTitle
                ? trackTitle.trim()
                : artistName.trim();

    const queries = [
        `${artistName} ${focusSeed}`.trim(),
        buildSearchSeed(artistName, trackTitle, albumTitle),
        artistName,
        ...profile.modifiers.map((modifier) => `${artistName} ${modifier}`.trim()),
        ...profile.modifiers.map((modifier) => `${focusSeed} ${modifier}`.trim()),
    ];

    return Array.from(new Set(queries.map((query) => query.trim()).filter(Boolean)));
}

function pushCandidate(
    candidates: ArtistImageCandidate[],
    seen: Set<string>,
    excluded: Set<string>,
    candidate: ArtistImageCandidate | null
) {
    if (!candidate?.imageUrl || seen.has(candidate.imageUrl) || excluded.has(candidate.imageUrl)) {
        return;
    }

    seen.add(candidate.imageUrl);
    candidates.push(candidate);
}

async function searchWikipediaSummary(
    artistName: string,
    trackTitle: string | undefined,
    albumTitle: string | undefined,
    subtitle: string,
    profile: SearchDiversificationProfile,
    candidates: ArtistImageCandidate[],
    seen: Set<string>,
    excluded: Set<string>
) {
    const locales = ['ko', 'en'];
    const titles = buildWikipediaTitles(artistName, trackTitle, albumTitle, profile);

    for (const locale of locales) {
        for (const title of titles) {
            const response = await fetch(
                `https://${locale}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
                { cache: 'no-store' }
            );

            if (!response.ok) {
                continue;
            }

            const summary = (await response.json()) as WikipediaSummaryResponse;
            const imageUrl = summary.originalimage?.source || summary.thumbnail?.source;
            if (!imageUrl) {
                continue;
            }

            pushCandidate(candidates, seen, excluded, {
                id: `wikipedia-${locale}-${encodeURIComponent(title)}`,
                source: locale === 'ko' ? 'Wikipedia KO' : 'Wikipedia',
                imageUrl,
                title: summary.title || artistName,
                subtitle: summary.description || subtitle || 'Artist page image',
                externalUrl: summary.content_urls?.desktop?.page,
            });

            if (candidates.length >= 5) {
                return;
            }
        }
    }
}

async function searchWikimediaCommons(
    artistName: string,
    trackTitle: string | undefined,
    albumTitle: string | undefined,
    subtitle: string,
    profile: SearchDiversificationProfile,
    candidates: ArtistImageCandidate[],
    seen: Set<string>,
    excluded: Set<string>
) {
    const queries = buildWikimediaQueries(artistName, trackTitle, albumTitle, profile);

    for (const query of queries) {
        const response = await fetch(
            `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}` +
                `&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url&iiurlwidth=1200&format=json`,
            { cache: 'no-store' }
        );

        if (!response.ok) {
            continue;
        }

        const data = (await response.json()) as WikimediaSearchResponse;
        const pages = Object.values(data.query?.pages ?? {});

        for (const page of pages) {
            const imageInfo = page.imageinfo?.[0];
            const imageUrl = imageInfo?.thumburl || imageInfo?.url;
            if (!imageUrl) {
                continue;
            }

            pushCandidate(candidates, seen, excluded, {
                id: `commons-${page.pageid}`,
                source: 'Wikimedia Commons',
                imageUrl,
                title: artistName,
                subtitle: page.title?.replace(/^File:/, '') || subtitle || 'Artist image',
                externalUrl: imageInfo?.descriptionurl,
            });

            if (candidates.length >= 5) {
                return;
            }
        }
    }
}

async function searchDeezerArtist(
    artistName: string,
    subtitle: string,
    candidates: ArtistImageCandidate[],
    seen: Set<string>,
    excluded: Set<string>
) {
    const response = await fetch(
        `https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}`,
        { cache: 'no-store' }
    );

    if (!response.ok) {
        return;
    }

    const data = (await response.json()) as DeezerSearchResponse;
    for (const artist of data.data ?? []) {
        const imageUrl = artist.picture_xl || artist.picture_big || artist.picture_medium;
        if (!imageUrl) {
            continue;
        }

        pushCandidate(candidates, seen, excluded, {
            id: `deezer-${artist.id}`,
            source: 'Deezer',
            imageUrl,
            title: artist.name || artistName,
            subtitle: subtitle || 'Artist profile image',
            externalUrl: artist.link,
        });

        if (candidates.length >= 5) {
            return;
        }
    }
}

export async function searchArtistImageCandidates(input: {
    artistName: string;
    trackTitle?: string;
    albumTitle?: string;
    excludeImageUrls?: string[];
    retryIndex?: number;
}): Promise<ArtistImageCandidate[]> {
    const artistName = input.artistName.trim();
    if (!artistName) {
        return [];
    }

    const retryIndex = input.retryIndex ?? 0;
    const profile = buildSearchDiversificationProfile(
        retryIndex,
        artistName,
        input.trackTitle,
        input.albumTitle
    );
    const subtitle = buildSubtitle(input.trackTitle, input.albumTitle);
    const candidates: ArtistImageCandidate[] = [];
    const seen = new Set<string>();
    const excluded = new Set((input.excludeImageUrls || []).filter(Boolean));

    if (retryIndex === 0) {
        try {
            const spotify = await getArtistStats('', artistName);
            if (spotify && !('error' in spotify) && spotify.image) {
                pushCandidate(candidates, seen, excluded, {
                    id: 'spotify-primary',
                    source: 'Spotify',
                    imageUrl: spotify.image,
                    title: spotify.name || artistName,
                    subtitle: subtitle || 'Artist profile image',
                    externalUrl: spotify.external_url,
                });
            }
        } catch (error) {
            console.error('Spotify artist image lookup failed', error);
        }
    }

    try {
        await searchWikipediaSummary(
            artistName,
            input.trackTitle,
            input.albumTitle,
            subtitle,
            profile,
            candidates,
            seen,
            excluded
        );
    } catch (error) {
        console.error('Wikipedia summary image lookup failed', error);
    }

    if (retryIndex <= 1) {
        try {
            await searchDeezerArtist(artistName, subtitle, candidates, seen, excluded);
        } catch (error) {
            console.error('Deezer artist image lookup failed', error);
        }
    }

    try {
        await searchWikimediaCommons(
            artistName,
            input.trackTitle,
            input.albumTitle,
            subtitle,
            profile,
            candidates,
            seen,
            excluded
        );
    } catch (error) {
        console.error('Wikimedia Commons image lookup failed', error);
    }

    return candidates.slice(0, 5);
}
