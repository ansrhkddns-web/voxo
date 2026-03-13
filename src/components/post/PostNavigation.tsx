import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { PublicPostSummary } from '@/types/content';

interface PostNavigationProps {
    previous: PublicPostSummary | null;
    next: PublicPostSummary | null;
}

function NavigationCard({
    direction,
    post,
}: {
    direction: 'previous' | 'next';
    post: PublicPostSummary | null;
}) {
    const isPrevious = direction === 'previous';

    if (!post) {
        return (
            <div className="border border-white/5 bg-gray-950/20 p-6 opacity-40">
                <p className="font-display text-[9px] uppercase tracking-[0.25em] text-gray-600">
                    {isPrevious ? 'Previous Story' : 'Next Story'}
                </p>
                <p className="mt-4 text-sm text-gray-500">No article available</p>
            </div>
        );
    }

    return (
        <Link
            href={`/post/${post.slug}`}
            className="group block border border-white/5 bg-gray-950/20 p-6 transition-colors hover:border-accent-green/30"
        >
            <div className="flex items-center justify-between gap-4">
                <p className="font-display text-[9px] uppercase tracking-[0.25em] text-gray-600">
                    {isPrevious ? 'Previous Story' : 'Next Story'}
                </p>
                {isPrevious ? (
                    <ArrowLeft size={14} className="text-gray-500 transition-colors group-hover:text-accent-green" />
                ) : (
                    <ArrowRight size={14} className="text-gray-500 transition-colors group-hover:text-accent-green" />
                )}
            </div>
            <h4 className="mt-4 font-display text-lg font-light uppercase tracking-[0.04em] text-white transition-colors group-hover:text-accent-green">
                {post.title}
            </h4>
        </Link>
    );
}

export default function PostNavigation({
    previous,
    next,
}: PostNavigationProps) {
    if (!previous && !next) {
        return null;
    }

    return (
        <section className="mt-24 border-t border-white/5 pt-16">
            <div className="grid gap-6 md:grid-cols-2">
                <NavigationCard direction="previous" post={previous} />
                <NavigationCard direction="next" post={next} />
            </div>
        </section>
    );
}
