'use client';

import React from 'react';
import { BarChart2, TrendingUp } from 'lucide-react';

interface ArtistStatsProps {
    data: {
        name: string;
        followers: number;
        genres: string[];
        image?: string;
        external_url: string;
        topTracks: {
            id: string;
            title: string;
            duration: string;
        }[];
    } | null;
}

export default function ArtistStats({ data }: ArtistStatsProps) {
    if (!data) return null;

    const formatFollowers = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };
    return (
        <div className="bg-gray-950/20 border border-white/5 overflow-hidden font-display relative group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-green/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />
            <div className="p-6">
                <h3 className="text-white text-[10px] uppercase tracking-[0.4em] font-display mb-8 flex items-center gap-3">
                    <span className="w-4 h-px bg-accent-green" />
                    Artist Intelligence
                </h3>

                <div className="space-y-6">
                    <div>
                        <p className="text-gray-400 text-[10px] font-display uppercase tracking-[0.3em] mb-3">Audience Reach</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-display font-light text-white tracking-tighter">{formatFollowers(data.followers)}</span>
                            <span className="text-accent-green text-[10px] font-display uppercase tracking-widest flex items-center">
                                <TrendingUp size={12} className="mr-1" /> Followers
                            </span>
                        </div>
                    </div>

                    <div className="h-px w-full bg-white/5" />

                    <div>
                        <p className="text-gray-400 text-[10px] font-display uppercase tracking-[0.3em] mb-4">Top Transmissions</p>
                        <ul className="space-y-4">
                            {data.topTracks.map((track, index) => (
                                <li key={track.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-600 text-[9px] font-mono group-hover:text-accent-green transition-colors">
                                            {(index + 1).toString().padStart(2, '0')}
                                        </span>
                                        <span className="text-gray-300 text-[10px] uppercase tracking-widest group-hover:text-white transition-all">
                                            {track.title}
                                        </span>
                                    </div>
                                    <span className="text-gray-600 text-[9px] font-mono">{track.duration}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="h-px w-full bg-white/5" />

                    <div>
                        <p className="text-gray-400 text-[10px] font-display uppercase tracking-[0.3em] mb-4">Meta Genre</p>
                        <div className="flex flex-wrap gap-2">
                            {data.genres.map(genre => (
                                <span key={genre} className="text-gray-400 text-[9px] uppercase tracking-widest border border-white/5 bg-white/[0.02] px-3 py-1.5 hover:border-white/10 transition-colors">
                                    {genre}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <a
                    href={data.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full mt-10 text-center py-4 border border-white/10 text-[9px] uppercase tracking-[0.3em] font-display text-gray-400 hover:text-white hover:border-accent-green transition-all duration-500"
                >
                    Connect to Signal
                </a>
            </div>
        </div>
    );
}
