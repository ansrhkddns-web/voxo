import React from 'react';
import { Layout, Sparkles, Type } from 'lucide-react';
import type {
    NewsletterLanguage,
    NewsletterTemplateOption,
} from '../types';
import { NewsletterTemplatePicker } from './NewsletterTemplatePicker';

interface NewsletterComposerFormProps {
    title: string;
    subjectLabel: string;
    subjectPlaceholder: string;
    contentLabel: string;
    contentPlaceholder: string;
    subject: string;
    content: string;
    language: NewsletterLanguage;
    templates: NewsletterTemplateOption[];
    onSubjectChange: (value: string) => void;
    onContentChange: (value: string) => void;
    onApplyTemplate: (template: NewsletterTemplateOption) => void;
}

export function NewsletterComposerForm({
    title,
    subjectLabel,
    subjectPlaceholder,
    contentLabel,
    contentPlaceholder,
    subject,
    content,
    language,
    templates,
    onSubjectChange,
    onContentChange,
    onApplyTemplate,
}: NewsletterComposerFormProps) {
    return (
        <section className="space-y-8">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                <Sparkles className="text-accent-green" size={16} strokeWidth={1} />
                <h2 className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-400">
                    {title}
                </h2>
            </div>

            <div className="space-y-6">
                <NewsletterTemplatePicker
                    templates={templates}
                    language={language}
                    onApplyTemplate={onApplyTemplate}
                />

                <div className="space-y-4">
                    <label className="flex items-center gap-2 font-display text-[9px] uppercase tracking-[0.3em] text-gray-600">
                        <Type size={12} strokeWidth={1} /> {subjectLabel}
                    </label>
                    <input
                        placeholder={subjectPlaceholder}
                        className="w-full rounded-none border border-white/5 bg-transparent p-5 font-display text-[11px] uppercase tracking-[0.1em] text-white transition-all focus:border-white/20 focus:outline-none"
                        value={subject}
                        onChange={(event) => onSubjectChange(event.target.value)}
                    />
                </div>

                <div className="space-y-4">
                    <label className="flex items-center gap-2 font-display text-[9px] uppercase tracking-[0.3em] text-gray-600">
                        <Layout size={12} strokeWidth={1} /> {contentLabel}
                    </label>
                    <textarea
                        placeholder={contentPlaceholder}
                        className="min-h-[320px] w-full resize-none rounded-none border border-white/5 bg-transparent p-8 font-serif text-[12px] leading-relaxed text-gray-300 transition-all focus:border-white/20 focus:outline-none"
                        value={content}
                        onChange={(event) => onContentChange(event.target.value)}
                    />
                </div>
            </div>
        </section>
    );
}
