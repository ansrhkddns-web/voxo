import React from 'react';
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PostCard from '@/components/home/PostCard';
import NewsletterForm from '@/components/home/NewsletterForm';
import { getPosts } from '@/app/actions/postActions';
import { estimateReadTimeMinutes, timeAgo } from '@/lib/utils';
import type { PostRecord } from '@/types/content';

const validCategories = ['news', 'reviews', 'features', 'editors-pick', 'archives', 'focus', 'cover-story'];

const categoryDescriptions: Record<string, string> = {
    news: '빠르게 움직이는 음악 소식과 그 의미를 함께 정리하는 섹션입니다.',
    reviews: '곡과 앨범을 더 깊이 듣고, 감정선과 해석을 함께 풀어내는 리뷰 섹션입니다.',
    features: '아티스트와 장면, 시대의 분위기를 넓게 다루는 장문 에디토리얼 섹션입니다.',
    'editors-pick': '지금 꼭 들어봐야 할 곡과 앨범을 에디터의 시선으로 고른 추천 섹션입니다.',
    archives: '지나간 작품을 지금의 감각으로 다시 꺼내보는 아카이브 섹션입니다.',
    focus: '한 아티스트, 한 곡, 한 장면을 더 가까이 들여다보는 집중 탐구 섹션입니다.',
    'cover-story': '가장 넓은 시야와 무게감으로 구성한 대표 특집 섹션입니다.',
};

