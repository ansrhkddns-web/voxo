'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { PostRecord } from '@/types/content';

interface HeroProps {
    post?: PostRecord | null;
}

export default function Hero({ post }: HeroProps) {
    const title = post?.title || 'VOXO';

    let extractedExcerpt = '';
    if (post?.content) {
        const metaMatch = post.content.match(/<div id="voxo-metadata" data-excerpt="(.*?)"/);
        if (metaMatch) extractedExcerpt = metaMatch[1].replace(/&quot;/g, '"');
    }

    const subtitle = extractedExcerpt || '지금 가장 먼저 주목해야 할 커버 스토리를 만나보세요.';
    const bgImage =
        post?.cover_image ||
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBjO7KPUXt-RmJ7hVDcehFYap-aEc3LxZYZCqgxJkhkMgVddoikvox-8--Y-AqhJOV6_uHDQW79JGS9cnD6uHkvogxTLxF9ZwpoGg3Nfh8WKEIs6acJxqGcw-Wu_MBUSXBliEv7_gr6SnCioZ9oFvI6humJfvsWPF-BYSpuIXPkwwLCSuPBLsyExWfxpA9lx-wIf32LCXgroohCwmTrSJzXxYXu99pUj1_IvY3mXQj4xrvfrr-LsLZao80uhUzhVfLnt9SO3_gzjz3l';
    const postLink = post?.slug ? `/post/${post.slug}` : '#';

    return (
        <header className="group/hero relative flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-black">
            <motion.div
                initial={{ scale: 1.05, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 z-0 h-full w-full"
            >
                <Image
                    alt="Cover Image"
                    src={bgImage}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-top opacity-50 grayscale transition-all duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/hero:grayscale-0 group-hover/hero:opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/70 to-[#050505] transition-opacity duration-[2000ms]"></div>
            </motion.div>

            <div className="relative z-10 mt-20 flex max-w-5xl flex-col items-center px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-6 flex flex-col items-center gap-3"
                >
                    <span className="inline-block h-px w-6 bg-white/30"></span>
                    <p className="font-display text-[9px] uppercase tracking-[0.4em] text-gray-500">Cover Story</p>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-8 max-w-[90vw] text-center font-display text-5xl font-light uppercase tracking-[0.15em] text-white drop-shadow-2xl md:text-7xl lg:text-8xl"
                >
                    {title}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="mx-auto mb-16 max-w-xl px-4 font-serif text-sm italic leading-relaxed tracking-wide text-gray-400 drop-shadow-md line-clamp-3 md:text-lg"
                >
                    {subtitle}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    <a
                        href={postLink}
                        className="group relative inline-block overflow-hidden rounded-none border border-white/10 bg-white/5 px-10 py-4 backdrop-blur-sm transition-colors duration-700 hover:border-white/30"
                    >
                        <span className="relative z-10 font-display text-[9px] uppercase tracking-[0.3em] text-gray-300 transition-colors duration-500 group-hover:text-white">
                            지금 읽기
                        </span>
                        <div className="absolute inset-0 origin-left scale-x-0 transform bg-white/10 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"></div>
                    </a>
                </motion.div>
            </div>

            <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 transform"
            >
                <div className="h-2 w-2 rotate-45 border-b border-r border-white/50"></div>
            </motion.div>
        </header>
    );
}
