'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useAdminLanguage } from '@/providers/AdminLanguageProvider';
import { getAllSettings, updateAdminCredentials, updateSetting } from '@/app/actions/settingsActions';
import {
    DEFAULT_ADMIN_CREDENTIAL,
    DEFAULT_ADMIN_SECURITY,
    DEFAULT_ADMIN_SETTINGS,
    adminSettingKeys,
    adminSettingsCopy,
    adminSettingsTabs,
} from '@/features/admin-settings/constants';
import { AdminSettingsTabButton } from '@/features/admin-settings/components/AdminSettingsTabButton';
import { AISettingsSection } from '@/features/admin-settings/sections/AISettingsSection';
import { GeneralSettingsSection } from '@/features/admin-settings/sections/GeneralSettingsSection';
import { IntegrationsSettingsSection } from '@/features/admin-settings/sections/IntegrationsSettingsSection';
import { NotificationsSettingsSection } from '@/features/admin-settings/sections/NotificationsSettingsSection';
import { SecuritySettingsSection } from '@/features/admin-settings/sections/SecuritySettingsSection';
import type {
    AdminSecurityState,
    AdminSettingsState,
    AdminSettingsTabId,
} from '@/features/admin-settings/types';

interface SettingRecord {
    setting_key: string;
    setting_value: string | null;
}

interface AdminSettingsClientProps {
    initialSettingsRecords: SettingRecord[];
    initialLoadFailed?: boolean;
}

function applySettingsRecords(records: SettingRecord[]) {
    const settingsMap = Object.fromEntries(
        records.map((item) => [item.setting_key, item.setting_value ?? ''])
    );

    const nextSettings: AdminSettingsState = {
        ...DEFAULT_ADMIN_SETTINGS,
        siteName: settingsMap[adminSettingKeys.siteName] || DEFAULT_ADMIN_SETTINGS.siteName,
        siteDescription:
            settingsMap[adminSettingKeys.siteDescription] ||
            DEFAULT_ADMIN_SETTINGS.siteDescription,
        contactEmail:
            settingsMap[adminSettingKeys.contactEmail] || DEFAULT_ADMIN_SETTINGS.contactEmail,
        geminiApiKey:
            settingsMap[adminSettingKeys.geminiApiKey] || DEFAULT_ADMIN_SETTINGS.geminiApiKey,
        globalPlaylist:
            settingsMap[adminSettingKeys.globalPlaylist] || DEFAULT_ADMIN_SETTINGS.globalPlaylist,
        maintenanceMode: settingsMap[adminSettingKeys.maintenanceMode] === 'true',
        maintenanceTitle:
            settingsMap[adminSettingKeys.maintenanceTitle] ||
            DEFAULT_ADMIN_SETTINGS.maintenanceTitle,
        maintenanceMessage:
            settingsMap[adminSettingKeys.maintenanceMessage] ||
            DEFAULT_ADMIN_SETTINGS.maintenanceMessage,
        maintenanceEta:
            settingsMap[adminSettingKeys.maintenanceEta] || DEFAULT_ADMIN_SETTINGS.maintenanceEta,
        maintenanceNoticeUrl:
            settingsMap[adminSettingKeys.maintenanceNoticeUrl] ||
            DEFAULT_ADMIN_SETTINGS.maintenanceNoticeUrl,
        aiPromptResearch:
            settingsMap[adminSettingKeys.aiPromptResearch] ||
            DEFAULT_ADMIN_SETTINGS.aiPromptResearch,
        aiPromptWrite:
            settingsMap[adminSettingKeys.aiPromptWrite] || DEFAULT_ADMIN_SETTINGS.aiPromptWrite,
        aiPromptSeo:
            settingsMap[adminSettingKeys.aiPromptSeo] || DEFAULT_ADMIN_SETTINGS.aiPromptSeo,
        aiPromptConcept:
            settingsMap[adminSettingKeys.aiPromptConcept] || DEFAULT_ADMIN_SETTINGS.aiPromptConcept,
    };

    const nextSecurity: AdminSecurityState = {
        ...DEFAULT_ADMIN_SECURITY,
        adminEmail:
            settingsMap[adminSettingKeys.adminEmail] || DEFAULT_ADMIN_CREDENTIAL.email,
    };

    return { nextSettings, nextSecurity };
}

