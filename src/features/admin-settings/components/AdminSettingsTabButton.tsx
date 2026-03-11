import React from 'react';
import type { LucideIcon } from 'lucide-react';
import type { AdminSettingsTabId } from '../types';

interface AdminSettingsTabButtonProps {
    id: AdminSettingsTabId;
    label: string;
    icon: LucideIcon;
    active: boolean;
    onClick: (tab: AdminSettingsTabId) => void;
}

export function AdminSettingsTabButton({
    id,
    label,
    icon: Icon,
    active,
    onClick,
}: AdminSettingsTabButtonProps) {
    return (
        <button
            onClick={() => onClick(id)}
            className={`flex w-full items-center gap-3 border-l px-4 py-3 text-left font-display text-[10px] uppercase tracking-[0.2em] transition-all ${
                active
                    ? 'border-accent-green bg-white/[0.03] text-accent-green'
                    : 'border-transparent text-gray-500 hover:bg-white/[0.02] hover:text-white'
            }`}
        >
            <Icon size={14} />
            {label}
        </button>
    );
}
