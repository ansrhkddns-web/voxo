import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { searchPosts } from '@/app/actions/postActions';
import { getMenuTags } from '@/app/actions/tagActions';
import type { SearchPostResult } from '@/types/content';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const RECENT_SEARCHES_KEY = 'voxo-recent-searches';

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchPostResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [recentQueries, setRecentQueries] = useState<string[]>([]);
    const [menuTagNames, setMenuTagNames] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            try {
                const savedQueries = window.localStorage.getItem(RECENT_SEARCHES_KEY);
                if (savedQueries) {
                    const parsed = JSON.parse(savedQueries) as string[];
                    setRecentQueries(Array.isArray(parsed) ? parsed : []);
                }
            } catch (error) {
                console.error('Failed to read recent searches', error);
            }
        } else {
            document.body.style.overflow = 'auto';
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        const loadMenuTags = async () => {
            try {
                const tags = await getMenuTags();
                setMenuTagNames((tags ?? []).slice(0, 6).map((tag) => tag.name));
            } catch (error) {
                console.error('Failed to load menu tags for search overlay', error);
            }
        };

        if (isOpen) {
            void loadMenuTags();
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

    const persistRecentQuery = (nextQuery: string) => {
        const trimmed = nextQuery.trim();
        if (!trimmed) {
            return;
        }

        const nextRecentQueries = [trimmed, ...recentQueries.filter((item) => item !== trimmed)].slice(0, 6);
        setRecentQueries(nextRecentQueries);
        window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(nextRecentQueries));
    };

    const applySuggestion = (value: string) => {
        setQuery(value);
    };

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
                        <span className="text-[10px] uppercase tracking-[0.5em] text-accent-green font-display">검색</span>
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
                                placeholder="아티스트, 곡명, 제목으로 검색해보세요..."
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

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                            <div className="space-y-4">
                                <p className="text-[10px] uppercase tracking-[0.25em] font-display text-gray-600">
                                    {query.length > 1 ? `${results.length}개 결과` : '빠른 탐색'}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {recentQueries.map((recentQuery) => (
                                        <button
                                            key={recentQuery}
                                            type="button"
                                            onClick={() => applySuggestion(recentQuery)}
                                            className="border border-white/10 px-4 py-2 text-[9px] uppercase tracking-[0.18em] text-gray-400 transition-colors hover:border-accent-green hover:text-accent-green"
                                        >
                                            {recentQuery}
                                        </button>
                                    ))}
                                    {recentQueries.length === 0 ? (
                                        menuTagNames.map((tagName) => (
                                            <button
                                                key={tagName}
                                                type="button"
                                                onClick={() => applySuggestion(tagName)}
                                                className="border border-white/10 px-4 py-2 text-[9px] uppercase tracking-[0.18em] text-gray-400 transition-colors hover:border-accent-green hover:text-accent-green"
                                            >
                                                #{tagName}
                                            </button>
                                        ))
                                    ) : null}
                                </div>
                            </div>

                            <div className="border border-white/5 bg-white/[0.02] p-5">
                                <p className="text-[10px] uppercase tracking-[0.25em] font-display text-gray-500">
                                    검색 팁
                                </p>
                                <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-500">
                                    <p>아티스트명, 곡명, 기사 제목으로 검색해보세요.</p>
                                    <p>인디, 재즈, 소울, K-POP 같은 장르 태그로도 찾을 수 있습니다.</p>
                                    <p>ESC 키를 누르면 언제든 검색창을 닫을 수 있습니다.</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-display text-gray-600">검색 결과</h3>
                                    {query.length > 1 ? (
                                        <Link
                                            href={`/search?q=${encodeURIComponent(query)}`}
                                            onClick={() => {
                                                persistRecentQuery(query);
                                                onClose();
                                            }}
                                            className="text-[10px] uppercase tracking-[0.22em] text-gray-400 transition-colors hover:text-accent-green"
                                        >
                                            전체 결과 보기
                                        </Link>
                                    ) : null}
                                </div>
                                <div className="space-y-6">
                                    {results.length > 0 ? results.map((result) => (
                                        <Link
                                            key={result.slug}
                                            href={`/post/${result.slug}`}
                                            onClick={() => {
                                                persistRecentQuery(query || result.title);
                                                onClose();
                                            }}
                                            className="group block space-y-2"
                                        >
                                            <span className="text-[8px] uppercase tracking-widest text-accent-green/60">{result.categories?.name || 'Archive'}</span>
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xl font-display font-light uppercase tracking-wide group-hover:text-accent-green transition-colors">{result.title}</h4>
                                                <ArrowRight className="text-gray-800 group-hover:text-accent-green group-hover:translate-x-2 transition-all" size={16} strokeWidth={1} />
                                            </div>
                                        </Link>
                                    )) : query.length > 1 ? (
                                        <p className="text-[10px] uppercase tracking-widest text-gray-800">조건에 맞는 글을 찾지 못했습니다.</p>
                                    ) : (
                                        <p className="text-[10px] uppercase tracking-widest text-gray-800 italic">검색어를 입력하면 바로 결과를 보여드립니다.</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white/[0.02] border border-white/5 p-12 space-y-6 hidden md:block">
                                <h3 className="text-[10px] uppercase tracking-[0.3em] font-display text-gray-400">추천 태그</h3>
                                <div className="flex flex-wrap gap-3">
                                    {menuTagNames.length > 0 ? menuTagNames.map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => applySuggestion(tag)}
                                            className="text-[9px] uppercase tracking-widest text-gray-600 border border-white/5 px-4 py-2 hover:border-accent-green hover:text-white transition-all"
                                        >
                                            #{tag}
                                        </button>
                                    )) : ['#Indie', '#Techno', '#Ambient'].map(tag => (
                                        <button key={tag} type="button" className="text-[9px] uppercase tracking-widest text-gray-600 border border-white/5 px-4 py-2 hover:border-accent-green hover:text-white transition-all">
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
