

import React from 'react';
export const dynamic = "force-dynamic";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import PostCard from "@/components/home/PostCard";
import Footer from "@/components/layout/Footer";
import NewsletterForm from "@/components/home/NewsletterForm";
import LatestStories from "@/components/home/LatestStories";
import { cn } from "@/lib/utils";
import { getPosts } from '@/app/actions/postActions';
import { getMenuTags } from '@/app/actions/tagActions';
import Link from 'next/link';

export default async function Home() {
  const posts = await getPosts();
  const publishedPosts = posts?.filter((p: any) => p.is_published) || [];
  const menuTags = await getMenuTags();

  const latestCoverStory = publishedPosts.find((p: any) => p.categories?.name?.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-') === 'cover-story');

  return (
    <main className="flex min-h-screen flex-col bg-background-dark font-body select-none">
      <Navbar />
      <Hero post={latestCoverStory} />
      <Marquee />

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
    </main>
  );
}
