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
                <div className="relative aspect-[3/4] overflow-hidden bg-[#050505] mb-8">
                    <img
                        alt={title}
                        className="w-full h-full object-cover filter grayscale opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                        src={image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50"></div>

                    <div className="absolute top-4 left-4 flex gap-2">
                        <span className="text-[9px] uppercase tracking-[0.3em] text-white bg-black/60 px-3 py-1.5 backdrop-blur-md font-display border border-white/5">
                            {category}
                        </span>
                        {rating && (
                            <span className="text-[9px] uppercase tracking-[0.3em] text-gray-300 bg-black/60 px-3 py-1.5 backdrop-blur-md font-display flex items-center gap-1.5 border border-white/5">
                                <Star size={8} className="text-accent-green/70" fill="currentColor" /> {rating.toFixed(1)}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-4 mt-6">
                    <div className="flex items-center gap-4">
                        <span className="w-6 h-px bg-white/20 group-hover:bg-accent-green/50 transition-colors duration-1000" />
                        <span className="text-[8px] tracking-[0.4em] text-gray-500 uppercase font-display group-hover:text-gray-400 transition-colors duration-1000">{readTime}</span>
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl font-light tracking-[0.05em] text-white group-hover:text-accent-green transition-colors duration-[1500ms] uppercase line-clamp-2 leading-snug">
                        {title}
                    </h3>
                    <p className="text-xs font-light text-gray-400 leading-loose tracking-wide line-clamp-2 font-serif italic opacity-70 group-hover:opacity-100 transition-opacity duration-1000">
                        {excerpt}
                    </p>
                </div>
            </article>
        </Link >
    );
}
