'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe2, Play, Pause, SkipBack, SkipForward, Square } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function GlobalPlayer({ playlistUrl }: { playlistUrl: string }) {
    const [dismissed, setDismissed] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [embedController, setEmbedController] = useState<any>(null);
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const generateEmbedUrl = (input: string) => {
        if (!input) return '';
        if (input.includes('/embed/')) return input;

        try {
            const match = input.match(/spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/);
            if (match) {
                // Return exactly the embed URL format expected by iframe API URI
                return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
            }
        } catch (e) {
            console.error("Failed to parse Spotify URL", e);
        }
        return input;
    };

    const embedUrl = generateEmbedUrl(playlistUrl);

    useEffect(() => {
        if (!mounted || dismissed || !embedUrl) return;

        // Load Spotify IFrame API script dynamically
        const scriptId = 'spotify-iframe-api';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://open.spotify.com/embed/iframe-api/v1";
            script.async = true;
            document.body.appendChild(script);
        }

        // Define the global callback
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).onSpotifyIframeApiReady = (IFrameAPI: any) => {
            const element = document.getElementById('spotify-iframe');
            if (!element) return;

            // API needs the URI format (spotify:track:123) rather than the URL
            const uri = embedUrl.replace('https://open.spotify.com/embed/', 'spotify:').replace(/\//g, ':');

            const options = {
                uri: uri,
                width: '125%', // Keep the scaled look
                height: '80',
                theme: '0' // Dark theme
            };

            const callback = (EmbedController: any) => {
                setEmbedController(EmbedController);

                EmbedController.addListener('playback_update', (e: any) => {
                    // isPaused is true when not playing
                    setIsPlaying(!e.data.isPaused);
                });
            };

            IFrameAPI.createController(element, options, callback);
        };

        return () => {
            // We don't necessarily remove the script on unmount to prevent reloading issues if they close and reopen,
            // but we clear the callback to avoid memory leaks.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (window as any).onSpotifyIframeApiReady;
        }
    }, [mounted, dismissed, embedUrl]);


    if (!mounted || dismissed || !embedUrl) return null;

    // Optional: Hide global player on admin panel
    if (pathname.startsWith('/admin')) return null;

    const togglePlay = () => {
        if (embedController) {
            embedController.togglePlay();
        }
    };

    const stopPlay = () => {
        if (embedController) {
            embedController.seek(0);
            if (isPlaying) embedController.togglePlay(); // Pause if currently playing
        }
    };


    return (
        <AnimatePresence>
            {!dismissed && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 1 }}
                    className="fixed bottom-0 left-0 w-full z-[100] bg-[#121212] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden h-[64px] group/player"
                >
                    {/* Base DOM element for IFrame injection */}
                    <div
                        style={{
                            transform: 'scale(0.8)',
                            transformOrigin: 'top left',
                            width: '125%',
                            marginTop: '-8px',
                            pointerEvents: 'auto', // ensure the iframe itself is clickable everywhere else
                            position: 'relative',
                            zIndex: 1
                        }}
                    >
                        <div id="spotify-iframe" ref={containerRef} className="block w-full"></div>
                    </div>

                    {/* Left Title Label */}
                    <div className="absolute top-0 left-4 h-full flex items-center z-[110] pointer-events-none opacity-50 hidden md:flex">
                        <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/5 backdrop-blur-md">
                            <Globe2 size={10} className="text-accent-green" />
                            <span className="text-[9px] uppercase tracking-widest text-white font-display">VOXO Official Selection</span>
                        </div>
                    </div>

                    {/* Close Button UI (Right Side) */}
                    <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-[#121212] via-[#121212]/90 to-transparent z-[110] flex items-center justify-end pr-4 pointer-events-none">
                        <button
                            onClick={() => setDismissed(true)}
                            className="bg-black/60 border border-white/10 text-gray-400 hover:text-white rounded-full p-1.5 shadow-lg hover:scale-110 hover:bg-black/80 transition-all pointer-events-auto"
                            title="Close Global Player"
                        >
                            <X size={14} strokeWidth={1.5} />
                        </button>
                    </div>

                    {/* Central Custom Controls Overlay */}
                    {/* This covers the center of the player and intercepts clicks to prevent the iframe from handling them. */}
                    <div className="absolute inset-x-0 top-0 h-full z-[120] flex items-center justify-center pointer-events-none">
                        {/* Container that catches pointer events */}
                        <div className="flex items-center gap-6 bg-black/40 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full shadow-2xl pointer-events-auto transition-all hover:bg-black/60 hover:scale-105 duration-300">
                            {/* Previous Track (Visual only unless premium API is used, but gives a complete look) */}
                            <button className="text-gray-400 hover:text-white transition-colors p-1" title="Previous">
                                <SkipBack size={16} fill="currentColor" />
                            </button>

                            {/* Stop Button (Seek 0 + Pause) */}
                            <button onClick={stopPlay} className="text-gray-400 hover:text-white transition-colors p-1" title="Stop">
                                <Square size={14} fill="currentColor" />
                            </button>

                            {/* Play/Pause Main Button */}
                            <button
                                onClick={togglePlay}
                                className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform"
                            >
                                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                            </button>

                            {/* Next Track */}
                            <button className="text-gray-400 hover:text-white transition-colors p-1" title="Next">
                                <SkipForward size={16} fill="currentColor" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
