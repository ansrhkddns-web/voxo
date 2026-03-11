import React from 'react';
export const dynamic = 'force-dynamic';

import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import Marquee from '@/components/home/Marquee';
import Footer from '@/components/layout/Footer';
import NewsletterForm from '@/components/home/NewsletterForm';
import LatestStories from '@/components/home/LatestStories';
import { getPosts } from '@/app/actions/postActions';
import { getMenuTags } from '@/app/actions/tagActions';
import type { PostRecord } from '@/types/content';

export default async function Home() {
    const posts = await getPosts();
    const publishedPosts = posts.filter((post) => post.is_published);
    const menuTags = await getMenuTags();

    const marqueeItems = publishedPosts.slice(0, 8).map((post) => {
        if (post.artist_name) {
            return `${post.artist_name} - ${post.title}`;
        }

        return post.title;
    });

    const latestCoverStory =
        publishedPosts.find(
            (post: PostRecord) =>
                post.categories?.name?.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-') ===
                'cover-story',
        ) ?? null;

    return (
        <main className="flex min-h-screen flex-col bg-background-dark font-body select-none">
            <Navbar />
            <Hero post={latestCoverStory} />
            <Marquee items={marqueeItems} />

            <LatestStories posts={publishedPosts} tags={menuTags} />

            <section className="border-t border-white/10 bg-black px-4 py-32">
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
