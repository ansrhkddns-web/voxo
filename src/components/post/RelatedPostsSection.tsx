import React from 'react';
import Link from 'next/link';
import type { PublicPostSummary } from '@/types/content';
import { timeAgo } from '@/lib/utils';

interface RelatedPostsSectionProps {
    title: string;
    posts: PublicPostSummary[];
}

export default function RelatedPostsSection({
    title,
    posts,
}: RelatedPostsSectionProps) {
    if (posts.length === 0) {
        return null;
    }

    return (
        <section className="mt-24 border-t border-white/5 pt-16">
            <div className="mb-10 flex items-center gap-3">
                <span className="h-[1px] w-10 bg-accent-green"></span>
                <h3 className="font-display text-[10px] uppercase tracking-[0.3em] text-white">
                    {title}
                </h3>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {posts.map((post) => (
                    <Link
                        key={post.id}
                        href={`/post/${post.slug}`}
                        className="group block border border-white/5 bg-gray-950/20 p-6 transition-colors hover:border-accent-green/30"
                    >
                        <p className="font-display text-[9px] uppercase tracking-[0.25em] text-gray-500">
                            {post.categories?.name || 'Review'}
                        </p>
                        <h4 className="mt-4 font-display text-xl font-light uppercase tracking-[0.04em] text-white transition-colors group-hover:text-accent-green">
                            {post.title}
                        </h4>
                        <p className="mt-4 line-clamp-3 font-serif text-sm italic leading-loose text-gray-400">
                            {post.excerpt}
                        </p>
                        <p className="mt-6 font-display text-[9px] uppercase tracking-[0.25em] text-gray-600">
                            {timeAgo(post.published_at || post.created_at, 'Korean')}
                        </p>
                    </Link>
                ))}
            </div>
        </section>
    );
}
