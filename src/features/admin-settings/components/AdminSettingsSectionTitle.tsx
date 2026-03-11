import React from 'react';

interface AdminSettingsSectionTitleProps {
    title: string;
}

export function AdminSettingsSectionTitle({ title }: AdminSettingsSectionTitleProps) {
    return (
        <h2 className="border-b border-white/10 pb-4 font-display text-[10px] uppercase tracking-[0.4em] text-white">
            {title}
        </h2>
    );
}
