'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from "@/components/admin/AdminSidebar";
import { CirclePlus, Edit2, Trash2, Loader2, Tag, CheckSquare, Square } from 'lucide-react';
import { getTags, createTag, deleteTag, updateTag } from '@/app/actions/tagActions';
import toast, { Toaster } from 'react-hot-toast';

export default function TagsPage() {
    const [tags, setTags] = useState<Array<{ id: string; name: string; slug: string; show_in_menu: boolean; menu_order: number }>>([]);
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
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const data = await getTags();
            setTags(data);
        } catch {
            toast.error('Failed to sync tags');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTagName) return;

        setIsAdding(true);
        try {
            const slug = newTagName.toLowerCase().replace(/ /g, '-');
            await createTag(newTagName, slug, newTagShowInMenu, newTagMenuOrder);
            setNewTagName('');
            setNewTagShowInMenu(false);
            setNewTagMenuOrder(0);
            fetchTags();
            toast.success('Tag deployed');
        } catch {
            toast.error('Deployment failed');
        } finally {
            setIsAdding(false);
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editingName) return;
        try {
            const slug = editingName.toLowerCase().replace(/ /g, '-');
            await updateTag(id, editingName, slug, editingShowInMenu, editingMenuOrder);
            setEditingId(null);
            fetchTags();
            toast.success('Tag recalibrated');
        } catch {
            toast.error('Recalibration failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Execute deletion sequence?')) return;
        try {
            await deleteTag(id);
            fetchTags();
            toast.success('Tag deconstructed');
        } catch {
            toast.error('Deconstruction failed');
        }
    };

    return (
        <div className="flex min-h-screen bg-black text-white selection:bg-accent-green/30">
            <Toaster position="top-center" />
            <AdminSidebar />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-24 border-b border-white/5 bg-black/80 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-50">
                    <div className="space-y-1">
                        <h1 className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-display">Meta Structure</h1>
                        <p className="text-xl font-display font-light uppercase tracking-tighter">Tag Directory</p>
                    </div>

                    <form onSubmit={handleAdd} className="flex gap-4 items-center">
                        <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white transition-colors">
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={newTagShowInMenu}
                                onChange={(e) => setNewTagShowInMenu(e.target.checked)}
                            />
                            {newTagShowInMenu ? <CheckSquare size={16} className="text-accent-green" /> : <Square size={16} />}
                            <span className="text-[9px] uppercase tracking-widest">Show in Menu</span>
                        </label>
                        <input
                            placeholder="INPUT_NEW_TAG"
                            className="bg-gray-950 border border-white/5 rounded-none py-2.5 px-6 text-[10px] tracking-widest text-white focus:outline-none focus:border-accent-green/50 w-full md:w-56 transition-all placeholder:text-gray-800"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="ORDER"
                            className="bg-gray-950 border border-white/5 rounded-none py-2.5 px-4 text-[10px] tracking-widest text-white focus:outline-none focus:border-accent-green/50 w-24 transition-all placeholder:text-gray-800"
                            value={newTagMenuOrder}
                            onChange={(e) => setNewTagMenuOrder(parseInt(e.target.value) || 0)}
                        />
                        <button
                            type="submit"
                            disabled={isAdding}
                            className="h-10 px-8 bg-white text-black text-[10px] uppercase tracking-[0.2em] font-display font-bold hover:bg-accent-green transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            {isAdding ? <Loader2 className="animate-spin" size={14} /> : <CirclePlus size={14} />}
                            DEPLOY
                        </button>
                    </form>
                </header>

                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                            <Loader2 className="animate-spin text-accent-green" size={32} strokeWidth={1} />
                            <p className="text-[9px] uppercase tracking-[0.3em] text-gray-600 animate-pulse">Syncing Network...</p>
                        </div>
                    ) : (
                        <div className="max-w-7xl mx-auto">
                            <div className="border border-white/5 bg-gray-950/20">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-gray-950/50">
                                            <th className="px-8 py-6 text-[9px] uppercase tracking-[0.3em] text-gray-500 font-display font-bold">Tag Identity</th>
                                            <th className="px-8 py-6 text-[9px] uppercase tracking-[0.3em] text-gray-500 font-display font-bold">Slug Vector</th>
                                            <th className="px-8 py-6 text-[9px] uppercase tracking-[0.3em] text-gray-500 font-display font-bold">Menu Display</th>
                                            <th className="px-8 py-6 text-[9px] uppercase tracking-[0.3em] text-gray-500 font-display font-bold">Priority</th>
                                            <th className="px-8 py-6 text-[9px] uppercase tracking-[0.3em] text-gray-500 font-display font-bold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tags.map((tag) => (
                                            <tr key={tag.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-8 py-6">
                                                    {editingId === tag.id ? (
                                                        <input
                                                            className="bg-black border border-accent-green/50 py-1.5 px-3 text-[11px] tracking-widest text-white focus:outline-none w-48 font-light"
                                                            value={editingName}
                                                            onChange={(e) => setEditingName(e.target.value)}
                                                            autoFocus
                                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate(tag.id)}
                                                        />
                                                    ) : (
                                                        <div className="flex items-center gap-4">
                                                            <Tag size={14} className="text-gray-700 group-hover:text-accent-green transition-colors" />
                                                            <span className="text-[11px] tracking-widest font-light">{tag.name}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-[10px] tracking-widest text-gray-500 font-mono">{tag.slug}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {editingId === tag.id ? (
                                                        <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white transition-colors">
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={editingShowInMenu}
                                                                onChange={(e) => setEditingShowInMenu(e.target.checked)}
                                                            />
                                                            {editingShowInMenu ? <CheckSquare size={16} className="text-accent-green" /> : <Square size={16} />}
                                                        </label>
                                                    ) : (
                                                        tag.show_in_menu ? (
                                                            <span className="text-[8px] uppercase tracking-widest px-2 py-1 bg-accent-green/10 text-accent-green border border-accent-green/20">VISIBLE</span>
                                                        ) : (
                                                            <span className="text-[8px] uppercase tracking-widest px-2 py-1 bg-gray-800 text-gray-400 border border-gray-700">HIDDEN</span>
                                                        )
                                                    )}
                                                </td>
                                                <td className="px-8 py-6">
                                                    {editingId === tag.id ? (
                                                        <input
                                                            type="number"
                                                            className="bg-black border border-accent-green/50 py-1.5 px-3 text-[11px] font-mono text-white focus:outline-none w-16"
                                                            value={editingMenuOrder}
                                                            onChange={(e) => setEditingMenuOrder(parseInt(e.target.value) || 0)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate(tag.id)}
                                                        />
                                                    ) : (
                                                        <span className="text-[10px] tracking-widest text-gray-400 font-mono">{tag.menu_order || 0}</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {editingId === tag.id ? (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleUpdate(tag.id)}
                                                                    className="text-[9px] uppercase tracking-widest bg-accent-green text-black px-4 py-1.5 font-bold hover:bg-white transition-colors"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingId(null)}
                                                                    className="text-[9px] uppercase tracking-widest bg-gray-900 text-white px-4 py-1.5 hover:bg-gray-800 transition-colors"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingId(tag.id);
                                                                        setEditingName(tag.name);
                                                                        setEditingShowInMenu(tag.show_in_menu);
                                                                        setEditingMenuOrder(tag.menu_order || 0);
                                                                    }}
                                                                    className="text-gray-500 hover:text-white transition-colors p-2"
                                                                >
                                                                    <Edit2 size={14} strokeWidth={1} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(tag.id)}
                                                                    className="text-gray-700 hover:text-red-500 transition-colors p-2"
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

            <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>
    );
}
