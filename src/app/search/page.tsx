import React from 'react';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import PostCard from '@/components/home/PostCard';
import { getPosts } from '@/app/actions/postActions';
import { getMenuTags } from '@/app/actions/tagActions';
import { estimateReadTimeMinutes, stripHtmlTags, timeAgo } from '@/lib/utils';
import type { PostRecord } from '@/types/content';

type SearchSortMode = 'relevance' | 'latest' | 'popular' | 'rated';

function filterSearchPosts(posts: PostRecord[], query: string) {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
        return [];
    }

    return posts
        .filter((post) => {
            if (!post.is_published) return false;

            const haystacks = [
                post.title,
                post.artist_name || '',
                stripHtmlTags(post.content || ''),
                ...(post.tags ?? []),
                post.categories?.name || '',
            ];

            return haystacks.some((value) => value.toLowerCase().includes(normalizedQuery));
        })
        .map((post) => {
            let score = 0;
            const content = stripHtmlTags(post.content || '').toLowerCase();
            const title = post.title.toLowerCase();
            const artist = (post.artist_name || '').toLowerCase();
            const category = (post.categories?.name || '').toLowerCase();
            const tags = (post.tags ?? []).join(' ').toLowerCase();

            if (title.includes(normalizedQuery)) score += 6;
            if (artist.includes(normalizedQuery)) score += 5;
            if (tags.includes(normalizedQuery)) score += 4;
            if (category.includes(normalizedQuery)) score += 2;
            if (content.includes(normalizedQuery)) score += 1;

            return { post, score };
        });
}

function buildSearchHref(query: string, category: string, sort: SearchSortMode) {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    if (sort !== 'relevance') params.set('sort', sort);
    const nextQuery = params.toString();
    return nextQuery ? `/search?${nextQuery}` : '/search';
}

