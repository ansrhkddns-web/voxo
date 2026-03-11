import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIDeskHeaderProps {
    progress: number;
    completionMode?: 'database' | 'local' | null;
    compact?: boolean;
}

export function AIDeskHeader({ progress, completionMode = null, compact = false }: AIDeskHeaderProps) {
    return (
        <header className={compact ? 'border-b border-white/5 pb-3' : 'mb-12 border-b border-white/5 pb-6'}>
            <div className={`flex flex-col ${compact ? 'gap-4 md:flex-row md:items-center md:justify-between' : 'gap-6 md:flex-row md:items-center md:justify-between'}`}>
                <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-3">
                        <span className={`inline-flex items-center justify-center rounded-full border border-accent-green/20 bg-accent-green/10 ${compact ? 'h-8 w-8' : 'h-10 w-10'}`}>
                            <Sparkles className="text-accent-green" size={compact ? 16 : 20} />
                        </span>
                        <div className="min-w-0">
                            <h1 className={`${compact ? 'text-lg tracking-[0.16em]' : 'text-2xl tracking-[0.2em]'} truncate font-light uppercase text-white`}>
                                AI Auto Desk
                            </h1>
                            {compact ? (
                                <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-gray-500">
                                    Sticky live pipeline monitor
                                </p>
                            ) : null}
                        </div>
                    </div>
                    <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-accent-green"></span>
                        AI draft pipeline and live processing status
                    </p>
                </div>

                <div className={`flex ${compact ? 'flex-wrap items-center gap-3 md:justify-end' : 'flex-col gap-1 text-left md:items-end md:text-right'}`}>
                    <div className={compact ? 'rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-left' : 'text-left md:text-right'}>
                        <span className="block text-[10px] uppercase tracking-widest text-gray-500">Overall progress</span>
                        <span className={`${compact ? 'text-lg' : 'text-2xl'} font-light tracking-wider text-accent-green`}>
                            {progress}%
                        </span>
                    </div>

                    {completionMode ? (
                        <div
                            className={`inline-flex items-center gap-2 border px-3 py-2 text-[10px] uppercase tracking-[0.18em] ${
                                completionMode === 'database'
                                    ? 'border-accent-green/30 bg-accent-green/10 text-accent-green'
                                    : 'border-amber-400/30 bg-amber-400/10 text-amber-200'
                            }`}
                        >
                            <span className={`h-1.5 w-1.5 rounded-full ${completionMode === 'database' ? 'bg-accent-green' : 'bg-amber-300'}`}></span>
                            <span>
                                {completionMode === 'database'
                                    ? 'Saved to database'
                                    : 'Opened as local recovery draft'}
                            </span>
                        </div>
                    ) : null}
                </div>
            </div>

            {!compact && completionMode ? (
                <div
                    className={`mt-4 inline-flex w-full items-center gap-2 border px-3 py-2 text-[10px] uppercase tracking-[0.2em] md:w-auto ${
                        completionMode === 'database'
                            ? 'border-accent-green/30 bg-accent-green/10 text-accent-green'
                            : 'border-amber-400/30 bg-amber-400/10 text-amber-200'
                    }`}
                >
                    <span className={`h-1.5 w-1.5 rounded-full ${completionMode === 'database' ? 'bg-accent-green' : 'bg-amber-300'}`}></span>
                    <span>
                        {completionMode === 'database'
                            ? 'Saved to database'
                            : 'Opened as local recovery draft'}
                    </span>
                </div>
            ) : null}
        </header>
    );
}
