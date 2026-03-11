import React from 'react';
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
            <AdminSettingsField label={copy.concept} value={settings.aiPromptConcept} onChange={(value) => onFieldChange('aiPromptConcept', value)} placeholder={copy.concept} multiline rows={3} />
            <AdminSettingsField label={copy.research} value={settings.aiPromptResearch} onChange={(value) => onFieldChange('aiPromptResearch', value)} placeholder={copy.research} multiline rows={6} />
            <AdminSettingsField label={copy.write} value={settings.aiPromptWrite} onChange={(value) => onFieldChange('aiPromptWrite', value)} placeholder={copy.write} multiline rows={8} />
            <AdminSettingsField label={copy.seo} value={settings.aiPromptSeo} onChange={(value) => onFieldChange('aiPromptSeo', value)} placeholder={copy.seo} multiline rows={5} />
        </section>
    );
}
