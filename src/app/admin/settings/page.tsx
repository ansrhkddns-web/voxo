'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Save, Loader2, Globe, Lock, Bell, Database, Type, Music } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useAdminLanguage } from '@/providers/AdminLanguageProvider';
import { getSetting, updateSetting } from '@/app/actions/settingsActions';

const TRANSLATIONS = {
    en: {
        headerTitle: 'System Configuration',
        saveBtnSyncing: 'Synchronizing...',
        saveBtnSave: 'Save Configuration',
        saveSuccess: 'Configuration metrics synchronized',
        pageTitle: 'Platform Settings',
        pageDesc: 'Modify core system parameters and integrations.<br />Changes require brief recalibration of the delivery network.',
        tabGeneral: 'General',
        tabSecurity: 'Security',
        tabIntegrations: 'Integrations',
        tabNotifications: 'Notifications',

        // General Tab
        generalIdent: 'Global Identity',
        identName: 'Platform Designation',
        identDesc: 'Meta Description',
        identEmail: 'Primary Comm Channel',
        languagePref: 'Language Preference',
        languageDesc: 'Platform Interface Language',

        // APIs Tab
        apisTitle: 'External APIs',
        apisSpotify: 'Spotify Client Token',
        apisEncrypted: 'ENCRYPTED',
        apisUpdateBtn: 'Update Key',
        apisGlobalPlaylist: 'Global Spotify Playlist URL',
        apisGlobalPlaylistDesc: 'Enter a Spotify Track/Playlist/Album URL to stream globally on the bottom bar.',

        // Security Tab
        dangerZone: 'Danger Zone',
        maintenanceTitle: 'Maintenance Override',
        maintenanceDesc: 'Temporarily restrict front-end access to all public nodes.',

        // Placeholders
        placeholderSecurity: 'Security settings matrix is currently under construction. Please refer to external Auth provider.',
        placeholderIntegrations: 'Integration hooks for external databases will be available in v2.0.',
        placeholderNotifications: 'System notification routing is currently hardcoded.'
    },
    ko: {
        headerTitle: '시스템 구성',
        saveBtnSyncing: '저장 중...',
        saveBtnSave: '설정 저장',
        saveSuccess: '설정이 성공적으로 보존되었습니다.',
        pageTitle: '플랫폼 설정',
        pageDesc: '시스템의 핵심 파라미터와 연동 설정을 수정합니다.<br />변경 사항은 네트워크 상에 일시적인 재조정을 유발할 수 있습니다.',
        tabGeneral: '일반 설정',
        tabSecurity: '보안',
        tabIntegrations: '연동 설정',
        tabNotifications: '알림',

        // General Tab
        generalIdent: '기본 정보',
        identName: '서비스 이름',
        identDesc: '사이트 설명',
        identEmail: '대표 이메일',
        languagePref: '언어 설정',
        languageDesc: '플랫폼 인터페이스 출력 언어',

        // APIs Tab
        apisTitle: '외부 연동',
        apisSpotify: '스포티파이 API 토큰',
        apisEncrypted: '암호화됨',
        apisUpdateBtn: '키 교체',
        apisGlobalPlaylist: '글로벌 라디오 플레이리스트 URL',
        apisGlobalPlaylistDesc: '홈페이지 하단 바 전역에서 재생할 스포티파이 트랙/플레이리스트/앨범 URL을 입력하세요.',

        // Security Tab
        dangerZone: '위험 구역',
        maintenanceTitle: '점검 모드 작동',
        maintenanceDesc: '일반 방문자의 프론트엔드 퍼블릭 접근을 일시적으로 전면 차단합니다.',

        // Placeholders
        placeholderSecurity: '보안 및 권한 제어 매트릭스는 현재 공사 중입니다. 서드파티 인증 프로바이더를 참조하세요.',
        placeholderIntegrations: '외부 데이터베이스와의 인테그레이션 훅은 v2.0에서 지원될 예정입니다.',
        placeholderNotifications: '시스템 라우팅 알림은 현재 백엔드 코드에 하드코딩 되어있습니다.'
    }
};

type Language = 'en' | 'ko';

