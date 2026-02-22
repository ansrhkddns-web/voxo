'use client';

import React, { useState } from 'react';
import PostCard from './PostCard';

interface Tag {
    id: string;
    name: string;
    slug: string;
    show_in_menu: boolean;
}

interface LatestStoriesProps {
    posts: any[];
    tags: Tag[];
}

export default function LatestStories({ posts, tags }: LatestStoriesProps) {
    const [activeTag, setActiveTag] = useState<string>('all');

    const filteredPosts = activeTag === 'all'
        ? posts
        : posts.filter(post => post.tags && post.tags.includes(activeTag));

    return (
        <section className="w-full py-40 px-4 md:px-12 max-w-[1800px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 border-b border-white/5 pb-6">
                <h2 className="font-display text-2xl md:text-3xl font-light tracking-[0.4em] text-white uppercase">Latest Stories</h2>
                <div className="flex flex-wrap gap-6 mt-4 md:mt-0 font-display">
                    <button
                        onClick={() => setActiveTag('all')}
                        className={`text-[10px] uppercase tracking-[0.15em] transition-colors pb-1 ${activeTag === 'all' ? 'text-white border-b border-accent-green' : 'text-gray-600 hover:text-white'}`}
                    >
                        All
                    </button>
                    {tags.map(tag => (
                        <button
                            key={tag.id}
                            onClick={() => setActiveTag(tag.name)}
                            className={`text-[10px] uppercase tracking-[0.15em] transition-colors pb-1 ${activeTag === tag.name ? 'text-white border-b border-accent-green' : 'text-gray-600 hover:text-white'}`}
                        >
                            {tag.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                {filteredPosts.length > 0 ? (
                    filteredPosts.map((post: any) => (
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
    );
}
