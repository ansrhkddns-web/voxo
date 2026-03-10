
import React from 'react';
export const dynamic = "force-dynamic";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import Footer from "@/components/layout/Footer";
import GlobalPlaylistBar from "@/components/layout/GlobalPlaylistBar";
import NewsletterForm from "@/components/home/NewsletterForm";
import LatestStories from "@/components/home/LatestStories";
import { getPosts } from '@/app/actions/postActions';
import { getMenuTags } from '@/app/actions/tagActions';
import { getSiteSettings } from '@/lib/site-settings';
import type { PostRecord } from '@/types/content';

export default async function Home() {
  const posts = await getPosts();
  const publishedPosts = posts.filter((post) => post.is_published);
  const menuTags = await getMenuTags();
  const siteSettings = await getSiteSettings();
  const marqueeItems = publishedPosts
    .slice(0, 8)
    .map((post) => {
      if (post.artist_name) {
        return `${post.artist_name} - ${post.title}`;
      }

      return post.title;
    });

  const latestCoverStory =
    publishedPosts.find((post: PostRecord) => post.categories?.name?.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-') === 'cover-story') ?? null;

  return (
    <main className="flex min-h-screen flex-col bg-background-dark font-body select-none">
      <Navbar />
      <Hero post={latestCoverStory} />
      <Marquee items={marqueeItems} />

      <LatestStories posts={publishedPosts} tags={menuTags} />

      {/* Newsletter Section */}
      <section className="py-32 px-4 bg-black border-t border-white/10">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-[9px] uppercase tracking-[0.2em] text-accent-green mb-4 block font-display">Stay Tuned</span>
          <h2 className="font-display text-4xl md:text-5xl font-light tracking-widest text-white mb-6 uppercase">
            Never Miss A Beat
          </h2>
          <p className="text-gray-500 text-sm font-light tracking-wide mb-10 max-w-md mx-auto">
            Get the latest reviews, artist interviews, and underground discoveries delivered straight to your inbox.
          </p>
          <NewsletterForm />
          <p className="text-gray-800 text-[9px] mt-4 tracking-wider font-display uppercase">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      <Footer />
      {siteSettings.globalPlaylist && <GlobalPlaylistBar uri={siteSettings.globalPlaylist} />}
    </main>
  );
}
