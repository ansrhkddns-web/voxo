'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import PostCard from './PostCard';
import { estimateReadTimeMinutes, stripHtmlTags, timeAgo } from '@/lib/utils';
import type { PostRecord, TagRecord } from '@/types/content';

interface LatestStoriesProps {
    posts: PostRecord[];
    tags: TagRecord[];
}

export default function LatestStories({ posts, tags }: LatestStoriesProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [sortMode, setSortMode] = React.useState<'latest' | 'popular' | 'rated'>('latest');
    const queryTag = searchParams.get('tag');
    const activeTag = queryTag && tags.some((tag) => tag.name === queryTag) ? queryTag : 'all';

    const updateTagFilter = (nextTag: string) => {
        const nextParams = new URLSearchParams(searchParams.toString());

        if (nextTag === 'all') {
            nextParams.delete('tag');
        } else {
            nextParams.set('tag', nextTag);
        }

        const nextQuery = nextParams.toString();
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    };

    const filteredPosts =
        activeTag === 'all'
            ? posts
            : posts.filter((post) => post.tags && post.tags.includes(activeTag));

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
                        {activeTag === 'all'
                            ? `전체 섹션에서 지금 볼 만한 큐레이션 글 ${activeTagCount}개를 모아두었습니다.`
                            : `${activeTag} 태그가 적용된 글만 모았습니다. 현재 ${activeTagCount}개의 글을 보고 있습니다.`}
                    </p>
                </div>

                <div className="mt-4 flex flex-col gap-4 md:mt-0 md:items-end">
                    <div className="flex flex-wrap gap-6 font-display">
                        <button
                            onClick={() => updateTagFilter('all')}
                            className={`pb-1 text-[10px] uppercase tracking-[0.15em] transition-colors ${
                                activeTag === 'all'
                                    ? 'border-b border-accent-green text-white'
                                    : 'text-gray-600 hover:text-white'
                            }`}
                        >
                            전체
                        </button>
                        {tags.map((tag) => (
                            <button
                                key={tag.id}
                                onClick={() => updateTagFilter(tag.name)}
                                className={`pb-1 text-[10px] uppercase tracking-[0.15em] transition-colors ${
                                    activeTag === tag.name
                                        ? 'border-b border-accent-green text-white'
                                        : 'text-gray-600 hover:text-white'
                                }`}
                            >
                                {tag.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {[
                            { key: 'latest', label: '최신 글' },
                            { key: 'popular', label: '많이 읽은 글' },
                            { key: 'rated', label: '평점 높은 글' },
                        ].map((option) => (
                            <button
                                key={option.key}
                                type="button"
                                onClick={() => setSortMode(option.key as 'latest' | 'popular' | 'rated')}
                                className={`px-3 py-2 text-[9px] uppercase tracking-[0.18em] transition-colors ${
                                    sortMode === option.key
                                        ? 'bg-white text-black'
                                        : 'border border-white/10 text-gray-400 hover:border-accent-green hover:text-accent-green'
                                }`}
                            >
                                {option.label}
                            </button>
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
                            readTime={`${estimateReadTimeMinutes(post.content)}분 읽기 / ${timeAgo(post.published_at || post.created_at, 'Korean')}`}
                            excerpt={`${stripHtmlTags(post.content || '').slice(0, 100)}...`}
                            slug={post.slug}
                            rating={post.rating ?? undefined}
                            artistName={post.artist_name || undefined}
                            statLabel={`조회수 ${(post.view_count || 0).toLocaleString()}회`}
                        />
                    ))
                ) : (
                    <div className="col-span-full border border-white/5 bg-gray-950/20 py-20 text-center">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-gray-700">
                            아직 이 조건에 맞는 글이 없습니다.
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
