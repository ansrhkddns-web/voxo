import React from 'react';
import { getAiPromptManagerData } from '@/app/actions/aiPromptActions';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminAIPromptManagerClient from '@/features/admin-ai-prompts/components/AdminAIPromptManagerClient';

export const dynamic = 'force-dynamic';

export default async function AIPromptManagerPage() {
    let initialData = null;
    let initialLoadFailed = false;

    try {
        initialData = await getAiPromptManagerData();
    } catch (error) {
        initialLoadFailed = true;
        console.error('Failed to load AI prompt manager data', error);
    }

    return (
        <div className="flex min-h-screen bg-black text-white selection:bg-accent-green/30">
            <AdminSidebar />
            <AdminAIPromptManagerClient
                initialData={initialData}
                initialLoadFailed={initialLoadFailed}
            />
        </div>
    );
}
