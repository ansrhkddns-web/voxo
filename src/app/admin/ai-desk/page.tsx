'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, Music, Mic2, Tag, CheckCircle2, ChevronRight, Terminal, Database, Activity, Type, Globe } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getCategories } from '@/app/actions/categoryActions';

type AgentStatus = 'idle' | 'research' | 'write' | 'seo' | 'media' | 'done';

interface LogEntry {
    time: string;
    message: string;
}

export default function AIDeskPage() {
    const [step, setStep] = useState<'form' | 'dashboard'>('form');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Dashboard State
    const [currentAgent, setCurrentAgent] = useState<AgentStatus>('idle');
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Form State
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        artistName: '',
        songTitle: '',
        language: 'English',
        categoryId: '',
        concept: ''
    });

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const cats = await getCategories();
                setCategories(cats || []);
                if (cats && cats.length > 0) {
                    setFormData(prev => ({ ...prev, categoryId: cats[0].id }));
                }
            } catch (e) {
                console.error("Failed to fetch categories", e);
            }
        };
        fetchCats();
    }, []);

    const scrollToBottom = () => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (step === 'dashboard') {
            scrollToBottom();
        }
    }, [logs, step]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setStep('dashboard');
        setLogs([]);
        setProgress(0);
        setCurrentAgent('idle');

        try {
            // Append a timestamp to completely bypass Next.js route caching
            const timestamp = new Date().getTime();
            const response = await fetch(`/api/ai/generate-v3?t=${timestamp}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                },
                body: JSON.stringify(formData),
                cache: 'no-store', // Force Next.js App Router to bypass client cache
            });

            if (!response.ok) {
                throw new Error('API Request Failed');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) throw new Error("No reader available");

            let done = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;

                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n\n');

                    for (const line of lines) {
                        if (!line.trim()) continue;

                        const eventMatch = line.match(/event: (.*)/);
                        const dataMatch = line.match(/data: (.*)/);

                        if (eventMatch && dataMatch) {
                            const event = eventMatch[1];
                            const data = JSON.parse(dataMatch[1]);

                            if (event === 'log') {
                                const now = new Date();
                                const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                                setLogs(prev => [...prev, { time: timeStr, message: data.message }]);
                            } else if (event === 'state') {
                                setCurrentAgent(data.currentAgent);
                                setProgress(data.progress);
                            } else if (event === 'complete') {
                                setCurrentAgent('done');
                                setProgress(100);
                                setTimeout(() => {
                                    router.push(`/admin/editor?id=${data.postId}`);
                                }, 2000);
                            } else if (event === 'error') {
                                throw new Error(data.message);
                            }
                        }
                    }
                }
            }

        } catch (err: any) {
            setError(err.message || '서버 통신 중 오류가 발생했습니다.');
            setStep('form');
        } finally {
            setIsLoading(false);
        }
    }

    const agents = [
        { id: 'research', name: '리서치 에이전트', model: 'Gemini 1.5 Pro', icon: Database },
        { id: 'write', name: '작성 에이전트', model: 'Gemini 1.5 Pro', icon: Type },
        { id: 'seo', name: '비평/SEO 에이전트', model: 'Gemini 1.5 Pro', icon: Tag },
        { id: 'media', name: '미디어 크롤러', model: 'Internal API', icon: Music },
    ];

    const getAgentState = (agentId: string) => {
        const order = ['idle', 'research', 'write', 'seo', 'media', 'done'];
        const currentIndex = order.indexOf(currentAgent);
        const agentIndex = order.indexOf(agentId);

        if (currentIndex > agentIndex) return 'done';
        if (currentIndex === agentIndex) return 'active';
        return 'waiting';
    };

    return (
        <div className="flex min-h-screen bg-[#050505] text-white font-body selection:bg-accent-green/30 selection:text-white">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 md:p-12 mb-20 max-w-7xl mx-auto font-display">

                    <header className="mb-12 flex items-center justify-between border-b border-white/5 pb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Sparkles className="text-accent-green" size={24} />
                                <h1 className="text-2xl tracking-[0.2em] font-light uppercase text-white">AI Auto Desk V3.1</h1>
                            </div>
                            <p className="text-gray-500 text-[10px] uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></span>
                                시스템 정상 가동 • 실시간 다중 에이전트 파이프라인
                            </p>
                        </div>
                        {step === 'dashboard' && (
                            <div className="text-right flex flex-col items-end gap-1">
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest">전체 진행률</span>
                                <span className="text-2xl font-light tracking-wider text-accent-green">{progress}%</span>
                            </div>
                        )}
                    </header>

                    {error && (
                        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs tracking-wider flex items-center gap-3">
                            <div className="w-1 h-1 rounded-full bg-red-500 animate-ping"></div>
                            {error}
                        </div>
                    )}

                    {step === 'form' ? (
                        <form onSubmit={handleSubmit} className="space-y-12 max-w-3xl animate-fade-in-up">
                            <div className="space-y-8 bg-black/40 border border-white/5 p-8 md:p-10 relative group">
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-gray-500 focus-within:text-accent-green transition-colors">
                                            <Mic2 size={12} /> Target Artist
                                        </label>
                                        <input
                                            type="text"
                                            name="artistName"
                                            required
                                            value={formData.artistName}
                                            onChange={handleInputChange}
                                            placeholder="The Weeknd"
                                            className="w-full bg-transparent border-b border-white/10 py-3 text-white text-sm focus:border-accent-green outline-none transition-colors placeholder:text-gray-800 focus:placeholder:text-gray-600"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-gray-500 focus-within:text-accent-green transition-colors">
                                            <Music size={12} /> Target Track
                                        </label>
                                        <input
                                            type="text"
                                            name="songTitle"
                                            required
                                            value={formData.songTitle}
                                            onChange={handleInputChange}
                                            placeholder="Blinding Lights"
                                            className="w-full bg-transparent border-b border-white/10 py-3 text-white text-sm focus:border-accent-green outline-none transition-colors placeholder:text-gray-800 focus:placeholder:text-gray-600"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6 pt-6 border-t border-white/5">
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-gray-500 focus-within:text-accent-green transition-colors">
                                            <Globe size={12} /> 포스팅 작성 언어 (Language)
                                        </label>
                                        <select
                                            name="language"
                                            value={formData.language}
                                            onChange={handleInputChange}
                                            className="w-full bg-black border-b border-white/10 py-3 text-white focus:outline-none focus:border-accent-green transition-colors text-sm font-mono appearance-none uppercase tracking-widest"
                                        >
                                            <option value="English">ENGLISH</option>
                                            <option value="Korean">한국어</option>
                                            <option value="Japanese">日本語</option>
                                            <option value="Chinese">中文</option>
                                            <option value="Spanish">Español</option>
                                            <option value="French">Français</option>
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-gray-500 focus-within:text-accent-green transition-colors">
                                            <Database size={12} /> 저장 될 카테고리 (및 글 톤앤매너 설정)
                                        </label>
                                        <select
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleInputChange}
                                            className="w-full bg-black border-b border-white/10 py-3 text-white focus:outline-none focus:border-accent-green transition-colors text-sm font-mono appearance-none uppercase tracking-widest"
                                        >
                                            {categories.map((cat: any) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-white/5">
                                    <label className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-gray-500 focus-within:text-accent-green transition-colors">
                                        <Tag size={12} /> Direction / Concept (Optional)
                                    </label>
                                    <textarea
                                        name="concept"
                                        rows={3}
                                        value={formData.concept}
                                        onChange={handleInputChange}
                                        placeholder="어떤 감성으로 글을 작성할지 AI에게 지시해 주세요."
                                        className="w-full bg-transparent border-b border-white/10 py-3 text-white text-sm focus:border-accent-green outline-none transition-colors placeholder:text-gray-800 focus:placeholder:text-gray-600 resize-none"
                                    ></textarea>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full md:w-auto bg-white text-black font-display uppercase tracking-[0.2em] px-12 py-4 text-[10px] font-semibold hover:bg-accent-green hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                <span className="absolute inset-0 w-full h-full bg-white group-hover:bg-accent-green transition-colors z-0"></span>
                                <span className="relative z-10 flex items-center gap-3">
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            <span>INITIALIZING PIPELINE...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Activity size={14} className="group-hover:animate-pulse" />
                                            <span>파이프라인 가동 (Deploy Agents)</span>
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>
                    ) : (
                        // Dashboard UI
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">

                            {/* Left Panel: Agent Pipeline */}
                            <div className="lg:col-span-8 space-y-8">
                                <h3 className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-6 flex items-center gap-2">
                                    <Activity size={12} /> Active Agents Workflow
                                </h3>

                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-2 items-center justify-between overflow-x-auto pb-4 custom-scrollbar">
                                    {agents.map((agent, index) => {
                                        const state = getAgentState(agent.id);
                                        const Icon = agent.icon;

                                        return (
                                            <React.Fragment key={agent.id}>
                                                <div className={`relative flex flex-col justify-between w-full sm:w-48 h-32 p-4 rounded-lg border transition-all duration-500 ${state === 'active'
                                                    ? 'bg-accent-green/10 border-accent-green/50 shadow-[0_0_20px_rgba(20,200,100,0.1)]'
                                                    : state === 'done'
                                                        ? 'bg-black border-white/20 opacity-60'
                                                        : 'bg-black border-white/5 opacity-40'
                                                    }`}>
                                                    {/* Top Badges */}
                                                    <div className="flex items-start justify-between">
                                                        <div className={`p-2 rounded-md ${state === 'active' ? 'bg-accent-green text-black' : 'bg-white/5 text-gray-400'}`}>
                                                            <Icon size={14} />
                                                        </div>
                                                        {state === 'done' && (
                                                            <span className="text-[8px] uppercase tracking-widest text-accent-green flex items-center gap-1 bg-accent-green/10 px-2 py-1 rounded-full">
                                                                <CheckCircle2 size={10} /> 완료
                                                            </span>
                                                        )}
                                                        {state === 'active' && (
                                                            <span className="flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-ping"></span>
                                                                <span className="text-[8px] uppercase tracking-widest text-accent-green">진행중</span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Text */}
                                                    <div>
                                                        <h4 className="text-xs font-semibold tracking-wider text-white mb-1">{agent.name}</h4>
                                                        <p className="text-[9px] text-gray-500 tracking-wider uppercase">{agent.model}</p>
                                                    </div>

                                                    {/* Active Progress Bar indicator */}
                                                    {state === 'active' && (
                                                        <div className="absolute bottom-0 left-0 h-0.5 bg-accent-green w-full animate-pulse"></div>
                                                    )}
                                                </div>

                                                {/* Arrow */}
                                                {index < agents.length - 1 && (
                                                    <div className="hidden sm:flex text-gray-700">
                                                        <ChevronRight size={16} className={state === 'done' ? 'text-accent-green' : ''} />
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>

                                {/* Virtual Token Usage (Fake visualizer for pro aesthetics) */}
                                <div className="mt-12 p-6 border border-white/5 bg-black/40 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                    <div className="space-y-1">
                                        <h4 className="text-[9px] uppercase tracking-[0.3em] text-gray-500">Session Metrics</h4>
                                        <p className="text-xl font-light tracking-widest text-white">12,450 <span className="text-[10px] text-gray-600">TOKENS EXPENDED</span></p>
                                    </div>
                                    <div className="w-full sm:w-1/2 space-y-2">
                                        <div className="flex justify-between text-[8px] uppercase tracking-widest text-gray-500">
                                            <span>API Quota</span>
                                            <span className="text-accent-green">Optimized</span>
                                        </div>
                                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-accent-green w-[24%] transition-all duration-1000"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel: Live Terminal */}
                            <div className="lg:col-span-4 h-[400px] lg:h-auto border border-white/10 bg-[#0a0a0a] rounded-lg overflow-hidden flex flex-col font-mono text-xs shadow-2xl relative group">
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-green/20 to-transparent"></div>

                                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/50">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Terminal size={12} />
                                        <span className="uppercase tracking-widest text-[9px]">Live Event Source</span>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-gray-800"></div>
                                        <div className="w-2 h-2 rounded-full bg-gray-800"></div>
                                        <div className="w-2 h-2 rounded-full bg-accent-green/50 animate-pulse"></div>
                                    </div>
                                </div>

                                <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                                    {logs.map((log, i) => (
                                        <div key={i} className="flex gap-3 leading-relaxed animate-fade-in-up">
                                            <span className="text-gray-600 shrink-0">{log.time}</span>
                                            <span className="text-gray-300 break-words font-light">
                                                {/* Color syntax highlighting for logs */}
                                                {log.message.includes('[시스템]') ? (
                                                    <span className="text-accent-green mr-2">[SYS]</span>
                                                ) : log.message.includes('[ERROR]') ? (
                                                    <span className="text-red-400 mr-2">[ERR]</span>
                                                ) : log.message.includes('[Gemini') || log.message.includes('[DeepSeek') || log.message.includes('[Claude') ? (
                                                    <span className="text-blue-400 mr-2">{log.message.split(']')[0] + ']'}</span>
                                                ) : null}
                                                {log.message.replace(/\[시스템\]|\[ERROR\]|\[Gemini.*?\]|\[DeepSeek.*?\]|\[Claude.*?\]/, '')}
                                            </span>
                                        </div>
                                    ))}
                                    {currentAgent !== 'done' && (
                                        <div className="flex gap-3 text-gray-600 animate-pulse">
                                            <span>--:--:--</span>
                                            <span>Waiting for sequence...</span>
                                        </div>
                                    )}
                                    <div ref={logsEndRef} />
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
