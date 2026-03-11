import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Send } from 'lucide-react';

interface EditorHeaderProps {
    title: string;
    saveDraftLabel: string;
    publishLabel: string;
    publishingLabel: string;
    isPublishing: boolean;
    onSaveDraft: () => void;
    onPublish: () => void;
}

export function EditorHeader({
    title,
    saveDraftLabel,
    publishLabel,
    publishingLabel,
    isPublishing,
    onSaveDraft,
    onPublish,
}: EditorHeaderProps) {
    return (
        <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
            <div className="flex min-h-20 flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <div className="flex items-center gap-4 sm:gap-6">
                <Link href="/admin" className="text-gray-500 transition-colors hover:text-white">
                    <ArrowLeft size={18} strokeWidth={1} />
                </Link>
                <div className="h-4 w-[1px] bg-white/10" />
                <span className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-400 sm:tracking-[0.4em]">{title}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                    onClick={onSaveDraft}
                    className="flex items-center gap-2 border border-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 transition-all hover:border-white/20 hover:text-white sm:px-6"
                >
                    <Save size={14} />
                    {saveDraftLabel}
                </button>
                <button
                    onClick={onPublish}
                    disabled={isPublishing}
                    className="flex items-center gap-2 bg-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-accent-green disabled:opacity-50 sm:px-8"
                >
                    {isPublishing ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                    {isPublishing ? publishingLabel : publishLabel}
                </button>
            </div>
            </div>
        </header>
    );
}
