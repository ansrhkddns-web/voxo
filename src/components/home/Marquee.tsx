import React from 'react';

interface MarqueeProps {
    items?: string[];
    label?: string;
}

const FALLBACK_ITEMS = [
    'Fresh reviews from the underground scene',
    'New interviews and playlist picks every week',
    'Editorial curation for records, tracks, and live culture',
    'Independent voices shaping the next wave of music',
];

export default function Marquee({
    items = FALLBACK_ITEMS,
    label = 'Latest News',
}: MarqueeProps) {
    const normalizedItems = items
        .map((item) => item.trim())
        .filter(Boolean);
    const displayItems = normalizedItems.length > 0 ? normalizedItems : FALLBACK_ITEMS;

    return (
        <div className="relative z-20 w-full border-b border-t border-white/10 bg-black">
            <div className="container mx-auto flex items-center justify-between overflow-hidden px-4 py-3">
                <div className="flex items-center gap-4 whitespace-nowrap">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-green"></span>
                    <span className="font-display text-[10px] uppercase tracking-[0.15em] text-white">
                        {label}
                    </span>
                </div>

                <div className="relative ml-8 h-5 flex-1 overflow-hidden">
                    <div className="absolute flex w-full animate-marquee gap-16 whitespace-nowrap">
                        {[...Array(4)].map((_, groupIndex) => (
                            <React.Fragment key={groupIndex}>
                                {displayItems.map((item) => (
                                    <React.Fragment key={`${groupIndex}-${item}`}>
                                        <span className="font-display text-[10px] uppercase tracking-widest text-gray-500 transition-colors hover:text-white">
                                            {item}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-widest text-gray-800">{'///'}</span>
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
