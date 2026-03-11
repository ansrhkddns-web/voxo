import React from 'react';

interface AdminSettingsFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    multiline?: boolean;
    rows?: number;
    type?: string;
}

export function AdminSettingsField({
    label,
    value,
    onChange,
    placeholder,
    multiline = false,
    rows = 4,
    type = 'text',
}: AdminSettingsFieldProps) {
    return (
        <label className="block space-y-3">
            <span className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-500">{label}</span>
            {multiline ? (
                <textarea
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    rows={rows}
                    className="w-full resize-y border-b border-white/10 bg-transparent py-3 text-white focus:border-accent-green focus:outline-none"
                    placeholder={placeholder}
                />
            ) : (
                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    type={type}
                    className="w-full border-b border-white/10 bg-transparent py-3 text-white focus:border-accent-green focus:outline-none"
                    placeholder={placeholder}
                />
            )}
        </label>
    );
}
