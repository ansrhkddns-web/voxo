'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import TurndownService from 'turndown';
import { marked } from 'marked';

interface MarkdownEditorProps {
    content: string; // The parent expects/sends HTML
    onChange: (htmlContent: string) => void;
}

export default function MarkdownEditor({ content, onChange }: MarkdownEditorProps) {
    const [markdown, setMarkdown] = useState('');
    const [isPreview, setIsPreview] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // Initial load: converting parent's HTML into Markdown
    useEffect(() => {
        if (!initialized && content) {
            const turndownService = new TurndownService({
                headingStyle: 'atx',
                codeBlockStyle: 'fenced'
            });
            // Try parsing HTML
            setMarkdown(turndownService.turndown(content));
            setInitialized(true);
        } else if (!initialized && !content) {
            setInitialized(true); // new post
        }
    }, [content, initialized]);

    // When typing, we update local Markdown state and tell parent the parsed HTML
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const mdText = e.target.value;
        setMarkdown(mdText);

        // Parse md -> html for parent database saving
        const html = marked.parse(mdText) as string;
        onChange(html);
    };

    return (
        <div className="w-full flex flex-col border border-white/10 rounded-xs bg-[#050505] overflow-hidden shadow-2xl">
            {/* Toolbar */}
            <div className="flex items-center gap-4 p-3 border-b border-white/10 bg-white/5">
                <button
                    onClick={() => setIsPreview(false)}
                    className={`px-4 py-2 text-[10px] tracking-[0.2em] uppercase font-display transition-colors rounded-sm flex-1 md:flex-none ${!isPreview ? 'bg-accent-green text-black font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    Write (Markdown)
                </button>
                <button
                    onClick={() => setIsPreview(true)}
                    className={`px-4 py-2 text-[10px] tracking-[0.2em] uppercase font-display transition-colors rounded-sm flex-1 md:flex-none ${isPreview ? 'bg-accent-green text-black font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    Preview Mode
                </button>
            </div>

            {/* Editor Body */}
            <div className="flex-1 w-full min-h-[600px] relative">
                {isPreview ? (
                    <div className="prose prose-lg prose-invert max-w-none p-8 text-gray-300 font-serif font-light leading-relaxed custom-scrollbar h-[600px] overflow-y-auto">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                        >
                            {markdown}
                        </ReactMarkdown>
                    </div>
                ) : (
                    <textarea
                        value={markdown}
                        onChange={handleChange}
                        placeholder="# Write your post here...&#10;&#10;Use standard Markdown syntax like **bold**, *italic*, or > blockquotes.&#10;To render HTML directly, just type raw HTML tags."
                        className="w-full h-[600px] p-8 bg-transparent text-gray-300 font-mono text-sm leading-8 focus:outline-none resize-y custom-scrollbar selection:bg-accent-green/30"
                        spellCheck={false}
                    />
                )}
            </div>
        </div>
    );
}
