'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Bot, Database, Globe, Loader2, Lock, Save, ShieldCheck } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAdminLanguage } from '@/providers/AdminLanguageProvider';
import { getSetting, updateAdminCredentials, updateSetting } from '@/app/actions/settingsActions';
import { getAdminCredentialHint } from '@/lib/admin-auth';

type TabId = 'general' | 'ai' | 'integrations' | 'security' | 'notifications';

interface SettingsState {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    geminiApiKey: string;
    globalPlaylist: string;
    maintenanceMode: boolean;
    maintenanceTitle: string;
    maintenanceMessage: string;
    maintenanceEta: string;
    maintenanceNoticeUrl: string;
    aiPromptResearch: string;
    aiPromptWrite: string;
    aiPromptSeo: string;
    aiPromptConcept: string;
}

interface SecurityState {
    adminEmail: string;
    newPassword: string;
    confirmPassword: string;
}

const DEFAULT_ADMIN = getAdminCredentialHint();

const DEFAULT_SETTINGS: SettingsState = {
    siteName: 'VOXO Cinematic Magazine',
    siteDescription: 'Premium Curated Music Experience',
    contactEmail: 'hello@voxo.edit',
    geminiApiKey: '',
    globalPlaylist: '',
    maintenanceMode: false,
    maintenanceTitle: '점검 진행 중',
    maintenanceMessage:
        '현재 사이트 점검이 진행 중입니다. 더 안정적인 서비스와 완성도 높은 콘텐츠 경험을 위해 잠시 공개 화면을 닫아두었습니다. 작업이 끝나면 다시 정상적으로 접속할 수 있습니다.',
    maintenanceEta: '',
    maintenanceNoticeUrl: '',
    aiPromptResearch:
        'Research the artist "{artistName}" and the song "{songTitle}". Return concise factual bullet points only.',
    aiPromptWrite:
        'Write the article in {language} using {facts}. Follow this direction: {concept}. Use category context {categoryName}. Start with "Title:" and "Intro:".',
    aiPromptSeo: 'Create comma-separated SEO tags from {articleText}. Prefer existing tags from {existingTags}.',
    aiPromptConcept: 'Focus on mood, production detail, and why the song matters.',
};

const DEFAULT_SECURITY: SecurityState = {
    adminEmail: DEFAULT_ADMIN.email,
    newPassword: '',
    confirmPassword: '',
};

const settingKeys = {
    siteName: 'site_name',
    siteDescription: 'site_description',
    contactEmail: 'contact_email',
    geminiApiKey: 'gemini_api_key',
    globalPlaylist: 'global_spotify_playlist',
    maintenanceMode: 'maintenance_mode',
    maintenanceTitle: 'maintenance_title',
    maintenanceMessage: 'maintenance_message',
    maintenanceEta: 'maintenance_eta',
    maintenanceNoticeUrl: 'maintenance_notice_url',
    aiPromptResearch: 'ai_prompt_research',
    aiPromptWrite: 'ai_prompt_write',
    aiPromptSeo: 'ai_prompt_seo',
    aiPromptConcept: 'ai_prompt_concept',
    adminEmail: 'admin_login_email',
} as const;

const tabs: Array<{ id: TabId; icon: typeof Globe }> = [
    { id: 'general', icon: Globe },
    { id: 'ai', icon: Bot },
    { id: 'integrations', icon: Database },
    { id: 'security', icon: Lock },
    { id: 'notifications', icon: Bell },
];

