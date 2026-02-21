'use client';

import React from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface PostCardProps {
    title: string;
    category: string;
    image: string;
    readTime: string;
    excerpt: string;
    slug: string;
    rating?: number;
}

export default function PostCard({ title, category, image, readTime, excerpt, slug, rating }: PostCardProps) {
    return (
        <Link href={`/post/${slug}`} className="group cursor-pointer block">
            <article>
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-900 mb-6">
                    <img
                        alt={title}
                        className="w-full h-full object-cover filter grayscale group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100"
                        src={image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60"></div>

                    <div className="absolute top-4 left-4 flex gap-2">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-white bg-black/50 px-2 py-1 backdrop-blur-sm font-display">
                            {category}
                        </span>
                        {rating && (
                            <span className="text-[9px] uppercase tracking-[0.2em] text-accent-green bg-black/50 px-2 py-1 backdrop-blur-sm font-display flex items-center gap-1 border border-accent-green/20">
                                <Star size={8} fill="currentColor" /> {rating.toFixed(1)}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-[9px] tracking-[0.2em] text-gray-500 uppercase font-display">{readTime}</span>
                    <h3 className="font-display text-xl font-light tracking-wide text-white group-hover:text-gray-300 transition-colors uppercase line-clamp-2">
                        {title}
                    </h3>
                    <p className="text-xs font-light text-gray-500 leading-relaxed tracking-wide line-clamp-2 font-body italic">
                        {excerpt}
                    </p>
                </div>
            </article>
        </Link>
    );
}
