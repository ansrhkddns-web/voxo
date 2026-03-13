'use client';

import React from 'react';
import { AI_PROMPT_VARIABLES } from '@/features/admin-ai-prompts/constants';
import { SectionCard, TokenChipList } from '@/features/admin-ai-prompts/components/FormFields';
import type { AIPromptManagerCopy } from '@/features/admin-ai-prompts/types';

interface BasicSettingsTabProps {
    copy: AIPromptManagerCopy;
    onCopyVariable: (token: string) => void;
    onCopyAllVariables: () => void;
}

export default function BasicSettingsTab({
    copy,
    onCopyVariable,
    onCopyAllVariables,
}: BasicSettingsTabProps) {
    return (
        <div className="space-y-6">
            <SectionCard title={copy.tabs.basic.label} description={copy.subtitle}>
                <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                    <div className="space-y-5 rounded-2xl bg-black/30 p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                                <h3 className="font-display text-sm uppercase tracking-[0.22em] text-white/90">
                                    {copy.variablesTitle}
                                </h3>
                                <p className="max-w-2xl text-sm leading-relaxed text-gray-500">
                                    {copy.variablesDescription}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onCopyAllVariables}
                                className="rounded-full border border-accent-green/25 bg-accent-green/5 px-4 py-2 text-xs text-accent-green transition-colors hover:border-accent-green hover:bg-accent-green/10"
                            >
                                {copy.copyAllVariables}
                            </button>
                        </div>
                        <TokenChipList
                            tokens={AI_PROMPT_VARIABLES}
                            buttonLabel={copy.copyVariable}
                            onCopy={onCopyVariable}
                        />
                    </div>

                    <div className="space-y-4 rounded-2xl bg-black/30 p-6">
                        <h3 className="font-display text-sm uppercase tracking-[0.22em] text-white/90">
                            {copy.usageTipsTitle}
                        </h3>
                        <div className="space-y-3">
                            {copy.usageTips.map((tip) => (
                                <div
                                    key={tip}
                                    className="rounded-2xl border border-white/8 bg-black/35 px-4 py-4 text-sm leading-relaxed text-gray-300"
                                >
                                    {tip}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}
