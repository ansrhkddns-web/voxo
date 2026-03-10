'use client';

import React, { useEffect, useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
    CheckCircle,
    Eye,
    FileText,
    Layout,
    Loader2,
    Mail,
    Send,
    Sparkles,
    Type,
    XCircle,
} from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getAllSettings } from '@/app/actions/settingsActions';
import { broadcastNewsletter, getNewsletterHistory, sendTestNewsletter, type NewsletterHistoryEntry } from '@/app/actions/newsletterActions';
import { useAdminLanguage } from '@/providers/AdminLanguageProvider';

interface SiteSettingRecord {
    setting_key: string;
    setting_value: string | null;
}

interface TemplateOption {
    id: string;
    label: string;
    subject: string;
    content: string;
}

function formatDate(value: string, locale: string) {
    return new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(new Date(value));
}

function previewParagraphs(content: string) {
    return content
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 5);
}

function getHistoryTypeLabel(item: NewsletterHistoryEntry, language: 'en' | 'ko') {
    if (item.deliveryType === 'test') {
        return language === 'ko' ? '테스트' : 'Test';
    }

    return language === 'ko' ? '전체 발송' : 'Broadcast';
}

function getTemplateOptions(language: 'en' | 'ko'): TemplateOption[] {
    if (language === 'ko') {
        return [
            {
                id: 'weekly-roundup',
                label: '주간 큐레이션',
                subject: '이번 주 VOXO 큐레이션 업데이트',
                content: '이번 주 새롭게 발행된 리뷰와 큐레이션을 모아 전해드립니다.\n\n이번 주의 핵심 아티스트와 함께 꼭 읽어볼 글 3편을 골랐습니다.\n\n사이트에 방문해 최신 콘텐츠와 플레이리스트도 함께 확인해 주세요.',
            },
            {
                id: 'breaking',
                label: '긴급 업데이트',
                subject: '새 콘텐츠가 방금 공개되었습니다',
                content: '방금 새로운 콘텐츠가 공개되었습니다.\n\n이번 글은 지금 가장 주목받는 아티스트와 트랙을 중심으로 빠르게 정리했습니다.\n\n지금 바로 확인하고 의견을 남겨 주세요.',
            },
            {
                id: 'event',
                label: '이벤트 안내',
                subject: 'VOXO 특별 이벤트 안내',
                content: '이번 주 VOXO에서 특별 이벤트를 진행합니다.\n\n참여 방법과 혜택을 아래 내용에서 확인해 주세요.\n\n많은 참여 부탁드립니다.',
            },
        ];
    }

    return [
        {
            id: 'weekly-roundup',
            label: 'Weekly Roundup',
            subject: 'This week on VOXO',
            content: 'Here is your weekly roundup from VOXO.\n\nWe selected the most important reviews and curated picks published this week.\n\nVisit the site to catch the latest stories and playlist updates.',
        },
        {
            id: 'breaking',
            label: 'Breaking Update',
            subject: 'A new story just went live',
            content: 'A new story has just been published on VOXO.\n\nThis issue highlights the artist, track, and context you should not miss right now.\n\nOpen the site and read the full piece.',
        },
        {
            id: 'event',
            label: 'Event Notice',
            subject: 'A special VOXO event is now open',
            content: 'We have launched a special event for our readers.\n\nCheck the details below to see how to participate and what you can receive.\n\nWe would love to have you join.',
        },
    ];
}

