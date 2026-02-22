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

export default async function PostDetail({ params }: { params: { slug: string } | Promise<{ slug: string }> }) {
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

    // Fetch Spotify Artist Stats (Direct ID > Link > Name Fallback)
    console.log(`VOXO_POST_DEBUG: URI=[${post.spotify_uri}] NAME=[${post.artist_name}] ID=[${post.spotify_artist_id}]`);

    const artistStats = (post.spotify_uri || post.artist_name || post.spotify_artist_id)
        ? await getArtistStats(post.spotify_uri || '', post.artist_name || '', post.spotify_artist_id || '')
        : null;

    const artistStatsData = artistStats as any;
    console.log(`VOXO_POST_DEBUG: Fetch Result ->`, artistStatsData ? (artistStatsData.error ? `ERROR: ${artistStatsData.error}` : `SUCCESS: ${artistStatsData.name}`) : 'NULL (Skipped)');

    const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).toUpperCase();

    return (
        <main className="flex min-h-screen flex-col bg-background-dark select-none">
            <Navbar />

            {/* Article Hero - Redesigned for Split Layout */}
            <header className="relative w-full bg-background-dark pt-32 pb-16 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="flex flex-col items-start gap-8 animate-fade-in-up">
                    {/* Category & Badge */}
                    <div className="flex items-center gap-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full border border-accent-green/30 bg-accent-green/5 text-[9px] uppercase tracking-widest text-accent-green font-display">
                            {post.categories?.name || 'Review'}
                        </span>
                        <div className="h-px w-12 bg-white/10"></div>
                    </div>

                    {/* Title - Large, Clean, Modern */}
                    <h1 className="font-display font-light text-4xl md:text-6xl lg:text-8xl tracking-tight text-white leading-[1.1] max-w-6xl drop-shadow-sm">
                        {post.title}
                    </h1>

                    {/* Subtitle / Excerpt (Optional, using part of content if possible or generic) */}
                    <p className="text-gray-400 font-serif italic text-lg md:text-xl max-w-3xl leading-relaxed">
                        Exploratory resonance and architectural analysis of {post.artist_name || 'the collective'}&apos;s latest sonic transmission. Deep diving into the textures and emotional gradients.
                    </p>

                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-y-4 gap-x-8 pt-8 border-t border-white/5 w-full text-gray-400 text-[10px] tracking-[0.2em] font-display uppercase">
                        <div className="flex flex-col gap-1">
                            <span className="text-gray-600 text-[8px]">Written By</span>
                            <span className="text-white hover:text-accent-green transition-colors cursor-pointer border-b border-transparent hover:border-accent-green/30 pb-0.5">
                                VOXO EDITORIAL
                            </span>
                        </div>
                        <div className="w-px h-8 bg-white/10 hidden md:block"></div>
                        <div className="flex flex-col gap-1">
                            <span className="text-gray-600 text-[8px]">Publication</span>
                            <span className="flex items-center gap-2">
                                <Clock size={10} className="text-accent-green/50" />
                                10 MIN READ
                            </span>
                        </div>
                        <div className="w-px h-8 bg-white/10 hidden md:block"></div>
                        <div className="flex flex-col gap-1">
                            <span className="text-gray-600 text-[8px]">Date Released</span>
                            <span className="text-gray-300">
                                {formattedDate}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Separated Cover Image Section */}
            <section className="w-full px-6 md:px-12 max-w-7xl mx-auto mb-20 animate-fade-in">
                <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-sm group">
                    <img
                        alt={post.title}
                        className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-1000 ease-out"
                        src={post.cover_image || "https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=1974&auto=format&fit=crop"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark/40 to-transparent pointer-events-none"></div>

                    {/* Media Caption */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-accent-green animate-pulse"></div>
                        <span className="text-[8px] uppercase tracking-[0.3em] text-white/50 font-display">Archival Footage / Transmission {slug.substring(0, 4)}</span>
                    </div>
                </div>
            </section>

            {/* Article Content */}
            <section className="max-w-7xl mx-auto px-4 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-20">
                <div className="lg:col-span-8">
                    <article className="font-serif text-gray-400 text-lg md:text-xl leading-relaxed space-y-12">
                        {post.artist_name && (
                            <p className="text-white text-2xl md:text-4xl font-light italic leading-snug font-serif tracking-tight border-l-2 border-accent-green/30 pl-8 my-16">
                                Examining the resonance within {post.artist_name}&apos;s latest transmission...
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

                    {/* Artist Stats (Silent fallback if API restricted) */}
                    <ArtistStats data={artistStats} />

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
