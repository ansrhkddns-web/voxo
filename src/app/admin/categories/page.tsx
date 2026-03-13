import React from 'react';
import { getCategoryManagementData } from '@/app/actions/categoryActions';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { AdminCategoriesClient } from '@/features/admin-categories/components/AdminCategoriesClient';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
    let initialCategories: Awaited<ReturnType<typeof getCategoryManagementData>> = [];
    let initialLoadFailed = false;

    try {
        initialCategories = await getCategoryManagementData();
    } catch (error) {
        initialLoadFailed = true;
        console.error('Failed to load category management data', error);
    }

    return (
        <div className="flex min-h-screen bg-black text-white selection:bg-accent-green/30">
            <AdminSidebar />
            <AdminCategoriesClient
                initialCategories={initialCategories}
                initialLoadFailed={initialLoadFailed}
            />
            <div
                className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
                style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
            />
        </div>
    );
}
