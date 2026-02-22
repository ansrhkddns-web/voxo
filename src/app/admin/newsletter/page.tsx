'use client';

import React, { useState } from 'react';
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Send, Layout, Type, Loader2, Sparkles } from 'lucide-react';
import { broadcastNewsletter } from '@/app/actions/newsletterActions';
import toast, { Toaster } from 'react-hot-toast';
import { useAdminLanguage } from '@/providers/AdminLanguageProvider';

export default function NewsletterPage() {
    const { t } = useAdminLanguage();
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    const handleBroadcast = async () => {
        if (!subject || !content) {
            toast.error(t('errMissing', 'newsletter'));
            return;
        }

        setIsBroadcasting(true);
        try {
            await broadcastNewsletter(subject, content);
            toast.success(t('successInitiated', 'newsletter'));
            setSubject('');
            setContent('');
        } catch (error) {
            toast.error(t('errInterrupt', 'newsletter'));
        } finally {
            setIsBroadcasting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-black text-white selection:bg-accent-green/30">
            <Toaster position="top-center" />
            <AdminSidebar />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-24 border-b border-white/5 bg-black/80 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-50">
                    <div className="space-y-1">
                        <h1 className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-display">{t('infra', 'newsletter')}</h1>
                        <p className="text-xl font-display font-light uppercase tracking-tighter">{t('title', 'newsletter')}</p>
                    </div>

                    <button
                        onClick={handleBroadcast}
                        disabled={isBroadcasting}
                        className="h-10 px-10 bg-white text-black text-[10px] uppercase tracking-[0.2em] font-display font-bold hover:bg-accent-green transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                        {isBroadcasting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                        <span>{isBroadcasting ? t('transmitting', 'newsletter') : t('execBroadcast', 'newsletter')}</span>
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-12">
                        <section className="space-y-8">
                            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                                <Sparkles className="text-accent-green" size={16} strokeWidth={1} />
                                <h2 className="text-[10px] uppercase tracking-[0.3em] font-display text-gray-400">{t('composeBtn', 'newsletter')}</h2>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 font-display flex items-center gap-2">
                                        <Type size={12} strokeWidth={1} /> {t('subjectLine', 'newsletter')}
                                    </label>
                                    <input
                                        placeholder={t('subjectPlaceholder', 'newsletter')}
                                        className="w-full bg-transparent border border-white/5 rounded-none p-5 text-[11px] tracking-[0.1em] text-white focus:outline-none focus:border-white/20 transition-all font-display uppercase"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 font-display flex items-center gap-2">
                                        <Layout size={12} strokeWidth={1} /> {t('content', 'newsletter')}
                                    </label>
                                    <textarea
                                        placeholder={t('contentPlaceholder', 'newsletter')}
                                        className="w-full bg-transparent border border-white/5 rounded-none p-8 text-[12px] leading-relaxed text-gray-400 focus:outline-none focus:border-white/20 transition-all font-serif min-h-[400px] resize-none"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="p-8 border border-white/5 bg-gray-950/20 space-y-6">
                            <h3 className="text-[9px] uppercase tracking-[0.3em] text-gray-600 font-display">{t('safetyTitle', 'newsletter')}</h3>
                            <p className="text-[10px] text-gray-700 leading-relaxed uppercase tracking-widest">
                                {t('safetyText', 'newsletter')}
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Grainy Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>
    );
}
