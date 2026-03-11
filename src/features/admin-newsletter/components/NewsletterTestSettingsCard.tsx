import React from 'react';
import { Mail } from 'lucide-react';
import type { NewsletterLanguage } from '../types';

interface NewsletterTestSettingsCardProps {
    testEmail: string;
    language: NewsletterLanguage;
    onTestEmailChange: (value: string) => void;
}

export function NewsletterTestSettingsCard({
    testEmail,
    language,
    onTestEmailChange,
}: NewsletterTestSettingsCardProps) {
    return (
        <section className="space-y-6 border border-white/5 bg-gray-950/20 p-8">
            <div className="flex items-center gap-3">
                <Mail size={14} className="text-accent-green" />
                <h3 className="font-display text-[9px] uppercase tracking-[0.3em] text-gray-600">
                    {language === 'ko' ? '테스트 발송 설정' : 'Test Delivery Setup'}
                </h3>
            </div>

            <div className="space-y-4">
                <label className="block font-display text-[9px] uppercase tracking-[0.3em] text-gray-600">
                    {language === 'ko' ? '테스트 수신 이메일' : 'Test recipient email'}
                </label>
                <input
                    value={testEmail}
                    onChange={(event) => onTestEmailChange(event.target.value)}
                    placeholder="example@voxo.local"
                    className="w-full rounded-none border border-white/5 bg-transparent p-5 text-sm text-white transition-all focus:border-white/20 focus:outline-none"
                />
                <p className="text-xs text-gray-500">
                    {language === 'ko'
                        ? '먼저 내 주소로 1건만 보내보고, 내용이 맞는지 확인한 다음 전체 발송을 눌러 주세요.'
                        : 'Send one test email first, review it, then send the full broadcast.'}
                </p>
            </div>
        </section>
    );
}
