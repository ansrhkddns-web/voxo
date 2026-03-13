'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { Copy, Edit2, ExternalLink, Loader2, Search, Trash2, X } from 'lucide-react';
import { duplicatePost, deletePost, getAdminPostSummaries } from '@/app/actions/postActions';
import { cn } from '@/lib/utils';
import { useAdminLanguage } from '@/providers/AdminLanguageProvider';
import type { AdminPostSummary, CategoryRecord, TagRecord } from '@/types/content';

type StatusFilter = 'all' | 'published' | 'draft';

interface AdminPostsClientProps {
    initialPosts: AdminPostSummary[];
    initialCategories: CategoryRecord[];
    initialTags: TagRecord[];
    initialFilters: {
        searchQuery: string;
        filter: StatusFilter;
        categoryFilter: string;
        tagFilter: string;
    };
    initialLoadFailed?: boolean;
}

export function AdminPostsClient({
    initialPosts,
    initialCategories,
    initialTags,
    initialFilters,
    initialLoadFailed = false,
}: AdminPostsClientProps) {
    const { t, language } = useAdminLanguage();
    const isKorean = language === 'ko';
    const [posts, setPosts] = useState(initialPosts);
    const [categories, setCategories] = useState(initialCategories);
    const [tags, setTags] = useState(initialTags);
    const [searchQuery, setSearchQuery] = useState(initialFilters.searchQuery);
    const [filter, setFilter] = useState<StatusFilter>(initialFilters.filter);
    const [categoryFilter, setCategoryFilter] = useState(initialFilters.categoryFilter);
    const [tagFilter, setTagFilter] = useState(initialFilters.tagFilter);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

    useEffect(() => {
        setPosts(initialPosts);
    }, [initialPosts]);

    useEffect(() => {
        setCategories(initialCategories);
        setTags(initialTags);
    }, [initialCategories, initialTags]);

    useEffect(() => {
        setSearchQuery(initialFilters.searchQuery);
        setFilter(initialFilters.filter);
        setCategoryFilter(initialFilters.categoryFilter);
        setTagFilter(initialFilters.tagFilter);
    }, [initialFilters]);

    useEffect(() => {
        if (!initialLoadFailed) {
            return;
        }

        toast.error(
            isKorean
                ? '글 목록 데이터를 일부 불러오지 못했습니다.'
                : 'Some post list data could not be loaded.'
        );
    }, [initialLoadFailed, isKorean]);

    const refreshPosts = useCallback(async () => {
        setPosts(await getAdminPostSummaries());
    }, []);

    const handleDelete = async (id: string) => {
        const confirmed = confirm(isKorean ? '이 게시글을 삭제할까요?' : 'Delete this post?');
        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(id);
            await deletePost(id);
            await refreshPosts();
            toast.success(isKorean ? '게시글을 삭제했습니다.' : 'Post deleted.');
        } catch {
            toast.error(isKorean ? '게시글 삭제에 실패했습니다.' : 'Failed to delete post.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleDuplicate = async (id: string) => {
        try {
            setDuplicatingId(id);
            const duplicatedPost = await duplicatePost(id);
            await refreshPosts();
            toast.success(
                isKorean
                    ? `복제 초안을 만들었습니다: ${duplicatedPost.title}`
                    : `Draft copy created: ${duplicatedPost.title}`
            );
        } catch {
            toast.error(isKorean ? '게시글 복제에 실패했습니다.' : 'Failed to duplicate post.');
        } finally {
            setDuplicatingId(null);
        }
    };

    const formatDateLabel = (dateValue?: string | null) => {
        if (!dateValue) {
            return 'N/A';
        }

        return new Date(dateValue).toLocaleString(isKorean ? 'ko-KR' : 'en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filteredPosts = useMemo(() => {
        return posts.filter((post) => {
            const normalizedQuery = searchQuery.trim().toLowerCase();
            const matchesSearch =
                !normalizedQuery ||
                post.title.toLowerCase().includes(normalizedQuery) ||
                post.slug.toLowerCase().includes(normalizedQuery) ||
                (post.artist_name || '').toLowerCase().includes(normalizedQuery);
            const matchesStatus =
                filter === 'all'
                    ? true
                    : filter === 'published'
                      ? post.is_published
                      : !post.is_published;
            const matchesCategory = !categoryFilter || post.category_id === categoryFilter;
            const matchesTag = !tagFilter || (post.tags ?? []).includes(tagFilter);
            return matchesSearch && matchesStatus && matchesCategory && matchesTag;
        });
    }, [categoryFilter, filter, posts, searchQuery, tagFilter]);

    const activeCategory = categories.find((item) => item.id === categoryFilter);
    const activeTag = tags.find((item) => item.name === tagFilter);

    return (
        <>
            <Toaster position="top-center" />

            <main className="flex-1 overflow-y-auto p-6 sm:p-10 xl:p-12">
                <header className="mb-10 border-b border-white/5 pb-8">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <span className="h-px w-4 bg-accent-green"></span>
                                <span className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-400">
                                    {t('repo', 'posts')}
                                </span>
                            </div>
                            <h1 className="font-display text-3xl font-light uppercase tracking-widest sm:text-4xl">
                                {t('title', 'posts')}
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm text-gray-500">
                                {isKorean
                                    ? '카테고리와 태그 기준으로 빠르게 좁혀 보고, 복제와 수정 작업으로 바로 이어갈 수 있습니다.'
                                    : 'Filter posts by category or tag and move quickly into review, duplication, and editing.'}
                            </p>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,320px)]">
                            <div className="flex rounded-none border border-white/10 bg-gray-950/50 p-1">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={cn(
                                        'px-6 py-2 font-display text-[9px] uppercase tracking-widest transition-colors',
                                        filter === 'all'
                                            ? 'bg-white text-black'
                                            : 'text-gray-500 hover:text-white'
                                    )}
                                >
                                    {t('all', 'posts')}
                                </button>
                                <button
                                    onClick={() => setFilter('published')}
                                    className={cn(
                                        'px-6 py-2 font-display text-[9px] uppercase tracking-widest transition-colors',
                                        filter === 'published'
                                            ? 'bg-white text-black'
                                            : 'text-gray-500 hover:text-white'
                                    )}
                                >
                                    {t('published', 'posts')}
                                </button>
                                <button
                                    onClick={() => setFilter('draft')}
                                    className={cn(
                                        'px-6 py-2 font-display text-[9px] uppercase tracking-widest transition-colors',
                                        filter === 'draft'
                                            ? 'bg-white text-black'
                                            : 'text-gray-500 hover:text-white'
                                    )}
                                >
                                    {t('drafts', 'posts')}
                                </button>
                            </div>

                            <div className="relative w-full">
                                <Search
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
                                    size={16}
                                />
                                <input
                                    placeholder={t('search', 'posts')}
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    className="w-full border-b border-white/10 bg-transparent py-3 pl-0 pr-10 font-display text-[10px] uppercase tracking-widest text-white placeholder:text-gray-700 transition-colors focus:border-accent-green focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,220px)_minmax(0,220px)_auto]">
                        <select
                            value={categoryFilter}
                            onChange={(event) => setCategoryFilter(event.target.value)}
                            className="border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-accent-green focus:outline-none"
                        >
                            <option value="">{isKorean ? '전체 카테고리' : 'All categories'}</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={tagFilter}
                            onChange={(event) => setTagFilter(event.target.value)}
                            className="border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-accent-green focus:outline-none"
                        >
                            <option value="">{isKorean ? '전체 태그' : 'All tags'}</option>
                            {tags.map((tag) => (
                                <option key={tag.id} value={tag.name}>
                                    {tag.name}
                                </option>
                            ))}
                        </select>

                        <div className="flex flex-wrap items-center gap-2">
                            {activeCategory ? (
                                <span className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-gray-300">
                                    <span>
                                        {isKorean ? '카테고리' : 'Category'}: {activeCategory.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setCategoryFilter('')}
                                        className="text-gray-500 hover:text-white"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ) : null}
                            {activeTag ? (
                                <span className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-gray-300">
                                    <span>
                                        {isKorean ? '태그' : 'Tag'}: {activeTag.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setTagFilter('')}
                                        className="text-gray-500 hover:text-white"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ) : null}
                            {searchQuery ? (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-gray-400 hover:border-accent-green hover:text-accent-green"
                                >
                                    {isKorean ? '검색 초기화' : 'Clear search'}
                                </button>
                            ) : null}
                        </div>
                    </div>
                </header>

                <div className="relative">
                    <div className="overflow-hidden border border-white/5 bg-gray-950/20">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="font-display text-[9px] uppercase tracking-[0.2em] text-gray-600 border-b border-white/5">
                                    <th className="px-8 py-6 font-medium">{t('colIdentify', 'posts')}</th>
                                    <th className="px-8 py-6 font-medium">{t('colCat', 'posts')}</th>
                                    <th className="px-8 py-6 font-medium">{isKorean ? '태그' : 'Tags'}</th>
                                    <th className="px-8 py-6 font-medium">{t('colCreated', 'posts')}</th>
                                    <th className="px-8 py-6 font-medium">{t('colStatus', 'posts')}</th>
                                    <th className="px-8 py-6 text-right font-medium">{t('colOps', 'posts')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-display">
                                {filteredPosts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <p className="text-[10px] italic uppercase tracking-[0.3em] text-gray-700">
                                                {isKorean
                                                    ? '조건에 맞는 게시글이 없습니다.'
                                                    : t('emptyState', 'posts')}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPosts.map((post) => (
                                        <tr
                                            key={post.id}
                                            className="group transition-colors hover:bg-white/[0.02]"
                                        >
                                            <td className="px-8 py-6">
                                                <Link
                                                    href={`/admin/editor?id=${post.id}`}
                                                    className="block group/title"
                                                >
                                                    <p className="max-w-sm truncate text-sm font-light uppercase tracking-wide text-white transition-colors group-hover/title:text-accent-green">
                                                        {post.title}
                                                    </p>
                                                    <p className="mt-1 text-[8px] tracking-widest text-gray-600">
                                                        /post/{post.slug}
                                                    </p>
                                                    <p className="mt-1 text-[8px] tracking-widest text-gray-700">
                                                        {post.id.toUpperCase()}
                                                    </p>
                                                </Link>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="border border-white/5 bg-white/[0.02] px-3 py-1 text-[9px] uppercase tracking-widest text-gray-400">
                                                    {post.categories?.name || t('generic', 'posts')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex max-w-[220px] flex-wrap gap-2">
                                                    {(post.tags ?? []).length > 0 ? (
                                                        (post.tags ?? []).slice(0, 3).map((tag) => (
                                                            <button
                                                                key={tag}
                                                                type="button"
                                                                onClick={() => setTagFilter(tag)}
                                                                className="border border-white/10 px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-gray-400 hover:border-accent-green hover:text-accent-green"
                                                            >
                                                                {tag}
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <span className="text-[9px] uppercase tracking-[0.16em] text-gray-700">
                                                            {isKorean ? '태그 없음' : 'No tags'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1">
                                                    <span className="block text-[10px] uppercase tracking-widest text-gray-400">
                                                        {post.is_published ? 'Published' : 'Created'}{' '}
                                                        {formatDateLabel(post.published_at || post.created_at)}
                                                    </span>
                                                    <span className="block text-[8px] uppercase tracking-[0.2em] text-gray-600">
                                                        Updated {formatDateLabel(post.updated_at || post.created_at)}
                                                    </span>
                                                    <span className="block text-[8px] uppercase tracking-[0.2em] text-gray-700">
                                                        {post.is_published
                                                            ? 'Stable permalink active'
                                                            : 'Draft permalink reserved'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={cn(
                                                            'h-1.5 w-1.5 rounded-full',
                                                            post.is_published
                                                                ? 'bg-accent-green'
                                                                : 'bg-gray-600 animate-pulse'
                                                        )}
                                                    />
                                                    <span
                                                        className={cn(
                                                            'text-[9px] uppercase tracking-widest',
                                                            post.is_published
                                                                ? 'text-accent-green'
                                                                : 'text-gray-600'
                                                        )}
                                                    >
                                                        {post.is_published
                                                            ? t('published', 'posts')
                                                            : t('drafts', 'posts')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="relative z-50 flex items-center justify-end gap-2">
                                                    <a
                                                        href={`/post/${post.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block cursor-pointer p-3 text-white/40 transition-colors hover:bg-white/5 hover:text-accent-green"
                                                        title="Preview"
                                                    >
                                                        <ExternalLink size={14} />
                                                    </a>
                                                    <Link
                                                        href={`/admin/editor?id=${post.id}`}
                                                        className="block cursor-pointer p-3 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={14} />
                                                    </Link>
                                                    <button
                                                        onClick={(event) => {
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            void handleDuplicate(post.id);
                                                        }}
                                                        disabled={duplicatingId === post.id}
                                                        className="cursor-pointer p-3 text-white/40 transition-colors hover:bg-white/5 hover:text-sky-300 disabled:opacity-50"
                                                        title="Duplicate"
                                                    >
                                                        {duplicatingId === post.id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Copy size={14} />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={(event) => {
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            void handleDelete(post.id);
                                                        }}
                                                        disabled={deletingId === post.id}
                                                        className="cursor-pointer p-3 text-white/40 transition-colors hover:bg-white/5 hover:text-red-500 disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        {deletingId === post.id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={14} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </>
    );
}