export function AdminSettingsClient({
    initialSettingsRecords,
    initialLoadFailed = false,
}: AdminSettingsClientProps) {
    const { language, setLanguage } = useAdminLanguage();
    const copy = adminSettingsCopy[language];
    const initialState = applySettingsRecords(initialSettingsRecords);
    const [settings, setSettings] = useState<AdminSettingsState>(initialState.nextSettings);
    const [security, setSecurity] = useState<AdminSecurityState>(initialState.nextSecurity);
    const [activeTab, setActiveTab] = useState<AdminSettingsTabId>('general');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savingAccess, setSavingAccess] = useState(false);

    useEffect(() => {
        const { nextSettings, nextSecurity } = applySettingsRecords(initialSettingsRecords);
        setSettings(nextSettings);
        setSecurity((prev) => ({
            ...prev,
            adminEmail: nextSecurity.adminEmail,
        }));
    }, [initialSettingsRecords]);

    useEffect(() => {
        try {
            const localSettings = localStorage.getItem('voxoAdminSettings');
            if (!localSettings) {
                return;
            }

            const parsed = JSON.parse(localSettings) as Partial<AdminSettingsState> & {
                language?: 'ko' | 'en';
            };

            setSettings((prev) => ({ ...prev, ...parsed }));
            if (parsed.language && parsed.language !== language) {
                setLanguage(parsed.language);
            }
        } catch (error) {
            console.error('Failed to read local admin settings cache', error);
        }
    }, [language, setLanguage]);

    useEffect(() => {
        if (!initialLoadFailed) {
            return;
        }

        const loadSettings = async () => {
            setLoading(true);
            try {
                const values = await getAllSettings();
                const { nextSettings, nextSecurity } = applySettingsRecords(values);
                setSettings(nextSettings);
                setSecurity((prev) => ({
                    ...prev,
                    adminEmail: nextSecurity.adminEmail,
                }));
            } catch (error) {
                console.error('Failed to load settings', error);
                toast.error(copy.failed);
            } finally {
                setLoading(false);
            }
        };

        void loadSettings();
    }, [copy.failed, initialLoadFailed]);

    const updateField = <K extends keyof AdminSettingsState>(
        key: K,
        value: AdminSettingsState[K]
    ) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const updateSecurity = <K extends keyof AdminSecurityState>(
        key: K,
        value: AdminSecurityState[K]
    ) => {
        setSecurity((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            localStorage.setItem('voxoAdminSettings', JSON.stringify({ ...settings, language }));
            const results = await Promise.all([
                updateSetting(adminSettingKeys.siteName, settings.siteName),
                updateSetting(adminSettingKeys.siteDescription, settings.siteDescription),
                updateSetting(adminSettingKeys.contactEmail, settings.contactEmail),
                updateSetting(adminSettingKeys.geminiApiKey, settings.geminiApiKey),
                updateSetting(adminSettingKeys.globalPlaylist, settings.globalPlaylist),
                updateSetting(adminSettingKeys.maintenanceMode, String(settings.maintenanceMode)),
                updateSetting(adminSettingKeys.maintenanceTitle, settings.maintenanceTitle),
                updateSetting(adminSettingKeys.maintenanceMessage, settings.maintenanceMessage),
                updateSetting(adminSettingKeys.maintenanceEta, settings.maintenanceEta),
                updateSetting(adminSettingKeys.maintenanceNoticeUrl, settings.maintenanceNoticeUrl),
                updateSetting(adminSettingKeys.aiPromptResearch, settings.aiPromptResearch),
                updateSetting(adminSettingKeys.aiPromptWrite, settings.aiPromptWrite),
                updateSetting(adminSettingKeys.aiPromptSeo, settings.aiPromptSeo),
                updateSetting(adminSettingKeys.aiPromptConcept, settings.aiPromptConcept),
            ]);

            const hasFailure = results.some((result) => !result.success);
            toast[hasFailure ? 'error' : 'success'](hasFailure ? copy.failed : copy.saved);
        } catch (error) {
            console.error('Failed to save settings', error);
            toast.error(copy.failed);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAdminAccess = async () => {
        if (security.newPassword !== security.confirmPassword) {
            toast.error(copy.security.mismatch);
            return;
        }

        setSavingAccess(true);
        try {
            const result = await updateAdminCredentials(security.adminEmail, security.newPassword);
            if (!result.success) {
                toast.error(result.error || copy.failed);
                return;
            }

            toast.success(copy.security.savedAccess);
            setSecurity((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }));
        } catch (error) {
            console.error('Failed to save admin access', error);
            toast.error(copy.failed);
        } finally {
            setSavingAccess(false);
        }
    };

    return (
        <>
            <Toaster position="top-center" />

            <main className="flex-1 overflow-y-auto">
                <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-white/5 bg-black/80 px-12 backdrop-blur-xl">
                    <h1 className="font-display text-[10px] uppercase tracking-[0.4em] text-gray-400">
                        {copy.title}
                    </h1>
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="flex items-center gap-2 bg-white px-8 py-2.5 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-accent-green disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {saving ? copy.saving : copy.save}
                    </button>
                </header>

                <div className="mx-auto max-w-6xl p-12">
                    <p className="mb-12 max-w-3xl text-sm leading-relaxed text-gray-500">
                        {copy.subtitle}
                    </p>

                    {loading ? (
                        <div className="flex h-64 flex-col items-center justify-center gap-4 border border-white/5 bg-white/[0.01]">
                            <Loader2 className="animate-spin text-accent-green" size={28} />
                            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-600">
                                {copy.loading}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-16 md:grid-cols-[220px_1fr]">
                            <aside className="space-y-2">
                                {adminSettingsTabs.map((tab) => (
                                    <AdminSettingsTabButton
                                        key={tab.id}
                                        id={tab.id}
                                        label={copy.tabs[tab.id]}
                                        icon={tab.icon}
                                        active={activeTab === tab.id}
                                        onClick={setActiveTab}
                                    />
                                ))}
                            </aside>

                            <div className="space-y-12">
                                {activeTab === 'general' ? (
                                    <GeneralSettingsSection
                                        copy={copy.general}
                                        language={language}
                                        settings={settings}
                                        onFieldChange={updateField}
                                        onLanguageChange={setLanguage}
                                    />
                                ) : null}

                                {activeTab === 'ai' ? (
                                    <AISettingsSection
                                        copy={copy.ai}
                                        settings={settings}
                                        onFieldChange={updateField}
                                    />
                                ) : null}

                                {activeTab === 'integrations' ? (
                                    <IntegrationsSettingsSection
                                        copy={copy.integrations}
                                        settings={settings}
                                        onFieldChange={updateField}
                                    />
                                ) : null}

                                {activeTab === 'security' ? (
                                    <SecuritySettingsSection
                                        copy={copy.security}
                                        settings={settings}
                                        security={security}
                                        defaultAdminEmail={DEFAULT_ADMIN_CREDENTIAL.email}
                                        defaultAdminPassword={DEFAULT_ADMIN_CREDENTIAL.password}
                                        savingAccess={savingAccess}
                                        onFieldChange={updateField}
                                        onSecurityChange={updateSecurity}
                                        onSaveAccess={handleSaveAdminAccess}
                                    />
                                ) : null}

                                {activeTab === 'notifications' ? (
                                    <NotificationsSettingsSection copy={copy.notifications} />
                                ) : null}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