export default function AdminSettings() {
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const { language, setLanguage } = useAdminLanguage();

    const [settings, setSettings] = useState({
        siteName: 'VOXO Cinematic Magazine',
        siteDescription: 'Premium Curated Music Experience',
        contactEmail: 'hello@voxo.edit',
        spotifyClientId: '••••••••••••••••••••••••',
        globalPlaylist: '',
        maintenanceMode: false,
    });

    useEffect(() => {
        // Load localStorage
        const savedSettings = localStorage.getItem('voxoAdminSettings');
        if (savedSettings) {
            try {
                // eslint-disable-next-line
                setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }

        // Load DB settings
        const loadDbSettings = async () => {
            const playlistUrl = await getSetting('global_spotify_playlist');
            if (playlistUrl) {
                setSettings(prev => ({ ...prev, globalPlaylist: playlistUrl }));
            }
        };
        loadDbSettings();
    }, []);

    const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate network delay for local storage properties
        await new Promise(resolve => setTimeout(resolve, 800));

        const settingsToSave = { ...settings, language };
        localStorage.setItem('voxoAdminSettings', JSON.stringify(settingsToSave));

        // Save DB properties
        const res = await updateSetting('global_spotify_playlist', settings.globalPlaylist);

        setIsSaving(false);
        if (res.success) {
            toast.success(t.saveSuccess);
        } else {
            toast.error('Local settings saved, but failed to update Global Playlist in DB.');
        }
    };

    const tabs = [
        { id: 'general', name: t.tabGeneral, icon: Globe },
        { id: 'security', name: t.tabSecurity, icon: Lock },
        { id: 'integrations', name: t.tabIntegrations, icon: Database },
        { id: 'notifications', name: t.tabNotifications, icon: Bell },
    ];

    return (
        <div className="flex min-h-screen bg-black text-white font-body selection:bg-accent-green/30 selection:text-white">
            <Toaster position="top-center" />
            <AdminSidebar />

            <main className="flex-1 overflow-y-auto">
                <header className="h-20 border-b border-white/5 bg-black/80 backdrop-blur-xl flex items-center justify-between px-12 sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <span className="w-4 h-px bg-accent-green"></span>
                        <span className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-display">{t.headerTitle}</span>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="text-[10px] uppercase tracking-[0.2em] font-display bg-white text-black px-8 py-2.5 hover:bg-accent-green transition-all flex items-center gap-2 font-bold disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                        {isSaving ? t.saveBtnSyncing : t.saveBtnSave}
                    </button>
                </header>

                <div className="p-12 max-w-5xl mx-auto mt-8 relative z-10">
                    <div className="mb-16">
                        <h1 className="text-4xl font-display font-light tracking-widest uppercase mb-4 text-white">{t.pageTitle}</h1>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-display leading-relaxed" dangerouslySetInnerHTML={{ __html: t.pageDesc }}></p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-16">
                        <aside className="space-y-2">
                            {tabs.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-display transition-all ${activeTab === item.id ? 'bg-white/5 text-accent-green border-l border-accent-green' : 'text-gray-500 hover:text-white hover:bg-white/[0.02] border-l border-transparent'}`}
                                >
                                    <item.icon size={14} />
                                    {item.name}
                                </button>
                            ))}
                        </aside>

                        <div className="space-y-16">
                            {activeTab === 'general' && (
                                <>
                                    <section className="space-y-8">
                                        <h2 className="text-[10px] uppercase tracking-[0.4em] text-white font-display border-b border-white/10 pb-4">{t.languagePref}</h2>
                                        <div className="flex items-center justify-between border border-white/5 bg-white/[0.01] p-6">
                                            <div>
                                                <p className="text-white text-sm font-display tracking-widest uppercase mb-2 flex items-center gap-2"><Type size={14} className="text-accent-green" /> {t.languageDesc}</p>
                                            </div>
                                            <div className="flex gap-2 bg-gray-900 border border-white/10 p-1">
                                                <button
                                                    onClick={() => setLanguage('en')}
                                                    className={`px-4 py-2 text-[10px] uppercase tracking-widest font-display transition-colors ${language === 'en' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                                                >
                                                    English
                                                </button>
                                                <button
                                                    onClick={() => setLanguage('ko')}
                                                    className={`px-4 py-2 text-[10px] uppercase tracking-widest font-display transition-colors ${language === 'ko' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                                                >
                                                    한국어
                                                </button>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-8">
                                        <h2 className="text-[10px] uppercase tracking-[0.4em] text-white font-display border-b border-white/10 pb-4">{t.generalIdent}</h2>

                                        <div className="space-y-8">
                                            <div className="group">
                                                <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 block mb-4 font-display group-focus-within:text-accent-green transition-colors">{t.identName}</label>
                                                <input
                                                    type="text"
                                                    value={settings.siteName}
                                                    onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                                                    className="w-full bg-transparent border-b border-white/10 py-3 text-white text-xl font-light focus:outline-none focus:border-accent-green transition-colors"
                                                />
                                            </div>

                                            <div className="group">
                                                <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 block mb-4 font-display group-focus-within:text-accent-green transition-colors">{t.identDesc}</label>
                                                <textarea
                                                    value={settings.siteDescription}
                                                    onChange={e => setSettings({ ...settings, siteDescription: e.target.value })}
                                                    rows={2}
                                                    className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none focus:border-accent-green transition-colors resize-none leading-relaxed"
                                                />
                                            </div>

                                            <div className="group">
                                                <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 block mb-4 font-display group-focus-within:text-accent-green transition-colors">{t.identEmail}</label>
                                                <input
                                                    type="email"
                                                    value={settings.contactEmail}
                                                    onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                                                    className="w-full bg-transparent border-b border-white/10 py-3 text-white font-mono text-sm focus:outline-none focus:border-accent-green transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </section>
                                </>
                            )}

                            {activeTab === 'security' && (
                                <section className="space-y-8">
                                    <h2 className="text-[10px] uppercase tracking-[0.4em] text-white font-display border-b border-white/10 pb-4">{t.tabSecurity}</h2>
                                    <div className="p-12 border border-white/5 bg-white/[0.01] flex items-center justify-center text-center">
                                        <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] leading-relaxed max-w-sm">{t.placeholderSecurity}</p>
                                    </div>

                                    <h2 className="text-[10px] uppercase tracking-[0.4em] text-red-500/50 font-display border-b border-red-500/10 pb-4 pt-8">{t.dangerZone}</h2>
                                    <div className="border border-red-500/10 bg-red-500/[0.02] p-8 flex items-center justify-between">
                                        <div>
                                            <p className="text-white text-sm font-display tracking-widest uppercase mb-2">{t.maintenanceTitle}</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{t.maintenanceDesc}</p>
                                        </div>
                                        <button
                                            onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                            className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-800'}`}
                                        >
                                            <span className={`w-4 h-4 bg-white rounded-full absolute transition-transform ${settings.maintenanceMode ? 'translate-x-7' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </section>
                            )}

                            {activeTab === 'integrations' && (
                                <section className="space-y-8">
                                    <h2 className="text-[10px] uppercase tracking-[0.4em] text-white font-display border-b border-white/10 pb-4">{t.tabIntegrations}</h2>

                                    <div className="space-y-8">
                                        <div className="group">
                                            <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 block mb-4 font-display group-focus-within:text-accent-green transition-colors">{t.apisSpotify} <span className="text-red-500/50 float-right">{t.apisEncrypted}</span></label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    disabled
                                                    value={settings.spotifyClientId}
                                                    className="w-full bg-gray-950/50 border border-white/5 py-4 px-4 text-gray-500 font-mono text-sm focus:outline-none cursor-not-allowed"
                                                />
                                                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-widest text-accent-green hover:text-white transition-colors font-display">
                                                    {t.apisUpdateBtn}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="group mt-12">
                                            <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 block mb-2 font-display group-focus-within:text-accent-green transition-colors flex items-center gap-2">
                                                <Music size={12} className="text-accent-green" />
                                                {t.apisGlobalPlaylist}
                                            </label>
                                            <p className="text-[10px] text-gray-500 mb-4">{t.apisGlobalPlaylistDesc}</p>
                                            <input
                                                type="text"
                                                value={settings.globalPlaylist || ''}
                                                onChange={e => setSettings({ ...settings, globalPlaylist: e.target.value })}
                                                placeholder="https://open.spotify.com/playlist/..."
                                                className="w-full bg-transparent border-b border-white/10 py-3 text-white font-mono text-sm focus:outline-none focus:border-accent-green transition-colors placeholder:text-gray-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-12 border border-white/5 bg-white/[0.01] flex items-center justify-center text-center mt-8">
                                        <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] leading-relaxed max-w-sm">{t.placeholderIntegrations}</p>
                                    </div>
                                </section>
                            )}

                            {activeTab === 'notifications' && (
                                <section className="space-y-8">
                                    <h2 className="text-[10px] uppercase tracking-[0.4em] text-white font-display border-b border-white/10 pb-4">{t.tabNotifications}</h2>
                                    <div className="p-12 border border-white/5 bg-white/[0.01] flex items-center justify-center text-center">
                                        <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] leading-relaxed max-w-sm">{t.placeholderNotifications}</p>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>
    );
}
