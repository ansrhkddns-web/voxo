'use client';

import React from 'react';
import { Clock3, RotateCcw } from 'lucide-react';
import type { PostRevisionEntry } from '@/app/actions/postActions';

interface PostRevisionHistoryCardProps {
    revisions: PostRevisionEntry[];
    language: 'en' | 'ko';
    onRestore: (revision: PostRevisionEntry) => void;
}

function formatRevisionDate(dateValue: string, language: 'en' | 'ko') {
    return new Date(dateValue).toLocaleString(language === 'ko' ? 'ko-KR' : 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function PostRevisionHistoryCard({
    revisions,
    language,
    onRestore,
}: PostRevisionHistoryCardProps) {
    const isKorean = language === 'ko';

    return (
        <section className="space-y-6 border border-white/10 bg-white/[0.02] p-6">
            <div className="space-y-2">
                <p className="font-display text-[10px] uppercase tracking-[0.3em] text-accent-green">
                    {isKorean ? '수정 이력' : 'Revision History'}
                </p>
                <p className="text-sm text-gray-500">
                    {isKorean
                        ? '저장하기 직전 상태를 보관합니다. 필요하면 이전 버전 내용을 다시 불러올 수 있습니다.'
                        : 'Each save stores the previous version so you can restore it when needed.'}
                </p>
            </div>

            {revisions.length === 0 ? (
                <div className="rounded-sm border border-white/5 bg-black/30 px-4 py-4 text-sm text-gray-500">
                    {isKorean ? '아직 저장된 수정 이력이 없습니다.' : 'No saved revision history yet.'}
                </div>
            ) : (
                <div className="space-y-3">
                    {revisions.map((revision, index) => (
                        <div
                            key={revision.id}
                            className="rounded-sm border border-white/10 bg-black/30 p-4"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm text-white">
                                        {revision.title}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-gray-500">
                                        <span className="inline-flex items-center gap-2">
                                            <Clock3 size={12} />
                                            {formatRevisionDate(revision.savedAt, language)}
                                        </span>
                                        <span>
                                            {revision.is_published
                                                ? isKorean
                                                    ? '발행 상태 스냅샷'
                                                    : 'Published snapshot'
                                                : isKorean
                                                    ? '초안 스냅샷'
                                                    : 'Draft snapshot'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        {isKorean
                                            ? `최근 ${index + 1}번째 저장 전 버전`
                                            : `Version saved before update #${index + 1}`}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onRestore(revision)}
                                    className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green"
                                >
                                    <RotateCcw size={12} />
                                    <span>{isKorean ? '이 버전 불러오기' : 'Restore'}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
