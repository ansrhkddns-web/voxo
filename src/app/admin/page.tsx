'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import {
    AlertCircle,
    CheckCircle,
    ExternalLink,
    History,
    Loader2,
    Mail,
    Search,
    ShieldAlert,
    Terminal,
    Trash2,
    TrendingUp,
    Users,
    XCircle,
} from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { deletePost, getPosts } from '@/app/actions/postActions';
import { getNewsletterHistory, getSubscribers, type NewsletterHistoryEntry } from '@/app/actions/newsletterActions';
import { getAllSettings, getSettingsAuditLog, type SettingsAuditEntry } from '@/app/actions/settingsActions';
import { useAdminLanguage } from '@/providers/AdminLanguageProvider';
import { cn } from '@/lib/utils';
import type { PostRecord } from '@/types/content';

interface SubscriberRecord {
    id: string;
    email: string;
    status: 'active' | 'unsubscribed';
}

interface SiteSettingRecord {
    setting_key: string;
    setting_value: string | null;
    updated_at?: string | null;
}

const LABELS = {
    site_name: { en: 'Site name', ko: '사이트 이름' },
    site_description: { en: 'Site description', ko: '사이트 설명' },
    contact_email: { en: 'Contact email', ko: '문의 이메일' },
    maintenance_mode: { en: 'Maintenance mode', ko: '점검 모드' },
    maintenance_eta: { en: 'Maintenance ETA', ko: '복구 예정 시간' },
    maintenance_notice_url: { en: 'Notice link', ko: '공지 링크' },
    admin_login_email: { en: 'Admin email', ko: '관리자 이메일' },
    admin_password_hash: { en: 'Admin password', ko: '관리자 비밀번호' },
} as const;

function getLocale(language: 'en' | 'ko') {
    return language === 'ko' ? 'ko-KR' : 'en-US';
}

function formatNumber(value: number, locale: string) {
    return new Intl.NumberFormat(locale).format(value);
}

function formatDate(value: string | null | undefined, locale: string) {
    if (!value) return '-';
    return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value));
}

function labelFor(key: string, language: 'en' | 'ko') {
    return LABELS[key as keyof typeof LABELS]?.[language] || key;
}

function settingSummary(key: string, value: string | null, language: 'en' | 'ko') {
    if (!value) return language === 'ko' ? '비어 있음' : 'Empty';
    if (key === 'maintenance_mode') return value === 'true' ? (language === 'ko' ? '활성화' : 'Enabled') : (language === 'ko' ? '비활성화' : 'Disabled');
    return value.length > 56 ? `${value.slice(0, 56)}...` : value;
}

function auditSummary(entry: SettingsAuditEntry, language: 'en' | 'ko') {
    if (entry.key === 'admin_password_hash') {
        return language === 'ko' ? '관리자 비밀번호가 변경되었습니다.' : 'Admin password was updated.';
    }
    const before = entry.previousValue || (language === 'ko' ? '비어 있음' : 'Empty');
    const after = entry.nextValue || (language === 'ko' ? '비어 있음' : 'Empty');
    return `${before} -> ${after}`;
}

function deliveryLabel(item: NewsletterHistoryEntry, language: 'en' | 'ko') {
    return item.deliveryType === 'test' ? (language === 'ko' ? '테스트' : 'Test') : (language === 'ko' ? '전체 발송' : 'Broadcast');
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <section className="border border-white/5 bg-white/[0.02] p-6">
            <div className="mb-6 flex items-center justify-between">
                <p className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-500">{title}</p>
                {icon}
            </div>
            {children}
        </section>
    );
}

