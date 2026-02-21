'use client';

import React from 'react';
import { Play } from 'lucide-react';

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
    const embedHeight = isTrack ? "152" : "380";

    return (
        <div className="my-12 group">
            {/* Real Spotify Embed */}
            {embedUrl ? (
                <div className="relative">
                    <iframe
                        style={{ borderRadius: '12px' }}
                        src={embedUrl}
                        width="100%"
                        height={embedHeight}
                        frameBorder="0"
                        allowFullScreen={true}
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="relative z-10 shadow-2xl shadow-black/40 filter grayscale hover:grayscale-0 transition-all duration-700"
                    />
                    {/* Minimalist background glow for cinematic effect */}
                    <div className="absolute -inset-4 bg-accent-green/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                </div>
            ) : (
                <div className="relative z-10 py-12 text-center border border-dashed border-white/5 rounded-2xl bg-black/40 backdrop-blur-sm">
                    <p className="text-[9px] uppercase tracking-[0.4em] text-gray-700 font-display">Awaiting audio sequence synchronization...</p>
                </div>
            )}
        </div>
    );
}
