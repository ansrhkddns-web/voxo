import React from 'react';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import type { NewsletterHistoryListProps } from '../types';
import {
    formatNewsletterDate,
    getNewsletterHistoryTypeLabel,
} from '../utils';

export function NewsletterHistorySection({
    history,
    historyLoading,
    locale,
    language,
}: NewsletterHistoryListProps) {
    return (
        <section className="space-y-6 border border-white/5 bg-gray-950/20 p-8">
            <h3 className="font-display text-[9px] uppercase tracking-[0.3em] text-gray-600">
                {language === 'ko' ? '최근 발송 이력' : 'Recent Delivery History'}
            </h3>

            {historyLoading ? (
                <div className="flex items-center gap-3 text-gray-500">
                    <Loader2 size={14} className="animate-spin" />
                    <span>{language === 'ko' ? '이력을 불러오는 중입니다...' : 'Loading history...'}</span>
                </div>
            ) : history.length === 0 ? (
                <p className="text-sm text-gray-500">
                    {language === 'ko' ? '아직 발송 이력이 없습니다.' : 'No newsletter history yet.'}
                </p>
            ) : (
                <div className="space-y-4">
                    {history.map((item) => (
                        <div key={item.id} className="border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        {item.status === 'success' ? (
                                            <CheckCircle size={14} className="text-accent-green" />
                                        ) : (
                                            <XCircle size={14} className="text-red-400" />
                                        )}
                                        <p className="text-sm text-white">{item.subject}</p>
                                        <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-gray-400">
                                            {getNewsletterHistoryTypeLabel(item, language)}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-400">
                                        {item.preview ||
                                            (language === 'ko' ? '미리보기 내용이 없습니다.' : 'No preview')}
                                    </p>
                                    <p className="mt-2 text-[11px] text-gray-500">
                                        {language === 'ko'
                                            ? `${item.recipientCount}명 대상 · ${item.message}`
                                            : `${item.recipientCount} recipients · ${item.message}`}
                                    </p>
                                </div>
                                <span className="font-mono text-[11px] text-gray-500">
                                    {formatNewsletterDate(item.sentAt, locale)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
