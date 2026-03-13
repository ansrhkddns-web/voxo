'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { AIPromptManagerTabDefinition, AIPromptManagerTabId } from '../types';

export function StickyTabBar({
    tabs,
    activeTab,
    onChange,
    dirtyTabs,
    dirtyLabel,
}: {
    tabs: AIPromptManagerTabDefinition[];
    activeTab: AIPromptManagerTabId;
    onChange: (tabId: AIPromptManagerTabId) => void;
    dirtyTabs: Partial<Record<AIPromptManagerTabId, boolean>>;
    dirtyLabel: string;
}) {
    return (
        <div className="overflow-x-auto">
            <div className="inline-flex min-w-full gap-2 rounded-2xl border border-white/8 bg-white/[0.02] p-2">
                {tabs.map((tab) => {
                    const isActive = tab.id === activeTab;
                    const isDirty = Boolean(dirtyTabs[tab.id]);

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onChange(tab.id)}
                            className={cn(
                                'flex min-w-[140px] items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm transition-all',
                                isActive
                                    ? 'bg-accent-green text-black shadow-[0_10px_24px_rgba(102,255,170,0.16)]'
                                    : 'bg-transparent text-gray-400 hover:bg-white/[0.04] hover:text-white'
                            )}
                        >
                            <span className="font-display text-[11px] uppercase tracking-[0.2em]">
                                {tab.label}
                            </span>
                            {isDirty ? (
                                <span
                                    aria-label={dirtyLabel}
                                    className={cn(
                                        'h-2.5 w-2.5 rounded-full',
                                        isActive ? 'bg-black/80' : 'bg-accent-green'
                                    )}
                                />
                            ) : null}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
