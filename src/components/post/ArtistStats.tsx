'use client';

import React from 'react';
import { TrendingUp, Radio, Disc, ExternalLink, Activity } from 'lucide-react';

interface ArtistData {
    name?: string;
    followers?: number;
    genres?: string[];
    image?: string;
    secondary_image?: string;
    popularity?: number;
    external_url?: string;
    topTracks?: {
        id: string;
        name: string;
        duration: string;
    }[];
    latestReleases?: {
        id: string;
        name: string;
        release_date: string;
        image: string;
        type: string;
    }[];
    error?: string;
}

interface ArtistStatsProps {
    data: ArtistData | null;
}

export default function ArtistStats({ data }: ArtistStatsProps) {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CLIENT-SIDE EMERGENCY FALLBACK: "Voxyn"
    // Bypasses server errors if the artist is identified as Voxyn
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const VOXY_STATIC_DATA: ArtistData = {
        name: "Voxyn",
        followers: 128450,
        genres: ["AI Pop", "Cyber-Vocal", "Electronic"],
        image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop",
        secondary_image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop",
        popularity: 92,
        external_url: "https://open.spotify.com/artist/5rA9ZtIDl4KshP9N39pD8N",
        topTracks: [
            { id: "1", name: "Until It Stops", duration: "3:17" },
            { id: "2", name: "Sync Mode", duration: "2:45" },
            { id: "3", name: "Default Error", duration: "4:02" }
        ],
        latestReleases: [
            {
                id: "a1",
                name: "[Default]",
                release_date: "2024-02-21",
                image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500&auto=format&fit=crop",
                type: "album"
            },
            {
                id: "a2",
                name: "Pulse Signal",
                release_date: "2024-01-15",
                image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=500&auto=format&fit=crop",
                type: "single"
            }
        ]
    };

    // Use a helper to check if it's Voxyn regardless of where the string is
    const isVoxynDetected = (data?.name?.toLowerCase().includes('voxyn') ||
        (typeof window !== 'undefined' && window.location.href.toLowerCase().includes('voxyn')));

    // If there's an error but it's likely Voxyn, show her profile anyway!
    const displayData: ArtistData | null = (data?.error && isVoxynDetected)
        ? VOXY_STATIC_DATA
        : data;

    if (!displayData || displayData.error) return (
        <div className="bg-gray-950/20 border border-white/5 p-6 opacity-30 group">
            <h3 className="text-white text-[10px] uppercase tracking-[0.4em] font-display mb-4 flex items-center gap-3">
                <span className="w-4 h-px bg-red-500/50" />
                Signal Error
            </h3>
            <p className="text-[9px] uppercase tracking-[0.2em] text-gray-600 font-display">
                {displayData?.error || "Artist data stream could not be synchronized."}
            </p>
        </div>
    );

    const formatFollowers = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <div className="bg-gray-950/40 border border-white/10 overflow-hidden font-display relative group transition-all duration-700 hover:border-accent-green/30">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/5 blur-[60px] pointer-events-none group-hover:bg-accent-green/10 transition-all duration-1000" />

            {/* Header / Identity */}
            <div className="relative h-40 overflow-hidden">
                {displayData.image ? (
                    <img
                        src={displayData.image}
                        alt={displayData.name}
                        className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-60 group-hover:scale-110 transition-all duration-1000"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center opacity-20">
                        <Radio size={40} className="text-white" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-2xl font-display font-light text-white tracking-tighter mb-1 uppercase italic">{displayData.name}</h2>
                    <div className="flex flex-wrap gap-2">
                        {displayData.genres?.map(genre => (
                            <span key={genre} className="text-accent-green text-[8px] uppercase tracking-[0.2em] px-2 py-0.5 border border-accent-green/20 bg-accent-green/5">
                                {genre}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/[0.02] border border-white/5">
                        <p className="text-gray-500 text-[9px] uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Activity size={10} className="text-accent-green" /> Resonance
                        </p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl text-white font-light">{displayData.popularity}</span>
                            <span className="text-gray-600 text-[8px] uppercase tracking-tighter">/ 100</span>
                        </div>
                    </div>
                    <div className="p-4 bg-white/[0.02] border border-white/5">
                        <p className="text-gray-500 text-[9px] uppercase tracking-widest mb-2 flex items-center gap-2">
                            <TrendingUp size={10} className="text-accent-green" /> Reach
                        </p>
                        <span className="text-2xl text-white font-light">{formatFollowers(displayData.followers || 0)}</span>
                    </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-white/5 via-white/10 to-white/5" />

                {/* Top Tracks */}
                <div>
                    <h3 className="text-white text-[10px] uppercase tracking-[0.4em] font-display mb-6 flex items-center gap-3">
                        <span className="w-4 h-px bg-accent-green" />
                        Top Transmissions
                    </h3>
                    <ul className="space-y-4">
                        {displayData.topTracks?.map((track, index) => (
                            <li key={track.id} className="flex items-center justify-between group/item">
                                <div className="flex items-center gap-4">
                                    <span className="text-accent-green text-[9px] font-mono opacity-40 group-hover/item:opacity-100">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </span>
                                    <span className="text-gray-300 text-[10px] uppercase tracking-widest group-hover/item:text-white transition-all">
                                        {track.name}
                                    </span>
                                </div>
                                <span className="text-gray-600 text-[9px] font-mono">{track.duration}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Recent Releases */}
                {displayData.latestReleases && displayData.latestReleases.length > 0 && (
                    <div>
                        <h3 className="text-white text-[10px] uppercase tracking-[0.4em] font-display mb-6 flex items-center gap-3">
                            <span className="w-4 h-px bg-accent-green" />
                            Recent Signals
                        </h3>
                        <div className="space-y-4">
                            {displayData.latestReleases.map(album => (
                                <div key={album.id} className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/5 group/album hover:bg-white/[0.04] transition-all">
                                    <img src={album.image} alt={album.name} className="w-10 h-10 object-cover grayscale group-hover/album:grayscale-0 transition-all opacity-80" />
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-white text-[10px] uppercase tracking-widest truncate">{album.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[8px] text-accent-green uppercase tracking-tighter">{album.type}</span>
                                            <span className="w-1 h-1 bg-white/10 rounded-full" />
                                            <span className="text-[8px] text-gray-500 uppercase tracking-tighter">{album.release_date.split('-')[0]}</span>
                                        </div>
                                    </div>
                                    <Disc size={12} className="text-gray-600 group-hover/album:text-accent-green group-hover/album:rotate-90 transition-all duration-700" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Link */}
                <a
                    href={displayData.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full mt-10 text-center py-4 border border-white/10 text-[9px] uppercase tracking-[0.3em] font-display text-gray-400 hover:text-white hover:border-accent-green hover:bg-accent-green/5 transition-all duration-500 group/link"
                >
                    Establish Sync <ExternalLink size={12} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                </a>
            </div>
        </div>
    );
}
