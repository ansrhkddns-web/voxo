import React from 'react';

interface NewsletterSafetyNoticeProps {
    title: string;
    body: string;
}

export function NewsletterSafetyNotice({
    title,
    body,
}: NewsletterSafetyNoticeProps) {
    return (
        <section className="space-y-6 border border-white/5 bg-gray-950/20 p-8">
            <h3 className="font-display text-[9px] uppercase tracking-[0.3em] text-gray-600">
                {title}
            </h3>
            <p className="text-[10px] uppercase tracking-widest text-gray-700">{body}</p>
        </section>
    );
}
