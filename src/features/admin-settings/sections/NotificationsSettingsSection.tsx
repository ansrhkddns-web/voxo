import React from 'react';
import { AdminSettingsSectionTitle } from '../components/AdminSettingsSectionTitle';
import type { AdminSettingsCopy } from '../types';

interface NotificationsSettingsSectionProps {
    copy: AdminSettingsCopy['notifications'];
}

export function NotificationsSettingsSection({ copy }: NotificationsSettingsSectionProps) {
    return (
        <section className="space-y-6">
            <AdminSettingsSectionTitle title={copy.section} />
            <div className="rounded border border-white/5 bg-white/[0.01] p-4 text-sm text-gray-500">
                {copy.placeholder}
            </div>
        </section>
    );
}
