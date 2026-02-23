'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Save, Loader2, Globe, Lock, Bell, Database, Type, Music, Sparkles, Bot } from 'lucide-react';
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
        tabAIAgents: 'AI Agents',

        // AI Agents Tab
        aiAgentsTitle: 'AI Core Prompts',
        aiPromptResearch: 'Research Agent Prompt',
        aiPromptWrite: 'Editor Agent Prompt',
        aiPromptSeo: 'SEO Agent Prompt',
        aiPromptConcept: 'Default Editorial Concept',
        aiPromptDesc: 'Modify the exact instructions injected into the AI modules.',

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
        apisGemini: 'Google Gemini API Key',
        apisGeminiDesc: 'Enter your Gemini API key from Google AI Studio to enable AI features.',
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
        tabAIAgents: 'AI 에이전트',

        // AI Agents Tab
        aiAgentsTitle: 'AI 코어 프롬프트',
        aiPromptResearch: '리서치 에이전트 지시어',
        aiPromptWrite: '작성 에이전트 지시어',
        aiPromptSeo: 'SEO 에이전트 지시어',
        aiPromptConcept: '기본 포스팅 컨셉 (미입력 시 대체값)',
        aiPromptDesc: '각 AI 모듈에 주입되는 핵심 프롬프트(명령어)를 자유롭게 수정하세요.',

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
        apisGemini: '구글 제미나이(Gemini) API Key',
        apisGeminiDesc: 'AI 포스팅 기능을 활성화하기 위해 발급받은 제미나이 API 키를 입력하세요.',
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
        geminiApiKey: '',
        globalPlaylist: '',
        maintenanceMode: false,
        aiPromptResearch: `You are an expert music researcher. Gather factual information about the artist "{artistName}" and the song "{songTitle}".\nProvide a concise summary including:\n- Artist background (genre, debut, significant achievements)\n- Song details (release year, album, theme, producer if known)\n- Any interesting trivia or context about this specific track.\nDo not write a review, just bullet points of facts.`,
        aiPromptWrite: `당신은 'Voxo'라는 이름의 고품격 시네마틱 음악 매거진의 수석 에디터입니다.\n다음 팩트를 바탕으로 리뷰 기사를 약 1500자 분량으로 작성해주세요.\n\n[팩트 자료]\n{facts}\n\n[기사 컨셉/요청사항]\n{concept}\n[카테고리 분류: {categoryName}]\n\n요구사항:\n1. 언어: 이 기사는 무조건 '{language}' 언어로만 작성되어야 합니다.\n2. 제목: 상징적이고 눈길을 끄는 시네마틱한 제목 하나. (제일 첫 줄에 '제목: [작성한 제목]' 이라고 명시)\n3. 내용: 곡의 분위기와 아티스트의 행보를 문학적이고 깊이 있는 어조로 서술하세요. (HTML이 아닌 일반 Markdown 텍스트로 문단을 적절히 나누어 작성)\n4. 부제목(Intro): Voxo 매거진 특유의 시적인 서두(Intro) 한 줄을 제목 아래에 포함해주세요. (서두는 '서두: [작성한 서두]' 라고 명시)`,
        aiPromptSeo: `다음 기사 내용을 바탕으로, 구글 검색 엔진 최적화(SEO)에 가장 적합한 메타 태그/키워드들을 추출해주세요.\n\n[기존 태그 목록]\n{existingTags}\n\n[기사 내용]\n{articleText}\n\n요구사항:\n1. 먼저, 위의 [기존 태그 목록] 중에서 이 기사의 내용과 정확히 일치하거나 매우 연관성이 높은 태그가 있다면 최우선으로 선택하여 결과의 맨 앞쪽에 배치하세요.\n2. 기존 태그만으로는 부족하거나 이 기사만을 위한 필수 키워드가 있다면 추가하되, 문장이 아닌 '매우 짧고 단순한 단어' 형태로 최대 4~5개까지만 덧붙이세요.\n3. 결과는 오직 쉼표(,)로만 구분된 텍스트 형식으로 출력해야 합니다.`,
        aiPromptConcept: `음악의 철학적, 감성적 분석에 초점을 맞출 것`,
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
            const geminiKey = await getSetting('gemini_api_key');
            const lang = await getSetting('ai_post_language');
            const cat = await getSetting('ai_post_category');
            const research = await getSetting('ai_prompt_research');
            const write = await getSetting('ai_prompt_write');
            const seo = await getSetting('ai_prompt_seo');
            const concept = await getSetting('ai_prompt_concept');

            setSettings(prev => ({
                ...prev,
                ...(playlistUrl ? { globalPlaylist: playlistUrl } : {}),
                ...(geminiKey ? { geminiApiKey: geminiKey } : {}),
                ...(lang ? { aiPostLanguage: lang } : {}),
                ...(cat ? { aiPostCategory: cat } : {}),
                ...(research ? { aiPromptResearch: research } : {}),
                ...(write ? { aiPromptWrite: write } : {}),
                ...(seo ? { aiPromptSeo: seo } : {}),
                ...(concept ? { aiPromptConcept: concept } : {})
            }));
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
        await updateSetting('global_spotify_playlist', settings.globalPlaylist);
        await updateSetting('ai_prompt_research', settings.aiPromptResearch);
        await updateSetting('ai_prompt_write', settings.aiPromptWrite);
        await updateSetting('ai_prompt_seo', settings.aiPromptSeo);
        await updateSetting('ai_prompt_concept', settings.aiPromptConcept);
        const res2 = await updateSetting('gemini_api_key', settings.geminiApiKey || '');

        setIsSaving(false);
        if (res2.success) {
            toast.success(t.saveSuccess);
        } else {
            toast.error('Local settings saved, but failed to update Database.');
        }
    };

    const tabs = [
        { id: 'general', name: t.tabGeneral, icon: Globe },
        { id: 'ai_agents', name: t.tabAIAgents, icon: Bot },
        { id: 'integrations', name: t.tabIntegrations, icon: Database },
        { id: 'security', name: t.tabSecurity, icon: Lock },
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
                                    className={`w - full flex items - center gap - 3 px - 4 py - 3 text - [10px] uppercase tracking - [0.2em] font - display transition - all ${activeTab === item.id ? 'bg-white/5 text-accent-green border-l border-accent-green' : 'text-gray-500 hover:text-white hover:bg-white/[0.02] border-l border-transparent'} `}
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
                                                    className={`px - 4 py - 2 text - [10px] uppercase tracking - widest font - display transition - colors ${language === 'en' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'} `}
                                                >
                                                    English
                                                </button>
                                                <button
                                                    onClick={() => setLanguage('ko')}
                                                    className={`px - 4 py - 2 text - [10px] uppercase tracking - widest font - display transition - colors ${language === 'ko' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'} `}
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
                                            className={`w - 12 h - 6 rounded - full transition - colors relative flex items - center ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-800'} `}
                                        >
                                            <span className={`w - 4 h - 4 bg - white rounded - full absolute transition - transform ${settings.maintenanceMode ? 'translate-x-7' : 'translate-x-1'} `} />
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
                                                <Sparkles size={12} className="text-accent-green" />
                                                {t.apisGemini}
                                            </label>
                                            <p className="text-[10px] text-gray-500 mb-4">{t.apisGeminiDesc}</p>
                                            <input
                                                type="text"
                                                value={settings.geminiApiKey || ''}
                                                onChange={e => setSettings({ ...settings, geminiApiKey: e.target.value })}
                                                placeholder="AIzaSy..."
                                                className="w-full bg-transparent border-b border-white/10 py-3 text-white font-mono text-sm focus:outline-none focus:border-accent-green transition-colors placeholder:text-gray-700"
                                            />
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

                            {activeTab === 'ai_agents' && (
                                <section className="space-y-8">
                                    <h2 className="text-[10px] uppercase tracking-[0.4em] text-white font-display border-b border-white/10 pb-4">{t.aiAgentsTitle}</h2>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{t.aiPromptDesc}</p>

                                    <div className="space-y-12">
                                        <div className="group">
                                            <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 block mb-4 font-display group-focus-within:text-accent-green transition-colors">{t.aiPromptConcept}</label>
                                            <textarea
                                                value={settings.aiPromptConcept}
                                                onChange={e => setSettings({ ...settings, aiPromptConcept: e.target.value })}
                                                rows={2}
                                                className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none focus:border-accent-green transition-colors resize-y leading-relaxed text-sm font-mono"
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 block mb-4 font-display group-focus-within:text-accent-green transition-colors">{t.aiPromptResearch}</label>
                                            <p className="text-[8px] text-gray-500 mb-2 font-mono">Available variables: {'{artistName}'}, {'{songTitle}'}</p>
                                            <textarea
                                                value={settings.aiPromptResearch}
                                                onChange={e => setSettings({ ...settings, aiPromptResearch: e.target.value })}
                                                rows={5}
                                                className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none focus:border-accent-green transition-colors resize-y leading-relaxed text-sm font-mono"
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 block mb-4 font-display group-focus-within:text-accent-green transition-colors">{t.aiPromptWrite}</label>
                                            <p className="text-[8px] text-gray-500 mb-2 font-mono">Available variables: {'{facts}'}, {'{concept}'}, {'{language}'}, {'{categoryName}'}</p>
                                            <textarea
                                                value={settings.aiPromptWrite}
                                                onChange={e => setSettings({ ...settings, aiPromptWrite: e.target.value })}
                                                rows={10}
                                                className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none focus:border-accent-green transition-colors resize-y leading-relaxed text-sm font-mono"
                                            />
                                        </div>

                                        <div className="group">
                                            <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 block mb-4 font-display group-focus-within:text-accent-green transition-colors">{t.aiPromptSeo}</label>
                                            <p className="text-[8px] text-gray-500 mb-2 font-mono">Available variables: {'{articleText}'}, {'{existingTags}'}</p>
                                            <textarea
                                                value={settings.aiPromptSeo}
                                                onChange={e => setSettings({ ...settings, aiPromptSeo: e.target.value })}
                                                rows={4}
                                                className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none focus:border-accent-green transition-colors resize-y leading-relaxed text-sm font-mono"
                                            />
                                        </div>
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
