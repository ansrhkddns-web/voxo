'use client';

import React, { useEffect, useState } from 'react';
import { CheckSquare, CirclePlus, Edit2, Loader2, Square, Tag, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { createTag, deleteTag, getTags, updateTag } from '@/app/actions/tagActions';
import { useAdminLanguage } from '@/providers/AdminLanguageProvider';
import type { TagRecord } from '@/types/content';

export default function TagsPage() {
    const { language } = useAdminLanguage();
    const isKorean = language === 'ko';
    const [tags, setTags] = useState<TagRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTagName, setNewTagName] = useState('');
    const [newTagShowInMenu, setNewTagShowInMenu] = useState(false);
    const [newTagMenuOrder, setNewTagMenuOrder] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [editingShowInMenu, setEditingShowInMenu] = useState(false);
    const [editingMenuOrder, setEditingMenuOrder] = useState(0);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const data = await getTags();
                setTags(data);
            } catch {
                toast.error(isKorean ? '태그를 불러오지 못했습니다.' : 'Failed to load tags.');
            } finally {
                setLoading(false);
            }
        };

        fetchTags();
    }, [isKorean]);

    const makeSlug = (value: string) =>
        value
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9가-힣]+/g, '-')
            .replace(/(^-|-$)+/g, '');

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
            await createTag(newTagName.trim(), makeSlug(newTagName), newTagShowInMenu, newTagMenuOrder);
            resetCreateForm();
            setTags(await getTags());
            toast.success(isKorean ? '태그를 추가했습니다.' : 'Tag created.');
        } catch {
            toast.error(isKorean ? '태그 추가에 실패했습니다.' : 'Failed to create tag.');
        } finally {
            setIsAdding(false);
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editingName.trim()) return;

        try {
            await updateTag(id, editingName.trim(), makeSlug(editingName), editingShowInMenu, editingMenuOrder);
            setEditingId(null);
            setTags(await getTags());
            toast.success(isKorean ? '태그를 수정했습니다.' : 'Tag updated.');
        } catch {
            toast.error(isKorean ? '태그 수정에 실패했습니다.' : 'Failed to update tag.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(isKorean ? '이 태그를 삭제할까요?' : 'Delete this tag?')) return;

        try {
            await deleteTag(id);
            setTags(await getTags());
            toast.success(isKorean ? '태그를 삭제했습니다.' : 'Tag deleted.');
        } catch {
            toast.error(isKorean ? '태그 삭제에 실패했습니다.' : 'Failed to delete tag.');
        }
    };

    return (
        <div className="flex min-h-screen bg-black text-white selection:bg-accent-green/30">
            <Toaster position="top-center" />
            <AdminSidebar />

            <main className="flex-1 flex h-screen flex-col overflow-hidden">
                <header className="sticky top-0 z-50 flex h-24 items-center justify-between border-b border-white/5 bg-black/80 px-10 backdrop-blur-xl">
                    <div className="space-y-1">
                        <h1 className="font-display text-[10px] uppercase tracking-[0.4em] text-gray-500">
                            {isKorean ? '태그 구조 관리' : 'Meta Structure'}
                        </h1>
                        <p className="font-display text-xl font-light uppercase tracking-tighter">
                            {isKorean ? '태그 관리' : 'Tag Directory'}
                        </p>
                    </div>

                    <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-4">
                        <label className="flex cursor-pointer items-center gap-2 text-gray-400 transition-colors hover:text-white">
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={newTagShowInMenu}
                                onChange={(event) => setNewTagShowInMenu(event.target.checked)}
                            />
                            {newTagShowInMenu ? <CheckSquare size={16} className="text-accent-green" /> : <Square size={16} />}
                            <span className="text-[9px] uppercase tracking-widest">
                                {isKorean ? '메뉴 노출' : 'Show in Menu'}
                            </span>
                        </label>

                        <input
                            placeholder={isKorean ? '새 태그 이름' : 'NEW TAG'}
                            className="w-full rounded-none border border-white/5 bg-gray-950 px-6 py-2.5 text-[10px] tracking-widest text-white transition-all placeholder:text-gray-800 focus:border-accent-green/50 focus:outline-none md:w-56"
                            value={newTagName}
                            onChange={(event) => setNewTagName(event.target.value)}
                        />

                        <input
                            type="number"
                            placeholder={isKorean ? '순서' : 'ORDER'}
                            className="w-24 rounded-none border border-white/5 bg-gray-950 px-4 py-2.5 text-[10px] tracking-widest text-white transition-all placeholder:text-gray-800 focus:border-accent-green/50 focus:outline-none"
                            value={newTagMenuOrder}
                            onChange={(event) => setNewTagMenuOrder(parseInt(event.target.value) || 0)}
                        />

                        <button
                            type="submit"
                            disabled={isAdding}
                            className="flex h-10 items-center gap-2 whitespace-nowrap bg-white px-8 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-accent-green"
                        >
                            {isAdding ? <Loader2 className="animate-spin" size={14} /> : <CirclePlus size={14} />}
                            {isKorean ? (isAdding ? '추가 중...' : '추가') : isAdding ? 'CREATING...' : 'CREATE'}
                        </button>
                    </form>
                </header>

                <div className="custom-scrollbar flex-1 overflow-y-auto p-12">
                    {loading ? (
                        <div className="flex h-64 flex-col items-center justify-center space-y-4">
                            <Loader2 className="animate-spin text-accent-green" size={32} strokeWidth={1} />
                            <p className="text-[9px] uppercase tracking-[0.3em] text-gray-600 animate-pulse">
                                {isKorean ? '태그를 불러오는 중...' : 'Syncing tags...'}
                            </p>
                        </div>
                    ) : (
                        <div className="mx-auto max-w-7xl">
                            <div className="overflow-hidden border border-white/5 bg-gray-950/20">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-gray-950/50">
                                            <th className="px-8 py-6 font-display text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">
                                                {isKorean ? '태그 이름' : 'Tag Name'}
                                            </th>
                                            <th className="px-8 py-6 font-display text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">
                                                Slug
                                            </th>
                                            <th className="px-8 py-6 font-display text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">
                                                {isKorean ? '메뉴 노출' : 'Menu Display'}
                                            </th>
                                            <th className="px-8 py-6 font-display text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">
                                                {isKorean ? '정렬 순서' : 'Order'}
                                            </th>
                                            <th className="px-8 py-6 text-right font-display text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">
                                                {isKorean ? '작업' : 'Actions'}
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {tags.map((tag) => (
                                            <tr key={tag.id} className="group border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                                                <td className="px-8 py-6">
                                                    {editingId === tag.id ? (
                                                        <input
                                                            className="w-48 border border-accent-green/50 bg-black px-3 py-1.5 text-[11px] font-light tracking-widest text-white focus:outline-none"
                                                            value={editingName}
                                                            onChange={(event) => setEditingName(event.target.value)}
                                                            autoFocus
                                                            onKeyDown={(event) => event.key === 'Enter' && handleUpdate(tag.id)}
                                                        />
                                                    ) : (
                                                        <div className="flex items-center gap-4">
                                                            <Tag size={14} className="text-gray-700 transition-colors group-hover:text-accent-green" />
                                                            <span className="text-[11px] font-light tracking-widest">{tag.name}</span>
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-8 py-6">
                                                    <span className="font-mono text-[10px] tracking-widest text-gray-500">
                                                        {tag.slug}
                                                    </span>
                                                </td>

                                                <td className="px-8 py-6">
                                                    {editingId === tag.id ? (
                                                        <label className="flex cursor-pointer items-center gap-2 text-gray-400 transition-colors hover:text-white">
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={editingShowInMenu}
                                                                onChange={(event) => setEditingShowInMenu(event.target.checked)}
                                                            />
                                                            {editingShowInMenu ? <CheckSquare size={16} className="text-accent-green" /> : <Square size={16} />}
                                                        </label>
                                                    ) : tag.show_in_menu ? (
                                                        <span className="border border-accent-green/20 bg-accent-green/10 px-2 py-1 text-[8px] uppercase tracking-widest text-accent-green">
                                                            {isKorean ? '노출' : 'VISIBLE'}
                                                        </span>
                                                    ) : (
                                                        <span className="border border-gray-700 bg-gray-800 px-2 py-1 text-[8px] uppercase tracking-widest text-gray-400">
                                                            {isKorean ? '숨김' : 'HIDDEN'}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-8 py-6">
                                                    {editingId === tag.id ? (
                                                        <input
                                                            type="number"
                                                            className="w-16 border border-accent-green/50 bg-black px-3 py-1.5 font-mono text-[11px] text-white focus:outline-none"
                                                            value={editingMenuOrder}
                                                            onChange={(event) => setEditingMenuOrder(parseInt(event.target.value) || 0)}
                                                            onKeyDown={(event) => event.key === 'Enter' && handleUpdate(tag.id)}
                                                        />
                                                    ) : (
                                                        <span className="font-mono text-[10px] tracking-widest text-gray-400">
                                                            {tag.menu_order || 0}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-8 py-6">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                                        {editingId === tag.id ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleUpdate(tag.id)}
                                                                    className="bg-accent-green px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-black transition-colors hover:bg-white"
                                                                >
                                                                    {isKorean ? '저장' : 'Save'}
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingId(null)}
                                                                    className="bg-gray-900 px-4 py-1.5 text-[9px] uppercase tracking-widest text-white transition-colors hover:bg-gray-800"
                                                                >
                                                                    {isKorean ? '취소' : 'Cancel'}
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingId(tag.id);
                                                                        setEditingName(tag.name);
                                                                        setEditingShowInMenu(tag.show_in_menu);
                                                                        setEditingMenuOrder(tag.menu_order || 0);
                                                                    }}
                                                                    className="p-2 text-gray-500 transition-colors hover:text-white"
                                                                >
                                                                    <Edit2 size={14} strokeWidth={1} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(tag.id)}
                                                                    className="p-2 text-gray-700 transition-colors hover:text-red-500"
                                                                >
                                                                    <Trash2 size={14} strokeWidth={1} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>
    );
}
