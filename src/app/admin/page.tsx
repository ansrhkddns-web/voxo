'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Search, Edit2, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { getPosts, deletePost } from '@/app/actions/postActions';
import { cn } from "@/lib/utils";
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const router = useRouter();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const data = await getPosts();
            setPosts(data);
        } catch (error) {
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
        } catch (error) {
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
                            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-display">System Status: Online</span>
                        </div>
                        <h1 className="text-4xl font-display font-light tracking-widest uppercase">Content Control</h1>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                        <input
                            placeholder="SEARCH ARTICLES..."
                            className="w-full bg-transparent border-b border-white/10 py-3 pl-0 pr-10 text-[10px] tracking-widest text-white placeholder:text-gray-700 focus:outline-none focus:border-accent-green transition-colors uppercase font-display"
                        />
                    </div>
                </header>

                {/* Performance Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
                    {[
                        { label: 'Total Archives', value: posts.length.toString().padStart(2, '0') },
                        { label: 'Published Units', value: posts.filter(p => p.is_published).length.toString().padStart(2, '0') },
                        { label: 'Category Layers', value: Array.from(new Set(posts.map(p => p.categories?.name))).filter(Boolean).length.toString().padStart(2, '0') },
                        { label: 'Avg Read Time', value: '12M' },
                    ].map((stat, i) => (
                        <div key={i} className="group border-l border-white/5 pl-6 py-2 hover:border-accent-green transition-colors duration-500">
                            <p className="text-gray-500 text-[9px] font-display uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                            <p className="text-3xl font-display font-light tracking-tighter text-white group-hover:text-accent-green transition-colors">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Directory Table */}
                <div className="relative">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-8 font-display">Article Directory</p>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96 gap-4 border border-white/5 bg-gray-950/20">
                            <Loader2 className="animate-spin text-accent-green" size={24} strokeWidth={1} />
                            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-600 font-display animate-pulse">Syncing Database...</span>
                        </div>
                    ) : (
                        <div className="border border-white/5 bg-gray-950/20 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-[9px] uppercase tracking-[0.2em] font-display text-gray-600">
                                        <th className="px-8 py-6 font-medium">Archived Title</th>
                                        <th className="px-8 py-6 font-medium">Classification</th>
                                        <th className="px-8 py-6 font-medium">Integrity Status</th>
                                        <th className="px-8 py-6 font-medium text-right">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 font-display">
                                    {posts.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center">
                                                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-700 italic">No Data Sequences Found</p>
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
                                                    <span className="text-gray-400 text-[10px] uppercase tracking-widest">{post.categories?.name || 'GENERIC'}</span>
                                                </td>
                                                <td className="px-8 py-8 font-display">
                                                    <span className={cn(
                                                        "text-[9px] uppercase tracking-widest",
                                                        post.is_published ? "text-accent-green" : "text-gray-600"
                                                    )}>
                                                        {post.is_published ? 'Verified / Published' : 'Pending / Draft'}
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
