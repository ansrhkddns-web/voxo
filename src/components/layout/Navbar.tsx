'use client';

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { Search, User, Menu } from 'lucide-react';
import SearchOverlay from './SearchOverlay';

export default function Navbar() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
            <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between">
                {/* Left: Mobile Menu */}
                <div className="md:hidden">
                    <Menu className="text-white hover:text-accent-green transition-colors cursor-pointer" size={20} strokeWidth={1} />
                </div>

                {/* Center/Left: Navigation Links */}
                <div className="hidden md:flex items-center gap-12">
                    {/* News Links */}
                    <Link href="/news" className="text-[10px] uppercase tracking-[0.3em] font-display text-gray-400 hover:text-white transition-colors">
                        News
                    </Link>

                    {/* Reviews Dropdown */}
                    <div className="relative group/nav">
                        <Link href="/reviews" className="text-[10px] uppercase tracking-[0.3em] font-display text-gray-400 group-hover/nav:text-white transition-colors py-4 inline-block">
                            Reviews
                        </Link>
                        {/* Dropdown Menu */}
                        <div className="absolute left-0 top-full pt-2 opacity-0 -translate-y-2 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto transition-all duration-300">
                            <div className="bg-black/95 backdrop-blur-xl border border-white/10 p-4 w-48 flex flex-col gap-4 shadow-2xl">
                                <Link href="/reviews" className="text-[9px] uppercase tracking-[0.3em] text-gray-400 hover:text-accent-green transition-colors font-display block">Reviews</Link>
                                <Link href="/editors-pick" className="text-[9px] uppercase tracking-[0.3em] text-gray-400 hover:text-accent-green transition-colors font-display block">Editor's Pick</Link>
                                <Link href="/focus" className="text-[9px] uppercase tracking-[0.3em] text-gray-400 hover:text-accent-green transition-colors font-display block">Focus</Link>
                                <Link href="/cover-story" className="text-[9px] uppercase tracking-[0.3em] text-gray-400 hover:text-accent-green transition-colors font-display block">Cover Story</Link>
                            </div>
                        </div>
                    </div>

                    {/* Features & Archives Links */}
                    {['Features', 'Archives'].map((item) => (
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
                        className="text-white hover:text-accent-green transition-colors flex items-center gap-2"
                        title="Search (Cmd+K)"
                    >
                        <Search size={18} strokeWidth={1} />
                        <span className="hidden md:inline-block text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400 font-mono tracking-tighter">⌘K</span>
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
