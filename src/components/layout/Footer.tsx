import React from 'react';
import Link from 'next/link';
import { Instagram, Twitter } from 'lucide-react';
import { getSiteSettings } from '@/lib/site-settings';

export default async function Footer() {
    const settings = await getSiteSettings();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-white/10 bg-black px-8 py-20">
            <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
                <Link href="/" className="flex items-center gap-2">
                    <div className="h-2 w-2 rotate-45 bg-white"></div>
                    <span className="font-display text-xs font-light tracking-[0.2em] text-white">
                        VOXO
                    </span>
                </Link>

                <div className="flex gap-8">
                    {[
                        { label: 'About', href: '#' },
                        { label: 'Contact', href: `mailto:${settings.contactEmail}` },
                        { label: 'Privacy', href: '#' },
                        { label: 'Terms', href: '#' },
                    ].map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="font-display text-[9px] font-medium uppercase tracking-[0.15em] text-gray-500 transition-colors hover:text-white"
                        >
                            {item.label}
                        </a>
                    ))}
                </div>

                <div className="flex gap-4">
                    <a className="text-white transition-colors hover:text-accent-green" href="#">
                        <Twitter size={16} />
                    </a>
                    <a className="text-white transition-colors hover:text-accent-green" href="#">
                        <Instagram size={16} />
                    </a>
                </div>
            </div>

            <div className="mt-12 text-center font-display text-[8px] tracking-widest text-gray-800">
                {currentYear} {settings.siteName.toUpperCase()}. ALL RIGHTS RESERVED.
            </div>
        </footer>
    );
}
