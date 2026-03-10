'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, Search, User } from 'lucide-react';
import SearchOverlay from './SearchOverlay';

const NAV_LINKS = [
  { href: '/news', label: 'News' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/editors-pick', label: "Editor's Pick" },
  { href: '/focus', label: 'Focus' },
  { href: '/features', label: 'Features' },
  { href: '/archives', label: 'Archives' },
  { href: '/cover-story', label: 'Cover Story' },
];

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }

      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#050505]/70 backdrop-blur-2xl transition-all duration-1000">
      <div className="mx-auto flex h-20 max-w-[1800px] items-center justify-between px-6">
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="text-white/70 transition-colors duration-700 hover:text-white"
            aria-label="Open navigation menu"
          >
            <Menu className="cursor-pointer" size={20} strokeWidth={1} />
          </button>
        </div>

        <div className="hidden items-center gap-12 md:flex">
          <Link href="/news" className="text-[10px] font-display uppercase tracking-[0.3em] text-gray-400 transition-colors duration-700 hover:text-white">
            News
          </Link>

          <div className="group/nav relative">
            <Link href="/reviews" className="inline-block py-4 text-[10px] font-display uppercase tracking-[0.3em] text-gray-400 transition-colors duration-700 group-hover/nav:text-white">
              Reviews
            </Link>
            <div className="pointer-events-none absolute left-0 top-full -translate-y-2 pt-2 opacity-0 transition-all duration-300 group-hover/nav:pointer-events-auto group-hover/nav:translate-y-0 group-hover/nav:opacity-100">
              <div className="flex w-56 flex-col gap-5 border border-white/5 bg-[#050505]/95 p-6 shadow-2xl backdrop-blur-2xl">
                <Link href="/reviews" className="block text-[9px] font-display uppercase tracking-[0.3em] text-gray-500 transition-colors duration-500 hover:text-white">
                  Reviews
                </Link>
                <Link href="/editors-pick" className="block text-[9px] font-display uppercase tracking-[0.3em] text-gray-500 transition-colors duration-500 hover:text-white">
                  Editor&apos;s Pick
                </Link>
                <Link href="/focus" className="block text-[9px] font-display uppercase tracking-[0.3em] text-gray-500 transition-colors duration-500 hover:text-white">
                  Focus
                </Link>
                <Link href="/cover-story" className="block text-[9px] font-display uppercase tracking-[0.3em] text-gray-500 transition-colors duration-500 hover:text-white">
                  Cover Story
                </Link>
              </div>
            </div>
          </div>

          {['Features', 'Archives'].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="text-[10px] font-display uppercase tracking-[0.3em] text-gray-400 transition-colors duration-700 hover:text-white"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="flex items-baseline gap-1 font-display text-3xl font-light uppercase tracking-[0.5em] text-white">
            VO<span className="text-accent-green">X</span>O
          </Link>
        </div>

        <div className="flex items-center gap-8">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 text-white transition-colors duration-700 hover:text-accent-green"
            title="Search (Cmd+K)"
          >
            <Search size={18} strokeWidth={1} />
            <span className="hidden rounded bg-white/10 px-1.5 py-0.5 font-mono text-[8px] tracking-tighter text-gray-400 md:inline-block">
              CMD+K
            </span>
          </button>
          <Link href="/login" className="flex items-center gap-2 text-white transition-colors duration-700 hover:text-accent-green">
            <User size={18} strokeWidth={1} />
          </Link>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-white/5 bg-[#050505]/95 px-6 py-6 md:hidden">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-400 transition-colors duration-500 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
}
