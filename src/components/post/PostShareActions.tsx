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
            onClick: () =>
                openPopup(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(getCurrentUrl())}`,
                ),
        },
        {
            label: 'FB',
            onClick: () =>
                openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getCurrentUrl())}`),
        },
        {
            label: 'LI',
            onClick: () =>
                openPopup(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getCurrentUrl())}`,
                ),
        },
        {
            label: copied ? 'OK' : 'CP',
            onClick: handleCopy,
        },
        {
            label: 'SH',
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
                >
                    {action.label}
                </button>
            ))}
        </div>
    );
}
