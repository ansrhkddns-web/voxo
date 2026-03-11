import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import type { NewsletterHistoryEntry } from '@/app/actions/newsletterActions';
import type { DashboardLanguage } from '../types';
import {
    formatDashboardDate,
    formatDashboardNumber,
} from '../utils';

interface DashboardFailureBannerProps {
    latestFailure: NewsletterHistoryEntry | undefined;
    locale: string;
    language: DashboardLanguage;
}

export function DashboardFailureBanner({
    latestFailure,
    locale,
    language,
}: DashboardFailureBannerProps) {
    if (!latestFailure) return null;

    return (
        <section className="mb-16 border border-red-500/20 bg-red-500/5 p-6">
            <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                    <ShieldAlert className="mt-0.5 text-red-400" size={18} />
                    <div>
                        <p className="font-display text-[10px] uppercase tracking-[0.3em] text-red-300">
                            {language === 'ko'
                                ? '최근 발송 실패 감지'
                                : 'Recent Delivery Failure'}
                        </p>
                        <p className="mt-3 text-sm text-white">{latestFailure.subject}</p>
                        <p className="mt-2 text-sm text-gray-300">{latestFailure.message}</p>
                        <p className="mt-2 text-xs text-gray-500">
                            {`${formatDashboardDate(latestFailure.sentAt, locale)} · ${formatDashboardNumber(latestFailure.recipientCount, locale)}${language === 'ko' ? '명 대상' : ' recipients'}`}
                        </p>
                    </div>
                </div>
                <Link
                    href="/admin/newsletter"
                    className="shrink-0 border border-white/10 px-4 py-3 text-[11px] text-white transition-colors hover:border-accent-green hover:text-accent-green"
                >
                    {language === 'ko' ? '뉴스레터 확인' : 'Open Newsletter'}
                </Link>
            </div>
        </section>
    );
}
