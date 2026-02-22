'use client';

import React from 'react';
import { TrendingUp, Radio, Disc, ExternalLink, Activity, Zap } from 'lucide-react';

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
    if (!data || data.error) return (
        <div className="relative overflow-hidden bg-gray-950/40 border border-white/5 backdrop-blur-sm p-8 group">
            {/* Scanline Effect Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            <h3 className="text-white text-[10px] uppercase tracking-[0.5em] font-display mb-6 flex items-center gap-4">
                <span className="w-8 h-px bg-red-500/50 animate-pulse" />
                Signal Offline
            </h3>
            <p className="text-[9px] leading-relaxed uppercase tracking-[0.3em] text-gray-500 font-display max-w-[200px]">
                {data?.error || "Artist data stream could not be synchronized."}
            </p>
            <div className="mt-8 pt-6 border-t border-white/5">
                <span className="text-[8px] text-gray-700 uppercase tracking-widest font-mono">Status: Awaiting Manual Input</span>
            </div>
        </div>
    );

    const formatFollowers = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <div className="relative overflow-hidden bg-gray-950/60 border border-white/10 backdrop-blur-md font-display group transition-all duration-1000 hover:border-accent-green/40 shadow-2xl">
            {/* Ambient Background Scenery */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-green/5 blur-[100px] pointer-events-none group-hover:bg-accent-green/10 transition-all duration-1000" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/5 blur-[120px] pointer-events-none group-hover:opacity-100 opacity-50 transition-all" />

            {/* Scanline Effect Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            {/* Header / Identity Section */}
            <div className="relative h-56 overflow-hidden">
                {data.image ? (
                    <img
                        src={data.image}
                        alt={data.name}
                        className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-70 group-hover:scale-105 transition-all duration-[2000ms] cubic-bezier(0.4, 0, 0.2, 1)"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center opacity-30">
                        <Radio size={48} className="text-white animate-pulse" />
                    </div>
                )}

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-950/40 via-transparent to-transparent" />

                <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex items-center gap-3 mb-3">
                        <Zap size={10} className="text-accent-green animate-pulse" />
                        <span className="text-[8px] text-accent-green/80 uppercase tracking-[0.4em] font-mono">Synchronized // Intel</span>
                    </div>
                    <h2 className="text-4xl font-display font-light text-white tracking-tighter mb-3 uppercase italic leading-none group-hover:tracking-normal transition-all duration-700">
                        {data.name}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {data.genres?.map(genre => (
                            <span key={genre} className="text-accent-green text-[7px] font-mono uppercase tracking-[0.2em] px-2 py-1 border border-accent-green/30 bg-accent-green/10 rounded-sm">
                                {genre}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-10 relative z-10">
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 overflow-hidden">
                    <div className="p-5 bg-gray-950/40 hover:bg-white/[0.02] transition-colors relative group/stat">
                        <p className="text-gray-500 text-[8px] uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                            <Activity size={10} className="text-accent-green opacity-50 group-hover/stat:opacity-100 transition-opacity" /> Resonance
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl text-white font-light tracking-tighter">{data.popularity}</span>
                            <span className="text-gray-600 text-[8px] uppercase tracking-widest font-mono">Idx</span>
                        </div>
                    </div>
                    <div className="p-5 bg-gray-950/40 hover:bg-white/[0.02] transition-colors group/stat">
                        <p className="text-gray-500 text-[8px] uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                            <TrendingUp size={10} className="text-blue-500 opacity-50 group-hover/stat:opacity-100 transition-opacity" /> Global Reach
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl text-white font-light tracking-tighter">{formatFollowers(data.followers || 0)}</span>
                            <span className="text-gray-600 text-[8px] uppercase tracking-widest font-mono">Unit</span>
                        </div>
                    </div>
                </div>

                {/* Top Transmissions Section */}
                <div className="space-y-6">
                    <h3 className="text-white text-[9px] uppercase tracking-[0.6em] font-display flex items-center gap-4 opacity-80">
                        <div className="flex-1 h-px bg-gradient-to-r from-accent-green/40 to-transparent" />
                        Top Signals
                        <div className="flex-1 h-px bg-gradient-to-l from-accent-green/40 to-transparent" />
                    </h3>
                    <ul className="space-y-4">
                        {data.topTracks?.map((track, index) => (
                            <li key={track.id} className="flex items-center justify-between group/item p-2 -mx-2 hover:bg-white/[0.02] transition-all rounded-sm">
                                <div className="flex items-center gap-5">
                                    <span className="text-accent-green text-[8px] font-mono opacity-20 group-hover/item:opacity-100 transition-opacity">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </span>
                                    <span className="text-gray-300 text-[10px] uppercase tracking-[0.2em] group-hover/item:text-white transition-all">
                                        {track.name}
                                    </span>
                                </div>
                                <span className="text-gray-600 text-[8px] font-mono group-hover/item:text-accent-green transition-colors">{track.duration}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Recent Signals Section */}
                {data.latestReleases && data.latestReleases.length > 0 && (
                    <div className="space-y-6">
                        <h3 className="text-white text-[9px] uppercase tracking-[0.6em] font-display flex items-center gap-4 opacity-80">
                            <div className="flex-1 h-px bg-gradient-to-r from-blue-500/40 to-transparent" />
                            Recent Output
                            <div className="flex-1 h-px bg-gradient-to-l from-blue-500/40 to-transparent" />
                        </h3>
                        <div className="space-y-3">
                            {data.latestReleases.map(album => (
                                <div key={album.id} className="flex items-center gap-5 p-3 bg-white/[0.01] border border-white/5 group/album hover:bg-white/[0.03] hover:border-white/10 transition-all">
                                    <div className="relative w-12 h-12 overflow-hidden bg-gray-900 border border-white/5">
                                        <img src={album.image} alt={album.name} className="w-full h-full object-cover grayscale opacity-70 group-hover/album:grayscale-0 group-hover/album:opacity-100 group-hover/album:scale-110 transition-all duration-700" />
                                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-[10px] uppercase tracking-[0.15em] font-medium truncate group-hover/album:text-accent-green transition-colors">{album.name}</p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-[7px] text-accent-green/50 uppercase tracking-widest font-mono">[{album.type}]</span>
                                            <span className="w-0.5 h-0.5 bg-white/20 rounded-full" />
                                            <span className="text-[7px] text-gray-500 uppercase tracking-widest font-mono">{album.release_date.split('-')[0]} // UTC</span>
                                        </div>
                                    </div>
                                    <Disc size={14} className="text-gray-700 group-hover/album:text-accent-green group-hover/album:rotate-180 transition-all duration-1000" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* External Portal Link */}
                <a
                    href={data.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex items-center justify-center gap-4 w-full mt-12 py-5 overflow-hidden border border-white/5 bg-white/[0.02] text-[9px] uppercase tracking-[0.4em] font-display text-gray-400 hover:text-white hover:border-accent-green/50 transition-all duration-700 group/link"
                >
                    <div className="absolute inset-0 bg-accent-green/5 translate-y-full group-hover/link:translate-y-0 transition-transform duration-500" />
                    <span className="relative z-10 flex items-center gap-3">
                        Establish Connection <ExternalLink size={12} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                    </span>
                </a>
            </div>
        </div>
    );
}
