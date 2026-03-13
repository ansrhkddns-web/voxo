import React from 'react';
import Link from 'next/link';
import { AdminSettingsField } from '../components/AdminSettingsField';
import { AdminSettingsSectionTitle } from '../components/AdminSettingsSectionTitle';
import type { AdminSettingsCopy, AdminSettingsState } from '../types';

interface AISettingsSectionProps {
    copy: AdminSettingsCopy['ai'];
    settings: AdminSettingsState;
    onFieldChange: <K extends keyof AdminSettingsState>(key: K, value: AdminSettingsState[K]) => void;
}

export function AISettingsSection({ copy, settings, onFieldChange }: AISettingsSectionProps) {
    return (
        <section className="space-y-6">
            <AdminSettingsSectionTitle title={copy.section} />
            <p className="text-sm text-gray-500">{copy.description}</p>
            <div className="border border-accent-green/20 bg-accent-green/5 p-4 text-sm text-gray-300">
                Structured rules for category, curation profile, and article length can now be managed in{' '}
                <Link href="/admin/ai-prompts" className="text-accent-green underline underline-offset-4">
                    AI Prompt Manager
                </Link>
                .
            </div>
            <AdminSettingsField label={copy.concept} value={settings.aiPromptConcept} onChange={(value) => onFieldChange('aiPromptConcept', value)} placeholder={copy.concept} multiline rows={3} />
            <AdminSettingsField label={copy.research} value={settings.aiPromptResearch} onChange={(value) => onFieldChange('aiPromptResearch', value)} placeholder={copy.research} multiline rows={6} />
            <AdminSettingsField label={copy.write} value={settings.aiPromptWrite} onChange={(value) => onFieldChange('aiPromptWrite', value)} placeholder={copy.write} multiline rows={8} />
            <AdminSettingsField label={copy.seo} value={settings.aiPromptSeo} onChange={(value) => onFieldChange('aiPromptSeo', value)} placeholder={copy.seo} multiline rows={5} />
        </section>
    );
}
