import React from 'react';
import { Search } from 'lucide-react';

interface DashboardHeaderProps {
    statusText: string;
    title: string;
    searchPlaceholder: string;
    searchQuery: string;
    onSearchChange: (value: string) => void;
}

export function DashboardHeader({
    statusText,
    title,
    searchPlaceholder,
    searchQuery,
    onSearchChange,
}: DashboardHeaderProps) {
    return (
        <header className="mb-16 flex flex-col gap-6 border-b border-white/5 pb-8 md:flex-row md:items-end md:justify-between">
            <div>
                <p className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-400">{statusText}</p>
                <h1 className="mt-2 font-display text-4xl font-light uppercase tracking-widest">{title}</h1>
            </div>

            <div className="relative w-full md:w-80">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input
                    value={searchQuery}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full border-b border-white/10 bg-transparent py-3 pr-10 font-display text-[10px] uppercase tracking-widest text-white placeholder:text-gray-700 focus:border-accent-green focus:outline-none"
                />
            </div>
        </header>
    );
}
