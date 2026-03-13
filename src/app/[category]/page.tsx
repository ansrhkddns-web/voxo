export const revalidate = 300;

import Link from 'next/link';
import { notFound } from 'next/navigation';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import NewsletterForm from '@/components/home/NewsletterForm';
import PostCard from '@/components/home/PostCard';
import { getPublicPostsByCategory } from '@/lib/public-data';
import { timeAgo } from '@/lib/utils';

const validCategories = [
    'news',
    'reviews',
    'features',
    'editors-pick',
    'archives',
    'focus',
    'cover-story',
] as const;

const categoryTitles: Record<(typeof validCategories)[number], string> = {
    news: 'News',
    reviews: 'Reviews',
    features: 'Features',
    'editors-pick': "Editor's Pick",
    archives: 'Archives',
    focus: 'Focus',
    'cover-story': 'Cover Story',
};

const categoryDescriptions: Record<(typeof validCategories)[number], string> = {
    news: '빠르게 움직이는 음악 산업과 팝 컬처의 흐름을 전하는 뉴스 섹션입니다.',
    reviews:
        '곡과 앨범을 끝까지 듣고 왜 지금 중요한지 차분하게 분석하는 리뷰 섹션입니다.',
    features: '아티스트와 장면, 시대의 분위기를 더 깊게 파고드는 장문 피처 섹션입니다.',
    'editors-pick': '지금 꼭 읽어야 할 글만 골라 묶은 에디터 추천 섹션입니다.',
    archives: '시간이 지나도 다시 읽을 가치가 있는 글을 모아둔 아카이브 섹션입니다.',
    focus: '한 아티스트, 한 곡, 한 장면에 깊게 몰입해 해석하는 포커스 섹션입니다.',
    'cover-story':
        '가장 큰 흐름을 대표하는 주제를 전면에서 다루는 커버 스토리 섹션입니다.',
};

