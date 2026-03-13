'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Users, Trash2, Mail, Loader2, Calendar } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { deleteSubscriber, getSubscribers } from '@/app/actions/newsletterActions';
import { useAdminLanguage } from '@/providers/AdminLanguageProvider';

interface SubscriberItem {
    id: string;
    email: string;
    status: 'active' | 'unsubscribed';
    created_at: string;
}

interface AdminSubscribersClientProps {
    initialSubscribers: SubscriberItem[];
    initialLoadFailed?: boolean;
}

export function AdminSubscribersClient({
    initialSubscribers,
    initialLoadFailed = false,
}: AdminSubscribersClientProps) {
    const { t, language } = useAdminLanguage();
    const isKorean = language === 'ko';
    const [subscribers, setSubscribers] = useState<SubscriberItem[]>(initialSubscribers);
    const [loading, setLoading] = useState(false);

    const fetchSubscribers = useCallback(async () => {
        try {
            const data = await getSubscribers();
            setSubscribers(data);
        } catch {
            toast.error(isKorean ? '구독자 목록을 불러오지 못했습니다.' : 'Failed to load subscribers.');
        } finally {
            setLoading(false);
        }
    }, [isKorean]);

    useEffect(() => {
        setSubscribers(initialSubscribers);
    }, [initialSubscribers]);

    useEffect(() => {
        if (!initialLoadFailed) {
            return;
        }

        toast.error(
            isKorean
                ? '구독자 데이터를 일부 불러오지 못했습니다.'
                : 'Some subscriber data could not be loaded.'
        );
        setLoading(true);
        void fetchSubscribers();
    }, [fetchSubscribers, initialLoadFailed, isKorean]);

    const handleDelete = async (id: string) => {
        if (
            !confirm(
                isKorean
                    ? '이 구독자를 목록에서 삭제할까요?'
                    : 'Remove this subscriber from the list?'
            )
        ) {
            return;
        }

        try {
            await deleteSubscriber(id);
            await fetchSubscribers();
            toast.success(isKorean ? '구독자를 삭제했습니다.' : 'Subscriber removed.');
        } catch {
            toast.error(isKorean ? '삭제에 실패했습니다.' : 'Failed to remove subscriber.');
        }
    };

    return (
        <>
            <Toaster position="top-center" />

            <main className="flex h-screen flex-1 flex-col overflow-hidden">
                <header className="sticky top-0 z-50 flex h-24 items-center justify-between border-b border-white/5 bg-black/80 px-10 backdrop-blur-xl">
                    <div className="space-y-1">
                        <h1 className="font-display text-[10px] uppercase tracking-[0.4em] text-gray-500">
                            {t('infra', 'subscribers')}
                        </h1>
                        <p className="font-display text-xl font-light uppercase tracking-tighter">
                            {t('title', 'subscribers')}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 border border-white/5 bg-gray-950/50 px-6 py-2">
                        <Users size={14} className="text-accent-green" />
                        <span className="font-mono text-[10px] uppercase tracking-widest">
                            {subscribers.length} {t('units', 'subscribers')}
                        </span>
                    </div>
                </header>

                <div className="custom-scrollbar flex-1 overflow-y-auto p-12">
                    {loading ? (
                        <div className="flex h-64 flex-col items-center justify-center space-y-4">
                            <Loader2 className="animate-spin text-accent-green" size={32} strokeWidth={1} />
                            <p className="animate-pulse text-[9px] uppercase tracking-[0.3em] text-gray-600">
                                {t('syncing', 'subscribers')}
                            </p>
                        </div>
                    ) : (
                        <div className="mx-auto max-w-7xl">
                            <div className="border border-white/5 bg-gray-950/20">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-gray-950/50">
                                            <th className="px-8 py-6 font-display text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">
                                                {t('colIdentity', 'subscribers')}
                                            </th>
                                            <th className="px-8 py-6 font-display text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">
                                                {t('colStatus', 'subscribers')}
                                            </th>
                                            <th className="px-8 py-6 font-display text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">
                                                {t('colReg', 'subscribers')}
                                            </th>
                                            <th className="px-8 py-6 text-right font-display text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">
                                                {t('colActions', 'subscribers')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscribers.map((subscriber) => (
                                            <tr
                                                key={subscriber.id}
                                                className="group border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <Mail
                                                            size={14}
                                                            className="text-gray-700 transition-colors group-hover:text-accent-green"
                                                        />
                                                        <span className="text-[11px] font-light tracking-widest">
                                                            {subscriber.email}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="border border-accent-green/20 bg-accent-green/10 px-2 py-1 text-[8px] uppercase tracking-widest text-accent-green">
                                                        {subscriber.status === 'active'
                                                            ? t('active', 'subscribers')
                                                            : isKorean
                                                              ? '해지'
                                                              : 'Unsubscribed'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 font-mono text-[10px] text-gray-500">
                                                        <Calendar size={12} strokeWidth={1} />
                                                        {new Date(subscriber.created_at).toLocaleDateString(
                                                            isKorean ? 'ko-KR' : 'en-US'
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => void handleDelete(subscriber.id)}
                                                        className="p-2 text-gray-700 transition-colors hover:text-red-500"
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
            </main>
        </>
    );
}
