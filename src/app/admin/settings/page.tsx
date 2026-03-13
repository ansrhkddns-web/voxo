import React from 'react';
import { getAllSettings } from '@/app/actions/settingsActions';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { AdminSettingsClient } from '@/features/admin-settings/components/AdminSettingsClient';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
    let initialSettingsRecords: Awaited<ReturnType<typeof getAllSettings>> = [];
    let initialLoadFailed = false;

    try {
        initialSettingsRecords = await getAllSettings();
    } catch (error) {
        initialLoadFailed = true;
        console.error('Failed to load admin settings data', error);
    }

    return (
        <div className="flex min-h-screen bg-black text-white selection:bg-accent-green/30">
            <AdminSidebar />
            <AdminSettingsClient
                initialSettingsRecords={initialSettingsRecords}
                initialLoadFailed={initialLoadFailed}
            />
        </div>
    );
}
