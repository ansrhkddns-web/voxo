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
                    {/* Positioned slightly over center to prevent overlap with the thin playback bar at the bottom */}
                    <div className="absolute inset-x-0 top-[6px] z-[120] flex justify-center pointer-events-none">
                        {/* Container that catches pointer events */}
                        <div className="relative flex items-center gap-5 bg-black/70 backdrop-blur-md border border-white/10 px-5 py-1.5 rounded-full shadow-2xl pointer-events-auto transition-all hover:bg-black/90 hover:scale-105 duration-300">

                            {/* Left Title Label - Attached to the left of the control block to avoid overlapping song title */}
                            <div className="absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 px-3 py-1 bg-black/50 rounded-full border border-white/5 backdrop-blur-md pointer-events-none whitespace-nowrap">
                                <Globe2 size={10} className="text-accent-green" />
                                <span className="text-[9px] uppercase tracking-widest text-white/70 font-display">VOXO Official Selection</span>
                            </div>

                            {/* Previous Track */}
                            <button className="text-gray-400 hover:text-white transition-colors p-1" title="Previous">
                                <SkipBack size={14} fill="currentColor" />
                            </button>

                            {/* Stop Button (Seek 0 + Pause) */}
                            <button onClick={stopPlay} className="text-gray-400 hover:text-white transition-colors p-1" title="Stop">
                                <Square size={13} fill="currentColor" />
                            </button>

                            {/* Play/Pause Main Button */}
                            <button
                                onClick={togglePlay}
                                className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform"
                            >
                                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                            </button>

                            {/* Next Track */}
                            <button className="text-gray-400 hover:text-white transition-colors p-1" title="Next">
                                <SkipForward size={14} fill="currentColor" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
