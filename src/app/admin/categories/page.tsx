'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from "@/components/admin/AdminSidebar";
import { CirclePlus, Edit2, Trash2, Loader2, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCategories, createCategory, deleteCategory, updateCategory } from '@/app/actions/categoryActions';
import toast, { Toaster } from 'react-hot-toast';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            toast.error('Failed to sync archive');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName) return;

        setIsAdding(true);
        try {
            const slug = newCategoryName.toLowerCase().replace(/ /g, '-');
            await createCategory(newCategoryName, slug);
            setNewCategoryName('');
            fetchCategories();
            toast.success('Classification deployed');
        } catch (error) {
            toast.error('Deployment failed');
        } finally {
            setIsAdding(false);
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editingName) return;
        try {
            const slug = editingName.toLowerCase().replace(/ /g, '-');
            await updateCategory(id, editingName, slug);
            setEditingId(null);
            fetchCategories();
            toast.success('Unit recalibrated');
        } catch (error) {
            toast.error('Recalibration failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Execute deletion sequence?')) return;
        try {
            await deleteCategory(id);
            fetchCategories();
            toast.success('Unit deconstructed');
        } catch (error) {
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
                        <h1 className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-display">Meta Infrastructure</h1>
                        <p className="text-xl font-display font-light uppercase tracking-tighter">Category Archives</p>
                    </div>

                    <form onSubmit={handleAdd} className="flex gap-4">
                        <input
                            placeholder="UNIT LABEL"
                            className="bg-gray-950 border border-white/5 rounded-none py-2.5 px-6 text-[10px] uppercase tracking-widest text-white focus:outline-none focus:border-accent-green/50 w-full md:w-72 transition-all placeholder:text-gray-800"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={isAdding}
                            className="h-10 px-8 bg-white text-black text-[10px] uppercase tracking-[0.2em] font-display font-bold hover:bg-accent-green transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            {isAdding ? <Loader2 className="animate-spin" size={14} /> : <CirclePlus size={14} />}
                            <span>{isAdding ? 'EXECUTING...' : 'INITIALIZE'}</span>
                        </button>
                    </form>
                </header>

                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                            <Loader2 className="animate-spin text-accent-green" size={32} strokeWidth={1} />
                            <p className="text-[9px] uppercase tracking-[0.3em] text-gray-600 animate-pulse">Syncing Database...</p>
                        </div>
                    ) : (
                        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {categories.map((cat) => (
                                <div key={cat.id} className="relative bg-gray-950/40 p-8 border border-white/5 flex flex-col justify-between group hover:border-white/20 transition-all duration-500 overflow-hidden">
                                    {/* Decorative Background Element */}
                                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Database size={120} strokeWidth={0.5} />
                                    </div>

                                    <div className="flex justify-between items-start mb-12 relative z-10">
                                        <div className="size-12 bg-black border border-white/10 flex items-center justify-center text-accent-green text-xs font-mono group-hover:border-accent-green/50 transition-all">
                                            {cat.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => {
                                                    setEditingId(cat.id);
                                                    setEditingName(cat.name);
                                                }}
                                                className="p-2 text-gray-700 hover:text-white transition-colors"
                                            >
                                                <Edit2 size={14} strokeWidth={1} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id)}
                                                className="p-2 text-gray-700 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} strokeWidth={1} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        {editingId === cat.id ? (
                                            <div className="space-y-4">
                                                <input
                                                    autoFocus
                                                    className="w-full bg-black border-b border-accent-green py-2 text-xl font-display font-light uppercase tracking-tighter text-white focus:outline-none"
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleUpdate(cat.id);
                                                        if (e.key === 'Escape') setEditingId(null);
                                                    }}
                                                    onBlur={() => handleUpdate(cat.id)}
                                                />
                                                <p className="text-[8px] text-accent-green uppercase tracking-widest">Applying Changes...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="text-2xl font-display font-light uppercase tracking-tighter text-white mb-2">{cat.name}</h3>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-px w-6 bg-accent-green/30"></div>
                                                    <p className="text-gray-600 text-[8px] font-mono tracking-widest uppercase truncate max-w-[120px]">REF_ID: {cat.id.substring(0, 12)}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Grainy Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>
    );
}
