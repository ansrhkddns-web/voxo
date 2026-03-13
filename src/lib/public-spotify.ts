import { unstable_cache } from 'next/cache';
import { getArtistStats } from '@/app/actions/spotifyActions';
import { CACHE_TAGS } from '@/lib/cache-tags';
import type { SpotifyStatsResult } from '@/types/spotify';

const getCachedArtistStats = unstable_cache(
    async (
        uriOrUrl: string,
        artistName = '',
        manualArtistId = '',
        trackTitle = '',
    ): Promise<SpotifyStatsResult> => {
        if (!uriOrUrl && !artistName && !manualArtistId) {
            return null;
        }

        return getArtistStats(uriOrUrl, artistName, manualArtistId, trackTitle);
    },
    ['public-artist-stats'],
    { revalidate: 3600, tags: [CACHE_TAGS.spotifyStats] },
);

export async function getPublicArtistStats(params: {
    uriOrUrl: string;
    artistName?: string;
    manualArtistId?: string;
    trackTitle?: string;
}) {
    return getCachedArtistStats(
        params.uriOrUrl,
        params.artistName || '',
        params.manualArtistId || '',
        params.trackTitle || '',
    );
}
