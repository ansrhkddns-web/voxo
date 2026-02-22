'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Save, Loader2, Globe, Lock, Bell, Database } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminSettings() {
    const [isSaving, setIsSaving] = useState(false);

    // Dummy state for UI demonstration
    const [settings, setSettings] = useState({
        siteName: 'VOXO Cinematic Magazine',
        siteDescription: 'Premium Curated Music Experience',
        contactEmail: 'hello@voxo.edit',
        spotifyClientId: '••••••••••••••••••••••••',
        maintenanceMode: false,
    });

    // Load from local storage on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('voxoAdminSettings');
        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings));
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        localStorage.setItem('voxoAdminSettings', JSON.stringify(settings));
        setIsSaving(false);
        toast.success('설정이 성공적으로 저장되었습니다.');
    };

    return (
        <div className="flex min-h-screen bg-black text-white font-body selection:bg-accent-green/30 selection:text-white">
            <Toaster position="top-center" />
            <AdminSidebar />

            <main className="flex-1 overflow-y-auto">
                {/* Header */}
                <header className="h-20 border-b border-white/5 bg-black/80 backdrop-blur-xl flex items-center justify-between px-12 sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <span className="w-4 h-px bg-accent-green"></span>
                        <span className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-display">System Configuration</span>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="text-[10px] uppercase tracking-[0.2em] font-display bg-white text-black px-8 py-2.5 hover:bg-accent-green transition-all flex items-center gap-2 font-bold"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                        {isSaving ? '저장 중...' : '설정 저장'}
                    </button>
                </header>

                <div className="p-12 max-w-5xl mx-auto mt-8">
                    <div className="mb-16">
                        <h1 className="text-4xl font-display font-light tracking-widest uppercase mb-4 text-white">플랫폼 설정</h1>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-display leading-relaxed">시스템의 핵심 파라미터와 연동 설정을 수정합니다.<br />변경 사항은 네트워크 상에 일시적인 재조정을 유발할 수 있습니다.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-16">
                        {/* Settings Nav */}
                        <aside className="space-y-2">
                            {[
                                { name: '일반 설정', icon: Globe, active: true },
                                { name: '보안', icon: Lock, active: false },
                                { name: '연동 설정', icon: Database, active: false },
                                { name: '알림', icon: Bell, active: false },
                            ].map(item => (
                                <button key={item.name} className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-display transition-all ${item.active ? 'bg-white/5 text-accent-green border-l border-accent-green' : 'text-gray-500 hover:text-white hover:bg-white/[0.02]'}`}>
                                    <item.icon size={14} />
                                    {item.name}
                                </button>
                            ))}
                        </aside>

                        {/* Settings Form */}
                        <div className="space-y-16">
                            {/* Section 1 */}
                            <section className="space-y-8">
                                <h2 className="text-[10px] uppercase tracking-[0.4em] text-white font-display border-b border-white/10 pb-4">기본 정보</h2>

                                <div className="space-y-8">
                                    <div className="group">
                                        <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 block mb-4 font-display group-focus-within:text-accent-green transition-colors">서비스 이름</label>
                                        <input
                                            type="text"
                                            value={settings.siteName}
                                            onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                                            className="w-full bg-transparent border-b border-white/10 py-3 text-white text-xl font-light focus:outline-none focus:border-accent-green transition-colors"
                                        />
                                    </div>

                                    <div className="group">
                                        <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 block mb-4 font-display group-focus-within:text-accent-green transition-colors">사이트 설명</label>
                                        <textarea
                                            value={settings.siteDescription}
                                            onChange={e => setSettings({ ...settings, siteDescription: e.target.value })}
                                            rows={2}
                                            className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none focus:border-accent-green transition-colors resize-none leading-relaxed"
                                        />
                                    </div>

                                    <div className="group">
                                        <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 block mb-4 font-display group-focus-within:text-accent-green transition-colors">대표 이메일</label>
                                        <input
                                            type="email"
                                            value={settings.contactEmail}
                                            onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                                            className="w-full bg-transparent border-b border-white/10 py-3 text-white font-mono text-sm focus:outline-none focus:border-accent-green transition-colors"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Section 2 */}
                            <section className="space-y-8">
                                <h2 className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-display border-b border-white/5 pb-4">외부 연동</h2>

                                <div className="space-y-8">
                                    <div className="group">
                                        <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 block mb-4 font-display group-focus-within:text-accent-green transition-colors">스포티파이 API 토큰 <span className="text-red-500/50 float-right">암호화됨</span></label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                disabled
                                                value={settings.spotifyClientId}
                                                className="w-full bg-gray-950/50 border border-white/5 py-4 px-4 text-gray-500 font-mono text-sm focus:outline-none cursor-not-allowed"
                                            />
                                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-widest text-accent-green hover:text-white transition-colors font-display">
                                                키 교체
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 3 */}
                            <section className="space-y-8">
                                <h2 className="text-[10px] uppercase tracking-[0.4em] text-red-500/50 font-display border-b border-red-500/10 pb-4">위험 구역</h2>

                                <div className="border border-red-500/10 bg-red-500/[0.02] p-8 flex items-center justify-between">
                                    <div>
                                        <p className="text-white text-sm font-display tracking-widest uppercase mb-2">점검 모드 작동</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">일반 방문자의 프론트엔드 퍼블릭 접근을 일시적으로 전면 차단합니다.</p>
                                    </div>
                                    <button
                                        onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                        className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-800'}`}
                                    >
                                        <span className={`w-4 h-4 bg-white rounded-full absolute transition-transform ${settings.maintenanceMode ? 'translate-x-7' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            {/* Grainy Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>
    );
}