export default async function CategoryPage({
    params,
}: {
    params: { category: string } | Promise<{ category: string }>;
}) {
    const resolvedParams = params instanceof Promise ? await params : params;
    const categorySlug = resolvedParams?.category?.toLowerCase();

    if (!categorySlug || !validCategories.includes(categorySlug as (typeof validCategories)[number])) {
        notFound();
    }

    const typedCategorySlug = categorySlug as (typeof validCategories)[number];
    const publishedPosts = await getPublicPostsByCategory(typedCategorySlug);

    const displayTitle = categoryTitles[typedCategorySlug];
    const featuredPost = publishedPosts[0] ?? null;
    const newestPosts = [...publishedPosts].sort((left, right) => {
        const leftDate = new Date(left.published_at || left.created_at).getTime();
        const rightDate = new Date(right.published_at || right.created_at).getTime();
        return rightDate - leftDate;
    });
    const popularPosts = [...publishedPosts].sort(
        (left, right) => (right.view_count || 0) - (left.view_count || 0),
    );
    const ratedPosts = [...publishedPosts].sort(
        (left, right) => (right.rating || 0) - (left.rating || 0),
    );

    return (
        <main className="flex min-h-screen flex-col bg-background-dark font-body select-none">
            <Navbar />

            <header className="border-b border-white/5 bg-gradient-to-b from-black to-gray-950 px-4 pb-20 pt-40 text-center md:px-12">
                <h1 className="font-display text-5xl font-light uppercase tracking-[0.3em] text-white drop-shadow-lg md:text-7xl">
                    {displayTitle}
                </h1>
                <p className="mt-6 font-display text-[10px] uppercase tracking-[0.4em] text-accent-green">
                    {displayTitle} 큐레이션
                </p>
                <p className="mx-auto mt-6 max-w-3xl text-sm leading-relaxed text-gray-500">
                    {categoryDescriptions[typedCategorySlug]}
                </p>
            </header>

            <section className="mx-auto min-h-[50vh] w-full max-w-[1800px] px-4 py-20 md:px-12">
                {featuredPost ? (
                    <div className="mb-14 grid gap-6 border border-white/10 bg-white/[0.02] p-6 lg:grid-cols-[1.6fr_1fr]">
                        <div className="space-y-4">
                            <p className="font-display text-[9px] uppercase tracking-[0.24em] text-accent-green">
                                Featured Story
                            </p>
                            <h2 className="font-display text-3xl font-light uppercase tracking-[0.04em] text-white md:text-4xl">
                                {featuredPost.title}
                            </h2>
                            <p className="max-w-3xl text-sm leading-relaxed text-gray-500">
                                {featuredPost.excerpt}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.22em] text-gray-500">
                                <span>{featuredPost.readTimeMinutes}분 읽기</span>
                                <span>
                                    조회수 {(featuredPost.view_count || 0).toLocaleString()}회
                                </span>
                                <span>
                                    {timeAgo(
                                        featuredPost.published_at || featuredPost.created_at,
                                        'Korean',
                                    )}
                                </span>
                            </div>
                            <Link
                                href={`/post/${featuredPost.slug}`}
                                className="inline-flex items-center gap-2 border border-white/10 px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green"
                            >
                                스토리 읽기
                            </Link>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
                            {[
                                {
                                    label: '최신 스토리',
                                    value: newestPosts[0]?.title || '아직 등록된 글이 없습니다.',
                                },
                                {
                                    label: '가장 많이 읽힌 스토리',
                                    value: popularPosts[0]?.title || '아직 등록된 글이 없습니다.',
                                },
                                {
                                    label: '평점이 높은 스토리',
                                    value: ratedPosts[0]?.title || '아직 등록된 글이 없습니다.',
                                },
                            ].map((item) => (
                                <div key={item.label} className="border border-white/5 bg-black/30 p-4">
                                    <p className="font-display text-[9px] uppercase tracking-[0.22em] text-gray-500">
                                        {item.label}
                                    </p>
                                    <p className="mt-3 text-sm leading-relaxed text-white">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

                <div className="mb-12 flex flex-wrap gap-3">
                    {validCategories.map((item) => {
                        const isActive = item === typedCategorySlug;

                        return (
                            <Link
                                key={item}
                                href={`/${item}`}
                                className={`px-4 py-2 text-[10px] uppercase tracking-[0.24em] transition-colors ${
                                    isActive
                                        ? 'bg-white text-black'
                                        : 'border border-white/10 text-gray-400 hover:border-accent-green hover:text-accent-green'
                                }`}
                            >
                                {categoryTitles[item]}
                            </Link>
                        );
                    })}
                </div>

                <div className="mb-16 flex items-end justify-between border-b border-white/5 pb-4">
                    <span className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-500">
                        총 {publishedPosts.length}개 스토리
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
                    {publishedPosts.length > 0 ? (
                        publishedPosts.map((post) => (
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
                        <div className="col-span-full border border-white/5 bg-gray-950/20 py-32 text-center">
                            <p className="text-[10px] uppercase tracking-[0.4em] text-gray-700">
                                아직 이 카테고리에 등록된 글이 없습니다.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <section className="mt-auto border-t border-white/10 bg-black px-4 py-32">
                <div className="mx-auto max-w-2xl text-center">
                    <span className="mb-4 block font-display text-[9px] uppercase tracking-[0.2em] text-accent-green">
                        Newsletter Club
                    </span>
                    <h2 className="mb-6 font-display text-4xl font-light uppercase tracking-widest text-white md:text-5xl">
                        취향에 맞는 스토리를 가장 먼저 받아보세요
                    </h2>
                    <p className="mx-auto mb-10 max-w-md text-sm font-light tracking-wide text-gray-500">
                        새 글, 에디토리얼 큐레이션, 아티스트 분석을 뉴스레터로 정리해
                        보내드립니다.
                    </p>
                    <NewsletterForm />
                    <p className="mt-4 font-display text-[9px] uppercase tracking-wider text-gray-800">
                        스팸 없이, 중요한 이야기만 전해드립니다.
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
