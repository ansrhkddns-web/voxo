import React from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { AdminSettingsField } from '../components/AdminSettingsField';
import { AdminSettingsSectionTitle } from '../components/AdminSettingsSectionTitle';
import type { AdminSecurityState, AdminSettingsCopy, AdminSettingsState } from '../types';

interface SecuritySettingsSectionProps {
    copy: AdminSettingsCopy['security'];
    settings: AdminSettingsState;
    security: AdminSecurityState;
    defaultAdminEmail: string;
    defaultAdminPassword: string;
    savingAccess: boolean;
    onFieldChange: <K extends keyof AdminSettingsState>(key: K, value: AdminSettingsState[K]) => void;
    onSecurityChange: <K extends keyof AdminSecurityState>(key: K, value: AdminSecurityState[K]) => void;
    onSaveAccess: () => void;
}

export function SecuritySettingsSection({
    copy,
    settings,
    security,
    defaultAdminEmail,
    defaultAdminPassword,
    savingAccess,
    onFieldChange,
    onSecurityChange,
    onSaveAccess,
}: SecuritySettingsSectionProps) {
    return (
        <section className="space-y-8">
            <div className="space-y-3">
                <AdminSettingsSectionTitle title={copy.section} />
                <p className="text-sm text-gray-500">{copy.description}</p>
            </div>

            <div className="rounded border border-white/5 bg-white/[0.02] p-6">
                <div className="mb-5 flex items-center gap-3">
                    <ShieldCheck size={16} className="text-accent-green" />
                    <p className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-400">{copy.fallbackTitle}</p>
                </div>
                <p className="text-sm leading-relaxed text-gray-400">{copy.fallbackText}</p>
                <div className="mt-5 space-y-2 text-sm">
                    <p><span className="text-gray-500">{copy.fallbackId}</span> <span className="font-mono">{defaultAdminEmail}</span></p>
                    <p><span className="text-gray-500">{copy.fallbackPassword}</span> <span className="font-mono">{defaultAdminPassword}</span></p>
                </div>
            </div>

            <div className="space-y-6 border border-white/5 bg-white/[0.01] p-6">
                <AdminSettingsField label={copy.adminEmail} value={security.adminEmail} onChange={(value) => onSecurityChange('adminEmail', value)} placeholder={copy.adminEmail} type="email" />
                <AdminSettingsField label={copy.newPassword} value={security.newPassword} onChange={(value) => onSecurityChange('newPassword', value)} placeholder={copy.newPassword} type="password" />
                <AdminSettingsField label={copy.confirmPassword} value={security.confirmPassword} onChange={(value) => onSecurityChange('confirmPassword', value)} placeholder={copy.confirmPassword} type="password" />
                <p className="text-sm text-gray-500">{copy.passwordHelp}</p>
                <button
                    onClick={onSaveAccess}
                    disabled={savingAccess}
                    className="flex items-center gap-2 bg-white px-6 py-3 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-accent-green disabled:opacity-50"
                >
                    {savingAccess ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                    {savingAccess ? copy.savingAccess : copy.saveAccess}
                </button>
            </div>

            <div className="space-y-6 border border-white/5 bg-white/[0.01] p-6">
                <button
                    onClick={() => onFieldChange('maintenanceMode', !settings.maintenanceMode)}
                    className="flex items-center gap-3 rounded border border-red-500/10 bg-red-500/[0.03] px-4 py-3 text-sm text-white"
                >
                    <span className={`inline-block h-3 w-3 rounded-full ${settings.maintenanceMode ? 'bg-accent-green' : 'bg-gray-600'}`}></span>
                    {copy.maintenance}
                </button>
                <p className="text-sm text-gray-500">{copy.maintenanceHelp}</p>
                <AdminSettingsField label={copy.maintenanceTitle} value={settings.maintenanceTitle} onChange={(value) => onFieldChange('maintenanceTitle', value)} placeholder={copy.maintenanceTitle} />
                <AdminSettingsField label={copy.maintenanceMessage} value={settings.maintenanceMessage} onChange={(value) => onFieldChange('maintenanceMessage', value)} placeholder={copy.maintenanceMessage} multiline rows={5} />
                <AdminSettingsField label={copy.maintenanceEta} value={settings.maintenanceEta} onChange={(value) => onFieldChange('maintenanceEta', value)} placeholder={copy.maintenanceEta} />
                <AdminSettingsField label={copy.maintenanceNoticeUrl} value={settings.maintenanceNoticeUrl} onChange={(value) => onFieldChange('maintenanceNoticeUrl', value)} placeholder={copy.maintenanceNoticeUrl} type="url" />
            </div>
        </section>
    );
}
