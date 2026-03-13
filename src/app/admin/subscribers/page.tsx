import React from 'react';
import { getSubscribers } from '@/app/actions/newsletterActions';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { AdminSubscribersClient } from '@/features/admin-subscribers/components/AdminSubscribersClient';

export const dynamic = 'force-dynamic';

export default async function SubscribersPage() {
    let initialSubscribers: Awaited<ReturnType<typeof getSubscribers>> = [];
    let initialLoadFailed = false;

    try {
        initialSubscribers = await getSubscribers();
    } catch (error) {
        initialLoadFailed = true;
        console.error('Failed to load subscribers', error);
    }

    return (
        <div className="flex min-h-screen bg-black text-white selection:bg-accent-green/30">
            <AdminSidebar />
            <AdminSubscribersClient
                initialSubscribers={initialSubscribers}
                initialLoadFailed={initialLoadFailed}
            />
            <div
                className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
                style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
            />
        </div>
    );
}
