import React from 'react';
import { getAiPromptManagerData } from '@/app/actions/aiPromptActions';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminAIDeskClient from '@/features/admin-ai-desk/components/AdminAIDeskClient';

export const dynamic = 'force-dynamic';

export default async function AIDeskPage() {
    let initialData = null;
    let initialLoadFailed = false;

    try {
        initialData = await getAiPromptManagerData();
    } catch (error) {
        initialLoadFailed = true;
        console.error('Failed to load AI desk data', error);
    }

    return (
        <div className="flex min-h-screen bg-[#050505] font-body text-white selection:bg-accent-green/30 selection:text-white">
            <AdminSidebar />
            <AdminAIDeskClient
                initialData={initialData}
                initialLoadFailed={initialLoadFailed}
            />
        </div>
    );
}
