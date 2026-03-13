'use client';

import React from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';

export function RepeaterField({
    label,
    description,
    items,
    onChange,
    addLabel,
    emptyLabel,
    moveUpLabel,
    moveDownLabel,
    removeLabel,
}: {
    label: string;
    description?: string;
    items: string[];
    onChange: (items: string[]) => void;
    addLabel: string;
    emptyLabel: string;
    moveUpLabel: string;
    moveDownLabel: string;
    removeLabel: string;
}) {
    const updateItem = (index: number, value: string) => {
        const next = [...items];
        next[index] = value;
        onChange(next);
    };

    const addItem = () => {
        onChange([...items, '']);
    };

    const removeItem = (index: number) => {
        onChange(items.filter((_, itemIndex) => itemIndex !== index));
    };

    const moveItem = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= items.length) {
            return;
        }

        const next = [...items];
        const [movedItem] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, movedItem);
        onChange(next);
    };

    return (
        <section className="space-y-4 rounded-2xl bg-black/30 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                    <h3 className="font-display text-sm uppercase tracking-[0.22em] text-white/90">
                        {label}
                    </h3>
                    {description ? (
                        <p className="max-w-xl text-sm leading-relaxed text-gray-500">{description}</p>
                    ) : null}
                </div>
                <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center gap-2 rounded-full border border-accent-green/25 bg-accent-green/5 px-4 py-2 text-xs text-accent-green transition-colors hover:border-accent-green hover:bg-accent-green/10"
                >
                    <Plus size={14} />
                    {addLabel}
                </button>
            </div>

            {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-gray-600">
                    {emptyLabel}
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div
                            key={`${label}-${index}`}
                            className="grid min-w-0 gap-3 rounded-2xl border border-white/8 bg-black/40 p-3 sm:grid-cols-[40px_minmax(0,1fr)]"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.04] font-display text-[11px] uppercase tracking-[0.2em] text-gray-500">
                                {index + 1}
                            </div>
                            <input
                                type="text"
                                value={item}
                                onChange={(event) => updateItem(index, event.target.value)}
                                className="mt-0.5 min-w-0 w-full rounded-xl border border-white/8 bg-black/50 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-700 focus:border-accent-green"
                            />
                            <div className="flex flex-wrap justify-end gap-2 sm:col-start-2">
                                <button
                                    type="button"
                                    onClick={() => moveItem(index, index - 1)}
                                    aria-label={moveUpLabel}
                                    className="rounded-full border border-white/10 p-2 text-gray-400 transition-colors hover:border-white/20 hover:text-white"
                                >
                                    <ArrowUp size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveItem(index, index + 1)}
                                    aria-label={moveDownLabel}
                                    className="rounded-full border border-white/10 p-2 text-gray-400 transition-colors hover:border-white/20 hover:text-white"
                                >
                                    <ArrowDown size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    aria-label={removeLabel}
                                    className="rounded-full border border-red-500/20 p-2 text-red-400 transition-colors hover:border-red-400/40 hover:text-red-300"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
