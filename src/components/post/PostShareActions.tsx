'use client';

import React, { useState } from 'react';

interface PostShareActionsProps {
    title: string;
    excerpt?: string;
}

function openPopup(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer,width=720,height=720');
}

export default function PostShareActions({ title, excerpt }: PostShareActionsProps) {
    const [copied, setCopied] = useState(false);

    const getCurrentUrl = () => window.location.href;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(getCurrentUrl());
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch (error) {
            console.error('Failed to copy link', error);
        }
    };

    const handleNativeShare = async () => {
        const shareData = {
            title,
            text: excerpt || title,
            url: getCurrentUrl(),
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch (error) {
                console.error('Native share cancelled or failed', error);
            }
        }

        await handleCopy();
    };

    const actions = [
        {
            label: 'X',
            title: 'X에 공유',
            onClick: () =>
                openPopup(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(getCurrentUrl())}`,
                ),
        },
        {
            label: 'FB',
            title: 'Facebook에 공유',
            onClick: () =>
                openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getCurrentUrl())}`),
        },
        {
            label: 'LI',
            title: 'LinkedIn에 공유',
            onClick: () =>
                openPopup(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getCurrentUrl())}`,
                ),
        },
        {
            label: copied ? 'OK' : 'CP',
            title: copied ? '링크 복사 완료' : '링크 복사',
            onClick: handleCopy,
        },
        {
            label: 'SH',
            title: '기본 공유 열기',
            onClick: handleNativeShare,
        },
    ];

    return (
        <div className="flex gap-4">
            {actions.map((action) => (
                <button
                    key={action.label}
                    onClick={action.onClick}
                    className="flex h-10 w-10 items-center justify-center border border-white/10 font-display text-[10px] uppercase text-gray-500 transition-colors hover:border-white hover:text-white"
                    type="button"
                    title={action.title}
                    aria-label={action.title}
                >
                    {action.label}
                </button>
            ))}
        </div>
    );
}
