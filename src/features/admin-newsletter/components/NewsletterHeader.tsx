import React from 'react';
import { Loader2, Mail, Send } from 'lucide-react';
import type { NewsletterLanguage } from '../types';

interface NewsletterHeaderProps {
    eyebrow: string;
    title: string;
    language: NewsletterLanguage;
    isTesting: boolean;
    isBroadcasting: boolean;
    transmittingLabel: string;
    broadcastLabel: string;
    onTestSend: () => void;
    onBroadcast: () => void;
}

export function NewsletterHeader({
    eyebrow,
    title,
    language,
    isTesting,
    isBroadcasting,
    transmittingLabel,
    broadcastLabel,
    onTestSend,
    onBroadcast,
}: NewsletterHeaderProps) {
    return (
        <header className="sticky top-0 z-50 flex h-24 items-center justify-between border-b border-white/5 bg-black/80 px-10 backdrop-blur-xl">
            <div className="space-y-1">
                <h1 className="font-display text-[10px] uppercase tracking-[0.4em] text-gray-500">
                    {eyebrow}
                </h1>
                <p className="font-display text-xl font-light uppercase tracking-tighter">
                    {title}
                </p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={onTestSend}
                    disabled={isTesting || isBroadcasting}
                    className="flex h-10 items-center gap-3 border border-white/10 px-6 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:border-accent-green hover:text-accent-green disabled:opacity-50"
                >
                    {isTesting ? <Loader2 className="animate-spin" size={14} /> : <Mail size={14} />}
                    <span>
                        {isTesting
                            ? language === 'ko'
                                ? '테스트 발송 중'
                                : 'Sending Test'
                            : language === 'ko'
                                ? '테스트 발송'
                                : 'Send Test'}
                    </span>
                </button>

                <button
                    onClick={onBroadcast}
                    disabled={isBroadcasting || isTesting}
                    className="flex h-10 items-center gap-3 bg-white px-10 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-accent-green disabled:opacity-50"
                >
                    {isBroadcasting ? (
                        <Loader2 className="animate-spin" size={14} />
                    ) : (
                        <Send size={14} />
                    )}
                    <span>{isBroadcasting ? transmittingLabel : broadcastLabel}</span>
                </button>
            </div>
        </header>
    );
}
