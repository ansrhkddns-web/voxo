'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function PreviewPanel({
    title,
    content,
    defaultOpen = true,
    expandLabel,
    collapseLabel,
}: {
    title: string;
    content: string;
    defaultOpen?: boolean;
    expandLabel: string;
    collapseLabel: string;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <section className="rounded-2xl border border-white/8 bg-black/35">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
                <div className="space-y-1">
                    <h3 className="font-display text-sm uppercase tracking-[0.22em] text-white/90">
                        {title}
                    </h3>
                    <p className="text-xs text-gray-600">
                        {isOpen ? collapseLabel : expandLabel}
                    </p>
                </div>
                {isOpen ? (
                    <ChevronUp size={16} className="text-accent-green" />
                ) : (
                    <ChevronDown size={16} className="text-gray-500" />
                )}
            </button>

            {isOpen ? (
                <div className="border-t border-white/8 px-5 py-5">
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-7 text-gray-300">
                        {content}
                    </pre>
                </div>
            ) : null}
        </section>
    );
}
