import React from 'react';
import { getNewsletterHistory, getSubscribers } from '@/app/actions/newsletterActions';
import { getAdminPostSummaries } from '@/app/actions/postActions';
import { getAllSettings, getSettingsAuditLog } from '@/app/actions/settingsActions';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { AdminDashboardClient } from '@/features/admin-dashboard/components/AdminDashboardClient';
import type {
    DashboardDataBundle,
    DashboardSiteSettingRecord,
    DashboardSubscriberRecord,
} from '@/features/admin-dashboard/types';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    const results = await Promise.allSettled([
        getAdminPostSummaries(),
        getSubscribers(),
        getAllSettings(),
        getSettingsAuditLog(),
        getNewsletterHistory(),
    ]);

    for (const result of results) {
        if (result.status === 'rejected') {
            console.error('Failed to load admin dashboard data', result.reason);
        }
    }

    const initialData: DashboardDataBundle = {
        posts: results[0].status === 'fulfilled' ? results[0].value : [],
        subscribers:
            results[1].status === 'fulfilled'
                ? (results[1].value as DashboardSubscriberRecord[])
                : [],
        settings:
            results[2].status === 'fulfilled'
                ? (results[2].value as DashboardSiteSettingRecord[])
                : [],
        auditLog: results[3].status === 'fulfilled' ? results[3].value : [],
        newsletterHistory: results[4].status === 'fulfilled' ? results[4].value : [],
    };

    return (
        <div className="flex min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <AdminSidebar />
            <AdminDashboardClient
                initialData={initialData}
                initialLoadFailed={results.some((result) => result.status === 'rejected')}
            />
            <div
                className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
                style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
            />
        </div>
    );
}
