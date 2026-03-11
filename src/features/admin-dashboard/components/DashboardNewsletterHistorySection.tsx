import React from 'react';
import { CheckCircle, Mail, XCircle } from 'lucide-react';
import type { NewsletterHistoryEntry } from '@/app/actions/newsletterActions';
import type { DashboardLanguage } from '../types';
import {
    formatDashboardDate,
    getDashboardDeliveryLabel,
} from '../utils';
import { DashboardSection } from './DashboardSection';

interface DashboardNewsletterHistorySectionProps {
    newsletterHistory: NewsletterHistoryEntry[];
    locale: string;
    language: DashboardLanguage;
}

export function DashboardNewsletterHistorySection({
    newsletterHistory,
    locale,
    language,
}: DashboardNewsletterHistorySectionProps) {
    return (
        <DashboardSection
            title={language === 'ko' ? '최근 뉴스레터 발송' : 'Recent Newsletter Sends'}
            icon={<Mail size={14} className="text-accent-green" />}
        >
            <div className="space-y-4">
                {newsletterHistory.slice(0, 3).map((item) => (
                    <div key={item.id} className="border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    {item.status === 'success' ? (
                                        <CheckCircle size={14} className="text-accent-green" />
                                    ) : (
                                        <XCircle size={14} className="text-red-400" />
                                    )}
                                    <p className="truncate text-sm text-white">{item.subject}</p>
                                    <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-gray-400">
                                        {getDashboardDeliveryLabel(item, language)}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-gray-400">
                                    {item.preview ||
                                        (language === 'ko'
                                            ? '미리보기 내용이 없습니다.'
                                            : 'No preview available.')}
                                </p>
                            </div>
                            <span className="shrink-0 font-mono text-[11px] text-gray-500">
                                {formatDashboardDate(item.sentAt, locale)}
                            </span>
                        </div>
                    </div>
                ))}
                {newsletterHistory.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        {language === 'ko'
                            ? '아직 뉴스레터 발송 이력이 없습니다.'
                            : 'No newsletter history yet.'}
                    </p>
                ) : null}
            </div>
        </DashboardSection>
    );
}
