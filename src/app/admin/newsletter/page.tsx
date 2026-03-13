import React from 'react';
import { getNewsletterHistory } from '@/app/actions/newsletterActions';
import { getAllSettings } from '@/app/actions/settingsActions';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { AdminNewsletterClient } from '@/features/admin-newsletter/components/AdminNewsletterClient';
import type { NewsletterSiteSettingRecord } from '@/features/admin-newsletter/types';

function getDefaultTestEmail(settings: NewsletterSiteSettingRecord[]) {
    const settingsMap = Object.fromEntries(
        settings.map((item) => [item.setting_key, item.setting_value ?? ''])
    );

    return settingsMap.admin_login_email || settingsMap.contact_email || '';
}

export const dynamic = 'force-dynamic';

export default async function NewsletterPage() {
    const results = await Promise.allSettled([getNewsletterHistory(), getAllSettings()]);

    for (const result of results) {
        if (result.status === 'rejected') {
            console.error('Failed to load newsletter page data', result.reason);
        }
    }

    const initialSettings =
        results[1].status === 'fulfilled'
            ? (results[1].value as NewsletterSiteSettingRecord[])
            : [];

    return (
        <div className="flex min-h-screen bg-black text-white selection:bg-accent-green/30">
            <AdminSidebar />
            <AdminNewsletterClient
                initialHistory={results[0].status === 'fulfilled' ? results[0].value : []}
                initialTestEmail={getDefaultTestEmail(initialSettings)}
                initialLoadFailed={results.some((result) => result.status === 'rejected')}
            />
            <div
                className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
                style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
            />
        </div>
    );
}
