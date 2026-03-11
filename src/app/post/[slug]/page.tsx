import React from 'react';
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Image from 'next/image';
import { Eye } from 'lucide-react';
import { notFound } from 'next/navigation';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import ArtistStats from '@/components/post/ArtistStats';
import PostNavigation from '@/components/post/PostNavigation';
import PostShareActions from '@/components/post/PostShareActions';
import PostTableOfContents from '@/components/post/PostTableOfContents';
import RatingMeter from '@/components/post/RatingMeter';
import ReadingProgressBar from '@/components/post/ReadingProgressBar';
import RelatedPostsSection from '@/components/post/RelatedPostsSection';
import SpotifyEmbed from '@/components/post/SpotifyEmbed';
import ViewCounter from '@/components/post/ViewCounter';
import {
    getAdjacentPublishedPosts,
    getPostBySlug,
    getRelatedPosts,
} from '@/app/actions/postActions';
import { getArtistStats } from '@/app/actions/spotifyActions';
import { extractEditorMetadata } from '@/features/admin-editor/utils';
import { estimateReadTimeMinutes } from '@/lib/utils';
import type { PostRecord } from '@/types/content';
import type { SpotifyStatsResult } from '@/types/spotify';

function stripEmbeddedSpotifyPlayers(content: string) {
    return content
        .replace(
            /<(p|div)[^>]*>\s*<iframe[^>]*src="https:\/\/open\.spotify\.com\/embed\/[^"]*"[\s\S]*?<\/iframe>\s*<\/\1>/gi,
            '',
        )
        .replace(
            /<iframe[^>]*src="https:\/\/open\.spotify\.com\/embed\/[^"]*"[\s\S]*?<\/iframe>/gi,
            '',
        )
        .replace(
            /<(p|div)[^>]*>\s*(?:<a[^>]*href="https:\/\/open\.spotify\.com\/[^"]*"[\s\S]*?<\/a>|https:\/\/open\.spotify\.com\/[^<\s]+)\s*<\/\1>/gi,
            '',
        )
        .trim();
}

async function resolvePost(slug: string) {
    const decodedSlug = decodeURIComponent(slug);

    let post: PostRecord | null = await getPostBySlug(decodedSlug);
    if (!post && slug !== decodedSlug) {
        post = await getPostBySlug(slug);
    }

    if (!post) {
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = await createClient();
        const { data } = await supabase
            .from('posts')
            .select('*, categories(name)')
            .eq('slug', decodedSlug)
            .eq('is_published', true)
            .maybeSingle();
        post = data as PostRecord | null;
    }

    return post;
}

async function resolveArtistStats(post: PostRecord): Promise<SpotifyStatsResult> {
    if (!post.spotify_uri && !post.artist_name && !post.spotify_artist_id) {
        return null;
    }

    try {
        return await getArtistStats(
            post.spotify_uri || '',
            post.artist_name || '',
            post.spotify_artist_id || '',
        );
    } catch (error) {
        console.error('Failed to load Spotify artist stats', error);
        return null;
    }
}

async function resolvePostCompanions(slug: string) {
    const [relatedResult, adjacentResult] = await Promise.allSettled([
        getRelatedPosts(slug, 3),
        getAdjacentPublishedPosts(slug),
    ]);

    return {
        relatedPosts: relatedResult.status === 'fulfilled' ? relatedResult.value : [],
        adjacentPosts:
            adjacentResult.status === 'fulfilled'
                ? adjacentResult.value
                : { previous: null, next: null },
    };
}

