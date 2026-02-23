'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Search, Edit2, Trash2, Loader2, ExternalLink, Activity, TrendingUp, BarChart3, Database, CheckCircle, AlertCircle, Terminal } from 'lucide-react';
import { getPosts, deletePost } from '@/app/actions/postActions';
import { cn } from "@/lib/utils";
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { useAdminLanguage } from '@/providers/AdminLanguageProvider';

export default function AdminDashboard() {
    const { t } = useAdminLanguage();
    const [posts, setPosts] = useState<Array<{ id: string; title: string; slug: string; is_published: boolean; categories: { name: string } | null; view_count?: number }>>([]);
    const [loading, setLoading] = useState(true);

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
        if (!confirm('Are you sure?')) return;
        try {
            await deletePost(id);
            fetchPosts();
            toast.success('Post deleted');
        } catch {
            toast.error('Delete failed');
        }
    };

    return (
        <div className="flex min-h-screen bg-black text-white font-body selection:bg-white selection:text-black">
            <Toaster position="top-center" />
            <AdminSidebar />

            <main className="flex-1 p-12 overflow-y-auto">
                <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-20 border-b border-white/5 pb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-4 h-px bg-accent-green"></span>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-display">{t('status', 'dashboard')}</span>
                        </div>
                        <h1 className="text-4xl font-display font-light tracking-widest uppercase">{t('title', 'dashboard')}</h1>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                        <input
                            placeholder={t('search', 'dashboard')}
                            className="w-full bg-transparent border-b border-white/10 py-3 pl-0 pr-10 text-[10px] tracking-widest text-white placeholder:text-gray-700 focus:outline-none focus:border-accent-green transition-colors uppercase font-display"
                        />
                    </div>
                </header>

                {/* Performance Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <div className="bg-white/[0.02] border border-white/5 p-6 relative overflow-hidden group hover:border-accent-green/50 transition-colors duration-500">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Database size={64} />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/5 rounded text-gray-400 group-hover:text-accent-green group-hover:bg-accent-green/10 transition-all">
                                <Database size={16} />
                            </div>
                            <p className="text-gray-500 text-[10px] font-display uppercase tracking-[0.2em]">{t('statArchives', 'dashboard')}</p>
                        </div>
                        <p className="text-4xl font-display font-light tracking-tighter text-white mb-2">{posts.length.toString().padStart(2, '0')}</p>
                        <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-accent-green">
                            <TrendingUp size={10} /> <span>+12% this week</span>
                        </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 p-6 relative overflow-hidden group hover:border-accent-green/50 transition-colors duration-500">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CheckCircle size={64} />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/5 rounded text-gray-400 group-hover:text-accent-green group-hover:bg-accent-green/10 transition-all">
                                <CheckCircle size={16} />
                            </div>
                            <p className="text-gray-500 text-[10px] font-display uppercase tracking-[0.2em]">{t('statPublished', 'dashboard')}</p>
                        </div>
                        <p className="text-4xl font-display font-light tracking-tighter text-white mb-2">
                            {posts.filter(p => p.is_published).length.toString().padStart(2, '0')}
                        </p>
                        <div className="mt-4 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-accent-green"
                                style={{ width: `${posts.length > 0 ? (posts.filter(p => p.is_published).length / posts.length) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 p-6 relative overflow-hidden group hover:border-accent-green/50 transition-colors duration-500">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Activity size={64} />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/5 rounded text-gray-400 group-hover:text-accent-green group-hover:bg-accent-green/10 transition-all">
                                <Activity size={16} />
                            </div>
                            <p className="text-gray-500 text-[10px] font-display uppercase tracking-[0.2em]">{t('statCategories', 'dashboard')}</p>
                        </div>
                        <p className="text-4xl font-display font-light tracking-tighter text-white mb-2">
                            {Array.from(new Set(posts.map(p => p.categories?.name))).filter(Boolean).length.toString().padStart(2, '0')}
                        </p>
                        <p className="text-[9px] uppercase tracking-widest text-gray-500">Active Sectors</p>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 p-6 relative overflow-hidden group hover:border-accent-green/50 transition-colors duration-500">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <BarChart3 size={64} />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/5 rounded text-gray-400 group-hover:text-accent-green group-hover:bg-accent-green/10 transition-all">
                                <BarChart3 size={16} />
                            </div>
                            <p className="text-gray-500 text-[10px] font-display uppercase tracking-[0.2em]">Total Exposure</p>
                        </div>
                        <p className="text-4xl font-display font-light tracking-tighter text-white mb-2">
                            {posts.reduce((sum, p) => sum + (p.view_count || 0), 0).toLocaleString()}
                        </p>
                        <p className="text-[9px] uppercase tracking-widest text-gray-500">Global Impressions</p>
                    </div>
                </div>

                {/* Recent Network Activity Log */}
                <div className="mb-20">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-6 font-display flex items-center gap-2">
                        <Terminal size={12} className="text-accent-green" /> Recent Network Activity
                    </p>
                    <div className="border border-white/5 bg-[#050505] p-6 h-48 overflow-y-auto custom-scrollbar font-mono text-[10px] md:text-xs">
                        {loading ? (
                            <div className="flex items-center gap-3 text-gray-600 animate-pulse">
                                <Loader2 size={12} className="animate-spin" /> Establishing secure connection to mainframe...
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="text-accent-green flex items-start gap-3">
                                    <span className="opacity-50">[{new Date().toLocaleTimeString('en-US', { hour12: false })}]</span>
                                    <span>SYSTEM NOMINAL. Dashboard connection authenticated.</span>
                                </div>
                                {posts.slice(0, 5).map((post, i) => (
                                    <div key={`log-${post.id}`} className="text-gray-400 flex items-start gap-3 opacity-80 hover:opacity-100 transition-opacity">
                                        <span className="text-gray-600 shrink-0">[{new Date(Date.now() - (i + 1) * 3600000).toLocaleTimeString('en-US', { hour12: false })}]</span>
                                        <span>
                                            <span className={post.is_published ? "text-blue-400" : "text-yellow-500"}>
                                                {post.is_published ? "DATA_PUBLISHED" : "DATA_PENDING"}
                                            </span>
                                            {" "}— Sector: {post.categories?.name || 'UNKNOWN'} — Signal ID: {post.id.split('-')[0]}
                                        </span>
                                    </div>
                                ))}
                                <div className="text-gray-500 flex items-start gap-3 opacity-50">
                                    <span className="shrink-0">[{new Date(Date.now() - 6 * 3600000).toLocaleTimeString('en-US', { hour12: false })}]</span>
                                    <span>Scheduled garbage collection routine completed successfully.</span>
                                </div>
                                <div className="flex items-center gap-2 text-accent-green pt-2">
                                    <span className="w-2 h-4 bg-accent-green animate-pulse"></span>
                                    <span className="opacity-50 tracking-widest uppercase text-[9px]">Awaiting input...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Directory Table */}
                <div className="relative">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-8 font-display">{t('dirTitle', 'dashboard')}</p>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96 gap-4 border border-white/5 bg-gray-950/20">
                            <Loader2 className="animate-spin text-accent-green" size={24} strokeWidth={1} />
                            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-600 font-display animate-pulse">{t('syncing', 'dashboard')}</span>
                        </div>
                    ) : (
                        <div className="border border-white/5 bg-gray-950/20 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-[9px] uppercase tracking-[0.2em] font-display text-gray-600">
                                        <th className="px-8 py-6 font-medium">{t('colTitle', 'dashboard')}</th>
                                        <th className="px-8 py-6 font-medium">{t('colClass', 'dashboard')}</th>
                                        <th className="px-8 py-6 font-medium">Views</th>
                                        <th className="px-8 py-6 font-medium">{t('colStatus', 'dashboard')}</th>
                                        <th className="px-8 py-6 font-medium text-right">{t('colOps', 'dashboard')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 font-display">
                                    {posts.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center">
                                                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-700 italic">{t('emptyState', 'dashboard')}</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        posts.map((post) => (
                                            <tr key={post.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-8 py-8">
                                                    <Link
                                                        href={`/admin/editor?id=${post.id}`}
                                                        className="block group/title"
                                                    >
                                                        <p className="text-white text-sm font-light tracking-wide uppercase group-hover/title:text-accent-green transition-colors">{post.title}</p>
                                                        <p className="text-gray-600 text-[8px] mt-1 tracking-widest">{post.id.toUpperCase()}</p>
                                                    </Link>
                                                </td>
                                                <td className="px-8 py-8 font-display">
                                                    <span className="text-gray-400 text-[10px] uppercase tracking-widest">{post.categories?.name || t('generic', 'dashboard')}</span>
                                                </td>
                                                <td className="px-8 py-8 font-display">
                                                    <span className="text-gray-300 text-[10px] tracking-widest font-mono">{post.view_count?.toLocaleString() || '0'}</span>
                                                </td>
                                                <td className="px-8 py-8 font-display">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest border",
                                                        post.is_published
                                                            ? "bg-accent-green/10 text-accent-green border-accent-green/20"
                                                            : "bg-white/5 text-gray-400 border-white/10"
                                                    )}>
                                                        {post.is_published ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                                                        {post.is_published ? t('statusVerified', 'dashboard') : t('statusPending', 'dashboard')}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-8 text-right">
                                                    <div className="flex items-center justify-end gap-2 relative z-50 font-display">
                                                        <a
                                                            href={`/post/${post.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-white/60 hover:text-accent-green transition-colors p-3 hover:bg-white/5 cursor-pointer block"
                                                            title="Shortcut: Preview"
                                                        >
                                                            <ExternalLink size={14} />
                                                        </a>
                                                        <a
                                                            href={`/admin/editor?id=${post.id}`}
                                                            className="text-white/60 hover:text-accent-green transition-colors p-3 hover:bg-white/5 cursor-pointer block"
                                                            title="Shortcut: Recalibrate"
                                                        >
                                                            <Edit2 size={14} />
                                                        </a>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleDelete(post.id);
                                                            }}
                                                            className="text-white/60 hover:text-red-500 transition-colors p-3 hover:bg-white/5 cursor-pointer"
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
