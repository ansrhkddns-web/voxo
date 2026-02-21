'use client';

import React from 'react';
import { BarChart2, TrendingUp } from 'lucide-react';

export default function ArtistStats() {
    return (
        <div className="bg-surface-dark rounded-xl border border-white/10 overflow-hidden shadow-2xl shadow-black/40">
            <div className="h-2 bg-primary w-full" />
            <div className="p-6">
                <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
                    <BarChart2 className="text-primary" size={20} />
                    Artist Stats
                </h3>

                <div className="space-y-6">
                    <div>
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Monthly Listeners</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-white tracking-tight">2.4M</span>
                            <span className="text-primary text-sm font-bold flex items-center">
                                <TrendingUp size={14} className="mr-1" /> 12%
                            </span>
                        </div>
                    </div>

                    <div className="h-px w-full bg-white/5" />

                    <div>
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">Top Tracks</p>
                        <ul className="space-y-3">
                            {[
                                { id: '01', title: 'Digital Rain', time: '4:20' },
                                { id: '02', title: 'Neon Heart', time: '3:45' },
                                { id: '03', title: 'System Failure', time: '2:58' },
                            ].map((track) => (
                                <li key={track.id} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-600 text-sm font-mono group-hover:text-primary">{track.id}</span>
                                        <span className="text-gray-200 text-sm font-medium group-hover:text-white transition-colors">{track.title}</span>
                                    </div>
                                    <span className="text-gray-500 text-xs">{track.time}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="h-px w-full bg-white/5" />

                    <div>
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Genre</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="text-white text-sm font-bold bg-white/5 px-3 py-1 rounded-md">Cyber-Pop</span>
                            <span className="text-white text-sm font-bold bg-white/5 px-3 py-1 rounded-md">Industrial</span>
                        </div>
                    </div>
                </div>

                <button className="w-full mt-8 py-3 rounded-lg border border-primary text-primary font-bold text-sm hover:bg-primary hover:text-black transition-all duration-300">
                    View Full Profile
                </button>
            </div>
        </div>
    );
}
