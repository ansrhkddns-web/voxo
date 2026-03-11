import React from 'react';

interface DashboardSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

export function DashboardSection({ title, icon, children }: DashboardSectionProps) {
    return (
        <section className="border border-white/5 bg-white/[0.02] p-6">
            <div className="mb-6 flex items-center justify-between">
                <p className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-500">{title}</p>
                {icon}
            </div>
            {children}
        </section>
    );
}