const COPY = {
    en: {
        title: 'Platform Settings',
        subtitle: 'Manage site identity, AI prompts, maintenance mode, and admin access in one place.',
        save: 'Save Settings',
        saving: 'Saving...',
        saved: 'Settings saved successfully.',
        failed: 'Failed to save some settings.',
        loading: 'Loading settings...',
        tabs: { general: 'General', ai: 'AI Agents', integrations: 'Integrations', security: 'Security', notifications: 'Notifications' },
        general: {
            section: 'Site Identity',
            siteName: 'Site Name',
            siteDescription: 'Site Description',
            contactEmail: 'Contact Email',
            adminLanguage: 'Admin Language',
            languageHelp: 'Choose the language used inside the admin interface.',
        },
        ai: {
            section: 'AI Prompt Settings',
            description: 'These templates are used by the AI draft generation pipeline.',
            concept: 'Default Editorial Direction',
            research: 'Research Prompt',
            write: 'Writing Prompt',
            seo: 'SEO Prompt',
        },
        integrations: {
            section: 'External Integrations',
            spotify: 'Spotify credentials are managed via environment variables.',
            gemini: 'Google Gemini API Key',
            playlist: 'Global Spotify Playlist URL',
        },
        security: {
            section: 'Admin Access',
            description: 'Change the default admin login used for the built-in management access.',
            adminEmail: 'Admin Login Email',
            newPassword: 'New Password',
            confirmPassword: 'Confirm Password',
            saveAccess: 'Update Admin Login',
            savingAccess: 'Updating...',
            savedAccess: 'Admin login updated successfully.',
            passwordHelp: 'Use at least 8 characters. This replaces the built-in default admin login.',
            mismatch: 'Password confirmation does not match.',
            maintenance: 'Maintenance Mode',
            maintenanceHelp: 'When enabled, public visitors are redirected to the maintenance page while admin access stays available.',
            maintenanceTitle: 'Maintenance Title',
            maintenanceMessage: 'Maintenance Message',
            maintenanceEta: 'Expected Recovery Time',
            maintenanceNoticeUrl: 'Notice Link URL',
            fallbackTitle: 'Current quick access',
            fallbackText: 'If you have not changed the admin login yet, the current starter account is shown below.',
        },
        notifications: {
            section: 'Notifications',
            placeholder: 'Notification routing is not connected yet.',
        },
    },
    ko: {
        title: '관리자 설정',
        subtitle: '사이트 기본 정보, AI 프롬프트, 점검 모드, 관리자 계정을 한 곳에서 관리합니다.',
        save: '설정 저장',
        saving: '저장 중...',
        saved: '설정이 저장되었습니다.',
        failed: '일부 설정 저장에 실패했습니다.',
        loading: '설정을 불러오는 중...',
        tabs: { general: '일반', ai: 'AI 설정', integrations: '연동', security: '보안', notifications: '알림' },
        general: {
            section: '사이트 기본 정보',
            siteName: '사이트 이름',
            siteDescription: '사이트 설명',
            contactEmail: '문의 이메일',
            adminLanguage: '관리자 언어',
            languageHelp: '관리자 화면에서 사용할 언어를 선택합니다.',
        },
        ai: {
            section: 'AI 프롬프트 설정',
            description: 'AI 초안 생성 흐름에서 사용하는 기본 템플릿입니다.',
            concept: '기본 작성 방향',
            research: '리서치 프롬프트',
            write: '본문 작성 프롬프트',
            seo: 'SEO 태그 프롬프트',
        },
        integrations: {
            section: '외부 연동',
            spotify: 'Spotify 인증 정보는 환경변수로 관리됩니다.',
            gemini: 'Google Gemini API Key',
            playlist: '전역 Spotify 플레이리스트 URL',
        },
        security: {
            section: '관리자 접근 계정',
            description: '기본 관리자 로그인 계정을 관리자 화면에서 직접 변경할 수 있습니다.',
            adminEmail: '관리자 로그인 이메일',
            newPassword: '새 비밀번호',
            confirmPassword: '새 비밀번호 확인',
            saveAccess: '관리자 로그인 변경',
            savingAccess: '변경 중...',
            savedAccess: '관리자 로그인 정보가 저장되었습니다.',
            passwordHelp: '8자 이상으로 입력해 주세요. 저장하면 기본 관리자 로그인 정보가 바로 교체됩니다.',
            mismatch: '비밀번호 확인이 일치하지 않습니다.',
            maintenance: '점검 모드',
            maintenanceHelp: '활성화하면 방문자는 점검 안내 페이지로 이동하고, 관리자 페이지는 계속 사용할 수 있습니다.',
            maintenanceTitle: '점검 안내 제목',
            maintenanceMessage: '점검 안내 문구',
            maintenanceEta: '예상 복구 시간',
            maintenanceNoticeUrl: '공지 링크 URL',
            fallbackTitle: '현재 빠른 접속 정보',
            fallbackText: '아직 관리자 로그인을 변경하지 않았다면 아래 기본 계정으로 바로 접속할 수 있습니다.',
        },
        notifications: {
            section: '알림',
            placeholder: '알림 라우팅 기능은 아직 연결되지 않았습니다.',
        },
    },
} as const;

