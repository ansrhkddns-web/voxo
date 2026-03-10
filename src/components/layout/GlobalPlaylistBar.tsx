'use client';

import React, { useMemo, useState } from 'react';
import { Music2, X } from 'lucide-react';

interface GlobalPlaylistBarProps {
    uri: string;
}

function parseSpotifyUri(uri: string) {
    if (!uri) return null;

    if (uri.startsWith('spotify:')) {
        const parts = uri.split(':');
        if (parts.length >= 3) {
            return { type: parts[1], id: parts[2] };
        }
    }

    if (uri.includes('open.spotify.com')) {
        try {
            const url = new URL(uri);
            const pathParts = url.pathname.split('/').filter(Boolean);
            if (pathParts[0] && pathParts[1]) {
                return { type: pathParts[0], id: pathParts[1] };
            }
        } catch (error) {
            console.error('Invalid Spotify URL for global player', error);
        }
    }

    return null;
}

export default function GlobalPlaylistBar({ uri }: GlobalPlaylistBarProps) {
    const [dismissed, setDismissed] = useState(false);
    const parsed = useMemo(() => parseSpotifyUri(uri), [uri]);

    if (!parsed || dismissed) {
        return null;
    }

    const embedUrl = `https://open.spotify.com/embed/${parsed.type}/${parsed.id}?utm_source=generator&theme=0`;

    return (
        <div className="fixed bottom-0 left-0 z-[90] w-full border-t border-white/10 bg-[#0c0c0c]/95 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1800px] items-center gap-4 px-4 py-3 md:px-6">
                <div className="hidden items-center gap-3 md:flex">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-accent-green">
                        <Music2 size={16} />
                    </span>
                    <div>
                        <p className="font-display text-[9px] uppercase tracking-[0.35em] text-gray-500">
                            Global Playlist
                        </p>
                        <p className="font-display text-[10px] uppercase tracking-[0.2em] text-white">
                            Live on every page
                        </p>
                    </div>
                </div>

                <div className="relative min-w-0 flex-1 overflow-hidden rounded-md border border-white/5 bg-black">
                    <iframe
                        src={embedUrl}
                        width="100%"
                        height="80"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="block"
                    />
                </div>

                <button
                    type="button"
                    onClick={() => setDismissed(true)}
                    className="flex h-10 w-10 items-center justify-center border border-white/10 text-gray-500 transition-colors hover:text-white"
                    aria-label="Dismiss player"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
