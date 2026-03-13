import Link from 'next/link';
import PostCard from './PostCard';
import { timeAgo } from '@/lib/utils';
import type { PublicPostSummary, TagRecord } from '@/types/content';

type LatestStoriesSortMode = 'latest' | 'popular' | 'rated';

interface LatestStoriesProps {
    posts: PublicPostSummary[];
    tags: TagRecord[];
    activeTag?: string;
    sortMode?: LatestStoriesSortMode;
}

function buildStoriesHref(tag: string, sortMode: LatestStoriesSortMode) {
    const params = new URLSearchParams();

    if (tag && tag !== 'all') {
        params.set('tag', tag);
    }

    if (sortMode !== 'latest') {
        params.set('sort', sortMode);
    }

    const query = params.toString();
    return query ? `/?${query}` : '/';
}

export default function LatestStories({
    posts,
    tags,
    activeTag = 'all',
    sortMode = 'latest',
}: LatestStoriesProps) {
    const normalizedActiveTag =
        activeTag !== 'all' && tags.some((tag) => tag.name === activeTag) ? activeTag : 'all';

    const filteredPosts =
        normalizedActiveTag === 'all'
            ? posts
            : posts.filter((post) => post.tags.includes(normalizedActiveTag));

    const sortedPosts = [...filteredPosts].sort((left, right) => {
        if (sortMode === 'popular') {
            return (right.view_count || 0) - (left.view_count || 0);
        }

        if (sortMode === 'rated') {
            return (
                (right.rating || 0) - (left.rating || 0) ||
                new Date(right.published_at || right.created_at).getTime() -
                    new Date(left.published_at || left.created_at).getTime()
            );
        }

        return (
            new Date(right.published_at || right.created_at).getTime() -
            new Date(left.published_at || left.created_at).getTime()
        );
    });

    const activeTagCount = sortedPosts.length;

    return (
        <section className="mx-auto w-full max-w-[1800px] px-4 py-40 md:px-12">
            <div className="mb-24 flex flex-col justify-between gap-6 border-b border-white/5 pb-6 md:flex-row md:items-end">
                <div className="space-y-3">
                    <h2 className="font-display text-2xl font-light uppercase tracking-[0.4em] text-white md:text-3xl">
                        Latest Stories
                    </h2>
                    <p className="text-sm text-gray-500">
                        {normalizedActiveTag === 'all'
                            ? `VOXO가 지금 주목하는 최신 스토리 ${activeTagCount}개를 모았습니다.`
                            : `${normalizedActiveTag} 태그로 묶인 글 ${activeTagCount}개를 보고 있습니다.`}
                    </p>
                </div>

                <div className="mt-4 flex flex-col gap-4 md:mt-0 md:items-end">
                    <div className="flex flex-wrap gap-6 font-display">
                        <Link
                            href={buildStoriesHref('all', sortMode)}
                            scroll={false}
                            className={`pb-1 text-[10px] uppercase tracking-[0.15em] transition-colors ${
                                normalizedActiveTag === 'all'
                                    ? 'border-b border-accent-green text-white'
                                    : 'text-gray-600 hover:text-white'
                            }`}
                        >
                            전체
                        </Link>
                        {tags.map((tag) => (
                            <Link
                                key={tag.id}
                                href={buildStoriesHref(tag.name, sortMode)}
                                scroll={false}
                                className={`pb-1 text-[10px] uppercase tracking-[0.15em] transition-colors ${
                                    normalizedActiveTag === tag.name
                                        ? 'border-b border-accent-green text-white'
                                        : 'text-gray-600 hover:text-white'
                                }`}
                            >
                                {tag.name}
                            </Link>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {[
                            { key: 'latest', label: '최신순' },
                            { key: 'popular', label: '조회순' },
                            { key: 'rated', label: '평점순' },
                        ].map((option) => (
                            <Link
                                key={option.key}
                                href={buildStoriesHref(normalizedActiveTag, option.key as LatestStoriesSortMode)}
                                scroll={false}
                                className={`px-3 py-2 text-[9px] uppercase tracking-[0.18em] transition-colors ${
                                    sortMode === option.key
                                        ? 'bg-white text-black'
                                        : 'border border-white/10 text-gray-400 hover:border-accent-green hover:text-accent-green'
                                }`}
                            >
                                {option.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
                {sortedPosts.length > 0 ? (
                    sortedPosts.map((post) => (
                        <PostCard
                            key={post.id}
                            title={post.title}
                            category={post.categories?.name || 'Review'}
                            image={
                                post.cover_image ||
                                'https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=1974&auto=format&fit=crop'
                            }
                            readTime={`${post.readTimeMinutes}분 읽기 / ${timeAgo(
                                post.published_at || post.created_at,
                                'Korean',
                            )}`}
                            excerpt={post.excerpt}
                            slug={post.slug}
                            rating={post.rating ?? undefined}
                            artistName={post.artist_name || undefined}
                            statLabel={`조회수 ${(post.view_count || 0).toLocaleString()}회`}
                        />
                    ))
                ) : (
                    <div className="col-span-full border border-white/5 bg-gray-950/20 py-20 text-center">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-gray-700">
                            선택한 조건에 맞는 글이 아직 없습니다.
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-24 flex justify-center">
                <span className="mb-4 h-2 w-2 rotate-45 animate-pulse bg-white" />
            </div>
        </section>
    );
}