export default async function CategoryPage({
    params,
}: {
    params: { category: string } | Promise<{ category: string }>;
}) {
    const resolvedParams = params instanceof Promise ? await params : params;
    const categorySlug = resolvedParams?.category?.toLowerCase();

    if (!categorySlug || !validCategories.includes(categorySlug)) {
        notFound();
    }

    const posts = await getPosts();

    const publishedPosts = posts.filter((post: PostRecord) => {
        if (!post.is_published) return false;
        if (!post.categories?.name) return false;

        const dbCatSlug = post.categories.name.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-');
        return dbCatSlug === categorySlug;
    });

    const displayTitle = categorySlug === 'editors-pick' ? "Editor's Pick" : categorySlug.replace(/-/g, ' ');
    const featuredPost = publishedPosts[0] ?? null;
    const newestPosts = [...publishedPosts].sort((left, right) => {
        const leftDate = new Date(left.published_at || left.created_at).getTime();
        const rightDate = new Date(right.published_at || right.created_at).getTime();
        return rightDate - leftDate;
    });
    const popularPosts = [...publishedPosts].sort((left, right) => (right.view_count || 0) - (left.view_count || 0));
    const ratedPosts = [...publishedPosts].sort((left, right) => (right.rating || 0) - (left.rating || 0));

    return (
        <main className="flex min-h-screen flex-col bg-background-dark font-body select-none">
            <Navbar />

            <header className="border-b border-white/5 bg-gradient-to-b from-black to-gray-950 px-4 pb-20 pt-40 text-center md:px-12">
                <h1 className="font-display text-5xl font-light uppercase tracking-[0.3em] text-white drop-shadow-lg md:text-7xl">
                    {displayTitle}
                </h1>
                <p className="mt-6 font-display text-[10px] uppercase tracking-[0.4em] text-accent-green">
                    {displayTitle} 섹션 둘러보기
                </p>
                <p className="mx-auto mt-6 max-w-3xl text-sm leading-relaxed text-gray-500">
                    {categoryDescriptions[categorySlug]}
                </p>
            </header>

            <section className="mx-auto min-h-[50vh] w-full max-w-[1800px] px-4 py-20 md:px-12">
                {featuredPost ? (
                    <div className="mb-14 grid gap-6 border border-white/10 bg-white/[0.02] p-6 lg:grid-cols-[1.6fr_1fr]">
                        <div className="space-y-4">
                            <p className="font-display text-[9px] uppercase tracking-[0.24em] text-accent-green">
                                이 섹션의 대표 글
                            </p>
                            <h2 className="font-display text-3xl font-light uppercase tracking-[0.04em] text-white md:text-4xl">
                                {featuredPost.title}
                            </h2>
                            <p className="max-w-3xl text-sm leading-relaxed text-gray-500">
                                {(featuredPost.content?.replace(/<[^>]*>/g, '').trim().slice(0, 180) || '')}...
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.22em] text-gray-500">
                                <span>{estimateReadTimeMinutes(featuredPost.content)}분 읽기</span>
                                <span>조회수 {(featuredPost.view_count || 0).toLocaleString()}회</span>
                                <span>{timeAgo(featuredPost.published_at || featuredPost.created_at, 'Korean')}</span>
                            </div>
                            <a
                                href={`/post/${featuredPost.slug}`}
                                className="inline-flex items-center gap-2 border border-white/10 px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green"
                            >
                                대표 글 읽기
                            </a>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
                            {[
                                { label: '최신 글', value: newestPosts[0]?.title || '아직 등록된 글이 없습니다.' },
                                { label: '많이 읽은 글', value: popularPosts[0]?.title || '아직 등록된 글이 없습니다.' },
                                { label: '평점 높은 글', value: ratedPosts[0]?.title || '아직 등록된 글이 없습니다.' },
                            ].map((item) => (
                                <div key={item.label} className="border border-white/5 bg-black/30 p-4">
                                    <p className="font-display text-[9px] uppercase tracking-[0.22em] text-gray-500">
                                        {item.label}
                                    </p>
                                    <p className="mt-3 text-sm leading-relaxed text-white">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

                <div className="mb-12 flex flex-wrap gap-3">
                    {validCategories.map((item) => {
                        const label = item === 'editors-pick' ? "Editor's Pick" : item.replace(/-/g, ' ');
                        const isActive = item === categorySlug;
                        return (
                            <a
                                key={item}
                                href={`/${item}`}
                                className={`px-4 py-2 text-[10px] uppercase tracking-[0.24em] transition-colors ${
                                    isActive
                                        ? 'bg-white text-black'
                                        : 'border border-white/10 text-gray-400 hover:border-accent-green hover:text-accent-green'
                                }`}
                            >
                                {label}
                            </a>
                        );
                    })}
                </div>

                <div className="mb-16 flex items-end justify-between border-b border-white/5 pb-4">
                    <span className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-500">
                        총 {publishedPosts.length}개 글
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
                    {publishedPosts.length > 0 ? (
                        publishedPosts.map((post) => (
                            <PostCard
                                key={post.id}
                                title={post.title}
                                category={post.categories?.name || 'Review'}
                                image={post.cover_image || 'https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=1974&auto=format&fit=crop'}
                                readTime={`${estimateReadTimeMinutes(post.content)}분 읽기 / ${timeAgo(post.published_at || post.created_at, 'Korean')}`}
                                excerpt={`${post.content?.replace(/<[^>]*>/g, '').substring(0, 100) || ''}...`}
                                slug={post.slug}
                                rating={post.rating ?? undefined}
                                artistName={post.artist_name || undefined}
                                statLabel={`조회수 ${(post.view_count || 0).toLocaleString()}회`}
                            />
                        ))
                    ) : (
                        <div className="col-span-full border border-white/5 bg-gray-950/20 py-32 text-center">
                            <p className="text-[10px] uppercase tracking-[0.4em] text-gray-700">
                                아직 이 섹션에 등록된 글이 없습니다.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <section className="mt-auto border-t border-white/10 bg-black px-4 py-32">
                <div className="mx-auto max-w-2xl text-center">
                    <span className="mb-4 block font-display text-[9px] uppercase tracking-[0.2em] text-accent-green">
                        뉴스레터
                    </span>
                    <h2 className="mb-6 font-display text-4xl font-light uppercase tracking-widest text-white md:text-5xl">
                        새로운 글을 가장 먼저 받아보세요
                    </h2>
                    <p className="mx-auto mb-10 max-w-md text-sm font-light tracking-wide text-gray-500">
                        최신 리뷰, 아티스트 이야기, 새로운 발견을 메일로 편하게 받아볼 수 있습니다.
                    </p>
                    <NewsletterForm />
                    <p className="mt-4 font-display text-[9px] uppercase tracking-wider text-gray-800">
                        광고성 메일 없이 간결하게 보내드립니다.
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
