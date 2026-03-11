import React from 'react';
import { AdminSettingsField } from '../components/AdminSettingsField';
import { AdminSettingsSectionTitle } from '../components/AdminSettingsSectionTitle';
import type { AdminSettingsCopy, AdminSettingsState } from '../types';

interface IntegrationsSettingsSectionProps {
    copy: AdminSettingsCopy['integrations'];
    settings: AdminSettingsState;
    onFieldChange: <K extends keyof AdminSettingsState>(key: K, value: AdminSettingsState[K]) => void;
}

export function IntegrationsSettingsSection({
    copy,
    settings,
    onFieldChange,
}: IntegrationsSettingsSectionProps) {
    return (
        <section className="space-y-6">
            <AdminSettingsSectionTitle title={copy.section} />
            <div className="rounded border border-white/5 bg-white/[0.01] p-4 text-sm text-gray-500">{copy.spotify}</div>
            <AdminSettingsField label={copy.gemini} value={settings.geminiApiKey} onChange={(value) => onFieldChange('geminiApiKey', value)} placeholder={copy.gemini} />
            <AdminSettingsField label={copy.playlist} value={settings.globalPlaylist} onChange={(value) => onFieldChange('globalPlaylist', value)} placeholder={copy.playlist} />
        </section>
    );
}
