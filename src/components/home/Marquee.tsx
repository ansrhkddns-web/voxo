'use client';

import React from 'react';

const NEWS_ITEMS = [
    "Daft Punk Returns? Rumors Swirl",
    "Top 50 Festivals of 2024 Announced",
    "Vinyl Sales Hit New Record High",
    "The Analog Renaissance is Here"
];

export default function Marquee() {
    return (
        <div className="w-full border-t border-b border-white/10 bg-black z-20 relative">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between overflow-hidden">
                <div className="flex items-center gap-4 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse"></span>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-white font-display">Latest News</span>
                </div>

                <div className="flex-1 ml-8 overflow-hidden relative h-5">
                    <div className="absolute w-full animate-marquee whitespace-nowrap flex gap-16">
                        {[...Array(4)].map((_, i) => (
                            <React.Fragment key={i}>
                                {NEWS_ITEMS.map((item, index) => (
                                    <React.Fragment key={index}>
                                        <span className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors cursor-pointer font-display">
                                            {item}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-widest text-gray-800">///</span>
                                    </React.Fragment>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
