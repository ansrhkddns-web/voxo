import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { searchPosts } from '@/app/actions/postActions';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        const fetchResults = async () => {
            if (query.length > 1) {
                setIsSearching(true);
                try {
                    const data = await searchPosts(query);
                    setResults(data);
                } catch (error) {
                    console.error('Search failed', error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [query]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col p-8 md:p-20"
                >
                    <div className="flex justify-between items-center mb-20">
                        <span className="text-[10px] uppercase tracking-[0.5em] text-accent-green font-display">Neural Search Interface</span>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-white transition-colors p-4"
                        >
                            <X size={24} strokeWidth={1} />
                        </button>
                    </div>

                    <div className="max-w-5xl mx-auto w-full space-y-20">
                        <div className="relative border-b border-white/10 pb-4">
                            <input
                                autoFocus
                                placeholder="TYPE_SEARCH_QUERY..."
                                className="w-full bg-transparent text-4xl md:text-7xl font-display font-light uppercase tracking-tighter text-white placeholder:text-gray-900 focus:outline-none"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            {isSearching ? (
                                <Loader2 className="absolute right-0 top-1/2 -translate-y-1/2 animate-spin text-accent-green" size={24} />
                            ) : (
                                <Search className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-800" size={24} strokeWidth={1} />
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <h3 className="text-[10px] uppercase tracking-[0.3em] font-display text-gray-600">Sync Results</h3>
                                <div className="space-y-6">
                                    {results.length > 0 ? results.map((result) => (
                                        <Link
                                            key={result.slug}
                                            href={`/post/${result.slug}`}
                                            onClick={onClose}
                                            className="group block space-y-2"
                                        >
                                            <span className="text-[8px] uppercase tracking-widest text-accent-green/60">{result.categories?.name || 'Archive'}</span>
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xl font-display font-light uppercase tracking-wide group-hover:text-accent-green transition-colors">{result.title}</h4>
                                                <ArrowRight className="text-gray-800 group-hover:text-accent-green group-hover:translate-x-2 transition-all" size={16} strokeWidth={1} />
                                            </div>
                                        </Link>
                                    )) : query.length > 1 ? (
                                        <p className="text-[10px] uppercase tracking-widest text-gray-800">No matching signals found.</p>
                                    ) : (
                                        <p className="text-[10px] uppercase tracking-widest text-gray-800 italic">Awaiting query input...</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white/[0.02] border border-white/5 p-12 space-y-6 hidden md:block">
                                <h3 className="text-[10px] uppercase tracking-[0.3em] font-display text-gray-400">Trending Archives</h3>
                                <div className="flex flex-wrap gap-3">
                                    {['#Indie', '#Techno', '#Ambient', '#Reviews2024', '#Underground'].map(tag => (
                                        <button key={tag} className="text-[9px] uppercase tracking-widest text-gray-600 border border-white/5 px-4 py-2 hover:border-accent-green hover:text-white transition-all">
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grainy Noise Overlay */}
                    <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[101] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
