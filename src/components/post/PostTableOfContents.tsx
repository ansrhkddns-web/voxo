'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, List } from 'lucide-react';

interface HeadingItem {
    id: string;
    text: string;
    level: number;
}

interface PostTableOfContentsProps {
    articleSelector?: string;
    mode?: 'mobile' | 'desktop' | 'both';
}

function slugifyHeading(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function PostTableOfContents({
    articleSelector = '[data-post-article]',
    mode = 'both',
}: PostTableOfContentsProps) {
    const [headings, setHeadings] = useState<HeadingItem[]>([]);
    const [activeId, setActiveId] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const article = document.querySelector(articleSelector);
        if (!article) {
            const frameId = window.requestAnimationFrame(() => {
                setHeadings([]);
            });
            return () => window.cancelAnimationFrame(frameId);
        }

        const headingNodes = Array.from(article.querySelectorAll('h2, h3')) as HTMLHeadingElement[];
        const nextHeadings = headingNodes
            .map((heading, index) => {
                const text = heading.textContent?.trim() || '';
                if (!text) return null;

                const fallbackId = `${slugifyHeading(text) || 'section'}-${index}`;
                const nextId = heading.id || fallbackId;
                heading.id = nextId;

                return {
                    id: nextId,
                    text,
                    level: heading.tagName === 'H2' ? 2 : 3,
                };
            })
            .filter(Boolean) as HeadingItem[];

        const frameId = window.requestAnimationFrame(() => {
            setHeadings(nextHeadings);
        });

        if (nextHeadings.length === 0) {
            return () => window.cancelAnimationFrame(frameId);
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);

                if (visibleEntries[0]?.target?.id) {
                    setActiveId(visibleEntries[0].target.id);
                }
            },
            {
                rootMargin: '-25% 0px -60% 0px',
                threshold: [0, 1],
            }
        );

        headingNodes.forEach((heading) => observer.observe(heading));

        return () => {
            window.cancelAnimationFrame(frameId);
            observer.disconnect();
        };
    }, [articleSelector]);

    const hasHeadings = headings.length > 0;

    const content = useMemo(
        () => (
            <div className="space-y-2">
                {headings.map((heading) => (
                    <button
                        key={heading.id}
                        type="button"
                        onClick={() => {
                            document.getElementById(heading.id)?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start',
                            });
                            setMobileOpen(false);
                        }}
                        className={`block w-full text-left text-sm leading-relaxed transition-colors ${
                            activeId === heading.id
                                ? 'text-accent-green'
                                : 'text-gray-400 hover:text-white'
                        } ${heading.level === 3 ? 'pl-4' : ''}`}
                    >
                        {heading.text}
                    </button>
                ))}
            </div>
        ),
        [activeId, headings]
    );

    if (!hasHeadings) {
        return null;
    }

    return (
        <>
            {mode !== 'mobile' ? (
            <div className={`border border-white/10 bg-white/[0.02] p-5 ${mode === 'desktop' ? 'block' : 'hidden lg:block'}`}>
                <div className="mb-5 flex items-center gap-2">
                    <List size={14} className="text-accent-green" />
                    <h3 className="font-display text-[10px] uppercase tracking-[0.28em] text-white">
                        On This Page
                    </h3>
                </div>
                {content}
            </div>
            ) : null}

            {mode !== 'desktop' ? (
            <div className={`mb-8 border border-white/10 bg-white/[0.02] ${mode === 'mobile' ? 'block' : 'lg:hidden'}`}>
                <button
                    type="button"
                    onClick={() => setMobileOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between px-5 py-4"
                >
                    <div className="flex items-center gap-2">
                        <List size={14} className="text-accent-green" />
                        <span className="font-display text-[10px] uppercase tracking-[0.28em] text-white">
                            On This Page
                        </span>
                    </div>
                    <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {mobileOpen ? <div className="border-t border-white/10 px-5 py-4">{content}</div> : null}
            </div>
            ) : null}
        </>
    );
}
