'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function GlobalPlayer({ playlistUrl }: { playlistUrl: string }) {
    const [dismissed, setDismissed] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Try to parse standard Spotify URLs into embed URLs
    const generateEmbedUrl = (input: string) => {
        if (!input) return '';
        if (input.includes('/embed/')) return input;

        try {
            const match = input.match(/spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/);
            if (match) {
                return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
            }
        } catch (e) {
            console.error("Failed to parse Spotify URL", e);
        }
        return input;
    };

    const embedUrl = generateEmbedUrl(playlistUrl);

    // Don't render until client mount to avoid hydration mismatch
    if (!mounted || dismissed || !embedUrl) return null;

    // Optional: Hide global player on admin panel
    if (pathname.startsWith('/admin')) return null;

    return (
        <AnimatePresence>
            {!dismissed && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 1 }} // Slow anti-gravity entrance
                    className="fixed bottom-0 left-0 w-full z-[100] bg-[#121212] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden h-[64px]"
                >
                    {/* Floating indication it's the global curation */}
                    <div className="absolute top-0 right-24 h-full flex items-center z-[110] pointer-events-none opacity-50">
                        <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/5 backdrop-blur-md">
                            <Globe2 size={10} className="text-accent-green" />
                            <span className="text-[9px] uppercase tracking-widest text-white font-display">VOXO Official Selection</span>
                        </div>
                    </div>

                    <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-[#121212] via-[#121212]/90 to-transparent z-[110] flex items-center justify-end pr-4 pointer-events-none">
                        <button
                            onClick={() => setDismissed(true)}
                            className="bg-black/60 border border-white/10 text-gray-400 hover:text-white rounded-full p-1.5 shadow-lg hover:scale-110 hover:bg-black/80 transition-all pointer-events-auto"
                            title="Close Global Player"
                        >
                            <X size={14} strokeWidth={1.5} />
                        </button>
                    </div>

                    <iframe
                        src={embedUrl}
                        height="80"
                        frameBorder="0"
                        allowFullScreen={true}
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        style={{
                            borderRadius: '0px',
                            width: '125%',
                            transform: 'scale(0.8)',
                            transformOrigin: 'top left'
                        }}
                        className="relative z-10 transition-all duration-700 block w-full"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
