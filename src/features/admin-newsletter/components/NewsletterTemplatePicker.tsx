import React from 'react';
import { FileText } from 'lucide-react';
import type {
    NewsletterLanguage,
    NewsletterTemplateOption,
} from '../types';

interface NewsletterTemplatePickerProps {
    templates: NewsletterTemplateOption[];
    language: NewsletterLanguage;
    onApplyTemplate: (template: NewsletterTemplateOption) => void;
}

export function NewsletterTemplatePicker({
    templates,
    language,
    onApplyTemplate,
}: NewsletterTemplatePickerProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-500">
                <FileText size={14} />
                <p className="font-display text-[9px] uppercase tracking-[0.3em]">
                    {language === 'ko' ? '빠른 템플릿' : 'Quick Templates'}
                </p>
            </div>
            <div className="flex flex-wrap gap-3">
                {templates.map((template) => (
                    <button
                        key={template.id}
                        onClick={() => onApplyTemplate(template)}
                        className="border border-white/10 px-4 py-3 text-[11px] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green"
                    >
                        {template.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
