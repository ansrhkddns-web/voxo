import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIDeskHeaderProps {
    progress: number;
    completionMode?: 'database' | 'local' | null;
}

export function AIDeskHeader({ progress, completionMode = null }: AIDeskHeaderProps) {
    return (
        <header className="mb-12 border-b border-white/5 pb-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-3">
                        <Sparkles className="text-accent-green" size={24} />
                        <h1 className="text-2xl font-light uppercase tracking-[0.2em] text-white">AI Auto Desk</h1>
                    </div>
                    <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-accent-green"></span>
                        AI draft pipeline and live processing status
                    </p>
                </div>

                <div className="flex flex-col gap-1 text-left md:items-end md:text-right">
                    <span className="text-[10px] uppercase tracking-widest text-gray-500">Overall progress</span>
                    <span className="text-2xl font-light tracking-wider text-accent-green">{progress}%</span>
                </div>
            </div>

            {completionMode ? (
                <div
                    className={`mt-5 inline-flex w-full items-center gap-2 border px-3 py-2 text-[10px] uppercase tracking-[0.2em] md:w-auto ${
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
