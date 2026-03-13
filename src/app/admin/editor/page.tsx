import React from 'react';
import { getCategories } from '@/app/actions/categoryActions';
import {
    getPostById,
    getPostRevisionHistory,
} from '@/app/actions/postActions';
import { getTags } from '@/app/actions/tagActions';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminEditorClient from '@/features/admin-editor/components/AdminEditorClient';

type SearchParamsInput =
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>
    | undefined;

function getSingleParam(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export const dynamic = 'force-dynamic';

export default async function EditorPage({
    searchParams,
}: {
    searchParams?: SearchParamsInput;
}) {
    const resolvedSearchParams =
        searchParams && searchParams instanceof Promise ? await searchParams : searchParams ?? {};
    const postId = getSingleParam(resolvedSearchParams.id) || null;
    const draftId = getSingleParam(resolvedSearchParams.draft) || null;

    const results = await Promise.allSettled([
        getCategories(),
        getTags(),
        postId ? getPostById(postId) : Promise.resolve(null),
        postId ? getPostRevisionHistory(postId) : Promise.resolve([]),
    ]);

    for (const result of results) {
        if (result.status === 'rejected') {
            console.error('Failed to load editor page data', result.reason);
        }
    }

    return (
        <div className="flex min-h-screen bg-black text-white selection:bg-accent-green/30">
            <AdminSidebar />
            <AdminEditorClient
                postId={postId}
                draftId={draftId}
                initialData={{
                    categories: results[0].status === 'fulfilled' ? results[0].value : [],
                    availableTags: results[1].status === 'fulfilled' ? results[1].value : [],
                    post: results[2].status === 'fulfilled' ? results[2].value : null,
                    revisions: results[3].status === 'fulfilled' ? results[3].value : [],
                }}
                initialLoadFailed={results.some((result) => result.status === 'rejected')}
            />
            <div
                className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
                style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
            />
        </div>
    );
}