function Field({
    label,
    value,
    onChange,
    placeholder,
    multiline = false,
    rows = 4,
    type = 'text',
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    multiline?: boolean;
    rows?: number;
    type?: string;
}) {
    return (
        <label className="block space-y-3">
            <span className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-500">{label}</span>
            {multiline ? (
                <textarea
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    rows={rows}
                    className="w-full resize-y border-b border-white/10 bg-transparent py-3 text-white focus:border-accent-green focus:outline-none"
                    placeholder={placeholder}
                />
            ) : (
                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    type={type}
                    className="w-full border-b border-white/10 bg-transparent py-3 text-white focus:border-accent-green focus:outline-none"
                    placeholder={placeholder}
                />
            )}
        </label>
    );
}

export default function AdminSettings() {
    const { language, setLanguage } = useAdminLanguage();
    const text = COPY[language];
    const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
    const [security, setSecurity] = useState<SecurityState>(DEFAULT_SECURITY);
    const [activeTab, setActiveTab] = useState<TabId>('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingAccess, setSavingAccess] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const local = localStorage.getItem('voxoAdminSettings');
                if (local) {
                    setSettings((prev) => ({ ...prev, ...(JSON.parse(local) as Partial<SettingsState>) }));
                }

                const values = await Promise.all([
                    getSetting(settingKeys.siteName),
                    getSetting(settingKeys.siteDescription),
                    getSetting(settingKeys.contactEmail),
                    getSetting(settingKeys.geminiApiKey),
                    getSetting(settingKeys.globalPlaylist),
                    getSetting(settingKeys.maintenanceMode),
                    getSetting(settingKeys.maintenanceTitle),
                    getSetting(settingKeys.maintenanceMessage),
                    getSetting(settingKeys.maintenanceEta),
                    getSetting(settingKeys.maintenanceNoticeUrl),
                    getSetting(settingKeys.aiPromptResearch),
                    getSetting(settingKeys.aiPromptWrite),
                    getSetting(settingKeys.aiPromptSeo),
                    getSetting(settingKeys.aiPromptConcept),
                    getSetting(settingKeys.adminEmail),
                ]);

                setSettings((prev) => ({
                    ...prev,
                    ...(values[0] ? { siteName: values[0] } : {}),
                    ...(values[1] ? { siteDescription: values[1] } : {}),
                    ...(values[2] ? { contactEmail: values[2] } : {}),
                    ...(values[3] ? { geminiApiKey: values[3] } : {}),
                    ...(values[4] ? { globalPlaylist: values[4] } : {}),
                    ...(values[5] ? { maintenanceMode: values[5] === 'true' } : {}),
                    ...(values[6] ? { maintenanceTitle: values[6] } : {}),
                    ...(values[7] ? { maintenanceMessage: values[7] } : {}),
                    ...(values[8] ? { maintenanceEta: values[8] } : {}),
                    ...(values[9] ? { maintenanceNoticeUrl: values[9] } : {}),
                    ...(values[10] ? { aiPromptResearch: values[10] } : {}),
                    ...(values[11] ? { aiPromptWrite: values[11] } : {}),
                    ...(values[12] ? { aiPromptSeo: values[12] } : {}),
                    ...(values[13] ? { aiPromptConcept: values[13] } : {}),
                }));

                setSecurity((prev) => ({
                    ...prev,
                    adminEmail: values[14] || DEFAULT_ADMIN.email,
                }));
            } catch (error) {
                console.error('Failed to load settings', error);
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, []);

    const updateField = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const updateSecurity = <K extends keyof SecurityState>(key: K, value: SecurityState[K]) => {
        setSecurity((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            localStorage.setItem('voxoAdminSettings', JSON.stringify({ ...settings, language }));
            const results = await Promise.all([
                updateSetting(settingKeys.siteName, settings.siteName),
                updateSetting(settingKeys.siteDescription, settings.siteDescription),
                updateSetting(settingKeys.contactEmail, settings.contactEmail),
                updateSetting(settingKeys.geminiApiKey, settings.geminiApiKey),
                updateSetting(settingKeys.globalPlaylist, settings.globalPlaylist),
                updateSetting(settingKeys.maintenanceMode, String(settings.maintenanceMode)),
                updateSetting(settingKeys.maintenanceTitle, settings.maintenanceTitle),
                updateSetting(settingKeys.maintenanceMessage, settings.maintenanceMessage),
                updateSetting(settingKeys.maintenanceEta, settings.maintenanceEta),
                updateSetting(settingKeys.maintenanceNoticeUrl, settings.maintenanceNoticeUrl),
                updateSetting(settingKeys.aiPromptResearch, settings.aiPromptResearch),
                updateSetting(settingKeys.aiPromptWrite, settings.aiPromptWrite),
                updateSetting(settingKeys.aiPromptSeo, settings.aiPromptSeo),
                updateSetting(settingKeys.aiPromptConcept, settings.aiPromptConcept),
            ]);

            toast[results.some((item) => !item.success) ? 'error' : 'success'](
                results.some((item) => !item.success) ? text.failed : text.saved
            );
        } catch (error) {
            console.error('Failed to save settings', error);
            toast.error(text.failed);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAdminAccess = async () => {
        if (security.newPassword !== security.confirmPassword) {
            toast.error(text.security.mismatch);
            return;
        }

        setSavingAccess(true);
        try {
            const result = await updateAdminCredentials(security.adminEmail, security.newPassword);

            if (!result.success) {
                toast.error(result.error || text.failed);
                return;
            }

            toast.success(text.security.savedAccess);
            setSecurity((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }));
        } catch (error) {
            console.error('Failed to save admin access', error);
            toast.error(text.failed);
        } finally {
            setSavingAccess(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-black text-white selection:bg-accent-green/30">
            <Toaster position="top-center" />
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto">
                <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-white/5 bg-black/80 px-12 backdrop-blur-xl">
                    <h1 className="font-display text-[10px] uppercase tracking-[0.4em] text-gray-400">{text.title}</h1>
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="flex items-center gap-2 bg-white px-8 py-2.5 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-accent-green disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {saving ? text.saving : text.save}
                    </button>
                </header>

                <div className="mx-auto max-w-6xl p-12">
                    <p className="mb-12 max-w-3xl text-sm leading-relaxed text-gray-500">{text.subtitle}</p>

                    {loading ? (
                        <div className="flex h-64 flex-col items-center justify-center gap-4 border border-white/5 bg-white/[0.01]">
                            <Loader2 className="animate-spin text-accent-green" size={28} />
                            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-600">{text.loading}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-16 md:grid-cols-[220px_1fr]">
                            <aside className="space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex w-full items-center gap-3 border-l px-4 py-3 text-left font-display text-[10px] uppercase tracking-[0.2em] transition-all ${
                                            activeTab === tab.id
                                                ? 'border-accent-green bg-white/[0.03] text-accent-green'
                                                : 'border-transparent text-gray-500 hover:bg-white/[0.02] hover:text-white'
                                        }`}
                                    >
                                        <tab.icon size={14} />
                                        {text.tabs[tab.id]}
                                    </button>
                                ))}
                            </aside>

                            <div className="space-y-12">
                                {activeTab === 'general' && (
                                    <>
                                        <section className="space-y-6">
                                            <h2 className="border-b border-white/10 pb-4 font-display text-[10px] uppercase tracking-[0.4em] text-white">{text.general.section}</h2>
                                            <Field label={text.general.siteName} value={settings.siteName} onChange={(value) => updateField('siteName', value)} placeholder={text.general.siteName} />
                                            <Field label={text.general.siteDescription} value={settings.siteDescription} onChange={(value) => updateField('siteDescription', value)} placeholder={text.general.siteDescription} multiline rows={3} />
                                            <Field label={text.general.contactEmail} value={settings.contactEmail} onChange={(value) => updateField('contactEmail', value)} placeholder={text.general.contactEmail} type="email" />
                                        </section>
                                        <section className="space-y-4">
                                            <h2 className="border-b border-white/10 pb-4 font-display text-[10px] uppercase tracking-[0.4em] text-white">{text.general.adminLanguage}</h2>
                                            <p className="text-sm text-gray-500">{text.general.languageHelp}</p>
                                            <div className="flex gap-2">
                                                <button onClick={() => setLanguage('en')} className={`px-4 py-2 text-sm ${language === 'en' ? 'bg-white text-black' : 'bg-white/5 text-gray-400'}`}>English</button>
                                                <button onClick={() => setLanguage('ko')} className={`px-4 py-2 text-sm ${language === 'ko' ? 'bg-white text-black' : 'bg-white/5 text-gray-400'}`}>한국어</button>
                                            </div>
                                        </section>
                                    </>
                                )}

                                {activeTab === 'ai' && (
                                    <section className="space-y-6">
                                        <h2 className="border-b border-white/10 pb-4 font-display text-[10px] uppercase tracking-[0.4em] text-white">{text.ai.section}</h2>
                                        <p className="text-sm text-gray-500">{text.ai.description}</p>
                                        <Field label={text.ai.concept} value={settings.aiPromptConcept} onChange={(value) => updateField('aiPromptConcept', value)} placeholder={text.ai.concept} multiline rows={3} />
                                        <Field label={text.ai.research} value={settings.aiPromptResearch} onChange={(value) => updateField('aiPromptResearch', value)} placeholder={text.ai.research} multiline rows={6} />
                                        <Field label={text.ai.write} value={settings.aiPromptWrite} onChange={(value) => updateField('aiPromptWrite', value)} placeholder={text.ai.write} multiline rows={8} />
                                        <Field label={text.ai.seo} value={settings.aiPromptSeo} onChange={(value) => updateField('aiPromptSeo', value)} placeholder={text.ai.seo} multiline rows={5} />
                                    </section>
                                )}

                                {activeTab === 'integrations' && (
                                    <section className="space-y-6">
                                        <h2 className="border-b border-white/10 pb-4 font-display text-[10px] uppercase tracking-[0.4em] text-white">{text.integrations.section}</h2>
                                        <div className="rounded border border-white/5 bg-white/[0.01] p-4 text-sm text-gray-500">{text.integrations.spotify}</div>
                                        <Field label={text.integrations.gemini} value={settings.geminiApiKey} onChange={(value) => updateField('geminiApiKey', value)} placeholder={text.integrations.gemini} />
                                        <Field label={text.integrations.playlist} value={settings.globalPlaylist} onChange={(value) => updateField('globalPlaylist', value)} placeholder={text.integrations.playlist} />
                                    </section>
                                )}

                                {activeTab === 'security' && (
                                    <section className="space-y-8">
                                        <div className="space-y-3">
                                            <h2 className="border-b border-white/10 pb-4 font-display text-[10px] uppercase tracking-[0.4em] text-white">{text.security.section}</h2>
                                            <p className="text-sm text-gray-500">{text.security.description}</p>
                                        </div>

                                        <div className="rounded border border-white/5 bg-white/[0.02] p-6">
                                            <div className="mb-5 flex items-center gap-3">
                                                <ShieldCheck size={16} className="text-accent-green" />
                                                <p className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-400">{text.security.fallbackTitle}</p>
                                            </div>
                                            <p className="text-sm leading-relaxed text-gray-400">{text.security.fallbackText}</p>
                                            <div className="mt-5 space-y-2 text-sm">
                                                <p><span className="text-gray-500">ID</span> <span className="font-mono">{DEFAULT_ADMIN.email}</span></p>
                                                <p><span className="text-gray-500">PW</span> <span className="font-mono">{DEFAULT_ADMIN.password}</span></p>
                                            </div>
                                        </div>

                                        <div className="space-y-6 border border-white/5 bg-white/[0.01] p-6">
                                            <Field label={text.security.adminEmail} value={security.adminEmail} onChange={(value) => updateSecurity('adminEmail', value)} placeholder={text.security.adminEmail} type="email" />
                                            <Field label={text.security.newPassword} value={security.newPassword} onChange={(value) => updateSecurity('newPassword', value)} placeholder={text.security.newPassword} type="password" />
                                            <Field label={text.security.confirmPassword} value={security.confirmPassword} onChange={(value) => updateSecurity('confirmPassword', value)} placeholder={text.security.confirmPassword} type="password" />
                                            <p className="text-sm text-gray-500">{text.security.passwordHelp}</p>
                                            <button
                                                onClick={handleSaveAdminAccess}
                                                disabled={savingAccess}
                                                className="flex items-center gap-2 bg-white px-6 py-3 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-accent-green disabled:opacity-50"
                                            >
                                                {savingAccess ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                                                {savingAccess ? text.security.savingAccess : text.security.saveAccess}
                                            </button>
                                        </div>

                                        <div className="space-y-6 border border-white/5 bg-white/[0.01] p-6">
                                            <button
                                                onClick={() => updateField('maintenanceMode', !settings.maintenanceMode)}
                                                className="flex items-center gap-3 rounded border border-red-500/10 bg-red-500/[0.03] px-4 py-3 text-sm text-white"
                                            >
                                                <span className={`inline-block h-3 w-3 rounded-full ${settings.maintenanceMode ? 'bg-accent-green' : 'bg-gray-600'}`}></span>
                                                {text.security.maintenance}
                                            </button>
                                            <p className="text-sm text-gray-500">{text.security.maintenanceHelp}</p>
                                            <Field label={text.security.maintenanceTitle} value={settings.maintenanceTitle} onChange={(value) => updateField('maintenanceTitle', value)} placeholder={text.security.maintenanceTitle} />
                                            <Field label={text.security.maintenanceMessage} value={settings.maintenanceMessage} onChange={(value) => updateField('maintenanceMessage', value)} placeholder={text.security.maintenanceMessage} multiline rows={5} />
                                            <Field label={text.security.maintenanceEta} value={settings.maintenanceEta} onChange={(value) => updateField('maintenanceEta', value)} placeholder={text.security.maintenanceEta} />
                                            <Field label={text.security.maintenanceNoticeUrl} value={settings.maintenanceNoticeUrl} onChange={(value) => updateField('maintenanceNoticeUrl', value)} placeholder={text.security.maintenanceNoticeUrl} type="url" />
                                        </div>
                                    </section>
                                )}

                                {activeTab === 'notifications' && (
                                    <section className="space-y-6">
                                        <h2 className="border-b border-white/10 pb-4 font-display text-[10px] uppercase tracking-[0.4em] text-white">{text.notifications.section}</h2>
                                        <div className="rounded border border-white/5 bg-white/[0.01] p-4 text-sm text-gray-500">{text.notifications.placeholder}</div>
                                    </section>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
