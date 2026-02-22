'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Users, Trash2, Mail, Loader2, Calendar } from 'lucide-react';
import { getSubscribers, deleteSubscriber } from '@/app/actions/newsletterActions';
import toast, { Toaster } from 'react-hot-toast';
import { useAdminLanguage } from '@/providers/AdminLanguageProvider';

export default function SubscribersPage() {
    const { t } = useAdminLanguage();
    const [subscribers, setSubscribers] = useState<Array<{ id: string; email: string; created_at: string }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        try {
            const data = await getSubscribers();
            setSubscribers(data);
        } catch {
            toast.error('Failed to sync archive');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Execute deconstruction sequence for this unit?')) return;
        try {
            await deleteSubscriber(id);
            fetchSubscribers();
            toast.success('Unit deconstructed');
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
                        <h1 className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-display">{t('infra', 'subscribers')}</h1>
                        <p className="text-xl font-display font-light uppercase tracking-tighter">{t('title', 'subscribers')}</p>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-950/50 border border-white/5 px-6 py-2">
                        <Users size={14} className="text-accent-green" />
                        <span className="text-[10px] uppercase tracking-widest font-mono">{subscribers.length} {t('units', 'subscribers')}</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                            <Loader2 className="animate-spin text-accent-green" size={32} strokeWidth={1} />
                            <p className="text-[9px] uppercase tracking-[0.3em] text-gray-600 animate-pulse">{t('syncing', 'subscribers')}</p>
                        </div>
                    ) : (
                        <div className="max-w-7xl mx-auto">
                            <div className="border border-white/5 bg-gray-950/20">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-gray-950/50">
                                            <th className="px-8 py-6 text-[9px] uppercase tracking-[0.3em] text-gray-500 font-display font-bold">{t('colIdentity', 'subscribers')}</th>
                                            <th className="px-8 py-6 text-[9px] uppercase tracking-[0.3em] text-gray-500 font-display font-bold">{t('colStatus', 'subscribers')}</th>
                                            <th className="px-8 py-6 text-[9px] uppercase tracking-[0.3em] text-gray-500 font-display font-bold">{t('colReg', 'subscribers')}</th>
                                            <th className="px-8 py-6 text-[9px] uppercase tracking-[0.3em] text-gray-500 font-display font-bold text-right">{t('colActions', 'subscribers')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscribers.map((sub) => (
                                            <tr key={sub.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <Mail size={14} className="text-gray-700 group-hover:text-accent-green transition-colors" />
                                                        <span className="text-[11px] tracking-widest uppercase font-light">{sub.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-[8px] uppercase tracking-widest px-2 py-1 bg-accent-green/10 text-accent-green border border-accent-green/20">{t('active', 'subscribers')}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-gray-500 text-[10px] font-mono">
                                                        <Calendar size={12} strokeWidth={1} />
                                                        {new Date(sub.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => handleDelete(sub.id)}
                                                        className="text-gray-700 hover:text-red-500 transition-colors p-2"
                                                    >
                                                        <Trash2 size={14} strokeWidth={1} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main >

            {/* Grainy Noise Overlay */}
            < div className="fixed inset-0 pointer-events-none opacity-[0.02] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" ></div >
        </div >
    );
}
