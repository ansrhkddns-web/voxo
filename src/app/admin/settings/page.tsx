'use client';

import React, { useState } from 'react';
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

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
        toast.success('Configuration metrics synchronized');
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
                        {isSaving ? 'Synchronizing...' : 'Save Configuration'}
                    </button>
                </header>

                <div className="p-12 max-w-5xl mx-auto mt-8">
                    <div className="mb-16">
                        <h1 className="text-4xl font-display font-light tracking-widest uppercase mb-4 text-white">Platform Settings</h1>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-display leading-relaxed">Modify core system parameters and integrations.<br />Changes require brief recalibration of the delivery network.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-16">
                        {/* Settings Nav */}
                        <aside className="space-y-2">
                            {[
                                { name: 'General', icon: Globe, active: true },
                                { name: 'Security', icon: Lock, active: false },
                                { name: 'Integrations', icon: Database, active: false },
                                { name: 'Notifications', icon: Bell, active: false },
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
                                <h2 className="text-[10px] uppercase tracking-[0.4em] text-white font-display border-b border-white/10 pb-4">Global Identity</h2>

                                <div className="space-y-8">
                                    <div className="group">
                                        <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 block mb-4 font-display group-focus-within:text-accent-green transition-colors">Platform Designation</label>
                                        <input
                                            type="text"
                                            value={settings.siteName}
                                            onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                                            className="w-full bg-transparent border-b border-white/10 py-3 text-white text-xl font-light focus:outline-none focus:border-accent-green transition-colors"
                                        />
                                    </div>

                                    <div className="group">
                                        <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 block mb-4 font-display group-focus-within:text-accent-green transition-colors">Meta Description</label>
                                        <textarea
                                            value={settings.siteDescription}
                                            onChange={e => setSettings({ ...settings, siteDescription: e.target.value })}
                                            rows={2}
                                            className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none focus:border-accent-green transition-colors resize-none leading-relaxed"
                                        />
                                    </div>

                                    <div className="group">
                                        <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 block mb-4 font-display group-focus-within:text-accent-green transition-colors">Primary Comm Channel</label>
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
                                <h2 className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-display border-b border-white/5 pb-4">External APIs</h2>

                                <div className="space-y-8">
                                    <div className="group">
                                        <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 block mb-4 font-display group-focus-within:text-accent-green transition-colors">Spotify Client Token <span className="text-red-500/50 float-right">ENCRYPTED</span></label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                disabled
                                                value={settings.spotifyClientId}
                                                className="w-full bg-gray-950/50 border border-white/5 py-4 px-4 text-gray-500 font-mono text-sm focus:outline-none cursor-not-allowed"
                                            />
                                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-widest text-accent-green hover:text-white transition-colors font-display">
                                                Update Key
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 3 */}
                            <section className="space-y-8">
                                <h2 className="text-[10px] uppercase tracking-[0.4em] text-red-500/50 font-display border-b border-red-500/10 pb-4">Danger Zone</h2>

                                <div className="border border-red-500/10 bg-red-500/[0.02] p-8 flex items-center justify-between">
                                    <div>
                                        <p className="text-white text-sm font-display tracking-widest uppercase mb-2">Maintenance Override</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Temporarily restrict front-end access to all public nodes.</p>
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
