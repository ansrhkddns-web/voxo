'use client';

import React from 'react';

export function PromptEditor({
    title,
    description,
    value,
    onChange,
    helper,
    rows = 12,
    variableTokens = [],
}: {
    title: string;
    description: string;
    value: string;
    onChange: (value: string) => void;
    helper?: string;
    rows?: number;
    variableTokens?: readonly string[];
}) {
    return (
        <section className="space-y-4 rounded-2xl bg-black/30 p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                    <h3 className="font-display text-lg text-white">{title}</h3>
                    <p className="max-w-3xl text-sm leading-relaxed text-gray-500">{description}</p>
                </div>
                {variableTokens.length > 0 ? (
                    <div className="max-w-sm space-y-2">
                        <p className="font-display text-[10px] uppercase tracking-[0.22em] text-gray-500">
                            {helper}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {variableTokens.map((token) => (
                                <span
                                    key={token}
                                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-gray-300"
                                >
                                    {token}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
            <textarea
                rows={rows}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="min-h-[180px] w-full resize-y rounded-2xl border border-white/10 bg-black/60 px-5 py-4 font-mono text-sm leading-7 text-white outline-none transition-colors placeholder:text-gray-700 focus:border-accent-green"
            />
        </section>
    );
}