export default function NewsletterPage() {
    const { t, language } = useAdminLanguage();
    const locale = language === 'ko' ? 'ko-KR' : 'en-US';
    const templateOptions = useMemo(() => getTemplateOptions(language), [language]);
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [testEmail, setTestEmail] = useState('');
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [history, setHistory] = useState<NewsletterHistoryEntry[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    useEffect(() => {
        const loadPageData = async () => {
            try {
                const [items, settings] = await Promise.all([
                    getNewsletterHistory(),
                    getAllSettings(),
                ]);

                setHistory(items);

                const settingsMap = Object.fromEntries(
                    (settings as SiteSettingRecord[]).map((item) => [item.setting_key, item.setting_value ?? ''])
                );

                setTestEmail(settingsMap.admin_login_email || settingsMap.contact_email || '');
            } catch {
                toast.error(language === 'ko' ? '뉴스레터 화면 데이터를 불러오지 못했습니다.' : 'Failed to load newsletter data');
            } finally {
                setHistoryLoading(false);
            }
        };

        void loadPageData();
    }, [language]);

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

    const applyTemplate = (template: TemplateOption) => {
        setSubject(template.subject);
        setContent(template.content);
        toast.success(language === 'ko' ? `${template.label} 템플릿을 적용했습니다.` : `${template.label} template applied.`);
    };

    const handleTestSend = async () => {
        if (!validateNewsletter()) return;

        setIsTesting(true);
        try {
            const result = await sendTestNewsletter(subject, content, testEmail);
            await refreshHistory();

            if (!result.success) {
                toast.error(result.message || (language === 'ko' ? '테스트 발송에 실패했습니다.' : 'Test send failed'));
                return;
            }

            toast.success(result.message || (language === 'ko' ? '테스트 발송이 완료되었습니다.' : 'Test send completed'));
        } catch {
            toast.error(language === 'ko' ? '테스트 발송 중 오류가 발생했습니다.' : 'Test send failed');
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
        <div className="flex min-h-screen bg-black text-white selection:bg-accent-green/30">
            <Toaster position="top-center" />
            <AdminSidebar />

            <main className="flex h-screen flex-1 flex-col overflow-hidden">
                <header className="sticky top-0 z-50 flex h-24 items-center justify-between border-b border-white/5 bg-black/80 px-10 backdrop-blur-xl">
                    <div className="space-y-1">
                        <h1 className="font-display text-[10px] uppercase tracking-[0.4em] text-gray-500">{t('infra', 'newsletter')}</h1>
                        <p className="font-display text-xl font-light uppercase tracking-tighter">{t('title', 'newsletter')}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleTestSend}
                            disabled={isTesting || isBroadcasting}
                            className="flex h-10 items-center gap-3 border border-white/10 px-6 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:border-accent-green hover:text-accent-green disabled:opacity-50"
                        >
                            {isTesting ? <Loader2 className="animate-spin" size={14} /> : <Mail size={14} />}
                            <span>{isTesting ? (language === 'ko' ? '테스트 발송 중' : 'Sending Test') : (language === 'ko' ? '테스트 발송' : 'Send Test')}</span>
                        </button>

                        <button
                            onClick={handleBroadcast}
                            disabled={isBroadcasting || isTesting}
                            className="flex h-10 items-center gap-3 bg-white px-10 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-accent-green disabled:opacity-50"
                        >
                            {isBroadcasting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                            <span>{isBroadcasting ? t('transmitting', 'newsletter') : t('execBroadcast', 'newsletter')}</span>
                        </button>
                    </div>
                </header>

                <div className="custom-scrollbar flex-1 overflow-y-auto p-12">
                    <div className="mx-auto max-w-5xl space-y-12">
                        <section className="space-y-8">
                            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                                <Sparkles className="text-accent-green" size={16} strokeWidth={1} />
                                <h2 className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-400">{t('composeBtn', 'newsletter')}</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <FileText size={14} />
                                        <p className="font-display text-[9px] uppercase tracking-[0.3em]">
                                            {language === 'ko' ? '빠른 템플릿' : 'Quick Templates'}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {templateOptions.map((template) => (
                                            <button
                                                key={template.id}
                                                onClick={() => applyTemplate(template)}
                                                className="border border-white/10 px-4 py-3 text-[11px] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green"
                                            >
                                                {template.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 font-display text-[9px] uppercase tracking-[0.3em] text-gray-600">
                                        <Type size={12} strokeWidth={1} /> {t('subjectLine', 'newsletter')}
                                    </label>
                                    <input
                                        placeholder={t('subjectPlaceholder', 'newsletter')}
                                        className="w-full rounded-none border border-white/5 bg-transparent p-5 font-display text-[11px] uppercase tracking-[0.1em] text-white transition-all focus:border-white/20 focus:outline-none"
                                        value={subject}
                                        onChange={(event) => setSubject(event.target.value)}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 font-display text-[9px] uppercase tracking-[0.3em] text-gray-600">
                                        <Layout size={12} strokeWidth={1} /> {t('content', 'newsletter')}
                                    </label>
                                    <textarea
                                        placeholder={t('contentPlaceholder', 'newsletter')}
                                        className="min-h-[320px] w-full resize-none rounded-none border border-white/5 bg-transparent p-8 font-serif text-[12px] leading-relaxed text-gray-300 transition-all focus:border-white/20 focus:outline-none"
                                        value={content}
                                        onChange={(event) => setContent(event.target.value)}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6 border border-white/5 bg-gray-950/20 p-8">
                            <div className="flex items-center gap-3">
                                <Mail size={14} className="text-accent-green" />
                                <h3 className="font-display text-[9px] uppercase tracking-[0.3em] text-gray-600">
                                    {language === 'ko' ? '테스트 발송 설정' : 'Test Delivery Setup'}
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <label className="block font-display text-[9px] uppercase tracking-[0.3em] text-gray-600">
                                    {language === 'ko' ? '테스트 수신 이메일' : 'Test recipient email'}
                                </label>
                                <input
                                    value={testEmail}
                                    onChange={(event) => setTestEmail(event.target.value)}
                                    placeholder="example@voxo.local"
                                    className="w-full rounded-none border border-white/5 bg-transparent p-5 text-sm text-white transition-all focus:border-white/20 focus:outline-none"
                                />
                                <p className="text-xs text-gray-500">
                                    {language === 'ko'
                                        ? '먼저 이 주소로 1건만 보내보고, 내용이 맞는지 확인한 뒤 전체 발송을 눌러 주세요.'
                                        : 'Send one test email first, review it, then send the full broadcast.'}
                                </p>
                            </div>
                        </section>

                        <section className="space-y-6 border border-white/5 bg-gray-950/20 p-8">
                            <div className="flex items-center gap-3">
                                <Eye size={14} className="text-accent-green" />
                                <h3 className="font-display text-[9px] uppercase tracking-[0.3em] text-gray-600">
                                    {language === 'ko' ? '발송 미리보기' : 'Send Preview'}
                                </h3>
                            </div>

                            <div className="overflow-hidden border border-white/5 bg-black/40">
                                <div className="border-b border-white/5 px-6 py-4">
                                    <p className="text-[10px] uppercase tracking-[0.24em] text-gray-500">VOXO Newsletter</p>
                                    <p className="mt-3 text-2xl text-white">
                                        {subject.trim() || (language === 'ko' ? '제목을 입력하면 여기에 보입니다.' : 'Your subject will appear here.')}
                                    </p>
                                </div>
                                <div className="space-y-4 px-6 py-6 text-sm leading-7 text-gray-300">
                                    {paragraphs.length === 0 ? (
                                        <p>{language === 'ko' ? '본문을 입력하면 단락별로 미리볼 수 있습니다.' : 'Add content to preview the email body.'}</p>
                                    ) : (
                                        paragraphs.map((paragraph, index) => (
                                            <p key={`${paragraph}-${index}`}>{paragraph}</p>
                                        ))
                                    )}
                                </div>
                                <div className="border-t border-white/5 px-6 py-4 text-xs text-gray-500">
                                    {language === 'ko'
                                        ? `제목 ${subject.trim().length}자 · 본문 ${content.trim().length}자`
                                        : `${subject.trim().length} subject chars · ${content.trim().length} body chars`}
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6 border border-white/5 bg-gray-950/20 p-8">
                            <h3 className="font-display text-[9px] uppercase tracking-[0.3em] text-gray-600">
                                {language === 'ko' ? '최근 발송 이력' : 'Recent Delivery History'}
                            </h3>

                            {historyLoading ? (
                                <div className="flex items-center gap-3 text-gray-500">
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>{language === 'ko' ? '이력을 불러오는 중입니다...' : 'Loading history...'}</span>
                                </div>
                            ) : history.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    {language === 'ko' ? '아직 발송 이력이 없습니다.' : 'No newsletter history yet.'}
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {history.map((item) => (
                                        <div key={item.id} className="border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
                                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        {item.status === 'success' ? (
                                                            <CheckCircle size={14} className="text-accent-green" />
                                                        ) : (
                                                            <XCircle size={14} className="text-red-400" />
                                                        )}
                                                        <p className="text-sm text-white">{item.subject}</p>
                                                        <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-gray-400">
                                                            {getHistoryTypeLabel(item, language)}
                                                        </span>
                                                    </div>
                                                    <p className="mt-2 text-sm text-gray-400">
                                                        {item.preview || (language === 'ko' ? '미리보기 내용이 없습니다.' : 'No preview')}
                                                    </p>
                                                    <p className="mt-2 text-[11px] text-gray-500">
                                                        {language === 'ko'
                                                            ? `${item.recipientCount}명 대상 · ${item.message}`
                                                            : `${item.recipientCount} recipients · ${item.message}`}
                                                    </p>
                                                </div>
                                                <span className="font-mono text-[11px] text-gray-500">{formatDate(item.sentAt, locale)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="space-y-6 border border-white/5 bg-gray-950/20 p-8">
                            <h3 className="font-display text-[9px] uppercase tracking-[0.3em] text-gray-600">{t('safetyTitle', 'newsletter')}</h3>
                            <p className="text-[10px] uppercase tracking-widest text-gray-700">{t('safetyText', 'newsletter')}</p>
                        </section>
                    </div>
                </div>
            </main>

            <div className="pointer-events-none fixed inset-0 z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]"></div>
        </div>
    );
}