function getSortLabel(sortMode: SearchSortMode) {
    switch (sortMode) {
        case 'latest':
            return '최신순';
        case 'popular':
            return '많이 읽은 순';
        case 'rated':
            return '평점 높은 순';
        default:
            return '관련도순';
    }
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
    const resolvedSearchParams =
        searchParams && searchParams instanceof Promise ? await searchParams : searchParams ?? {};
    const queryParam = resolvedSearchParams.q;
    const categoryParam = resolvedSearchParams.category;
    const sortParam = resolvedSearchParams.sort;
    const query = Array.isArray(queryParam) ? queryParam[0] ?? '' : queryParam ?? '';
    const categoryFilter = Array.isArray(categoryParam) ? categoryParam[0] ?? '' : categoryParam ?? '';
    const sort = (Array.isArray(sortParam) ? sortParam[0] : sortParam) as SearchSortMode | undefined;
    const sortMode: SearchSortMode =
        sort && ['relevance', 'latest', 'popular', 'rated'].includes(sort) ? sort : 'relevance';

    const [posts, menuTags] = await Promise.all([getPosts(), getMenuTags()]);

    const searchMatches = filterSearchPosts(posts, query);
    const categoryOptions = Array.from(
        new Set(searchMatches.map(({ post }) => post.categories?.name || '').filter(Boolean)),
    );

    const filteredResults = searchMatches.filter(
        ({ post }) => !categoryFilter || (post.categories?.name || '') === categoryFilter,
    );

    const sortedResults = [...filteredResults].sort((left, right) => {
        if (sortMode === 'latest') {
            return (
                new Date(right.post.published_at || right.post.created_at).getTime() -
                new Date(left.post.published_at || left.post.created_at).getTime()
            );
        }

        if (sortMode === 'popular') {
            return (right.post.view_count || 0) - (left.post.view_count || 0);
        }

        if (sortMode === 'rated') {
            return (right.post.rating || 0) - (left.post.rating || 0);
        }

        return right.score - left.score;
    });

    const results = sortedResults.map((item) => item.post);
    const featuredResult = results[0] ?? null;

    return (
        <main className="flex min-h-screen flex-col bg-background-dark font-body">
            <Navbar />

            <header className="border-b border-white/5 bg-gradient-to-b from-black to-gray-950 px-4 pb-16 pt-36 md:px-12">
                <div className="mx-auto max-w-6xl">
                    <p className="font-display text-[10px] uppercase tracking-[0.35em] text-accent-green">
                        검색 아카이브
                    </p>
                    <h1 className="mt-5 font-display text-4xl font-light uppercase tracking-[0.08em] text-white md:text-6xl">
                        {query ? `"${query}" 검색 결과` : 'VOXO 아카이브 검색'}
                    </h1>
                    <p className="mt-6 max-w-3xl text-sm leading-relaxed text-gray-500 md:text-base">
                        {query
                            ? `현재 검색 조건에 맞는 공개 글 ${results.length}개를 찾았습니다. 카테고리와 정렬 기준을 바꿔가며 더 빠르게 좁혀보세요.`
                            : '아티스트명, 곡 제목, 기사 제목, 장르 태그로 원하는 글을 빠르게 찾을 수 있습니다.'}
                    </p>

                    <form action="/search" className="mt-10 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
                        <input
                            type="search"
                            name="q"
                            defaultValue={query}
                            placeholder="아티스트, 곡 제목, 태그, 분위기로 검색해보세요"
                            className="border border-white/10 bg-black/40 px-5 py-4 text-sm text-white placeholder:text-gray-600 focus:border-accent-green focus:outline-none"
                        />
                        <select
                            name="category"
                            defaultValue={categoryFilter}
                            className="border border-white/10 bg-black/40 px-4 py-4 text-sm text-white focus:border-accent-green focus:outline-none"
                        >
                            <option value="">전체 카테고리</option>
                            {categoryOptions.map((categoryName) => (
                                <option key={categoryName} value={categoryName}>
                                    {categoryName}
                                </option>
                            ))}
                        </select>
                        <select
                            name="sort"
                            defaultValue={sortMode}
                            className="border border-white/10 bg-black/40 px-4 py-4 text-sm text-white focus:border-accent-green focus:outline-none"
                        >
                            <option value="relevance">관련도순</option>
                            <option value="latest">최신순</option>
                            <option value="popular">많이 읽은 순</option>
                            <option value="rated">평점 높은 순</option>
                        </select>
                        <button
                            type="submit"
                            className="bg-white px-6 py-4 font-display text-[10px] font-bold uppercase tracking-[0.24em] text-black transition-colors hover:bg-accent-green"
                        >
                            검색
                        </button>
                    </form>

                    <div className="mt-6 flex flex-wrap gap-3">
                        {menuTags.slice(0, 8).map((tag) => (
                            <Link
                                key={tag.id}
                                href={buildSearchHref(tag.name, '', 'relevance')}
                                className="border border-white/10 px-4 py-2 text-[9px] uppercase tracking-[0.18em] text-gray-400 transition-colors hover:border-accent-green hover:text-accent-green"
                            >
                                #{tag.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </header>

            <section className="mx-auto w-full max-w-[1800px] flex-1 px-4 py-16 md:px-12">
                {query ? (
                    <div className="mb-8 flex flex-wrap gap-3">
                        <span className="border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-gray-300">
                            결과 {results.length}개
                        </span>
                        {categoryFilter ? (
                            <Link
                                href={buildSearchHref(query, '', sortMode)}
                                className="border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-gray-400 transition-colors hover:border-accent-green hover:text-accent-green"
                            >
                                카테고리: {categoryFilter} ×
                            </Link>
                        ) : null}
                        {sortMode !== 'relevance' ? (
                            <Link
                                href={buildSearchHref(query, categoryFilter, 'relevance')}
                                className="border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-gray-400 transition-colors hover:border-accent-green hover:text-accent-green"
                            >
                                정렬: {getSortLabel(sortMode)} ×
                            </Link>
                        ) : null}
                    </div>
                ) : null}

                {query && featuredResult ? (
                    <div className="mb-14 grid gap-6 border border-white/10 bg-white/[0.02] p-6 lg:grid-cols-[1.7fr_1fr]">
                        <div className="space-y-4">
                            <p className="font-display text-[9px] uppercase tracking-[0.24em] text-accent-green">
                                대표 결과
                            </p>
                            <h2 className="font-display text-3xl font-light uppercase tracking-[0.05em] text-white">
                                {featuredResult.title}
                            </h2>
                            <p className="max-w-3xl text-sm leading-relaxed text-gray-500">
                                {stripHtmlTags(featuredResult.content || '').slice(0, 220)}...
                            </p>
                            <div className="flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.18em] text-gray-500">
                                <span>{featuredResult.categories?.name || 'Review'}</span>
                                <span>{estimateReadTimeMinutes(featuredResult.content)}분 읽기</span>
                                <span>{timeAgo(featuredResult.published_at || featuredResult.created_at, 'Korean')}</span>
                            </div>
                            <Link
                                href={`/post/${featuredResult.slug}`}
                                className="inline-flex items-center gap-2 border border-white/10 px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green"
                            >
                                대표 결과 읽기
                            </Link>
                        </div>

                        <div className="border border-white/5 bg-black/30 p-5">
                            <p className="font-display text-[9px] uppercase tracking-[0.22em] text-gray-500">
                                검색 팁
                            </p>
                            <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-500">
                                <p>아티스트 이름으로 먼저 검색하면 관련 글을 넓게 찾기 좋습니다.</p>
                                <p>곡 제목으로 검색하면 특정 리뷰나 분석 글을 더 빠르게 찾을 수 있습니다.</p>
                                <p>결과가 많다면 카테고리와 정렬 기준을 같이 바꿔보세요.</p>
                            </div>
                        </div>
                    </div>
                ) : null}

                {query ? (
                    results.length > 0 ? (
                        <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
                            {results.map((post) => (
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
                            ))}
                        </div>
                    ) : (
                        <div className="border border-white/10 bg-white/[0.02] px-6 py-16 text-center">
                            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-600">
                                조건에 맞는 글을 찾지 못했습니다
                            </p>
                            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-500">
                                검색어를 조금 줄이거나, 다른 카테고리와 태그로 다시 시도해 보세요.
                            </p>
                        </div>
                    )
                ) : (
                    <div className="border border-white/10 bg-white/[0.02] px-6 py-16 text-center">
                        <p className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-600">
                            이름과 곡 제목으로 시작해보세요
                        </p>
                        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-500">
                            예를 들어 아티스트 이름, 곡 제목, 장르 태그로 검색하면 더 정확한 글을 찾을 수 있습니다.
                        </p>
                    </div>
                )}
            </section>

            <Footer />
        </main>
    );
}
