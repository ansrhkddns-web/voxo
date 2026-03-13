import React from 'react';
import Link from 'next/link';
import {
    AlertCircle,
    CheckCircle,
    ExternalLink,
    Loader2,
    Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminPostSummary } from '@/types/content';
import type { DashboardLanguage } from '../types';
import { formatDashboardNumber } from '../utils';

interface DashboardPostsTableProps {
    posts: AdminPostSummary[];
    loading: boolean;
    locale: string;
    language: DashboardLanguage;
    searchQuery: string;
    totalLabel: string;
    showingLabel: string;
    syncingLabel: string;
    emptySearchLabel: string;
    emptyStateLabel: string;
    genericLabel: string;
    statusPublishedLabel: string;
    statusDraftLabel: string;
    columns: {
        title: string;
        category: string;
        views: string;
        status: string;
        operations: string;
    };
    onDelete: (id: string) => void;
}

export function DashboardPostsTable({
    posts,
    loading,
    locale,
    language,
    searchQuery,
    totalLabel,
    showingLabel,
    syncingLabel,
    emptySearchLabel,
    emptyStateLabel,
    genericLabel,
    statusPublishedLabel,
    statusDraftLabel,
    columns,
    onDelete,
}: DashboardPostsTableProps) {
    return (
        <div className="overflow-hidden border border-white/5 bg-gray-950/20">
            <div className="flex items-center justify-between border-b border-white/5 px-8 py-6">
                <p className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-500">
                    {totalLabel}
                </p>
                <p className="font-display text-[10px] uppercase tracking-[0.2em] text-gray-600">
                    {showingLabel}
                </p>
            </div>

            {loading ? (
                <div className="flex h-80 items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-accent-green" size={24} />
                    <span className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-600">
                        {syncingLabel}
                    </span>
                </div>
            ) : (
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-white/5 font-display text-[9px] uppercase tracking-[0.2em] text-gray-600">
                            <th className="px-8 py-6 font-medium">{columns.title}</th>
                            <th className="px-8 py-6 font-medium">{columns.category}</th>
                            <th className="px-8 py-6 font-medium">{columns.views}</th>
                            <th className="px-8 py-6 font-medium">{columns.status}</th>
                            <th className="px-8 py-6 text-right font-medium">{columns.operations}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-display">
                        {posts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-20 text-center">
                                    <p className="text-[10px] italic uppercase tracking-[0.3em] text-gray-700">
                                        {searchQuery ? emptySearchLabel : emptyStateLabel}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            posts.map((post) => (
                                <tr key={post.id} className="group transition-colors hover:bg-white/[0.02]">
                                    <td className="px-8 py-8">
                                        <Link href={`/admin/editor?id=${post.id}`} className="block group/title">
                                            <p className="text-sm font-light uppercase tracking-wide text-white transition-colors group-hover/title:text-accent-green">
                                                {post.title}
                                            </p>
                                            <p className="mt-1 text-[8px] tracking-widest text-gray-600">
                                                {post.id.toUpperCase()}
                                            </p>
                                        </Link>
                                    </td>
                                    <td className="px-8 py-8">
                                        <span className="text-[10px] uppercase tracking-widest text-gray-400">
                                            {post.categories?.name || genericLabel}
                                        </span>
                                    </td>
                                    <td className="px-8 py-8">
                                        <span className="font-mono text-[10px] tracking-widest text-gray-300">
                                            {formatDashboardNumber(post.view_count || 0, locale)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-8">
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] uppercase tracking-widest',
                                                post.is_published
                                                    ? 'border-accent-green/20 bg-accent-green/10 text-accent-green'
                                                    : 'border-white/10 bg-white/5 text-gray-400'
                                            )}
                                        >
                                            {post.is_published ? (
                                                <CheckCircle size={10} />
                                            ) : (
                                                <AlertCircle size={10} />
                                            )}
                                            {post.is_published
                                                ? statusPublishedLabel
                                                : statusDraftLabel}
                                        </span>
                                    </td>
                                    <td className="px-8 py-8 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <a
                                                href={`/post/${post.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block p-3 text-white/60 transition-colors hover:bg-white/5 hover:text-accent-green"
                                                title={language === 'ko' ? '미리보기' : 'Preview'}
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                            <button
                                                onClick={() => onDelete(post.id)}
                                                className="cursor-pointer p-3 text-white/60 transition-colors hover:bg-white/5 hover:text-red-500"
                                                title={language === 'ko' ? '삭제' : 'Delete'}
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
            )}
        </div>
    );
}
