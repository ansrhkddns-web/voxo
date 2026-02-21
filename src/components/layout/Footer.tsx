import React from 'react';
import { Twitter, Instagram } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="py-20 px-8 border-t border-white/10 bg-black">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rotate-45"></div>
                    <span className="font-display font-light tracking-[0.2em] text-xs text-white">VOXO</span>
                </Link>

                <div className="flex gap-8">
                    {['About', 'Contact', 'Privacy', 'Terms'].map((item) => (
                        <a key={item} href="#" className="text-[9px] uppercase tracking-[0.15em] font-medium text-gray-500 hover:text-white transition-colors font-display">
                            {item}
                        </a>
                    ))}
                </div>

                <div className="flex gap-4">
                    <a className="text-white hover:text-accent-green transition-colors" href="#">
                        <Twitter size={16} />
                    </a>
                    <a className="text-white hover:text-accent-green transition-colors" href="#">
                        <Instagram size={16} />
                    </a>
                </div>
            </div>

            <div className="text-center mt-12 text-[8px] tracking-widest text-gray-800 font-display">
                © 2024 VOXO MAGAZINE. ALL RIGHTS RESERVED.
            </div>
        </footer>
    );
}
