'use client';

import React from 'react';

interface RatingMeterProps {
    rating: number;
}

export default function RatingMeter({ rating }: RatingMeterProps) {
    const percentage = (rating / 10) * 100;

    return (
        <div className="space-y-4 font-display">
            <div className="flex justify-between items-end">
                <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">System Rating</span>
                <span className="text-6xl font-light tracking-tighter text-white">
                    {rating.toFixed(1)}
                    <span className="text-xs text-gray-700 ml-1 font-mono">/ 10.0</span>
                </span>
            </div>

            <div className="relative h-1.5 w-full bg-gray-900 overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-accent-green transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(74,222,128,0.5)]"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="flex justify-between text-[8px] uppercase tracking-widest text-gray-700 font-mono">
                <span>0.0 // BASE</span>
                <span>OPTIMIZED // 10.0</span>
            </div>
        </div>
    );
}
