'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, X } from 'lucide-react';

interface SpotifyEmbedProps {
    uri?: string;
}

export default function SpotifyEmbed({ uri = 'spotify:track:0VjIj9H9tPjS9SqmAtvEnl' }: SpotifyEmbedProps) {
    let type = '';
    let id = '';

    if (uri.startsWith('spotify:')) {
        const parts = uri.split(':');
        type = parts[1];
        id = parts[2];
    } else if (uri.includes('open.spotify.com')) {
        try {
            // Handle URL format: https://open.spotify.com/album/1B3nwCcj7eyO0RKI6lJ9ys?si=...
            const url = new URL(uri);
            const pathParts = url.pathname.split('/').filter(Boolean);
            type = pathParts[0];
            id = pathParts[1];
        } catch (e) {
            console.error("Invalid Spotify URL:", uri);
        }
    }

    const embedUrl = type && id
        ? `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`
        : '';
    const isTrack = type === 'track';
    const embedHeight = isTrack ? 152 : 380;

    const [isSticky, setIsSticky] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const placeholderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsSticky(!entry.isIntersecting);
            },
            { threshold: 0.1 }
        );
        if (placeholderRef.current) {
            observer.observe(placeholderRef.current);
        }
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={placeholderRef} className="my-20 group relative w-full">
            {/* Real Spotify Embed */}
            {embedUrl ? (
                <>
                    {/* Placeholder space when floating */}
                    <div style={{ height: isSticky && !dismissed ? embedHeight : 0 }} className="w-full transition-all duration-700" />

                    <div className={
                        isSticky && !dismissed
                            ? "fixed bottom-0 left-0 w-full z-[100] bg-[#121212] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-fade-in-up overflow-visible h-[64px]"
                            : "relative w-full opacity-100"
                    }>
                        {isSticky && !dismissed && (
                            <button
                                onClick={() => setDismissed(true)}
                                className="fixed bottom-5 right-4 z-[120] text-yellow-400 hover:text-yellow-300 transition-all pointer-events-auto hover:scale-110 drop-shadow-md"
                                title="Close Player"
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        )}
                        <iframe
                            src={embedUrl}
                            height={isSticky && !dismissed ? 80 : embedHeight}
                            frameBorder="0"
                            allowFullScreen={true}
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            style={{
                                borderRadius: isSticky && !dismissed ? '0px' : '12px',
                                width: isSticky && !dismissed ? '125%' : '100%',
                                transform: isSticky && !dismissed ? 'scale(0.8)' : 'none',
                                transformOrigin: 'top left'
                            }}
                            className={`relative z-10 transition-all duration-700 ${isSticky && !dismissed ? 'block' : 'filter grayscale group-hover:grayscale-0 shadow-2xl shadow-black/40'}`}
                        />
                        {!isSticky && (
                            <div className="absolute -inset-4 bg-accent-green/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                        )}
                    </div>
                </>
            ) : (
                <div className="relative z-10 py-12 text-center border border-dashed border-white/5 rounded-2xl bg-black/40 backdrop-blur-sm">
                    <p className="text-[9px] uppercase tracking-[0.4em] text-gray-700 font-display">Awaiting audio sequence synchronization...</p>
                </div>
            )
            }
        </div >
    );
}
