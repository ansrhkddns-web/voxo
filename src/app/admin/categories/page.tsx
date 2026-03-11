'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CirclePlus, Edit2, FolderTree, Loader2, Search, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
    createCategory,
    deleteCategory,
    getCategoryManagementData,
    updateCategory,
} from '@/app/actions/categoryActions';
import { useAdminLanguage } from '@/providers/AdminLanguageProvider';

interface CategoryManagementItem {
    id: string;
    name: string;
    slug: string;
    postCount: number;
}

function buildCategorySlug(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function CategoriesPage() {
    const { language, t } = useAdminLanguage();
    const isKorean = language === 'ko';
    const [categories, setCategories] = useState<CategoryManagementItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMode, setFilterMode] = useState<'all' | 'in-use' | 'unused'>('all');

    const loadCategories = useCallback(async () => {
        try {
            const data = await getCategoryManagementData();
            setCategories(data);
        } catch (error) {
            const message = error instanceof Error ? error.message : '';
            toast.error(
                message ||
                    (isKorean ? '카테고리 목록을 불러오지 못했습니다.' : 'Failed to load categories.')
            );
        } finally {
            setLoading(false);
        }
    }, [isKorean]);

    useEffect(() => {
        void loadCategories();
    }, [loadCategories]);

    const handleAdd = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!newCategoryName.trim()) return;

        setIsAdding(true);
        try {
            await createCategory(newCategoryName.trim(), buildCategorySlug(newCategoryName));
            setNewCategoryName('');
            await loadCategories();
            toast.success(isKorean ? '카테고리를 추가했습니다.' : 'Category created.');
        } catch (error) {
            const message = error instanceof Error ? error.message : '';
            toast.error(
                message === 'Category already exists'
                    ? isKorean
                        ? '같은 이름 또는 슬러그의 카테고리가 이미 있습니다.'
                        : 'A category with the same name or slug already exists.'
                    : isKorean
                        ? '카테고리 추가에 실패했습니다.'
                        : 'Failed to create category.'
            );
        } finally {
            setIsAdding(false);
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editingName.trim()) return;

        try {
            await updateCategory(id, editingName.trim(), buildCategorySlug(editingName));
            setEditingId(null);
            setEditingName('');
            await loadCategories();
            toast.success(isKorean ? '카테고리를 수정했습니다.' : 'Category updated.');
        } catch (error) {
            const message = error instanceof Error ? error.message : '';
            toast.error(
                message === 'Category already exists'
                    ? isKorean
                        ? '같은 이름 또는 슬러그의 카테고리가 이미 있습니다.'
                        : 'A category with the same name or slug already exists.'
                    : isKorean
                        ? '카테고리 수정에 실패했습니다.'
                        : 'Failed to update category.'
            );
        }
    };

    const handleDelete = async (category: CategoryManagementItem) => {
        if (
            !confirm(
                isKorean
                    ? `"${category.name}" 카테고리를 삭제하시겠습니까?`
                    : `Delete "${category.name}"?`
            )
        ) {
            return;
        }

        try {
            await deleteCategory(category.id);
            await loadCategories();
            toast.success(isKorean ? '카테고리를 삭제했습니다.' : 'Category deleted.');
        } catch (error) {
            const message = error instanceof Error ? error.message : '';
            toast.error(
                message === 'Category is still being used by posts'
                    ? isKorean
                        ? '이 카테고리를 사용하는 게시글이 있어 삭제할 수 없습니다.'
                        : 'This category is still being used by posts.'
                    : isKorean
                        ? '카테고리 삭제에 실패했습니다.'
                        : 'Failed to delete category.'
            );
        }
    };

    const filteredCategories = useMemo(() => {
        return categories.filter((category) => {
            const normalizedQuery = searchQuery.trim().toLowerCase();
            const matchesSearch =
                !normalizedQuery ||
                category.name.toLowerCase().includes(normalizedQuery) ||
                category.slug.toLowerCase().includes(normalizedQuery);
            const matchesFilter =
                filterMode === 'all'
                    ? true
                    : filterMode === 'in-use'
                        ? category.postCount > 0
                        : category.postCount === 0;

            return matchesSearch && matchesFilter;
        });
    }, [categories, filterMode, searchQuery]);

    const summary = useMemo(
        () => ({
            total: categories.length,
            inUse: categories.filter((item) => item.postCount > 0).length,
            unused: categories.filter((item) => item.postCount === 0).length,
        }),
        [categories]
    );

    return (
        <div className="flex min-h-screen bg-black text-white selection:bg-accent-green/30">
            <Toaster position="top-center" />
            <AdminSidebar />

            <main className="flex h-screen flex-1 flex-col overflow-hidden">
                <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 px-6 py-6 backdrop-blur-xl sm:px-10">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div className="space-y-2">
                            <p className="font-display text-[10px] uppercase tracking-[0.4em] text-gray-500">
                                {t('infra', 'categories')}
                            </p>
                            <h1 className="font-display text-2xl font-light uppercase tracking-tight">
                                {t('title', 'categories')}
                            </h1>
                            <p className="max-w-2xl text-sm text-gray-500">
                                {isKorean
                                    ? '사용 중인 카테고리와 비어 있는 카테고리를 한 번에 확인하고, 안전하게 관리하세요.'
                                    : 'Review active and unused categories in one place and manage them safely.'}
                            </p>
                        </div>

                        <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-[minmax(0,280px)_180px_auto]">
                            <input
                                placeholder={isKorean ? '새 카테고리 이름' : 'New category name'}
                                className="border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-accent-green focus:outline-none"
                                value={newCategoryName}
                                onChange={(event) => setNewCategoryName(event.target.value)}
                            />
                            <div className="border border-white/10 bg-black/30 px-4 py-3 text-xs text-gray-500">
                                <span className="block font-display text-[9px] uppercase tracking-[0.22em] text-gray-600">
                                    {isKorean ? '슬러그 미리보기' : 'Slug Preview'}
                                </span>
                                <span className="mt-1 block truncate font-mono text-[11px] text-gray-300">
                                    {buildCategorySlug(newCategoryName) || 'category-slug'}
                                </span>
                            </div>
                            <button
                                type="submit"
                                disabled={isAdding}
                                className="inline-flex items-center justify-center gap-2 bg-white px-6 py-3 font-display text-[10px] font-bold uppercase tracking-[0.24em] text-black transition-colors hover:bg-accent-green disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isAdding ? <Loader2 size={14} className="animate-spin" /> : <CirclePlus size={14} />}
                                <span>{isAdding ? (isKorean ? '추가 중' : 'Creating') : (isKorean ? '추가' : 'Create')}</span>
                            </button>
                        </form>
                    </div>
                </header>

                <div className="custom-scrollbar flex-1 overflow-y-auto p-6 sm:p-10">
                    <div className="mx-auto max-w-7xl space-y-6">
                        <section className="grid gap-4 md:grid-cols-3">
                            <div className="border border-white/10 bg-white/[0.02] p-5">
                                <p className="font-display text-[9px] uppercase tracking-[0.24em] text-gray-500">
                                    {isKorean ? '전체 카테고리' : 'Total Categories'}
                                </p>
                                <p className="mt-3 text-3xl text-white">{summary.total}</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.02] p-5">
                                <p className="font-display text-[9px] uppercase tracking-[0.24em] text-gray-500">
                                    {isKorean ? '사용 중' : 'In Use'}
                                </p>
                                <p className="mt-3 text-3xl text-accent-green">{summary.inUse}</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.02] p-5">
                                <p className="font-display text-[9px] uppercase tracking-[0.24em] text-gray-500">
                                    {isKorean ? '비어 있음' : 'Unused'}
                                </p>
                                <p className="mt-3 text-3xl text-gray-300">{summary.unused}</p>
                            </div>
                        </section>

                        <section className="flex flex-col gap-4 border border-white/10 bg-white/[0.02] p-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="relative w-full max-w-md">
                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                                <input
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder={isKorean ? '카테고리 이름 또는 슬러그 검색' : 'Search by name or slug'}
                                    className="w-full border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm text-white placeholder:text-gray-600 focus:border-accent-green focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {[
                                    { key: 'all', label: isKorean ? '전체' : 'All' },
                                    { key: 'in-use', label: isKorean ? '사용 중' : 'In Use' },
                                    { key: 'unused', label: isKorean ? '비어 있음' : 'Unused' },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setFilterMode(item.key as 'all' | 'in-use' | 'unused')}
                                        className={`px-4 py-2 text-[10px] uppercase tracking-[0.22em] transition-colors ${
                                            filterMode === item.key
                                                ? 'bg-white text-black'
                                                : 'border border-white/10 text-gray-400 hover:border-accent-green hover:text-accent-green'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {loading ? (
                            <div className="flex h-64 flex-col items-center justify-center gap-4 border border-white/10 bg-white/[0.02]">
                                <Loader2 className="animate-spin text-accent-green" size={28} />
                                <p className="font-display text-[10px] uppercase tracking-[0.28em] text-gray-600">
                                    {isKorean ? '카테고리 불러오는 중' : 'Loading categories'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {filteredCategories.map((category) => (
                                    <article
                                        key={category.id}
                                        className="border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-white/20"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-3">
                                                <div className="inline-flex size-11 items-center justify-center border border-white/10 bg-black/40 text-accent-green">
                                                    <FolderTree size={18} />
                                                </div>

                                                {editingId === category.id ? (
                                                    <div className="space-y-3">
                                                        <input
                                                            autoFocus
                                                            value={editingName}
                                                            onChange={(event) => setEditingName(event.target.value)}
                                                            onKeyDown={(event) => {
                                                                if (event.key === 'Enter') void handleUpdate(category.id);
                                                                if (event.key === 'Escape') {
                                                                    setEditingId(null);
                                                                    setEditingName('');
                                                                }
                                                            }}
                                                            className="w-full border border-accent-green/40 bg-black/40 px-4 py-3 text-sm text-white focus:outline-none"
                                                        />
                                                        <p className="font-mono text-[11px] text-gray-500">
                                                            /{buildCategorySlug(editingName) || 'category-slug'}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <h2 className="text-xl text-white">{category.name}</h2>
                                                        <p className="font-mono text-[11px] text-gray-500">
                                                            /{category.slug}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {editingId === category.id ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => void handleUpdate(category.id)}
                                                            className="px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-accent-green transition-colors hover:bg-accent-green/10"
                                                        >
                                                            {isKorean ? '저장' : 'Save'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingId(null);
                                                                setEditingName('');
                                                            }}
                                                            className="px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                                                        >
                                                            {isKorean ? '취소' : 'Cancel'}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingId(category.id);
                                                                setEditingName(category.name);
                                                            }}
                                                            className="p-2 text-gray-500 transition-colors hover:text-white"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={category.postCount > 0}
                                                            onClick={() => void handleDelete(category)}
                                                            className="p-2 text-gray-600 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-6 grid grid-cols-2 gap-3">
                                            <div className="border border-white/5 bg-black/30 p-4">
                                                <p className="font-display text-[9px] uppercase tracking-[0.22em] text-gray-500">
                                                    {isKorean ? '연결 글 수' : 'Linked Posts'}
                                                </p>
                                                <p className="mt-2 text-2xl text-white">{category.postCount}</p>
                                            </div>
                                            <div className="border border-white/5 bg-black/30 p-4">
                                                <p className="font-display text-[9px] uppercase tracking-[0.22em] text-gray-500">
                                                    {isKorean ? '삭제 가능' : 'Delete Ready'}
                                                </p>
                                                <p className={`mt-2 text-sm ${category.postCount === 0 ? 'text-accent-green' : 'text-amber-300'}`}>
                                                    {category.postCount === 0
                                                        ? isKorean
                                                            ? '가능'
                                                            : 'Ready'
                                                        : isKorean
                                                            ? '사용 중'
                                                            : 'In Use'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <Link
                                                href={`/admin/posts?category=${category.id}`}
                                                className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green"
                                            >
                                                <span>{isKorean ? '관련 게시글 보기' : 'View linked posts'}</span>
                                            </Link>
                                        </div>
                                    </article>
                                ))}

                                {!loading && filteredCategories.length === 0 ? (
                                    <div className="col-span-full border border-dashed border-white/10 bg-white/[0.02] p-10 text-center text-sm text-gray-500">
                                        {isKorean
                                            ? '조건에 맞는 카테고리가 없습니다.'
                                            : 'No categories match the current filters.'}
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <div className="pointer-events-none fixed inset-0 z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
        </div>
    );
}
