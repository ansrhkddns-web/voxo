'use client';

import React, { useEffect, useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { deletePost, getAdminPostSummaries } from '@/app/actions/postActions';
import { DashboardAuditLogSection } from '@/features/admin-dashboard/components/DashboardAuditLogSection';
import { DashboardFailureBanner } from '@/features/admin-dashboard/components/DashboardFailureBanner';
import { DashboardHeader } from '@/features/admin-dashboard/components/DashboardHeader';
import { DashboardNewsletterHistorySection } from '@/features/admin-dashboard/components/DashboardNewsletterHistorySection';
import { DashboardNewsletterSummarySection } from '@/features/admin-dashboard/components/DashboardNewsletterSummarySection';
import { DashboardOperationsSection } from '@/features/admin-dashboard/components/DashboardOperationsSection';
import { DashboardPostActivitySection } from '@/features/admin-dashboard/components/DashboardPostActivitySection';
import { DashboardPostsTable } from '@/features/admin-dashboard/components/DashboardPostsTable';
import { DashboardSettingsValuesSection } from '@/features/admin-dashboard/components/DashboardSettingsValuesSection';
import { DashboardStatsGrid } from '@/features/admin-dashboard/components/DashboardStatsGrid';
import type { DashboardDataBundle } from '@/features/admin-dashboard/types';
import {
    formatDashboardNumber,
    getDashboardLocale,
} from '@/features/admin-dashboard/utils';
import { useAdminLanguage } from '@/providers/AdminLanguageProvider';

interface AdminDashboardClientProps {
    initialData: DashboardDataBundle;
    initialLoadFailed?: boolean;
}

export function AdminDashboardClient({
    initialData,
    initialLoadFailed = false,
}: AdminDashboardClientProps) {
    const { t, language } = useAdminLanguage();
    const locale = getDashboardLocale(language);
    const [posts, setPosts] = useState(initialData.posts);
    const [subscribers, setSubscribers] = useState(initialData.subscribers);
    const [settings, setSettings] = useState(initialData.settings);
    const [auditLog, setAuditLog] = useState(initialData.auditLog);
    const [newsletterHistory, setNewsletterHistory] = useState(initialData.newsletterHistory);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setPosts(initialData.posts);
        setSubscribers(initialData.subscribers);
        setSettings(initialData.settings);
        setAuditLog(initialData.auditLog);
        setNewsletterHistory(initialData.newsletterHistory);
    }, [initialData]);

    useEffect(() => {
        if (!initialLoadFailed) {
            return;
        }

        toast.error(
            language === 'ko'
                ? '대시보드 데이터를 일부 불러오지 못했습니다.'
                : 'Some dashboard data could not be loaded.'
        );
    }, [initialLoadFailed, language]);

    const handleDelete = async (id: string) => {
        const confirmed = confirm(language === 'ko' ? '이 게시글을 삭제할까요?' : 'Delete this post?');
        if (!confirmed) {
            return;
        }

        try {
            await deletePost(id);
            setPosts(await getAdminPostSummaries());
            toast.success(language === 'ko' ? '게시글을 삭제했습니다.' : 'Post deleted.');
        } catch {
            toast.error(language === 'ko' ? '게시글 삭제에 실패했습니다.' : 'Failed to delete post.');
        }
    };

    const filteredPosts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) {
            return posts;
        }

        return posts.filter((post) =>
            [post.title, post.slug, post.artist_name, post.categories?.name]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(query)
        );
    }, [posts, searchQuery]);

    const settingsMap = Object.fromEntries(
        settings.map((item) => [item.setting_key, item.setting_value ?? ''])
    );
    const activeSubscribers = subscribers.filter((item) => item.status === 'active').length;
    const publishedCount = posts.filter((item) => item.is_published).length;
    const totalViews = posts.reduce((sum, item) => sum + (item.view_count || 0), 0);
    const latestFailure = newsletterHistory.find((item) => item.status === 'failed');
    const latestNewsletter = newsletterHistory[0];
    const filteredCountLabel =
        language === 'ko'
            ? `표시 중 ${formatDashboardNumber(filteredPosts.length, locale)}건`
            : `Showing ${formatDashboardNumber(filteredPosts.length, locale)}`;

    return (
        <>
            <Toaster position="top-center" />

            <main className="flex-1 overflow-y-auto p-12">
                <DashboardHeader
                    statusText={t('status', 'dashboard')}
                    title={t('title', 'dashboard')}
                    searchPlaceholder={t('search', 'dashboard')}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                <DashboardFailureBanner
                    latestFailure={latestFailure}
                    locale={locale}
                    language={language}
                />

                <DashboardStatsGrid
                    totalPosts={posts.length}
                    publishedPosts={publishedCount}
                    activeSubscribers={activeSubscribers}
                    totalViews={totalViews}
                    locale={locale}
                    labels={{
                        totalPosts: t('statArchives', 'dashboard'),
                        publishedPosts: t('statPublished', 'dashboard'),
                        activeSubscribers: language === 'ko' ? '활성 구독자' : 'Active Subscribers',
                        totalViews: t('statViews', 'dashboard'),
                    }}
                />

                <div className="mb-16 grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <DashboardOperationsSection settingsMap={settingsMap} language={language} />
                    <DashboardNewsletterSummarySection
                        newsletterHistory={newsletterHistory}
                        latestNewsletter={latestNewsletter}
                        locale={locale}
                        language={language}
                    />
                </div>

                <div className="mb-16 grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <DashboardAuditLogSection
                        auditLog={auditLog}
                        locale={locale}
                        language={language}
                    />
                    <DashboardSettingsValuesSection
                        settings={settings}
                        locale={locale}
                        language={language}
                    />
                </div>

                <div className="mb-16 grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <DashboardNewsletterHistorySection
                        newsletterHistory={newsletterHistory}
                        locale={locale}
                        language={language}
                    />
                    <DashboardPostActivitySection
                        posts={posts}
                        loading={false}
                        locale={locale}
                        language={language}
                    />
                </div>

                <DashboardPostsTable
                    posts={filteredPosts}
                    loading={false}
                    locale={locale}
                    language={language}
                    searchQuery={searchQuery}
                    totalLabel={t('dirTitle', 'dashboard')}
                    showingLabel={filteredCountLabel}
                    syncingLabel={t('syncing', 'dashboard')}
                    emptySearchLabel={t('emptySearch', 'dashboard')}
                    emptyStateLabel={t('emptyState', 'dashboard')}
                    genericLabel={t('generic', 'dashboard')}
                    statusPublishedLabel={t('statusVerified', 'dashboard')}
                    statusDraftLabel={t('statusPending', 'dashboard')}
                    columns={{
                        title: t('colTitle', 'dashboard'),
                        category: t('colClass', 'dashboard'),
                        views: t('colViews', 'dashboard'),
                        status: t('colStatus', 'dashboard'),
                        operations: t('colOps', 'dashboard'),
                    }}
                    onDelete={handleDelete}
                />
            </main>
        </>
    );
}
