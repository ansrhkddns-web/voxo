import React from 'react';
import { Loader2, Terminal } from 'lucide-react';
import type { AdminPostSummary } from '@/types/content';
import type { DashboardLanguage } from '../types';
import { formatDashboardDate } from '../utils';
import { DashboardSection } from './DashboardSection';

interface DashboardPostActivitySectionProps {
    posts: AdminPostSummary[];
    loading: boolean;
    locale: string;
    language: DashboardLanguage;
}

export function DashboardPostActivitySection({
    posts,
    loading,
    locale,
    language,
}: DashboardPostActivitySectionProps) {
    return (
        <DashboardSection
            title={language === 'ko' ? '최근 게시글 활동' : 'Recent Post Activity'}
            icon={<Terminal size={14} className="text-accent-green" />}
        >
            <div className="space-y-3 font-mono text-[11px]">
                {loading ? (
                    <div className="flex items-center gap-3 text-gray-600">
                        <Loader2 size={12} className="animate-spin" />
                        {language === 'ko'
                            ? '활동 내역을 불러오는 중입니다...'
                            : 'Loading activity...'}
                    </div>
                ) : (
                    posts.slice(0, 5).map((post) => (
                        <div key={post.id} className="flex items-start gap-3 text-gray-300">
                            <span className="shrink-0 text-gray-600">
                                [{formatDashboardDate(post.created_at, locale)}]
                            </span>
                            <span>
                                <span className={post.is_published ? 'text-blue-400' : 'text-yellow-500'}>
                                    {post.is_published
                                        ? language === 'ko'
                                            ? '발행'
                                            : 'Published'
                                        : language === 'ko'
                                            ? '임시 저장'
                                            : 'Draft'}
                                </span>{' '}
                                <span>&quot;{post.title}&quot;</span>
                            </span>
                        </div>
                    ))
                )}
            </div>
        </DashboardSection>
    );
}
