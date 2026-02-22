'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HeroProps {
    post?: {
        title: string;
        excerpt?: string;
        content?: string;
        cover_image: string;
        slug: string;
    } | null | any;
}

export default function Hero({ post }: HeroProps) {
    const title = post?.title || 'V O X Y N';

    let extractedExcerpt = '';
    if (post?.content) {
        const metaMatch = post.content.match(/<div id="voxo-metadata" data-excerpt="(.*?)"/);
        if (metaMatch) extractedExcerpt = metaMatch[1].replace(/&quot;/g, '"');
    }

    const subtitle = post?.excerpt || extractedExcerpt || 'THE NEW SYNTH • REDEFINING BOUNDARIES';
    const bgImage = post?.cover_image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjO7KPUXt-RmJ7hVDcehFYap-aEc3LxZYZCqgxJkhkMgVddoikvox-8--Y-AqhJOV6_uHDQW79JGS9cnD6uHkvogxTLxF9ZwpoGg3Nfh8WKEIs6acJxqGcw-Wu_MBUSXBliEv7_gr6SnCioZ9oFvI6humJfvsWPF-BYSpuIXPkwwLCSuPBLsyExWfxpA9lx-wIf32LCXgroohCwmTrSJzXxYXu99pUj1_IvY3mXQj4xrvfrr-LsLZao80uhUzhVfLnt9SO3_gzjz3l';
    const postLink = post?.slug ? `/post/${post.slug}` : '#';

    return (
        <header className="relative w-full h-[100svh] flex flex-col items-center justify-center overflow-hidden bg-black">
            <motion.div
                initial={{ scale: 1.05, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 w-full h-full z-0"
            >
                <img
                    alt="Cover Image"
                    className="w-full h-full object-cover object-top opacity-50 grayscale"
                    src={bgImage}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/70 to-[#050505]"></div>
            </motion.div>

            <div className="relative z-10 text-center flex flex-col items-center max-w-5xl px-4 mt-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-6 flex flex-col items-center gap-3"
                >
                    <span className="inline-block h-px w-6 bg-white/30"></span>
                    <p className="text-[9px] tracking-[0.4em] uppercase text-gray-500 font-display">Cover Story</p>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="font-display font-light text-5xl md:text-7xl lg:text-8xl tracking-[0.15em] uppercase text-white mb-8 drop-shadow-2xl max-w-[90vw] text-center"
                >
                    {title}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="text-gray-400 font-serif italic text-sm md:text-lg tracking-wide leading-relaxed max-w-xl mx-auto mb-16 font-body drop-shadow-md line-clamp-3 px-4"
                >
                    {subtitle}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    <a href={postLink} className="group relative px-10 py-4 overflow-hidden rounded-none border border-white/10 hover:border-white/30 transition-colors duration-700 inline-block bg-white/5 backdrop-blur-sm">
                        <span className="relative z-10 text-[9px] uppercase tracking-[0.3em] text-gray-300 group-hover:text-white transition-colors duration-500 font-display">Read Story</span>
                        <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"></div>
                    </a>
                </motion.div>
            </div>

            <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            >
                <div className="w-2 h-2 border-r border-b border-white/50 rotate-45"></div>
            </motion.div>
        </header>
    );
}