export async function generateMetadata({
    params,
}: {
    params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> {
    const resolvedParams = params instanceof Promise ? await params : params;
    const slug = resolvedParams?.slug;

    if (!slug) {
        return {};
    }

    let post: PostRecord | null = null;
    try {
        post = await resolvePost(slug);
    } catch (error) {
        console.error('Failed to resolve post metadata', error);
        return {};
    }

    if (!post) {
        return {};
    }

    const metadata = extractEditorMetadata(post.content || '');
    const description =
        metadata.seoDescription ||
        metadata.excerpt ||
        `${post.artist_name || 'VOXO'}의 리뷰와 곡 해설을 지금 바로 확인해보세요.`;
    const ogImage = post.cover_image || undefined;

    return {
        title: post.title,
        description,
        openGraph: {
            title: post.title,
            description,
            images: ogImage ? [{ url: ogImage }] : undefined,
        },
        twitter: {
            card: ogImage ? 'summary_large_image' : 'summary',
            title: post.title,
            description,
            images: ogImage ? [ogImage] : undefined,
        },
    };
}

export default async function PostDetail({
    params,
}: {
    params: { slug: string } | Promise<{ slug: string }>;
}) {
    const resolvedParams = params instanceof Promise ? await params : params;
    const slug = resolvedParams?.slug;

    if (!slug) {
        notFound();
    }

    const post = await resolvePost(slug);
    if (!post) {
        notFound();
    }

    const extracted = extractEditorMetadata(post.content || '');
    const customExcerpt =
        extracted.excerpt ||
        `${post.artist_name || '이 아티스트'}의 사운드와 감정선을 차분하게 풀어낸 큐레이션 리뷰입니다.`;
    const customIntro =
        extracted.intro ||
        (post.artist_name ? `${post.artist_name}의 울림을 조금 더 가까이 들여다봅니다.` : '');
    const shareCopy = extracted.shareCopy || customExcerpt;
    const rawContent = extracted.bodyContent || post.content || '';
    const cleanContent = post.spotify_uri ? stripEmbeddedSpotifyPlayers(rawContent) : rawContent;
    const readTimeMinutes = estimateReadTimeMinutes(cleanContent);

    const formattedDate = new Date(post.created_at)
        .toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

    const [artistStats, companionData] = await Promise.all([
        resolveArtistStats(post),
        resolvePostCompanions(post.slug),
    ]);
    const { relatedPosts, adjacentPosts } = companionData;

    return (
        <main className="flex min-h-screen flex-col bg-background-dark select-none">
            <Navbar />
            <ViewCounter postId={post.id} />
            <ReadingProgressBar readTimeMinutes={readTimeMinutes} />

            <header className="relative mx-auto w-full max-w-7xl bg-background-dark px-6 pb-24 pt-40 md:px-12">
                <div className="flex animate-fade-in-up flex-col items-start gap-10">
                    <div className="flex items-center gap-4">
                        <span className="inline-flex items-center rounded-full border border-accent-green/30 bg-accent-green/5 px-3 py-1 font-display text-[9px] uppercase tracking-widest text-accent-green">
                            {post.categories?.name || 'Review'}
                        </span>
                        <div className="h-px w-12 bg-white/10"></div>
                    </div>

                    <h1 className="max-w-6xl font-display text-4xl font-light leading-[1.1] tracking-[0.02em] text-[#F5F5F7] drop-shadow-sm md:text-6xl lg:text-7xl">
                        {post.title}
                    </h1>

                    {customExcerpt ? (
                        <p className="max-w-4xl whitespace-pre-wrap font-serif text-xl italic leading-loose tracking-wide text-gray-400 md:text-2xl">
                            {customExcerpt}
                        </p>
                    ) : null}

                    <div className="flex w-full flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/5 pt-8 font-display text-[10px] uppercase tracking-[0.2em] text-gray-400">
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] text-gray-600">에디토리얼</span>
                            <span className="cursor-pointer border-b border-transparent pb-0.5 text-white transition-colors hover:border-accent-green/30 hover:text-accent-green">
                                VOXO EDITORIAL
                            </span>
                        </div>
                        <div className="hidden h-8 w-px bg-white/10 md:block"></div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] text-gray-600">조회수</span>
                            <span className="flex items-center gap-2">
                                <Eye size={10} className="text-accent-green/50" />
                                {post.view_count?.toLocaleString() || 0}회
                            </span>
                        </div>
                        <div className="hidden h-8 w-px bg-white/10 md:block"></div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] text-gray-600">발행일</span>
                            <span className="text-gray-300">{formattedDate}</span>
                        </div>
                        <div className="hidden h-8 w-px bg-white/10 md:block"></div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] text-gray-600">읽기 시간</span>
                            <span className="text-gray-300">{readTimeMinutes}분 읽기</span>
                        </div>
                    </div>
                </div>
            </header>

            <section className="mx-auto mb-32 w-full max-w-7xl animate-fade-in px-6 md:px-12">
                <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-none bg-[#050505] md:aspect-[21/9]">
                    <Image
                        alt={post.title}
                        src={
                            post.cover_image ||
                            'https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=1974&auto=format&fit=crop'
                        }
                        fill
                        sizes="(max-width: 768px) 100vw, 1400px"
                        className="object-cover opacity-80 transition-all duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] group-hover:opacity-100"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background-dark/40 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <div className="h-1 w-1 animate-pulse rounded-full bg-accent-green"></div>
                        <span className="font-display text-[8px] uppercase tracking-[0.3em] text-white/50">
                            Archive Signal / {slug.substring(0, 4)}
                        </span>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl grid-cols-1 gap-x-24 gap-y-20 px-4 py-20 md:px-12 lg:grid-cols-12">
                <div className="lg:col-span-8">
                    <PostTableOfContents mode="mobile" />

                    <div className="mb-10 grid gap-3 border border-white/10 bg-white/[0.02] p-5 md:hidden">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="border border-white/5 bg-black/30 p-4">
                                <p className="text-[8px] uppercase tracking-[0.22em] text-gray-500">카테고리</p>
                                <p className="mt-2 text-sm text-white">{post.categories?.name || 'Review'}</p>
                            </div>
                            <div className="border border-white/5 bg-black/30 p-4">
                                <p className="text-[8px] uppercase tracking-[0.22em] text-gray-500">읽기 시간</p>
                                <p className="mt-2 text-sm text-white">{readTimeMinutes}분</p>
                            </div>
                            <div className="border border-white/5 bg-black/30 p-4">
                                <p className="text-[8px] uppercase tracking-[0.22em] text-gray-500">조회수</p>
                                <p className="mt-2 text-sm text-white">{post.view_count?.toLocaleString() || 0}회</p>
                            </div>
                            <div className="border border-white/5 bg-black/30 p-4">
                                <p className="text-[8px] uppercase tracking-[0.22em] text-gray-500">평점</p>
                                <p className="mt-2 text-sm text-white">{post.rating ? post.rating.toFixed(1) : 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <article
                        data-post-article
                        className="space-y-16 font-serif text-lg leading-[2.2] tracking-[0.02em] text-[#e5e5e5] md:text-[21px]"
                    >
                        {customIntro ? (
                            <div className="relative my-24 border-l border-white/10 py-2 pl-8">
                                <span className="absolute top-0 h-8 w-[1px] bg-accent-green/50"></span>
                                <p className="whitespace-pre-wrap font-serif text-base font-light italic leading-relaxed tracking-wide text-gray-500 md:text-lg">
                                    {customIntro}
                                </p>
                            </div>
                        ) : null}

                        <div
                            className="prose prose-invert prose-lg max-w-none [&_a]:text-accent-green [&_figure]:my-10 [&_figure]:space-y-3 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-gray-500 [&_iframe]:min-h-[320px] [&_iframe]:w-full [&_iframe]:border-0 [&_iframe]:bg-black [&_img]:w-full [&_img]:object-cover"
                            dangerouslySetInnerHTML={{ __html: cleanContent }}
                        />

                        {post.spotify_uri ? (
                            <SpotifyEmbed
                                uri={post.spotify_uri}
                                autoPlayOnLoad
                                title={post.title}
                                artistName={post.artist_name || undefined}
                                artworkUrl={post.cover_image || undefined}
                                categoryName={post.categories?.name || undefined}
                            />
                        ) : null}
                    </article>

                    <div className="mt-20 flex flex-wrap gap-4 border-t border-white/5 pt-16">
                        {post.tags?.map((tag: string) => (
                            <a
                                key={tag}
                                href={`/?tag=${encodeURIComponent(tag)}`}
                                className="cursor-pointer border border-white/10 px-4 py-2 font-display text-[10px] uppercase tracking-widest text-gray-500 transition-colors hover:border-white"
                            >
                                #{tag}
                            </a>
                        ))}
                    </div>

                    <PostNavigation previous={adjacentPosts.previous} next={adjacentPosts.next} />
                    <RelatedPostsSection title="이 글과 함께 보면 좋은 글" posts={relatedPosts} />
                </div>

                <aside className="space-y-24 lg:col-span-4">
                    <PostTableOfContents mode="desktop" />

                    {post.rating ? (
                        <div className="border border-white/5 bg-gray-950/20 p-10">
                            <RatingMeter rating={post.rating} />
                        </div>
                    ) : null}

                    <ArtistStats data={artistStats} />

                    <div className="space-y-8">
                        <div className="flex items-center gap-2">
                            <span className="h-[1px] w-4 bg-accent-green"></span>
                            <h3 className="font-display text-[10px] uppercase tracking-[0.3em] text-white">
                                이 글 공유하기
                            </h3>
                        </div>
                        <PostShareActions title={post.title} excerpt={shareCopy} />
                    </div>
                </aside>
            </section>

            <Footer />
        </main>
    );
}
