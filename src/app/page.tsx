export const revalidate = 300;

import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import Marquee from '@/components/home/Marquee';
import Footer from '@/components/layout/Footer';
import LatestStories from '@/components/home/LatestStories';
import NewsletterForm from '@/components/home/NewsletterForm';
import {
    getPublicMenuTags,
    getPublicPublishedPostSummaries,
    normalizeCategorySlug,
} from '@/lib/public-data';

export default async function Home({
    searchParams,
}: {
    searchParams?:
        | Promise<Record<string, string | string[] | undefined>>
        | Record<string, string | string[] | undefined>;
}) {
    const resolvedSearchParams =
        searchParams && searchParams instanceof Promise
            ? await searchParams
            : searchParams ?? {};
    const tagParam = resolvedSearchParams.tag;
    const sortParam = resolvedSearchParams.sort;
    const activeTag = Array.isArray(tagParam) ? tagParam[0] ?? 'all' : tagParam ?? 'all';
    const requestedSort = Array.isArray(sortParam) ? sortParam[0] : sortParam;
    const sortMode =
        requestedSort === 'popular' ||
        requestedSort === 'rated' ||
        requestedSort === 'latest'
            ? requestedSort
            : 'latest';

    const [posts, menuTags] = await Promise.all([
        getPublicPublishedPostSummaries(),
        getPublicMenuTags(),
    ]);

    const marqueeItems = posts.slice(0, 8).map((post) => {
        if (post.artist_name) {
            return `${post.artist_name} - ${post.title}`;
        }

        return post.title;
    });

    const latestCoverStory =
        posts.find((post) => normalizeCategorySlug(post.categories) === 'cover-story') ?? null;

    return (
        <main className="flex min-h-screen flex-col bg-background-dark font-body select-none">
            <Navbar />
            <Hero post={latestCoverStory} />
            <Marquee items={marqueeItems} />

            <LatestStories
                posts={posts}
                tags={menuTags}
                activeTag={activeTag}
                sortMode={sortMode}
            />

            <section className="border-t border-white/10 bg-black px-4 py-32">
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
