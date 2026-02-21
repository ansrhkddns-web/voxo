import React from 'react';
export const dynamic = "force-dynamic";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArtistStats from "@/components/post/ArtistStats";
import SpotifyEmbed from "@/components/post/SpotifyEmbed";
import RatingMeter from "@/components/post/RatingMeter";
import { Clock } from 'lucide-react';
import { getPostBySlug } from '@/app/actions/postActions';
import { getArtistStats } from '@/app/actions/spotifyActions';
import { notFound } from 'next/navigation';

export default async function PostDetail({ params }: { params: any }) {
    // Robust params handling for various Next.js 15/16 environments
    const resolvedParams = params instanceof Promise ? await params : params;
    const slug = resolvedParams?.slug;

    if (!slug) {
        console.error("No slug found in params:", resolvedParams);
        notFound();
    }

    const decodedSlug = decodeURIComponent(slug);

    // 1. Primary lookup using decoded slug
    let post = await getPostBySlug(decodedSlug);

    // 2. Fallback: Lookup using raw slug (Next.js sometimes handles encoding differently)
    if (!post && slug !== decodedSlug) {
        post = await getPostBySlug(slug);
    }

    // 3. Last stand: Direct Supabase match bypass (to catch any ilike normalization issues)
    if (!post) {
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = await createClient();
        const { data } = await supabase
            .from('posts')
            .select('*, categories(name)')
            .eq('slug', decodedSlug)
            .eq('is_published', true)
            .maybeSingle();
        post = data;
    }

    if (!post) {
        notFound();
    }

    // Fetch Spotify Artist Stats if URI exists
    const artistStats = post.spotify_uri ? await getArtistStats(post.spotify_uri) : null;

    const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).toUpperCase();

    return (
        <main className="flex min-h-screen flex-col bg-background-dark select-none">
            <Navbar />

            {/* Article Hero */}
            <header className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 w-full h-full z-0">
                    <img
                        alt={post.title}
                        className="w-full h-full object-cover object-top opacity-70 grayscale scale-105"
                        src={post.cover_image || "https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=1974&auto=format&fit=crop"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/80 to-black"></div>
                </div>

                <div className="relative z-10 text-center flex flex-col items-center max-w-5xl px-4 mt-20">
                    <div className="mb-4">
                        <span className="inline-block h-px w-8 bg-accent-green mb-1"></span>
                        <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400 font-display">{post.categories?.name || 'Review'}</p>
                    </div>

                    <h1 className="font-display font-light text-5xl md:text-7xl lg:text-9xl tracking-super-wide uppercase text-white mb-8">
                        {post.title}
                    </h1>

                    <div className="flex items-center gap-6 text-gray-500 text-[10px] tracking-[0.2em] font-display uppercase">
                        <span className="flex items-center gap-2 underline underline-offset-4 decoration-accent-green/50">By VOXO Editorial</span>
                        <span>•</span>
                        <span className="flex items-center gap-2"><Clock size={12} className="text-accent-green" /> 10 Min Read</span>
                        <span>•</span>
                        <span>{formattedDate}</span>
                    </div>
                </div>

                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-2 h-2 border-r border-b border-white rotate-45"></div>
                </div>
            </header>

            {/* Article Content */}
            <section className="max-w-7xl mx-auto px-4 md:px-12 py-32 grid grid-cols-1 lg:grid-cols-12 gap-20">
                <div className="lg:col-span-8">
                    <article className="font-serif text-gray-400 text-lg md:text-xl leading-relaxed space-y-12">
                        {post.artist_name && (
                            <p className="text-white text-2xl md:text-3xl font-light italic leading-snug font-serif">
                                Examining the resonance within {post.artist_name}'s latest transmission...
                            </p>
                        )}

                        <div
                            className="prose prose-invert prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {post.spotify_uri && <SpotifyEmbed uri={post.spotify_uri} />}
                    </article>

                    <div className="mt-20 pt-16 border-t border-white/5 flex flex-wrap gap-4">
                        {post.tags?.map((tag: string) => (
                            <span key={tag} className="text-[10px] tracking-widest text-gray-500 uppercase font-display border border-white/10 px-4 py-2 hover:border-white transition-colors cursor-pointer">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-4 space-y-24">
                    {post.rating && (
                        <div className="bg-gray-950/20 p-10 border border-white/5">
                            <RatingMeter rating={post.rating} />
                        </div>
                    )}

                    {artistStats && <ArtistStats data={artistStats} />}

                    <div className="space-y-8">
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-[1px] bg-accent-green"></span>
                            <h3 className="text-[10px] uppercase tracking-[0.3em] font-display text-white">Share This Story</h3>
                        </div>
                        <div className="flex gap-4">
                            {['TW', 'IG', 'FB', 'LI'].map(social => (
                                <button key={social} className="w-10 h-10 border border-white/10 flex items-center justify-center text-[10px] uppercase font-display text-gray-500 hover:text-white hover:border-white transition-colors">
                                    {social}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>
            </section>

            <Footer />
        </main>
    );
}
