'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HeroProps {
    post?: {
        title: string;
        excerpt: string;
        cover_image: string;
        slug: string;
    } | null;
}

export default function Hero({ post }: HeroProps) {
    const title = post?.title || 'V O X Y N';
    const subtitle = post?.excerpt || 'THE NEW SYNTH • REDEFINING BOUNDARIES';
    const bgImage = post?.cover_image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjO7KPUXt-RmJ7hVDcehFYap-aEc3LxZYZCqgxJkhkMgVddoikvox-8--Y-AqhJOV6_uHDQW79JGS9cnD6uHkvogxTLxF9ZwpoGg3Nfh8WKEIs6acJxqGcw-Wu_MBUSXBliEv7_gr6SnCioZ9oFvI6humJfvsWPF-BYSpuIXPkwwLCSuPBLsyExWfxpA9lx-wIf32LCXgroohCwmTrSJzXxYXu99pUj1_IvY3mXQj4xrvfrr-LsLZao80uhUzhVfLnt9SO3_gzjz3l';
    const postLink = post?.slug ? `/post/${post.slug}` : '#';

    return (
        <header className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 w-full h-full z-0">
                <img
                    alt="Cover Image"
                    className="w-full h-full object-cover object-top opacity-60 grayscale"
                    src={bgImage}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/80 to-black"></div>
            </div>

            <div className="relative z-10 text-center flex flex-col items-center max-w-5xl px-4 mt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="mb-4"
                >
                    <span className="inline-block h-px w-8 bg-accent-green mb-1"></span>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400 font-display">Cover Story</p>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
                    className="font-display font-light text-5xl md:text-7xl lg:text-9xl tracking-super-wide uppercase text-white mb-6 drop-shadow-xl max-w-[90vw] truncate text-center"
                >
                    {title}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className="text-gray-400 font-light text-sm md:text-base tracking-widest max-w-xl mx-auto mb-16 font-body drop-shadow-md line-clamp-2 px-4"
                >
                    {subtitle}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                >
                    <a href={postLink} className="group relative px-8 py-3 overflow-hidden rounded-sm border border-white/20 hover:border-white/50 transition-colors duration-300 inline-block">
                        <span className="relative z-10 text-[10px] uppercase tracking-[0.2em] text-white group-hover:text-black transition-colors duration-300 font-display">Read Story</span>
                        <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out"></div>
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
