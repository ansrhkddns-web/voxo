'use client';

import React from 'react';
import { Play } from 'lucide-react';

interface SpotifyEmbedProps {
    uri?: string;
}

export default function SpotifyEmbed({ uri = 'spotify:track:0VjIj9H9tPjS9SqmAtvEnl' }: SpotifyEmbedProps) {
    // Convert URI to embed URL (track, album, artist, playlist supported)
    // Example: spotify:track:xxx -> https://open.spotify.com/embed/track/xxx
    const parts = uri.split(':');
    const type = parts[1];
    const id = parts[2];
    const embedUrl = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;

    return (
        <div className="my-12 p-6 bg-surface-dark border border-white/10 rounded-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Visual Dummy UI while loading or as fallback */}
            <div className="flex items-center gap-6 relative z-10 mb-4">
                <div
                    className="size-24 rounded-lg bg-cover bg-center shrink-0 shadow-lg shadow-black/50"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop")' }}
                />
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-primary tracking-widest uppercase mb-1">Preview</p>
                    <h4 className="text-xl font-bold text-white truncate mb-1">Listen on Spotify</h4>
                    <p className="text-gray-400 text-sm truncate">Click play to listen to the full track</p>
                </div>
                <button className="size-12 rounded-full bg-primary flex items-center justify-center text-black hover:scale-110 transition-transform shadow-[0_0_20px_rgba(29,185,84,0.4)]">
                    <Play size={24} fill="currentColor" />
                </button>
            </div>

            {/* Real Spotify Embed */}
            <iframe
                style={{ borderRadius: '12px' }}
                src={embedUrl}
                width="100%"
                height="152"
                frameBorder="0"
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="relative z-10"
            />
        </div>
    );
}
