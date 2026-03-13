import ArtistStats from '@/components/post/ArtistStats';
import { getPublicArtistStats } from '@/lib/public-spotify';
import type { PostRecord } from '@/types/content';

type ArtistStatsSource = Pick<PostRecord, 'spotify_uri' | 'artist_name' | 'spotify_artist_id' | 'title'>;

export function ArtistStatsSkeleton() {
    return (
        <div className="relative overflow-hidden border border-white/5 bg-gray-950/20 font-display">
            <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="p-6">
                <div className="mb-8 flex items-center gap-3">
                    <span className="h-px w-4 bg-white/10" />
                    <div className="h-3 w-28 animate-pulse bg-white/10" />
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="h-3 w-20 animate-pulse bg-white/10" />
                            <div className="h-9 w-24 animate-pulse bg-white/10" />
                        </div>
                        <div className="space-y-3">
                            <div className="h-3 w-20 animate-pulse bg-white/10" />
                            <div className="h-9 w-24 animate-pulse bg-white/10" />
                        </div>
                    </div>

                    <div className="h-px w-full bg-white/5" />

                    <div className="space-y-3">
                        <div className="h-3 w-16 animate-pulse bg-white/10" />
                        <div className="space-y-2">
                            <div className="h-3 w-full animate-pulse bg-white/10" />
                            <div className="h-3 w-4/5 animate-pulse bg-white/10" />
                            <div className="h-3 w-3/5 animate-pulse bg-white/10" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default async function ArtistStatsPanel({ post }: { post: ArtistStatsSource }) {
    if (!post.spotify_uri && !post.artist_name && !post.spotify_artist_id) {
        return null;
    }

    const data = await getPublicArtistStats({
        uriOrUrl: post.spotify_uri || '',
        artistName: post.artist_name || '',
        manualArtistId: post.spotify_artist_id || '',
        trackTitle: post.title,
    });

    return <ArtistStats data={data} />;
}
