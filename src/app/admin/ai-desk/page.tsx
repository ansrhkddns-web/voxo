'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  Database,
  Globe,
  Loader2,
  Mic2,
  Music,
  Sparkles,
  Tag,
  Terminal,
  Type,
} from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getCategories } from '@/app/actions/categoryActions';
import type { CategoryRecord } from '@/types/content';

type AgentStatus = 'idle' | 'research' | 'write' | 'seo' | 'media' | 'done';

type DashboardStep = 'form' | 'dashboard';

interface LogEntry {
  time: string;
  message: string;
}

interface FormState {
  artistName: string;
  songTitle: string;
  language: string;
  categoryId: string;
  concept: string;
}

interface StatePayload {
  currentAgent: AgentStatus;
  progress: number;
}

interface CompletePayload {
  postId: string;
}

interface LogPayload {
  message: string;
}

interface ErrorPayload {
  message: string;
}

function isAgentStatus(value: string): value is AgentStatus {
  return ['idle', 'research', 'write', 'seo', 'media', 'done'].includes(value);
}

function getTimeLabel() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
}

export default function AIDeskPage() {
  const router = useRouter();
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<DashboardStep>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAgent, setCurrentAgent] = useState<AgentStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [formData, setFormData] = useState<FormState>({
    artistName: '',
    songTitle: '',
    language: 'English',
    categoryId: '',
    concept: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = (await getCategories()) as CategoryRecord[] | null;
        const nextCategories = data || [];
        setCategories(nextCategories);

        if (nextCategories[0]?.id) {
          setFormData((prev) => ({
            ...prev,
            categoryId: prev.categoryId || nextCategories[0].id,
          }));
        }
      } catch (fetchError) {
        console.error('Failed to fetch categories', fetchError);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (step === 'dashboard') {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, step]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    setStep('dashboard');
    setLogs([]);
    setProgress(0);
    setCurrentAgent('idle');

    try {
      const response = await fetch(`/api/ai/generate-v3?t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
        cache: 'no-store',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('AI 초안 요청에 실패했습니다.');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('스트림 응답을 읽지 못했습니다.');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let finished = false;

      while (!finished) {
        const { value, done } = await reader.read();
        finished = done;
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() || '';

        for (const block of blocks) {
          const lines = block.split('\n');
          const eventLine = lines.find((line) => line.startsWith('event: '));
          const dataLine = lines.find((line) => line.startsWith('data: '));

          if (!eventLine || !dataLine) {
            continue;
          }

          const eventName = eventLine.replace('event: ', '').trim();
          const payloadText = dataLine.replace('data: ', '').trim();

          if (!payloadText) {
            continue;
          }

          const payload = JSON.parse(payloadText) as LogPayload | StatePayload | CompletePayload | ErrorPayload;

          if (eventName === 'log') {
            const logPayload = payload as LogPayload;
            setLogs((prev) => [...prev, { time: getTimeLabel(), message: logPayload.message }]);
            continue;
          }

          if (eventName === 'state') {
            const statePayload = payload as StatePayload;
            if (isAgentStatus(statePayload.currentAgent)) {
              setCurrentAgent(statePayload.currentAgent);
            }
            setProgress(statePayload.progress);
            continue;
          }

          if (eventName === 'complete') {
            const completePayload = payload as CompletePayload;
            setCurrentAgent('done');
            setProgress(100);
            setTimeout(() => {
              router.push(`/admin/editor?id=${completePayload.postId}`);
            }, 1200);
            continue;
          }

          if (eventName === 'error') {
            const errorPayload = payload as ErrorPayload;
            throw new Error(errorPayload.message);
          }
        }
      }
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : '서버 통신 중 오류가 발생했습니다.');
      setStep('form');
    } finally {
      setIsLoading(false);
    }
  };

  const agents = [
    { id: 'research', name: '리서치 에이전트', model: 'Gemini 2.5 Flash', icon: Database },
    { id: 'write', name: '라이팅 에이전트', model: 'Gemini 2.5 Flash', icon: Type },
    { id: 'seo', name: 'SEO 에이전트', model: 'Gemini 2.5 Flash', icon: Tag },
    { id: 'media', name: '미디어 보강', model: 'Spotify / YouTube', icon: Music },
  ] as const;

  const getAgentState = (agentId: AgentStatus) => {
    const order: AgentStatus[] = ['idle', 'research', 'write', 'seo', 'media', 'done'];
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
        <div className="mx-auto mb-20 max-w-7xl p-8 font-display md:p-12">
          <header className="mb-12 flex items-center justify-between border-b border-white/5 pb-6">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <Sparkles className="text-accent-green" size={24} />
                <h1 className="text-2xl font-light uppercase tracking-[0.2em] text-white">
                  AI Auto Desk
                </h1>
              </div>
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500">
                <span className="h-2 w-2 animate-pulse rounded-full bg-accent-green"></span>
                초안 생성 파이프라인과 실시간 진행 상태를 한 화면에서 확인합니다.
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 text-right">
              <span className="text-[10px] uppercase tracking-widest text-gray-500">전체 진행률</span>
              <span className="text-2xl font-light tracking-wider text-accent-green">{progress}%</span>
            </div>
          </header>

          {error && (
            <div className="mb-8 flex items-center gap-3 border border-red-500/20 bg-red-500/10 p-4 text-xs tracking-wider text-red-400">
              <div className="h-1 w-1 animate-ping rounded-full bg-red-500"></div>
              {error}
            </div>
          )}

          <div className="mb-16 grid grid-cols-1 gap-8 animate-fade-in lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-8">
              <h3 className="mb-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gray-500">
                <Activity size={12} /> Active Agents Workflow
              </h3>

              <div className="custom-scrollbar flex items-center justify-between gap-4 overflow-x-auto pb-4 sm:flex-row sm:gap-2">
                {agents.map((agent, index) => {
                  const state = getAgentState(agent.id);
                  const Icon = agent.icon;

                  return (
                    <React.Fragment key={agent.id}>
                      <div
                        className={`relative flex h-32 w-full flex-col justify-between rounded-lg border p-4 transition-all duration-500 sm:w-48 ${
                          state === 'active'
                            ? 'border-accent-green/50 bg-accent-green/10 shadow-[0_0_20px_rgba(20,200,100,0.1)]'
                            : state === 'done'
                              ? 'border-white/20 bg-black opacity-60'
                              : 'border-white/5 bg-black opacity-40'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div
                            className={`rounded-md p-2 ${
                              state === 'active'
                                ? 'bg-accent-green text-black'
                                : 'bg-white/5 text-gray-400'
                            }`}
                          >
                            <Icon size={14} />
                          </div>

                          {state === 'done' && (
                            <span className="flex items-center gap-1 rounded-full bg-accent-green/10 px-2 py-1 text-[8px] uppercase tracking-widest text-accent-green">
                              <CheckCircle2 size={10} /> 완료
                            </span>
                          )}

                          {state === 'active' && (
                            <span className="flex items-center gap-1">
                              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-accent-green"></span>
                              <span className="text-[8px] uppercase tracking-widest text-accent-green">
                                진행 중
                              </span>
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="mb-1 text-xs font-semibold tracking-wider text-white">{agent.name}</h4>
                          <p className="text-[9px] uppercase tracking-wider text-gray-500">{agent.model}</p>
                        </div>

                        {state === 'active' && (
                          <div className="absolute bottom-0 left-0 h-0.5 w-full animate-pulse bg-accent-green"></div>
                        )}
                      </div>

                      {index < agents.length - 1 && (
                        <div className="hidden text-gray-700 sm:flex">
                          <ChevronRight size={16} className={state === 'done' ? 'text-accent-green' : ''} />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-lg border border-white/5 bg-black/40 p-6 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <h4 className="text-[9px] uppercase tracking-[0.3em] text-gray-500">Session Metrics</h4>
                  <p className="text-xl font-light tracking-widest text-white">
                    {logs.length.toString().padStart(2, '0')} <span className="text-[10px] text-gray-600">LIVE EVENTS</span>
                  </p>
                </div>

                <div className="w-full space-y-2 sm:w-1/2">
                  <div className="flex justify-between text-[8px] uppercase tracking-widest text-gray-500">
                    <span>Pipeline Health</span>
                    <span className="text-accent-green">{isLoading ? 'Running' : 'Ready'}</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full bg-accent-green transition-all duration-700"
                      style={{ width: `${Math.max(progress, 4)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative flex h-[400px] flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] font-mono text-xs shadow-2xl lg:col-span-4 lg:h-auto">
              <div className="absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-accent-green/20 to-transparent"></div>

              <div className="flex items-center justify-between border-b border-white/5 bg-black/50 px-4 py-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <Terminal size={12} />
                  <span className="text-[9px] uppercase tracking-widest">Live Event Source</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-gray-800"></div>
                  <div className="h-2 w-2 rounded-full bg-gray-800"></div>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-accent-green/50"></div>
                </div>
              </div>

              <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
                {logs.length === 0 && (
                  <div className="leading-relaxed text-gray-600">
                    아직 로그가 없습니다. 아래 폼을 입력하고 초안 생성을 시작하면 진행 상황이 표시됩니다.
                  </div>
                )}

                {logs.map((log, index) => (
                  <div key={`${log.time}-${index}`} className="flex gap-3 leading-relaxed animate-fade-in-up">
                    <span className="shrink-0 text-gray-600">{log.time}</span>
                    <span className="break-words font-light text-gray-300">{log.message}</span>
                  </div>
                ))}

                {isLoading && currentAgent !== 'done' && (
                  <div className="flex gap-3 animate-pulse text-gray-600">
                    <span>--:--:--</span>
                    <span>Pipeline is streaming...</span>
                  </div>
                )}

                <div ref={logsEndRef} />
              </div>
            </div>
          </div>

          <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

          <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-12 animate-fade-in-up">
            <div className="group relative space-y-8 border border-white/5 bg-black/40 p-8 md:p-10">
              <div className="absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-accent-green/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>

              <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-gray-500">
                    <Mic2 size={12} /> Target Artist
                  </label>
                  <input
                    type="text"
                    name="artistName"
                    required
                    value={formData.artistName}
                    onChange={handleInputChange}
                    placeholder="The Weeknd"
                    className="w-full border-b border-white/10 bg-transparent py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-800 focus:border-accent-green focus:placeholder:text-gray-600"
                  />
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-gray-500">
                    <Music size={12} /> Target Track
                  </label>
                  <input
                    type="text"
                    name="songTitle"
                    required
                    value={formData.songTitle}
                    onChange={handleInputChange}
                    placeholder="Blinding Lights"
                    className="w-full border-b border-white/10 bg-transparent py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-800 focus:border-accent-green focus:placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-10 border-t border-white/5 pt-6 md:grid-cols-2">
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-gray-500">
                    <Globe size={12} /> 작성 언어
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full appearance-none border-b border-white/10 bg-black py-3 text-sm uppercase tracking-widest text-white transition-colors focus:border-accent-green focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Korean">Korean</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-gray-500">
                    <Database size={12} /> 카테고리
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full appearance-none border-b border-white/10 bg-black py-3 text-sm uppercase tracking-widest text-white transition-colors focus:border-accent-green focus:outline-none"
                  >
                    {categories.length === 0 && <option value="">카테고리 없음</option>}
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4 border-t border-white/5 pt-6">
                <label className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-gray-500">
                  <Tag size={12} /> 초안 방향 메모
                </label>
                <textarea
                  name="concept"
                  rows={3}
                  value={formData.concept}
                  onChange={handleInputChange}
                  placeholder="예: 몽환적인 분위기와 프로덕션 디테일을 강조해서 써주세요."
                  className="w-full resize-none border-b border-white/10 bg-transparent py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-800 focus:border-accent-green focus:placeholder:text-gray-600"
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden bg-white px-12 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-black transition-all hover:bg-accent-green hover:text-white disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            >
              <span className="absolute inset-0 z-0 h-full w-full bg-white transition-colors group-hover:bg-accent-green"></span>
              <span className="relative z-10 flex items-center gap-3">
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Generating Draft...</span>
                  </>
                ) : (
                  <>
                    <Activity size={14} className="group-hover:animate-pulse" />
                    <span>초안 생성 시작</span>
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
