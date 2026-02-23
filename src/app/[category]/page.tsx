import React from 'react';
export const dynamic = "force-dynamic";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PostCard from "@/components/home/PostCard";
import NewsletterForm from "@/components/home/NewsletterForm";
import { getPosts } from '@/app/actions/postActions';
import { notFound } from 'next/navigation';
import { timeAgo } from '@/lib/utils';

const validCategories = ['news', 'reviews', 'features', 'editors-pick', 'archives', 'focus', 'cover-story'];

export default async function CategoryPage({ params }: { params: { category: string } | Promise<{ category: string }> }) {
    const resolvedParams = params instanceof Promise ? await params : params;
    const categorySlug = resolvedParams?.category?.toLowerCase();

    if (!categorySlug || !validCategories.includes(categorySlug)) {
        notFound();
    }

    const posts = await getPosts();

    // Filter by category. Handle potential mismatches between URL slug and DB name/slug
    const publishedPosts = posts?.filter((p: any) => {
        if (!p.is_published) return false;
        if (!p.categories?.name) return false;

        const dbCatSlug = p.categories.name.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-');
        return dbCatSlug === categorySlug;
    }) || [];

    const displayTitle = categorySlug === 'editors-pick' ? "Editor's Pick" : categorySlug;

    return (
        <main className="flex min-h-screen flex-col bg-background-dark font-body select-none">
            <Navbar />

            <header className="pt-40 pb-20 px-4 md:px-12 text-center border-b border-white/5 bg-gradient-to-b from-black to-gray-950">
                <h1 className="font-display text-5xl md:text-7xl font-light tracking-[0.3em] text-white uppercase drop-shadow-lg">
                    {displayTitle}
                </h1>
                <p className="mt-6 text-[10px] uppercase tracking-[0.4em] text-accent-green font-display">
                    Exploring the {displayTitle} archive
                </p>
            </header>

            <section className="w-full py-20 px-4 md:px-12 max-w-[1800px] mx-auto min-h-[50vh]">
                <div className="flex justify-between items-end mb-16 border-b border-white/5 pb-4">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-display">
                        {publishedPosts.length} Records Found
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                    {publishedPosts.length > 0 ? (
                        publishedPosts.map((post: any) => (
                            <PostCard
                                key={post.id}
                                title={post.title}
                                category={post.categories?.name || 'Review'}
                                image={post.cover_image || 'https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=1974&auto=format&fit=crop'}
                                readTime={timeAgo(post.published_at || post.created_at, 'Korean')}
                                excerpt={post.content?.replace(/<[^>]*>/g, '').substring(0, 100) + '...'}
                                slug={post.slug}
                                rating={post.rating}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-32 text-center border border-white/5 bg-gray-950/20">
                            <p className="text-[10px] uppercase tracking-[0.4em] text-gray-700">No signals detected in this sector.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-32 px-4 bg-black border-t border-white/10 mt-auto">
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
