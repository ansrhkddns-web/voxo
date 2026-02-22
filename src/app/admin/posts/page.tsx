'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Search, Edit2, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { getPosts, deletePost } from '@/app/actions/postActions';
import { cn } from "@/lib/utils";
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { useAdminLanguage } from '@/providers/AdminLanguageProvider';

export default function AdminPosts() {
    const { t } = useAdminLanguage();
    const [posts, setPosts] = useState<Array<{ id: string; title: string; slug: string; is_published: boolean; categories: { name: string } | null; created_at: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const data = await getPosts();
            setPosts(data);
        } catch {
            toast.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this sequence?')) return;
        try {
            await deletePost(id);
            fetchPosts();
            toast.success('Sequence deleted');
        } catch {
            toast.error('Delete failed');
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.slug.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all'
            ? true
            : filter === 'published'
                ? post.is_published
                : !post.is_published;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex min-h-screen bg-black text-white font-body selection:bg-white selection:text-black">
            <Toaster position="top-center" />
            <AdminSidebar />

            <main className="flex-1 p-12 overflow-y-auto">
                <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16 border-b border-white/5 pb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-4 h-px bg-accent-green"></span>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-display">{t('repo', 'posts')}</span>
                        </div>
                        <h1 className="text-4xl font-display font-light tracking-widest uppercase">{t('title', 'posts')}</h1>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <div className="flex bg-gray-950/50 border border-white/10 p-1 rounded-none">
                            <button
                                onClick={() => setFilter('all')}
                                className={cn("px-6 py-2 text-[9px] uppercase tracking-widest font-display transition-colors", filter === 'all' ? "bg-white text-black" : "text-gray-500 hover:text-white")}
                            >
                                {t('all', 'posts')}
                            </button>
                            <button
                                onClick={() => setFilter('published')}
                                className={cn("px-6 py-2 text-[9px] uppercase tracking-widest font-display transition-colors", filter === 'published' ? "bg-white text-black" : "text-gray-500 hover:text-white")}
                            >
                                {t('published', 'posts')}
                            </button>
                            <button
                                onClick={() => setFilter('draft')}
                                className={cn("px-6 py-2 text-[9px] uppercase tracking-widest font-display transition-colors", filter === 'draft' ? "bg-white text-black" : "text-gray-500 hover:text-white")}
                            >
                                {t('drafts', 'posts')}
                            </button>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                            <input
                                placeholder={t('search', 'posts')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent border-b border-white/10 py-3 pl-0 pr-10 text-[10px] tracking-widest text-white placeholder:text-gray-700 focus:outline-none focus:border-accent-green transition-colors uppercase font-display"
                            />
                        </div>
                    </div>
                </header>

                {/* Directory Table */}
                <div className="relative">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96 gap-4 border border-white/5 bg-gray-950/20">
                            <Loader2 className="animate-spin text-accent-green" size={24} strokeWidth={1} />
                            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-600 font-display animate-pulse">{t('querying', 'posts')}</span>
                        </div>
                    ) : (
                        <div className="border border-white/5 bg-gray-950/20 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-[9px] uppercase tracking-[0.2em] font-display text-gray-600">
                                        <th className="px-8 py-6 font-medium">{t('colIdentify', 'posts')}</th>
                                        <th className="px-8 py-6 font-medium">{t('colCat', 'posts')}</th>
                                        <th className="px-8 py-6 font-medium">{t('colCreated', 'posts')}</th>
                                        <th className="px-8 py-6 font-medium">{t('colStatus', 'posts')}</th>
                                        <th className="px-8 py-6 font-medium text-right">{t('colOps', 'posts')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 font-display">
                                    {filteredPosts.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center">
                                                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-700 italic">{t('emptyState', 'posts')}</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPosts.map((post) => (
                                            <tr key={post.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-8 py-6">
                                                    <Link
                                                        href={`/admin/editor?id=${post.id}`}
                                                        className="block group/title"
                                                    >
                                                        <p className="text-white text-sm font-light tracking-wide uppercase group-hover/title:text-accent-green transition-colors truncate max-w-sm">{post.title}</p>
                                                        <p className="text-gray-600 text-[8px] mt-1 tracking-widest">{post.id.toUpperCase()}</p>
                                                    </Link>
                                                </td>
                                                <td className="px-8 py-6 font-display">
                                                    <span className="text-gray-400 text-[9px] uppercase tracking-widest border border-white/5 px-3 py-1 bg-white/[0.02]">{post.categories?.name || t('generic', 'posts')}</span>
                                                </td>
                                                <td className="px-8 py-6 font-display">
                                                    <span className="text-gray-500 text-[10px] uppercase tracking-widest">
                                                        {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 font-display">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn("w-1.5 h-1.5 rounded-full", post.is_published ? "bg-accent-green" : "bg-gray-600 animate-pulse")} />
                                                        <span className={cn(
                                                            "text-[9px] uppercase tracking-widest",
                                                            post.is_published ? "text-accent-green" : "text-gray-600"
                                                        )}>
                                                            {post.is_published ? t('published', 'posts') : t('drafts', 'posts')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 relative z-50 font-display">
                                                        <a
                                                            href={`/post/${post.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-white/40 hover:text-accent-green transition-colors p-3 hover:bg-white/5 cursor-pointer block"
                                                            title="Shortcut: Preview"
                                                        >
                                                            <ExternalLink size={14} />
                                                        </a>
                                                        <Link
                                                            href={`/admin/editor?id=${post.id}`}
                                                            className="text-white/40 hover:text-white transition-colors p-3 hover:bg-white/5 cursor-pointer block"
                                                            title="Shortcut: Recalibrate"
                                                        >
                                                            <Edit2 size={14} />
                                                        </Link>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleDelete(post.id);
                                                            }}
                                                            className="text-white/40 hover:text-red-500 transition-colors p-3 hover:bg-white/5 cursor-pointer"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Grainy Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>
    );
}
