'use client';

import React from 'react';
import { Copy, Sparkles } from 'lucide-react';

function FieldShell({
    label,
    helper,
    children,
    actions,
}: {
    label: string;
    helper?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
}) {
    return (
        <label className="space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <p className="font-display text-[10px] uppercase tracking-[0.24em] text-gray-400">
                        {label}
                    </p>
                    {helper ? <p className="text-xs leading-relaxed text-gray-600">{helper}</p> : null}
                </div>
                {actions}
            </div>
            {children}
        </label>
    );
}

export function SectionCard({
    title,
    description,
    children,
    actions,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
}) {
    return (
        <section className="space-y-6 rounded-2xl border border-white/8 bg-white/[0.025] p-7 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-accent-green" />
                        <h2 className="font-display text-lg text-white">{title}</h2>
                    </div>
                    {description ? (
                        <p className="max-w-3xl text-sm leading-relaxed text-gray-500">
                            {description}
                        </p>
                    ) : null}
                </div>
                {actions}
            </div>
            {children}
        </section>
    );
}

export function SubsectionCard({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-5 rounded-2xl bg-black/30 p-6">
            <div className="space-y-2">
                <h3 className="font-display text-sm uppercase tracking-[0.22em] text-white/90">
                    {title}
                </h3>
                {description ? (
                    <p className="max-w-2xl text-sm leading-relaxed text-gray-500">{description}</p>
                ) : null}
            </div>
            {children}
        </div>
    );
}

export function TextField({
    label,
    value,
    onChange,
    helper,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    helper?: string;
    placeholder?: string;
}) {
    return (
        <FieldShell label={label} helper={helper}>
            <input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-700 focus:border-accent-green"
            />
        </FieldShell>
    );
}

export function TextareaField({
    label,
    value,
    onChange,
    helper,
    rows = 5,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    helper?: string;
    rows?: number;
    placeholder?: string;
}) {
    return (
        <FieldShell label={label} helper={helper}>
            <textarea
                rows={rows}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="min-h-[120px] w-full resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm leading-relaxed text-white outline-none transition-colors placeholder:text-gray-700 focus:border-accent-green"
            />
        </FieldShell>
    );
}

export function SelectField({
    label,
    value,
    onChange,
    helper,
    options,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    helper?: string;
    options: Array<{ label: string; value: string }>;
}) {
    return (
        <FieldShell label={label} helper={helper}>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-accent-green"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value} className="bg-black">
                        {option.label}
                    </option>
                ))}
            </select>
        </FieldShell>
    );
}

export function TokenChipList({
    tokens,
    onCopy,
    buttonLabel,
}: {
    tokens: readonly string[];
    onCopy: (token: string) => void;
    buttonLabel: string;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {tokens.map((token) => (
                <button
                    key={token}
                    type="button"
                    onClick={() => onCopy(token)}
                    className="inline-flex items-center gap-2 rounded-full border border-accent-green/25 bg-accent-green/5 px-3 py-2 font-mono text-xs text-accent-green transition-colors hover:border-accent-green hover:bg-accent-green/10"
                >
                    <Copy size={12} />
                    <span>{token}</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/55">
                        {buttonLabel}
                    </span>
                </button>
            ))}
        </div>
    );
}
