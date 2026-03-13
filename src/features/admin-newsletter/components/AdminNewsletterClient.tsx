'use client';

import React, { useEffect, useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
    broadcastNewsletter,
    getNewsletterHistory,
    sendTestNewsletter,
    type NewsletterHistoryEntry,
} from '@/app/actions/newsletterActions';
import { getAllSettings } from '@/app/actions/settingsActions';
import { NewsletterComposerForm } from '@/features/admin-newsletter/components/NewsletterComposerForm';
import { NewsletterHeader } from '@/features/admin-newsletter/components/NewsletterHeader';
import { NewsletterHistorySection } from '@/features/admin-newsletter/components/NewsletterHistorySection';
import { NewsletterPreviewCard } from '@/features/admin-newsletter/components/NewsletterPreviewCard';
import { NewsletterSafetyNotice } from '@/features/admin-newsletter/components/NewsletterSafetyNotice';
import { NewsletterTestSettingsCard } from '@/features/admin-newsletter/components/NewsletterTestSettingsCard';
import type {
    NewsletterSiteSettingRecord,
    NewsletterTemplateOption,
} from '@/features/admin-newsletter/types';
import {
    getNewsletterTemplateOptions,
    previewParagraphs,
} from '@/features/admin-newsletter/utils';
import { useAdminLanguage } from '@/providers/AdminLanguageProvider';

interface AdminNewsletterClientProps {
    initialHistory: NewsletterHistoryEntry[];
    initialTestEmail: string;
    initialLoadFailed?: boolean;
}

function getDefaultTestEmail(settings: NewsletterSiteSettingRecord[]) {
    const settingsMap = Object.fromEntries(
        settings.map((item) => [item.setting_key, item.setting_value ?? ''])
    );

    return settingsMap.admin_login_email || settingsMap.contact_email || '';
}

export function AdminNewsletterClient({
    initialHistory,
    initialTestEmail,
    initialLoadFailed = false,
}: AdminNewsletterClientProps) {
    const { t, language } = useAdminLanguage();
    const locale = language === 'ko' ? 'ko-KR' : 'en-US';
    const templateOptions = useMemo(
        () => getNewsletterTemplateOptions(language),
        [language]
    );
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [testEmail, setTestEmail] = useState(initialTestEmail);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [history, setHistory] = useState<NewsletterHistoryEntry[]>(initialHistory);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        setHistory(initialHistory);
    }, [initialHistory]);

    useEffect(() => {
        setTestEmail(initialTestEmail);
    }, [initialTestEmail]);

    useEffect(() => {
        if (!initialLoadFailed) {
            return;
        }

        const loadPageData = async () => {
            setHistoryLoading(true);
            try {
                const [items, settings] = await Promise.all([
                    getNewsletterHistory(),
                    getAllSettings(),
                ]);

                setHistory(items);
                setTestEmail(getDefaultTestEmail(settings as NewsletterSiteSettingRecord[]));
            } catch {
                toast.error(
                    language === 'ko'
                        ? '뉴스레터 화면 데이터를 불러오지 못했습니다.'
                        : 'Failed to load newsletter data'
                );
            } finally {
                setHistoryLoading(false);
            }
        };

        void loadPageData();
    }, [initialLoadFailed, language]);

    const refreshHistory = async () => {
        setHistory(await getNewsletterHistory());
    };

    const validateNewsletter = () => {
        if (!subject.trim() || !content.trim()) {
            toast.error(t('errMissing', 'newsletter'));
            return false;
        }

        return true;
    };

    const applyTemplate = (template: NewsletterTemplateOption) => {
        setSubject(template.subject);
        setContent(template.content);
        toast.success(
            language === 'ko'
                ? `${template.label} 템플릿을 적용했습니다.`
                : `${template.label} template applied.`
        );
    };

    const handleTestSend = async () => {
        if (!validateNewsletter()) return;

        setIsTesting(true);

        try {
            const result = await sendTestNewsletter(subject, content, testEmail);
            await refreshHistory();

            if (!result.success) {
                toast.error(
                    result.message ||
                        (language === 'ko' ? '테스트 발송에 실패했습니다.' : 'Test send failed')
                );
                return;
            }

            toast.success(
                result.message ||
                    (language === 'ko'
                        ? '테스트 발송이 완료되었습니다.'
                        : 'Test send completed')
            );
        } catch {
            toast.error(
                language === 'ko'
                    ? '테스트 발송 중 오류가 발생했습니다.'
                    : 'Test send failed'
            );
        } finally {
            setIsTesting(false);
        }
    };

    const handleBroadcast = async () => {
        if (!validateNewsletter()) return;

        setIsBroadcasting(true);

        try {
            const result = await broadcastNewsletter(subject, content);
            await refreshHistory();

            if (!result.success) {
                toast.error(result.message || t('errInterrupt', 'newsletter'));
                return;
            }

            toast.success(result.message || t('successInitiated', 'newsletter'));
            setSubject('');
            setContent('');
        } catch {
            toast.error(t('errInterrupt', 'newsletter'));
        } finally {
            setIsBroadcasting(false);
        }
    };

    const paragraphs = previewParagraphs(content);

    return (
        <>
            <Toaster position="top-center" />

            <main className="flex h-screen flex-1 flex-col overflow-hidden">
                <NewsletterHeader
                    eyebrow={t('infra', 'newsletter')}
                    title={t('title', 'newsletter')}
                    language={language}
                    isTesting={isTesting}
                    isBroadcasting={isBroadcasting}
                    transmittingLabel={t('transmitting', 'newsletter')}
                    broadcastLabel={t('execBroadcast', 'newsletter')}
                    onTestSend={handleTestSend}
                    onBroadcast={handleBroadcast}
                />

                <div className="custom-scrollbar flex-1 overflow-y-auto p-12">
                    <div className="mx-auto max-w-5xl space-y-12">
                        <NewsletterComposerForm
                            title={t('composeBtn', 'newsletter')}
                            subjectLabel={t('subjectLine', 'newsletter')}
                            subjectPlaceholder={t('subjectPlaceholder', 'newsletter')}
                            contentLabel={t('content', 'newsletter')}
                            contentPlaceholder={t('contentPlaceholder', 'newsletter')}
                            subject={subject}
                            content={content}
                            language={language}
                            templates={templateOptions}
                            onSubjectChange={setSubject}
                            onContentChange={setContent}
                            onApplyTemplate={applyTemplate}
                        />

                        <NewsletterTestSettingsCard
                            testEmail={testEmail}
                            language={language}
                            onTestEmailChange={setTestEmail}
                        />

                        <NewsletterPreviewCard
                            subject={subject}
                            content={content}
                            paragraphs={paragraphs}
                            language={language}
                        />

                        <NewsletterHistorySection
                            history={history}
                            historyLoading={historyLoading}
                            locale={locale}
                            language={language}
                        />

                        <NewsletterSafetyNotice
                            title={t('safetyTitle', 'newsletter')}
                            body={t('safetyText', 'newsletter')}
                        />
                    </div>
                </div>
            </main>
        </>
    );
}
