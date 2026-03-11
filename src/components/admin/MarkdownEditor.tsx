'use client';

import React, { useMemo, useRef, useState } from 'react';
import TurndownService from 'turndown';
import { marked } from 'marked';
import {
    Heading2,
    Image as ImageIcon,
    Link2,
    Loader2,
    Quote,
    Rows3,
    Music2,
    Youtube,
} from 'lucide-react';

interface MarkdownEditorProps {
    content: string;
    onChange: (htmlContent: string) => void;
    spotifyUri?: string;
    onUploadInlineImage?: (file: File) => Promise<string>;
    isUploadingInlineImage?: boolean;
}

interface ToolbarButton {
    id: string;
    label: string;
    icon: React.ReactNode;
    snippet: string;
}

function extractYoutubeVideoId(url: string) {
    try {
        const parsed = new URL(url.trim());

        if (parsed.hostname.includes('youtu.be')) {
            const id = parsed.pathname.replace('/', '').trim();
            return id || null;
        }

        if (parsed.hostname.includes('youtube.com')) {
            if (parsed.pathname.startsWith('/watch')) {
                return parsed.searchParams.get('v');
            }

            if (parsed.pathname.startsWith('/shorts/')) {
                return parsed.pathname.split('/')[2] || null;
            }

            if (parsed.pathname.startsWith('/embed/')) {
                return parsed.pathname.split('/')[2] || null;
            }
        }
    } catch {
        return null;
    }

    return null;
}

function isDirectImageUrl(url: string) {
    return /^https?:\/\/.+\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(url.trim());
}

function transformStandaloneEmbeds(markdown: string) {
    const lines = markdown.split('\n');

    return lines
        .map((line) => {
            const trimmed = line.trim();

            if (!trimmed) {
                return line;
            }

            const youtubeVideoId = extractYoutubeVideoId(trimmed);
            if (youtubeVideoId) {
                return `\n<div class="voxo-video-embed"><iframe src="https://www.youtube.com/embed/${youtubeVideoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>\n`;
            }

            if (isDirectImageUrl(trimmed)) {
                return `\n<figure><img src="${trimmed}" alt="Embedded article image" /><figcaption>Article image</figcaption></figure>\n`;
            }

            return line;
        })
        .join('\n');
}

export default function MarkdownEditor({
    content,
    onChange,
    spotifyUri = '',
    onUploadInlineImage,
    isUploadingInlineImage = false,
}: MarkdownEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const turndownService = useMemo(() => {
        const service = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced',
        });

        service.addRule('keepIframeEmbeds', {
            filter: ['iframe'],
            replacement: (_content, node) => `\n\n${(node as HTMLElement).outerHTML}\n\n`,
        });

        service.addRule('keepVideoWrapper', {
            filter: (node) =>
                node instanceof HTMLElement &&
                node.nodeName === 'DIV' &&
                node.classList.contains('voxo-video-embed'),
            replacement: (_content, node) => `\n\n${(node as HTMLElement).outerHTML}\n\n`,
        });

        service.addRule('keepFigureBlocks', {
            filter: ['figure'],
            replacement: (_content, node) => `\n\n${(node as HTMLElement).outerHTML}\n\n`,
        });

        return service;
    }, []);

    const [draftMarkdown, setDraftMarkdown] = useState(() =>
        content ? turndownService.turndown(content) : ''
    );
    const markdown = draftMarkdown;

    const toolbarButtons: ToolbarButton[] = [
        {
            id: 'section',
            label: 'Section',
            icon: <Heading2 size={14} />,
            snippet: '\n\n## Section title\n\nWrite your next section here.\n',
        },
        {
            id: 'quote',
            label: 'Quote',
            icon: <Quote size={14} />,
            snippet: '\n\n> Add a highlighted quote or key point here.\n',
        },
        {
            id: 'link',
            label: 'Link',
            icon: <Link2 size={14} />,
            snippet: '\n\n[Link text](https://example.com)\n',
        },
        {
            id: 'youtube',
            label: 'YouTube',
            icon: <Youtube size={14} />,
            snippet: '\n\nhttps://www.youtube.com/watch?v=\n',
        },
        {
            id: 'divider',
            label: 'Divider',
            icon: <Rows3 size={14} />,
            snippet: '\n\n---\n\n',
        },
        {
            id: 'spotify',
            label: 'Spotify Note',
            icon: <Music2 size={14} />,
            snippet: spotifyUri
                ? `\n\n> Listen on Spotify: ${spotifyUri}\n`
                : '\n\n> Add a Spotify listening note here.\n',
        },
    ];

    const updateMarkdown = (nextMarkdown: string) => {
        setDraftMarkdown(nextMarkdown);
        const normalizedMarkdown = transformStandaloneEmbeds(nextMarkdown);
        const html = marked.parse(normalizedMarkdown) as string;
        onChange(html);
    };

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateMarkdown(event.target.value);
    };

    const insertSnippet = (snippet: string) => {
        const textarea = textareaRef.current;
        if (!textarea) {
            updateMarkdown(`${markdown}${snippet}`);
            return;
        }

        const selectionStart = textarea.selectionStart;
        const selectionEnd = textarea.selectionEnd;
        const nextMarkdown =
            markdown.slice(0, selectionStart) + snippet + markdown.slice(selectionEnd);

        updateMarkdown(nextMarkdown);

        requestAnimationFrame(() => {
            textarea.focus();
            const nextPosition = selectionStart + snippet.length;
            textarea.setSelectionRange(nextPosition, nextPosition);
        });
    };

    const handleInlineImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !onUploadInlineImage) {
            return;
        }

        const uploadedUrl = await onUploadInlineImage(file);
        if (uploadedUrl) {
            insertSnippet(`\n\n![Image description](${uploadedUrl})\n\n*Add image caption here.*\n`);
        }

        event.target.value = '';
    };

    return (
        <div className="flex w-full flex-col overflow-hidden border border-white/10 bg-[#050505] shadow-2xl">
            <div className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-white/5 p-4">
                <div className="mr-2 space-y-1">
                    <span className="block font-display text-[10px] uppercase tracking-[0.25em] text-white">
                        Write
                    </span>
                    <span className="block text-[11px] text-gray-500">
                        Paste a YouTube URL on its own line to auto-embed it. A direct image URL will render as an article image.
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {toolbarButtons.map((button) => (
                        <button
                            key={button.id}
                            type="button"
                            onClick={() => insertSnippet(button.snippet)}
                            className="inline-flex items-center gap-2 rounded-sm border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green"
                        >
                            {button.icon}
                            <span>{button.label}</span>
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!onUploadInlineImage || isUploadingInlineImage}
                        className="inline-flex items-center gap-2 rounded-sm border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isUploadingInlineImage ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <ImageIcon size={14} />
                        )}
                        <span>Inline Image</span>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleInlineImageUpload}
                    />
                </div>
            </div>

            <div className="relative min-h-[720px] w-full flex-1">
                <textarea
                    ref={textareaRef}
                    value={markdown}
                    onChange={handleChange}
                    placeholder="# Write your post here...&#10;&#10;Paste a standalone YouTube URL to embed it, or add a direct image URL to render it inside the article."
                    className="custom-scrollbar h-[720px] w-full resize-y bg-transparent p-8 font-mono text-sm leading-8 text-gray-300 selection:bg-accent-green/30 focus:outline-none"
                    spellCheck={false}
                />
            </div>
        </div>
    );
}
