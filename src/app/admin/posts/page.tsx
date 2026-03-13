import React from 'react';
import { getCategories } from '@/app/actions/categoryActions';
import { getAdminPostSummaries } from '@/app/actions/postActions';
import { getTags } from '@/app/actions/tagActions';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { AdminPostsClient } from '@/features/admin-posts/components/AdminPostsClient';
import type { CategoryRecord, TagRecord } from '@/types/content';

type StatusFilter = 'all' | 'published' | 'draft';
type SearchParamsInput =
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>
    | undefined;

function getSingleParam(
    value: string | string[] | undefined
) {
    return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function parseStatusFilter(value: string): StatusFilter {
    return value === 'published' || value === 'draft' ? value : 'all';
}

export const dynamic = 'force-dynamic';

export default async function AdminPostsPage({
    searchParams,
}: {
    searchParams?: SearchParamsInput;
}) {
    const resolvedSearchParams =
        searchParams && searchParams instanceof Promise ? await searchParams : searchParams ?? {};

    const results = await Promise.allSettled([
        getAdminPostSummaries(),
        getCategories(),
        getTags(),
    ]);

    for (const result of results) {
        if (result.status === 'rejected') {
            console.error('Failed to load admin posts data', result.reason);
        }
    }

    return (
        <div className="flex min-h-screen bg-black font-body text-white selection:bg-white selection:text-black">
            <AdminSidebar />
            <AdminPostsClient
                initialPosts={results[0].status === 'fulfilled' ? results[0].value : []}
                initialCategories={
                    results[1].status === 'fulfilled'
                        ? (results[1].value as CategoryRecord[])
                        : []
                }
                initialTags={
                    results[2].status === 'fulfilled'
                        ? (results[2].value as TagRecord[])
                        : []
                }
                initialFilters={{
                    searchQuery: getSingleParam(resolvedSearchParams.q),
                    filter: parseStatusFilter(getSingleParam(resolvedSearchParams.status)),
                    categoryFilter: getSingleParam(resolvedSearchParams.category),
                    tagFilter: getSingleParam(resolvedSearchParams.tag),
                }}
                initialLoadFailed={results.some((result) => result.status === 'rejected')}
            />
            <div
                className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
                style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
            />
        </div>
    );
}
