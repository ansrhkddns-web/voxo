import React from 'react';
import { getTagManagementData } from '@/app/actions/tagActions';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { AdminTagsClient } from '@/features/admin-tags/components/AdminTagsClient';

export const dynamic = 'force-dynamic';

export default async function TagsPage() {
    let initialTags: Awaited<ReturnType<typeof getTagManagementData>> = [];
    let initialLoadFailed = false;

    try {
        initialTags = await getTagManagementData();
    } catch (error) {
        initialLoadFailed = true;
        console.error('Failed to load tag management data', error);
    }

    return (
        <div className="flex min-h-screen bg-black text-white selection:bg-accent-green/30">
            <AdminSidebar />
            <AdminTagsClient initialTags={initialTags} initialLoadFailed={initialLoadFailed} />
            <div
                className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
                style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
            />
        </div>
    );
}
