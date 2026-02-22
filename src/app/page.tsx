

import React from 'react';
export const dynamic = "force-dynamic";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import PostCard from "@/components/home/PostCard";
import Footer from "@/components/layout/Footer";
import NewsletterForm from "@/components/home/NewsletterForm";
import { cn } from "@/lib/utils";
import { getPosts } from '@/app/actions/postActions';
import Link from 'next/link';

export default async function Home() {
  const posts = await getPosts();
  const publishedPosts = posts?.filter((p: any) => p.is_published) || [];

  const latestCoverStory = publishedPosts.find((p: any) => p.categories?.name?.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-') === 'cover-story');

  return (
    <main className="flex min-h-screen flex-col bg-background-dark font-body select-none">
      <Navbar />
      <Hero post={latestCoverStory} />
      <Marquee />

      {/* Latest Stories Section */}
      <section className="w-full py-20 px-4 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-white/5 pb-4">
          <h2 className="font-display text-3xl font-light tracking-[0.2em] text-white uppercase">Latest Stories</h2>
          <div className="flex gap-6 mt-4 md:mt-0 font-display">
            <button className="text-[10px] uppercase tracking-[0.15em] text-white border-b border-accent-green pb-1">All</button>
            <button className="text-[10px] uppercase tracking-[0.15em] text-gray-600 hover:text-white transition-colors">Indie</button>
            <button className="text-[10px] uppercase tracking-[0.15em] text-gray-600 hover:text-white transition-colors">Pop</button>
            <button className="text-[10px] uppercase tracking-[0.15em] text-gray-600 hover:text-white transition-colors">Electronic</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {publishedPosts.length > 0 ? (
            publishedPosts.map((post: any) => (
              <PostCard
                key={post.id}
                title={post.title}
                category={post.categories?.name || 'Review'}
                image={post.cover_image || 'https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=1974&auto=format&fit=crop'}
                readTime="10 Min Read"
                excerpt={post.content?.replace(/<[^>]*>/g, '').substring(0, 100) + '...'}
                slug={post.slug}
                rating={post.rating}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center border border-white/5 bg-gray-950/20">
              <p className="text-[10px] uppercase tracking-[0.4em] text-gray-700">Archives are currently empty. Awaiting signal.</p>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-24">
          <span className="w-2 h-2 bg-white rotate-45 mb-4 animate-pulse"></span>
        </div>
      </section>

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
