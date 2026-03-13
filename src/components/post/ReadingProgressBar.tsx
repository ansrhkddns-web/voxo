'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Clock3 } from 'lucide-react';

interface ReadingProgressBarProps {
    articleSelector?: string;
    readTimeMinutes: number;
}

export default function ReadingProgressBar({
    articleSelector = '[data-post-article]',
    readTimeMinutes,
}: ReadingProgressBarProps) {
    const [progress, setProgress] = useState(0);
    const [showTopButton, setShowTopButton] = useState(false);
    const frameRef = useRef<number | null>(null);
    const previousProgressRef = useRef(0);
    const previousShowTopRef = useRef(false);

    useEffect(() => {
        const syncProgress = () => {
            const article = document.querySelector(articleSelector);
            if (!article) {
                if (previousProgressRef.current !== 0) {
                    previousProgressRef.current = 0;
                    setProgress(0);
                }
                frameRef.current = null;
                return;
            }

            const rect = article.getBoundingClientRect();
            const articleTop = window.scrollY + rect.top;
            const articleHeight = article.clientHeight;
            const viewportHeight = window.innerHeight;
            const totalScrollable = Math.max(articleHeight - viewportHeight, 1);
            const nextProgress = Math.min(
                Math.max((window.scrollY - articleTop) / totalScrollable, 0),
                1,
            );
            const roundedProgress = Math.round(nextProgress * 100) / 100;
            const nextShowTop = window.scrollY > articleTop + 300;

            if (previousProgressRef.current !== roundedProgress) {
                previousProgressRef.current = roundedProgress;
                setProgress(roundedProgress);
            }

            if (previousShowTopRef.current !== nextShowTop) {
                previousShowTopRef.current = nextShowTop;
                setShowTopButton(nextShowTop);
            }

            frameRef.current = null;
        };

        const requestSync = () => {
            if (frameRef.current !== null) {
                return;
            }

            frameRef.current = window.requestAnimationFrame(syncProgress);
        };

        requestSync();
        window.addEventListener('scroll', requestSync, { passive: true });
        window.addEventListener('resize', requestSync);

        return () => {
            window.removeEventListener('scroll', requestSync);
            window.removeEventListener('resize', requestSync);
            if (frameRef.current !== null) {
                window.cancelAnimationFrame(frameRef.current);
            }
        };
    }, [articleSelector]);

    const progressLabel = `${Math.round(progress * 100)}%`;

    return (
        <>
            <div className="fixed inset-x-0 top-0 z-[70] h-[3px] bg-white/5">
                <div
                    className="h-full bg-gradient-to-r from-accent-green via-white/80 to-accent-green transition-[width] duration-150"
                    style={{ width: `${progress * 100}%` }}
                />
            </div>

            <div className="pointer-events-none fixed bottom-6 right-6 z-[70] flex flex-col items-end gap-3">
                <div
                    className="pointer-events-auto inline-flex items-center gap-3 border border-white/10 bg-black/80 px-4 py-3 backdrop-blur-xl"
                    style={{ marginBottom: 'var(--voxo-player-offset, 0px)' }}
                >
                    <Clock3 size={14} className="text-accent-green" />
                    <span className="font-display text-[10px] uppercase tracking-[0.2em] text-gray-300">
                        {readTimeMinutes}분 읽기
                    </span>
                    <span className="font-display text-[10px] uppercase tracking-[0.2em] text-gray-500">
                        {progressLabel}
                    </span>
                </div>

                {showTopButton ? (
                    <button
                        type="button"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="pointer-events-auto inline-flex items-center gap-2 border border-white/10 bg-black/80 px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green"
                        style={{ marginBottom: 'var(--voxo-player-offset, 0px)' }}
                    >
                        <ArrowUp size={14} />
                        <span>위로</span>
                    </button>
                ) : null}
            </div>
        </>
    );
}
