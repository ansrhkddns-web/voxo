import React from 'react';
import { AdminSettingsField } from '../components/AdminSettingsField';
import { AdminSettingsSectionTitle } from '../components/AdminSettingsSectionTitle';
import type { AdminSettingsCopy, AdminSettingsState } from '../types';

interface GeneralSettingsSectionProps {
    copy: AdminSettingsCopy['general'];
    language: 'en' | 'ko';
    settings: AdminSettingsState;
    onFieldChange: <K extends keyof AdminSettingsState>(key: K, value: AdminSettingsState[K]) => void;
    onLanguageChange: (language: 'en' | 'ko') => void;
}

export function GeneralSettingsSection({
    copy,
    language,
    settings,
    onFieldChange,
    onLanguageChange,
}: GeneralSettingsSectionProps) {
    return (
        <>
            <section className="space-y-6">
                <AdminSettingsSectionTitle title={copy.section} />
                <AdminSettingsField label={copy.siteName} value={settings.siteName} onChange={(value) => onFieldChange('siteName', value)} placeholder={copy.siteName} />
                <AdminSettingsField label={copy.siteDescription} value={settings.siteDescription} onChange={(value) => onFieldChange('siteDescription', value)} placeholder={copy.siteDescription} multiline rows={3} />
                <AdminSettingsField label={copy.contactEmail} value={settings.contactEmail} onChange={(value) => onFieldChange('contactEmail', value)} placeholder={copy.contactEmail} type="email" />
            </section>

            <section className="space-y-4">
                <AdminSettingsSectionTitle title={copy.adminLanguage} />
                <p className="text-sm text-gray-500">{copy.languageHelp}</p>
                <div className="flex gap-2">
                    <button onClick={() => onLanguageChange('en')} className={`px-4 py-2 text-sm ${language === 'en' ? 'bg-white text-black' : 'bg-white/5 text-gray-400'}`}>
                        {copy.englishLabel}
                    </button>
                    <button onClick={() => onLanguageChange('ko')} className={`px-4 py-2 text-sm ${language === 'ko' ? 'bg-white text-black' : 'bg-white/5 text-gray-400'}`}>
                        {copy.koreanLabel}
                    </button>
                </div>
            </section>
        </>
    );
}
