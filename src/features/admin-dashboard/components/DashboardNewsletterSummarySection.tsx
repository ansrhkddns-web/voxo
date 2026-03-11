import React from 'react';
import { Mail } from 'lucide-react';
import type { NewsletterHistoryEntry } from '@/app/actions/newsletterActions';
import type { DashboardLanguage } from '../types';
import { formatDashboardNumber } from '../utils';
import { DashboardSection } from './DashboardSection';

interface DashboardNewsletterSummarySectionProps {
    newsletterHistory: NewsletterHistoryEntry[];
    latestNewsletter: NewsletterHistoryEntry | undefined;
    locale: string;
    language: DashboardLanguage;
}

export function DashboardNewsletterSummarySection({
    newsletterHistory,
    latestNewsletter,
    locale,
    language,
}: DashboardNewsletterSummarySectionProps) {
    const successCount = newsletterHistory.filter((item) => item.status === 'success').length;
    const testCount = newsletterHistory.filter((item) => item.deliveryType === 'test').length;

    return (
        <DashboardSection
            title={language === 'ko' ? '뉴스레터 요약' : 'Newsletter Summary'}
            icon={<Mail size={14} className="text-accent-green" />}
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <span className="text-sm text-gray-400">
                        {language === 'ko' ? '누적 발송 기록' : 'Total sends tracked'}
                    </span>
                    <span className="text-sm text-white">
                        {formatDashboardNumber(newsletterHistory.length, locale)}
                    </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <span className="text-sm text-gray-400">
                        {language === 'ko' ? '성공 발송' : 'Successful sends'}
                    </span>
                    <span className="text-sm text-white">
                        {formatDashboardNumber(successCount, locale)}
                    </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <span className="text-sm text-gray-400">
                        {language === 'ko' ? '테스트 발송' : 'Test sends'}
                    </span>
                    <span className="text-sm text-white">
                        {formatDashboardNumber(testCount, locale)}
                    </span>
                </div>
                <div className="rounded-sm border border-white/5 bg-black/30 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
                        {language === 'ko' ? '최근 발송 제목' : 'Latest subject'}
                    </p>
                    <p className="mt-2 text-sm text-white">
                        {latestNewsletter?.subject ||
                            (language === 'ko'
                                ? '아직 발송 이력이 없습니다.'
                                : 'No newsletter history yet.')}
                    </p>
                </div>
            </div>
        </DashboardSection>
    );
}