export default function AdminDashboard() {
    const { t, language } = useAdminLanguage();
    const locale = getLocale(language);
    const [posts, setPosts] = useState<PostRecord[]>([]);
    const [subscribers, setSubscribers] = useState<SubscriberRecord[]>([]);
    const [settings, setSettings] = useState<SiteSettingRecord[]>([]);
    const [auditLog, setAuditLog] = useState<SettingsAuditEntry[]>([]);
    const [newsletterHistory, setNewsletterHistory] = useState<NewsletterHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const [postData, subscriberData, settingData, auditData, newsletterData] = await Promise.all([
                    getPosts(),
                    getSubscribers(),
                    getAllSettings(),
                    getSettingsAuditLog(),
                    getNewsletterHistory(),
                ]);
                setPosts(postData);
                setSubscribers(subscriberData as SubscriberRecord[]);
                setSettings(settingData as SiteSettingRecord[]);
                setAuditLog(auditData);
                setNewsletterHistory(newsletterData);
            } catch {
                toast.error(language === 'ko' ? '대시보드 데이터를 불러오지 못했습니다.' : 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [language]);

    const handleDelete = async (id: string) => {
        if (!confirm(language === 'ko' ? '정말 이 게시글을 삭제할까요?' : 'Delete this post?')) return;
        try {
            await deletePost(id);
            setPosts(await getPosts());
            toast.success(language === 'ko' ? '게시글을 삭제했습니다.' : 'Post deleted');
        } catch {
            toast.error(language === 'ko' ? '게시글 삭제에 실패했습니다.' : 'Delete failed');
        }
    };

    const filteredPosts = posts.filter((post) => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return true;
        return [post.title, post.slug, post.artist_name, post.categories?.name].filter(Boolean).join(' ').toLowerCase().includes(query);
    });

    const settingsMap = Object.fromEntries(settings.map((item) => [item.setting_key, item.setting_value ?? '']));
    const activeSubscribers = subscribers.filter((item) => item.status === 'active').length;
    const publishedCount = posts.filter((item) => item.is_published).length;
    const totalViews = posts.reduce((sum, item) => sum + (item.view_count || 0), 0);
    const failedHistory = newsletterHistory.filter((item) => item.status === 'failed');
    const latestFailure = failedHistory[0];
    const latestNewsletter = newsletterHistory[0];

    return (
        <div className="flex min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <Toaster position="top-center" />
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto p-12">
                <header className="mb-16 flex flex-col gap-6 border-b border-white/5 pb-8 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-400">{t('status', 'dashboard')}</p>
                        <h1 className="mt-2 font-display text-4xl font-light uppercase tracking-widest">{t('title', 'dashboard')}</h1>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('search', 'dashboard')} className="w-full border-b border-white/10 bg-transparent py-3 pr-10 font-display text-[10px] uppercase tracking-widest text-white placeholder:text-gray-700 focus:border-accent-green focus:outline-none" />
                    </div>
                </header>

                {latestFailure ? (
                    <section className="mb-16 border border-red-500/20 bg-red-500/5 p-6">
                        <div className="flex items-start justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <ShieldAlert className="mt-0.5 text-red-400" size={18} />
                                <div>
                                    <p className="font-display text-[10px] uppercase tracking-[0.3em] text-red-300">{language === 'ko' ? '최근 발송 실패 감지' : 'Recent Delivery Failure'}</p>
                                    <p className="mt-3 text-sm text-white">{latestFailure.subject}</p>
                                    <p className="mt-2 text-sm text-gray-300">{latestFailure.message}</p>
                                    <p className="mt-2 text-xs text-gray-500">{`${formatDate(latestFailure.sentAt, locale)} · ${formatNumber(latestFailure.recipientCount, locale)}${language === 'ko' ? '명 대상' : ' recipients'}`}</p>
                                </div>
                            </div>
                            <Link href="/admin/newsletter" className="shrink-0 border border-white/10 px-4 py-3 text-[11px] text-white transition-colors hover:border-accent-green hover:text-accent-green">{language === 'ko' ? '뉴스레터 확인' : 'Open Newsletter'}</Link>
                        </div>
                    </section>
                ) : null}

                <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {[
                        { icon: <TrendingUp size={16} />, label: t('statArchives', 'dashboard'), value: posts.length },
                        { icon: <CheckCircle size={16} />, label: t('statPublished', 'dashboard'), value: publishedCount },
                        { icon: <Users size={16} />, label: language === 'ko' ? '활성 구독자' : 'Active Subscribers', value: activeSubscribers },
                        { icon: <TrendingUp size={16} />, label: t('statViews', 'dashboard'), value: totalViews },
                    ].map((item) => (
                        <div key={item.label} className="border border-white/5 bg-white/[0.02] p-6">
                            <div className="mb-4 flex items-center gap-3 text-gray-500">{item.icon}<p className="font-display text-[10px] uppercase tracking-[0.2em]">{item.label}</p></div>
                            <p className="font-display text-4xl font-light text-white">{formatNumber(item.value, locale)}</p>
                        </div>
                    ))}
                </div>

                <div className="mb-16 grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <Section title={language === 'ko' ? '운영 상태' : 'Operations Snapshot'} icon={<Terminal size={14} className="text-accent-green" />}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4"><span className="text-sm text-gray-400">{language === 'ko' ? '서비스 모드' : 'Service mode'}</span><span className="text-sm text-white">{settingsMap.maintenance_mode === 'true' ? (language === 'ko' ? '점검 중' : 'Maintenance') : (language === 'ko' ? '정상 운영' : 'Live')}</span></div>
                            <div className="flex items-center justify-between border-b border-white/5 pb-4"><span className="text-sm text-gray-400">{language === 'ko' ? '복구 예정 시간' : 'ETA'}</span><span className="text-sm text-white">{settingsMap.maintenance_eta || '-'}</span></div>
                            <div className="flex items-center justify-between"><span className="text-sm text-gray-400">{language === 'ko' ? '공지 링크' : 'Notice link'}</span><span className="max-w-[60%] truncate text-sm text-white">{settingsMap.maintenance_notice_url || '-'}</span></div>
                        </div>
                    </Section>

                    <Section title={language === 'ko' ? '뉴스레터 요약' : 'Newsletter Summary'} icon={<Mail size={14} className="text-accent-green" />}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4"><span className="text-sm text-gray-400">{language === 'ko' ? '누적 발송 기록' : 'Total sends tracked'}</span><span className="text-sm text-white">{formatNumber(newsletterHistory.length, locale)}</span></div>
                            <div className="flex items-center justify-between border-b border-white/5 pb-4"><span className="text-sm text-gray-400">{language === 'ko' ? '성공 발송' : 'Successful sends'}</span><span className="text-sm text-white">{formatNumber(newsletterHistory.filter((item) => item.status === 'success').length, locale)}</span></div>
                            <div className="flex items-center justify-between border-b border-white/5 pb-4"><span className="text-sm text-gray-400">{language === 'ko' ? '테스트 발송' : 'Test sends'}</span><span className="text-sm text-white">{formatNumber(newsletterHistory.filter((item) => item.deliveryType === 'test').length, locale)}</span></div>
                            <div className="rounded-sm border border-white/5 bg-black/30 p-4">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">{language === 'ko' ? '최근 발송 제목' : 'Latest subject'}</p>
                                <p className="mt-2 text-sm text-white">{latestNewsletter?.subject || (language === 'ko' ? '아직 발송 이력이 없습니다.' : 'No newsletter history yet.')}</p>
                            </div>
                        </div>
                    </Section>
                </div>

                <div className="mb-16 grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <Section title={language === 'ko' ? '설정 변경 로그' : 'Settings Audit Log'} icon={<History size={14} className="text-accent-green" />}>
                        <div className="space-y-4">
                            {auditLog.slice(0, 5).map((entry) => (
                                <div key={entry.id} className="border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-sm text-white">{labelFor(entry.key, language)}</p>
                                        <span className="font-mono text-[10px] text-gray-500">{formatDate(entry.changedAt, locale)}</span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-400">{auditSummary(entry, language)}</p>
                                </div>
                            ))}
                            {auditLog.length === 0 ? <p className="text-sm text-gray-500">{language === 'ko' ? '아직 설정 변경 로그가 없습니다.' : 'No settings audit history yet.'}</p> : null}
                        </div>
                    </Section>

                    <Section title={language === 'ko' ? '최근 설정 상태' : 'Recent Setting Values'} icon={<History size={14} className="text-accent-green" />}>
                        <div className="space-y-4">
                            {settings.filter((item) => item.setting_key !== 'admin_password_hash').slice(0, 5).map((item) => (
                                <div key={item.setting_key} className="border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-sm text-white">{labelFor(item.setting_key, language)}</p>
                                        <span className="font-mono text-[10px] text-gray-500">{formatDate(item.updated_at, locale)}</span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-400">{settingSummary(item.setting_key, item.setting_value, language)}</p>
                                </div>
                            ))}
                        </div>
                    </Section>
                </div>

                <div className="mb-16 grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <Section title={language === 'ko' ? '최근 뉴스레터 발송' : 'Recent Newsletter Sends'} icon={<Mail size={14} className="text-accent-green" />}>
                        <div className="space-y-4">
                            {newsletterHistory.slice(0, 3).map((item) => (
                                <div key={item.id} className="border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                {item.status === 'success' ? <CheckCircle size={14} className="text-accent-green" /> : <XCircle size={14} className="text-red-400" />}
                                                <p className="truncate text-sm text-white">{item.subject}</p>
                                                <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-gray-400">{deliveryLabel(item, language)}</span>
                                            </div>
                                            <p className="mt-2 text-sm text-gray-400">{item.preview || (language === 'ko' ? '미리보기 내용이 없습니다.' : 'No preview available.')}</p>
                                        </div>
                                        <span className="shrink-0 font-mono text-[11px] text-gray-500">{formatDate(item.sentAt, locale)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section title={language === 'ko' ? '최근 게시글 활동' : 'Recent Post Activity'} icon={<Terminal size={14} className="text-accent-green" />}>
                        <div className="space-y-3 font-mono text-[11px]">
                            {loading ? <div className="flex items-center gap-3 text-gray-600"><Loader2 size={12} className="animate-spin" />{language === 'ko' ? '활동 내역을 불러오는 중입니다...' : 'Loading activity...'}</div> : posts.slice(0, 5).map((post) => (
                                <div key={post.id} className="flex items-start gap-3 text-gray-300">
                                    <span className="shrink-0 text-gray-600">[{formatDate(post.created_at, locale)}]</span>
                                    <span><span className={post.is_published ? 'text-blue-400' : 'text-yellow-500'}>{post.is_published ? (language === 'ko' ? '발행' : 'Published') : (language === 'ko' ? '임시 저장' : 'Draft')}</span> <span>&quot;{post.title}&quot;</span></span>
                                </div>
                            ))}
                        </div>
                    </Section>
                </div>

                <div className="overflow-hidden border border-white/5 bg-gray-950/20">
                    <div className="flex items-center justify-between border-b border-white/5 px-8 py-6">
                        <p className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-500">{t('dirTitle', 'dashboard')}</p>
                        <p className="font-display text-[10px] uppercase tracking-[0.2em] text-gray-600">{language === 'ko' ? `표시 중 ${formatNumber(filteredPosts.length, locale)}건` : `Showing ${formatNumber(filteredPosts.length, locale)}`}</p>
                    </div>
                    {loading ? (
                        <div className="flex h-80 items-center justify-center gap-4">
                            <Loader2 className="animate-spin text-accent-green" size={24} />
                            <span className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-600">{t('syncing', 'dashboard')}</span>
                        </div>
                    ) : (
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-white/5 font-display text-[9px] uppercase tracking-[0.2em] text-gray-600">
                                    <th className="px-8 py-6 font-medium">{t('colTitle', 'dashboard')}</th>
                                    <th className="px-8 py-6 font-medium">{t('colClass', 'dashboard')}</th>
                                    <th className="px-8 py-6 font-medium">{t('colViews', 'dashboard')}</th>
                                    <th className="px-8 py-6 font-medium">{t('colStatus', 'dashboard')}</th>
                                    <th className="px-8 py-6 text-right font-medium">{t('colOps', 'dashboard')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-display">
                                {filteredPosts.length === 0 ? (
                                    <tr><td colSpan={5} className="px-8 py-20 text-center"><p className="text-[10px] italic uppercase tracking-[0.3em] text-gray-700">{searchQuery ? t('emptySearch', 'dashboard') : t('emptyState', 'dashboard')}</p></td></tr>
                                ) : (
                                    filteredPosts.map((post) => (
                                        <tr key={post.id} className="group transition-colors hover:bg-white/[0.02]">
                                            <td className="px-8 py-8"><Link href={`/admin/editor?id=${post.id}`} className="block group/title"><p className="text-sm font-light uppercase tracking-wide text-white transition-colors group-hover/title:text-accent-green">{post.title}</p><p className="mt-1 text-[8px] tracking-widest text-gray-600">{post.id.toUpperCase()}</p></Link></td>
                                            <td className="px-8 py-8"><span className="text-[10px] uppercase tracking-widest text-gray-400">{post.categories?.name || t('generic', 'dashboard')}</span></td>
                                            <td className="px-8 py-8"><span className="font-mono text-[10px] tracking-widest text-gray-300">{formatNumber(post.view_count || 0, locale)}</span></td>
                                            <td className="px-8 py-8"><span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] uppercase tracking-widest', post.is_published ? 'border-accent-green/20 bg-accent-green/10 text-accent-green' : 'border-white/10 bg-white/5 text-gray-400')}>{post.is_published ? <CheckCircle size={10} /> : <AlertCircle size={10} />}{post.is_published ? t('statusVerified', 'dashboard') : t('statusPending', 'dashboard')}</span></td>
                                            <td className="px-8 py-8 text-right"><div className="flex items-center justify-end gap-2"><a href={`/post/${post.slug}`} target="_blank" rel="noopener noreferrer" className="block p-3 text-white/60 transition-colors hover:bg-white/5 hover:text-accent-green" title={language === 'ko' ? '미리보기' : 'Preview'}><ExternalLink size={14} /></a><button onClick={() => handleDelete(post.id)} className="cursor-pointer p-3 text-white/60 transition-colors hover:bg-white/5 hover:text-red-500" title={language === 'ko' ? '삭제' : 'Delete'}><Trash2 size={14} /></button></div></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
            <div className="pointer-events-none fixed inset-0 z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
        </div>
    );
}
