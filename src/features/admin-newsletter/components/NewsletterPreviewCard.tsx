import React from 'react';
import { Eye } from 'lucide-react';
import type { NewsletterLanguage } from '../types';

interface NewsletterPreviewCardProps {
    subject: string;
    content: string;
    paragraphs: string[];
    language: NewsletterLanguage;
}

export function NewsletterPreviewCard({
    subject,
    content,
    paragraphs,
    language,
}: NewsletterPreviewCardProps) {
    return (
        <section className="space-y-6 border border-white/5 bg-gray-950/20 p-8">
            <div className="flex items-center gap-3">
                <Eye size={14} className="text-accent-green" />
                <h3 className="font-display text-[9px] uppercase tracking-[0.3em] text-gray-600">
                    {language === 'ko' ? '발송 미리보기' : 'Send Preview'}
                </h3>
            </div>

            <div className="overflow-hidden border border-white/5 bg-black/40">
                <div className="border-b border-white/5 px-6 py-4">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-gray-500">
                        VOXO Newsletter
                    </p>
                    <p className="mt-3 text-2xl text-white">
                        {subject.trim() ||
                            (language === 'ko'
                                ? '제목을 입력하면 여기에 보입니다.'
                                : 'Your subject will appear here.')}
                    </p>
                </div>
                <div className="space-y-4 px-6 py-6 text-sm leading-7 text-gray-300">
                    {paragraphs.length === 0 ? (
                        <p>
                            {language === 'ko'
                                ? '본문을 입력하면 문단별로 미리볼 수 있습니다.'
                                : 'Add content to preview the email body.'}
                        </p>
                    ) : (
                        paragraphs.map((paragraph, index) => (
                            <p key={`${paragraph}-${index}`}>{paragraph}</p>
                        ))
                    )}
                </div>
                <div className="border-t border-white/5 px-6 py-4 text-xs text-gray-500">
                    {language === 'ko'
                        ? `제목 ${subject.trim().length}자 · 본문 ${content.trim().length}자`
                        : `${subject.trim().length} subject chars · ${content.trim().length} body chars`}
                </div>
            </div>
        </section>
    );
}
