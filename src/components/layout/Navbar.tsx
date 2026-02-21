'use client';

import React, { useState } from 'react';
import Link from "next/link";
import { Search, User, Menu } from 'lucide-react';
import SearchOverlay from './SearchOverlay';

export default function Navbar() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
            <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between">
                {/* Left: Mobile Menu */}
                <div className="md:hidden">
                    <Menu className="text-white hover:text-accent-green transition-colors cursor-pointer" size={20} strokeWidth={1} />
                </div>

                {/* Center/Left: Navigation Links */}
                <div className="hidden md:flex items-center gap-12">
                    {['News', 'Reviews', 'Features', 'Archives'].map((item) => (
                        <Link
                            key={item}
                            href={`/${item.toLowerCase()}`}
                            className="text-[10px] uppercase tracking-[0.3em] font-display text-gray-400 hover:text-white transition-colors"
                        >
                            {item}
                        </Link>
                    ))}
                </div>

                {/* Center: Logo */}
                <div className="absolute left-1/2 -translate-x-1/2">
                    <Link href="/" className="font-display text-3xl font-light tracking-[0.5em] text-white uppercase flex items-baseline gap-1">
                        VO<span className="text-accent-green">X</span>O
                    </Link>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="text-white hover:text-accent-green transition-colors"
                    >
                        <Search size={18} strokeWidth={1} />
                    </button>
                    <Link href="/login" className="text-white hover:text-accent-green transition-colors flex items-center gap-2">
                        <User size={18} strokeWidth={1} />
                    </Link>
                </div>
            </div>

            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </nav>
    );
}
