'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    CheckSquare,
    CirclePlus,
    Edit2,
    Loader2,
    Search,
    Square,
    Tag,
    Trash2,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import {
    bulkDeleteUnusedTags,
    bulkSetTagMenuVisibility,
    createTag,
    deleteTag,
    getTagManagementData,
    updateTag,
} from '@/app/actions/tagActions';
import { useAdminLanguage } from '@/providers/AdminLanguageProvider';

interface TagManagementItem {
    id: string;
    name: string;
    slug: string;
    show_in_menu: boolean;
    menu_order: number;
    postCount: number;
}

interface AdminTagsClientProps {
    initialTags: TagManagementItem[];
    initialLoadFailed?: boolean;
}

function buildTagSlug(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function AdminTagsClient({
    initialTags,
    initialLoadFailed = false,
}: AdminTagsClientProps) {
    const { language } = useAdminLanguage();
    const isKorean = language === 'ko';
    const [tags, setTags] = useState<TagManagementItem[]>(initialTags);
    const [loading, setLoading] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagShowInMenu, setNewTagShowInMenu] = useState(false);
    const [newTagMenuOrder, setNewTagMenuOrder] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [editingShowInMenu, setEditingShowInMenu] = useState(false);
    const [editingMenuOrder, setEditingMenuOrder] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMode, setFilterMode] = useState<'all' | 'menu' | 'in-use'>('all');
    const [sortMode, setSortMode] = useState<'menu-order' | 'usage' | 'name'>('menu-order');
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

    const loadTags = useCallback(async () => {
        try {
            const data = await getTagManagementData();
            setTags(data);
        } catch (error) {
            const message = error instanceof Error ? error.message : '';
            toast.error(message || (isKorean ? '태그를 불러오지 못했습니다.' : 'Failed to load tags.'));
        } finally {
            setLoading(false);
        }
    }, [isKorean]);

    useEffect(() => {
        setTags(initialTags);
    }, [initialTags]);

    useEffect(() => {
        if (!initialLoadFailed) {
            return;
        }

        toast.error(
            isKorean
                ? '태그 데이터를 일부 불러오지 못했습니다.'
                : 'Some tag data could not be loaded.'
        );
        setLoading(true);
        void loadTags();
    }, [initialLoadFailed, isKorean, loadTags]);

    const resetCreateForm = () => {
        setNewTagName('');
        setNewTagShowInMenu(false);
        setNewTagMenuOrder(0);
    };

    const handleAdd = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!newTagName.trim()) return;

        setIsAdding(true);
        try {
            await createTag(
                newTagName.trim(),
                buildTagSlug(newTagName),
                newTagShowInMenu,
                newTagMenuOrder
            );
            resetCreateForm();
            await loadTags();
            toast.success(isKorean ? '태그를 추가했습니다.' : 'Tag created.');
        } catch (error) {
            const message = error instanceof Error ? error.message : '';
            toast.error(
                message === 'Tag already exists'
                    ? isKorean
                        ? '같은 이름 또는 슬러그의 태그가 이미 있습니다.'
                        : 'A tag with the same name or slug already exists.'
                    : isKorean
                      ? '태그 추가에 실패했습니다.'
                      : 'Failed to create tag.'
            );
        } finally {
            setIsAdding(false);
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editingName.trim()) return;

        try {
            await updateTag(
                id,
                editingName.trim(),
                buildTagSlug(editingName),
                editingShowInMenu,
                editingMenuOrder
            );
            setEditingId(null);
            setEditingName('');
            await loadTags();
            toast.success(isKorean ? '태그를 수정했습니다.' : 'Tag updated.');
        } catch (error) {
            const message = error instanceof Error ? error.message : '';
            toast.error(
                message === 'Tag already exists'
                    ? isKorean
                        ? '같은 이름 또는 슬러그의 태그가 이미 있습니다.'
                        : 'A tag with the same name or slug already exists.'
                    : isKorean
                      ? '태그 수정에 실패했습니다.'
                      : 'Failed to update tag.'
            );
        }
    };

    const handleQuickMenuToggle = async (tag: TagManagementItem) => {
        try {
            await updateTag(tag.id, tag.name, tag.slug, !tag.show_in_menu, tag.menu_order || 0);
            await loadTags();
            toast.success(
                isKorean
                    ? !tag.show_in_menu
                        ? '메뉴 노출을 켰습니다.'
                        : '메뉴 노출을 껐습니다.'
                    : !tag.show_in_menu
                      ? 'Menu visibility enabled.'
                      : 'Menu visibility disabled.'
            );
        } catch {
            toast.error(
                isKorean
                    ? '메뉴 노출 변경에 실패했습니다.'
                    : 'Failed to update menu visibility.'
            );
        }
    };

    const handleDelete = async (tag: TagManagementItem) => {
        if (!confirm(isKorean ? `"${tag.name}" 태그를 삭제할까요?` : `Delete "${tag.name}"?`)) {
            return;
        }

        try {
            await deleteTag(tag.id);
            await loadTags();
            toast.success(isKorean ? '태그를 삭제했습니다.' : 'Tag deleted.');
        } catch (error) {
            const message = error instanceof Error ? error.message : '';
            toast.error(
                message === 'Tag is still being used by posts'
                    ? isKorean
                        ? '이 태그를 사용하는 게시글이 있어 삭제할 수 없습니다.'
                        : 'This tag is still being used by posts.'
                    : isKorean
                      ? '태그 삭제에 실패했습니다.'
                      : 'Failed to delete tag.'
            );
        }
    };

    const filteredTags = useMemo(() => {
        return tags
            .filter((tag) => {
                const normalizedQuery = searchQuery.trim().toLowerCase();
                const matchesSearch =
                    !normalizedQuery ||
                    tag.name.toLowerCase().includes(normalizedQuery) ||
                    tag.slug.toLowerCase().includes(normalizedQuery);
                const matchesFilter =
                    filterMode === 'all'
                        ? true
                        : filterMode === 'menu'
                          ? tag.show_in_menu
                          : tag.postCount > 0;

                return matchesSearch && matchesFilter;
            })
            .sort((left, right) => {
                if (sortMode === 'usage') {
                    return (
                        right.postCount - left.postCount || left.name.localeCompare(right.name)
                    );
                }

                if (sortMode === 'name') {
                    return left.name.localeCompare(right.name);
                }

                return (
                    (left.menu_order || 0) - (right.menu_order || 0) ||
                    left.name.localeCompare(right.name)
                );
            });
    }, [filterMode, searchQuery, sortMode, tags]);

    useEffect(() => {
        setSelectedTagIds((prev) =>
            prev.filter((id) => filteredTags.some((tag) => tag.id === id))
        );
    }, [filteredTags]);

    const summary = useMemo(
        () => ({
            total: tags.length,
            menu: tags.filter((tag) => tag.show_in_menu).length,
            inUse: tags.filter((tag) => tag.postCount > 0).length,
        }),
        [tags]
    );

    const selectedCount = selectedTagIds.length;
    const allFilteredSelected =
        filteredTags.length > 0 && filteredTags.every((tag) => selectedTagIds.includes(tag.id));

    const toggleSelectedTag = (tagId: string) => {
        setSelectedTagIds((prev) =>
            prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
        );
    };

    const handleToggleSelectAll = () => {
        if (allFilteredSelected) {
            setSelectedTagIds([]);
            return;
        }

        setSelectedTagIds(filteredTags.map((tag) => tag.id));
    };

    const handleBulkMenuVisibility = async (showInMenu: boolean) => {
        try {
            const result = await bulkSetTagMenuVisibility(selectedTagIds, showInMenu);
            await loadTags();
            toast.success(
                isKorean
                    ? `${result.updatedCount}개 태그의 메뉴 노출 상태를 변경했습니다.`
                    : `Updated menu visibility for ${result.updatedCount} tags.`
            );
        } catch {
            toast.error(
                isKorean ? '선택한 태그 수정에 실패했습니다.' : 'Failed to update selected tags.'
            );
        }
    };

    const handleBulkDelete = async () => {
        if (
            !confirm(
                isKorean
                    ? `선택한 ${selectedCount}개 태그를 정리할까요? 사용 중인 태그는 자동으로 보호됩니다.`
                    : `Delete ${selectedCount} selected tags? Tags still in use will be protected.`
            )
        ) {
            return;
        }

        try {
            const result = await bulkDeleteUnusedTags(selectedTagIds);
            await loadTags();
            setSelectedTagIds([]);

            if (result.deletedCount > 0) {
                toast.success(
                    isKorean
                        ? `${result.deletedCount}개 태그를 삭제했습니다.`
                        : `Deleted ${result.deletedCount} tags.`
                );
            }

            if (result.blockedNames.length > 0) {
                toast.error(
                    isKorean
                        ? `사용 중인 태그는 삭제하지 않았습니다: ${result.blockedNames.join(', ')}`
                        : `Skipped tags still in use: ${result.blockedNames.join(', ')}`
                );
            }
        } catch {
            toast.error(isKorean ? '선택 삭제에 실패했습니다.' : 'Failed to delete selected tags.');
        }
    };

    return (
        <>
            <Toaster position="top-center" />

            <main className="flex h-screen flex-1 flex-col overflow-hidden">
                <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 px-6 py-6 backdrop-blur-xl sm:px-10">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div className="space-y-2">
                            <p className="font-display text-[10px] uppercase tracking-[0.4em] text-gray-500">
                                {isKorean ? '태그 구조 관리' : 'Tag Structure'}
                            </p>
                            <h1 className="font-display text-2xl font-light uppercase tracking-tight">
                                {isKorean ? '태그 관리' : 'Tag Directory'}
                            </h1>
                            <p className="max-w-2xl text-sm text-gray-500">
                                {isKorean
                                    ? '메뉴 노출 태그와 실제 사용 중인 태그를 함께 보고 빠르게 관리합니다.'
                                    : 'Review menu tags and in-use tags together and manage them quickly.'}
                            </p>
                        </div>

                        <form
                            onSubmit={handleAdd}
                            className="grid gap-3 lg:grid-cols-[auto_minmax(0,220px)_120px_220px_auto] lg:items-center"
                        >
                            <label className="inline-flex items-center gap-2 border border-white/10 bg-black/30 px-4 py-3 text-xs text-gray-400">
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={newTagShowInMenu}
                                    onChange={(event) => setNewTagShowInMenu(event.target.checked)}
                                />
                                {newTagShowInMenu ? (
                                    <CheckSquare size={16} className="text-accent-green" />
                                ) : (
                                    <Square size={16} />
                                )}
                                <span>{isKorean ? '메뉴 노출' : 'Show in menu'}</span>
                            </label>

                            <input
                                placeholder={isKorean ? '새 태그 이름' : 'New tag name'}
                                className="border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-accent-green focus:outline-none"
                                value={newTagName}
                                onChange={(event) => setNewTagName(event.target.value)}
                            />

                            <input
                                type="number"
                                min="0"
                                placeholder={isKorean ? '순서' : 'Order'}
                                className="border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-accent-green focus:outline-none"
                                value={newTagMenuOrder}
                                onChange={(event) =>
                                    setNewTagMenuOrder(parseInt(event.target.value, 10) || 0)
                                }
                            />

                            <div className="border border-white/10 bg-black/30 px-4 py-3 text-xs text-gray-500">
                                <span className="block font-display text-[9px] uppercase tracking-[0.22em] text-gray-600">
                                    {isKorean ? '슬러그 미리보기' : 'Slug Preview'}
                                </span>
                                <span className="mt-1 block truncate font-mono text-[11px] text-gray-300">
                                    {buildTagSlug(newTagName) || 'tag-slug'}
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={isAdding}
                                className="inline-flex items-center justify-center gap-2 bg-white px-6 py-3 font-display text-[10px] font-bold uppercase tracking-[0.24em] text-black transition-colors hover:bg-accent-green disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isAdding ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <CirclePlus size={14} />
                                )}
                                <span>{isAdding ? (isKorean ? '추가 중' : 'Creating') : isKorean ? '추가' : 'Create'}</span>
                            </button>
                        </form>
                    </div>
                </header>

                <div className="custom-scrollbar flex-1 overflow-y-auto p-6 sm:p-10">
                    <div className="mx-auto max-w-7xl space-y-6">
                        <section className="grid gap-4 md:grid-cols-3">
                            <div className="border border-white/10 bg-white/[0.02] p-5">
                                <p className="font-display text-[9px] uppercase tracking-[0.24em] text-gray-500">
                                    {isKorean ? '전체 태그' : 'Total Tags'}
                                </p>
                                <p className="mt-3 text-3xl text-white">{summary.total}</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.02] p-5">
                                <p className="font-display text-[9px] uppercase tracking-[0.24em] text-gray-500">
                                    {isKorean ? '메뉴 노출' : 'Menu Tags'}
                                </p>
                                <p className="mt-3 text-3xl text-accent-green">{summary.menu}</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.02] p-5">
                                <p className="font-display text-[9px] uppercase tracking-[0.24em] text-gray-500">
                                    {isKorean ? '사용 중' : 'In Use'}
                                </p>
                                <p className="mt-3 text-3xl text-gray-300">{summary.inUse}</p>
                            </div>
                        </section>

                        <section className="flex flex-col gap-4 border border-white/10 bg-white/[0.02] p-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="relative w-full max-w-md">
                                <Search
                                    size={14}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                                />
                                <input
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder={
                                        isKorean ? '태그 이름 또는 슬러그 검색' : 'Search by name or slug'
                                    }
                                    className="w-full border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm text-white placeholder:text-gray-600 focus:border-accent-green focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {[
                                    { key: 'all', label: isKorean ? '전체' : 'All' },
                                    { key: 'menu', label: isKorean ? '메뉴 노출' : 'Menu' },
                                    { key: 'in-use', label: isKorean ? '사용 중' : 'In Use' },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() =>
                                            setFilterMode(item.key as 'all' | 'menu' | 'in-use')
                                        }
                                        className={`px-4 py-2 text-[10px] uppercase tracking-[0.22em] transition-colors ${
                                            filterMode === item.key
                                                ? 'bg-white text-black'
                                                : 'border border-white/10 text-gray-400 hover:border-accent-green hover:text-accent-green'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                                <select
                                    value={sortMode}
                                    onChange={(event) =>
                                        setSortMode(
                                            event.target.value as 'menu-order' | 'usage' | 'name'
                                        )
                                    }
                                    className="border border-white/10 bg-black/40 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-gray-300 focus:border-accent-green focus:outline-none"
                                >
                                    <option value="menu-order">
                                        {isKorean ? '메뉴 순서' : 'Menu order'}
                                    </option>
                                    <option value="usage">{isKorean ? '사용량' : 'Usage'}</option>
                                    <option value="name">{isKorean ? '이름순' : 'Name'}</option>
                                </select>
                            </div>
                        </section>

                        {selectedCount > 0 ? (
                            <section className="flex flex-col gap-3 border border-accent-green/20 bg-accent-green/5 p-5 lg:flex-row lg:items-center lg:justify-between">
                                <p className="text-sm text-gray-200">
                                    {isKorean
                                        ? `${selectedCount}개 태그를 선택했습니다.`
                                        : `${selectedCount} tags selected.`}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => void handleBulkMenuVisibility(true)}
                                        className="border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green"
                                    >
                                        {isKorean ? '메뉴 노출 켜기' : 'Show in menu'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void handleBulkMenuVisibility(false)}
                                        className="border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green"
                                    >
                                        {isKorean ? '메뉴 노출 끄기' : 'Hide from menu'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void handleBulkDelete()}
                                        className="border border-red-500/30 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-red-300 transition-colors hover:bg-red-500/10"
                                    >
                                        {isKorean ? '사용 안 하는 태그 삭제' : 'Delete unused'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedTagIds([])}
                                        className="border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-gray-400 transition-colors hover:border-white hover:text-white"
                                    >
                                        {isKorean ? '선택 해제' : 'Clear selection'}
                                    </button>
                                </div>
                            </section>
                        ) : null}

                        {loading ? (
                            <div className="flex h-64 flex-col items-center justify-center gap-4 border border-white/10 bg-white/[0.02]">
                                <Loader2 className="animate-spin text-accent-green" size={28} />
                                <p className="font-display text-[10px] uppercase tracking-[0.28em] text-gray-600">
                                    {isKorean ? '태그 불러오는 중' : 'Loading tags'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-hidden border border-white/10 bg-white/[0.02]">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-black/30">
                                            <th className="px-6 py-5 font-display text-[9px] uppercase tracking-[0.24em] text-gray-500">
                                                <button
                                                    type="button"
                                                    onClick={handleToggleSelectAll}
                                                    className="inline-flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
                                                >
                                                    {allFilteredSelected ? (
                                                        <CheckSquare size={14} />
                                                    ) : (
                                                        <Square size={14} />
                                                    )}
                                                </button>
                                            </th>
                                            <th className="px-6 py-5 font-display text-[9px] uppercase tracking-[0.24em] text-gray-500">
                                                {isKorean ? '태그' : 'Tag'}
                                            </th>
                                            <th className="px-6 py-5 font-display text-[9px] uppercase tracking-[0.24em] text-gray-500">
                                                Slug
                                            </th>
                                            <th className="px-6 py-5 font-display text-[9px] uppercase tracking-[0.24em] text-gray-500">
                                                {isKorean ? '연결 글 수' : 'Posts'}
                                            </th>
                                            <th className="px-6 py-5 font-display text-[9px] uppercase tracking-[0.24em] text-gray-500">
                                                {isKorean ? '메뉴 노출' : 'Menu'}
                                            </th>
                                            <th className="px-6 py-5 font-display text-[9px] uppercase tracking-[0.24em] text-gray-500">
                                                {isKorean ? '순서' : 'Order'}
                                            </th>
                                            <th className="px-6 py-5 text-right font-display text-[9px] uppercase tracking-[0.24em] text-gray-500">
                                                {isKorean ? '작업' : 'Actions'}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTags.map((tag) => (
                                            <tr
                                                key={tag.id}
                                                className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                                            >
                                                <td className="px-6 py-5">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSelectedTag(tag.id)}
                                                        className="text-gray-400 transition-colors hover:text-white"
                                                    >
                                                        {selectedTagIds.includes(tag.id) ? (
                                                            <CheckSquare
                                                                size={16}
                                                                className="text-accent-green"
                                                            />
                                                        ) : (
                                                            <Square size={16} />
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {editingId === tag.id ? (
                                                        <input
                                                            autoFocus
                                                            value={editingName}
                                                            onChange={(event) =>
                                                                setEditingName(event.target.value)
                                                            }
                                                            onKeyDown={(event) => {
                                                                if (event.key === 'Enter') {
                                                                    void handleUpdate(tag.id);
                                                                }
                                                                if (event.key === 'Escape') {
                                                                    setEditingId(null);
                                                                    setEditingName('');
                                                                }
                                                            }}
                                                            className="w-48 border border-accent-green/40 bg-black/40 px-4 py-3 text-sm text-white focus:outline-none"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center gap-3">
                                                            <Tag size={14} className="text-gray-600" />
                                                            <span className="text-sm text-white">
                                                                {tag.name}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 font-mono text-[11px] text-gray-500">
                                                    {editingId === tag.id
                                                        ? buildTagSlug(editingName) || 'tag-slug'
                                                        : tag.slug}
                                                </td>
                                                <td className="px-6 py-5 text-sm text-white">
                                                    {tag.postCount}
                                                </td>
                                                <td className="px-6 py-5">
                                                    {editingId === tag.id ? (
                                                        <label className="inline-flex items-center gap-2 text-gray-400">
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={editingShowInMenu}
                                                                onChange={(event) =>
                                                                    setEditingShowInMenu(
                                                                        event.target.checked
                                                                    )
                                                                }
                                                            />
                                                            {editingShowInMenu ? (
                                                                <CheckSquare
                                                                    size={16}
                                                                    className="text-accent-green"
                                                                />
                                                            ) : (
                                                                <Square size={16} />
                                                            )}
                                                        </label>
                                                    ) : (
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    void handleQuickMenuToggle(tag)
                                                                }
                                                                className={`inline-flex items-center gap-2 border px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors ${
                                                                    tag.show_in_menu
                                                                        ? 'border-accent-green/30 bg-accent-green/10 text-accent-green hover:bg-accent-green/15'
                                                                        : 'border-white/10 text-gray-400 hover:border-accent-green hover:text-accent-green'
                                                                }`}
                                                            >
                                                                {tag.show_in_menu ? (
                                                                    <CheckSquare size={12} />
                                                                ) : (
                                                                    <Square size={12} />
                                                                )}
                                                                <span>
                                                                    {tag.show_in_menu
                                                                        ? isKorean
                                                                            ? '노출 중'
                                                                            : 'Visible'
                                                                        : isKorean
                                                                          ? '숨김'
                                                                          : 'Hidden'}
                                                                </span>
                                                            </button>
                                                            <Link
                                                                href={`/admin/posts?tag=${encodeURIComponent(tag.name)}`}
                                                                className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green"
                                                            >
                                                                {isKorean
                                                                    ? '관련 글 보기'
                                                                    : 'View posts'}
                                                            </Link>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5">
                                                    {editingId === tag.id ? (
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={editingMenuOrder}
                                                            onChange={(event) =>
                                                                setEditingMenuOrder(
                                                                    parseInt(event.target.value, 10) ||
                                                                        0
                                                                )
                                                            }
                                                            className="w-20 border border-accent-green/40 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none"
                                                        />
                                                    ) : (
                                                        <span className="font-mono text-[11px] text-gray-400">
                                                            {tag.menu_order || 0}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {editingId === tag.id ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        void handleUpdate(tag.id)
                                                                    }
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
                                                                        setEditingId(tag.id);
                                                                        setEditingName(tag.name);
                                                                        setEditingShowInMenu(
                                                                            tag.show_in_menu
                                                                        );
                                                                        setEditingMenuOrder(
                                                                            tag.menu_order || 0
                                                                        );
                                                                    }}
                                                                    className="p-2 text-gray-500 transition-colors hover:text-white"
                                                                >
                                                                    <Edit2 size={14} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    disabled={tag.postCount > 0}
                                                                    onClick={() => void handleDelete(tag)}
                                                                    className="p-2 text-gray-600 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {!loading && filteredTags.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="px-6 py-12 text-center text-sm text-gray-500"
                                                >
                                                    {isKorean
                                                        ? '조건에 맞는 태그가 없습니다.'
                                                        : 'No tags match the current filters.'}
                                                </td>
                                            </tr>
                                        ) : null}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
