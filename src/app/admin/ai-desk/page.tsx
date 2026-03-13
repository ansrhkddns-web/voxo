'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getAiPromptManagerData } from '@/app/actions/aiPromptActions';
import { AIDeskHeader } from '@/features/admin-ai-desk/components/AIDeskHeader';
import { AIDeskWorkflow } from '@/features/admin-ai-desk/components/AIDeskWorkflow';
import { AIDeskLogPanel } from '@/features/admin-ai-desk/components/AIDeskLogPanel';
import { AIDeskForm } from '@/features/admin-ai-desk/components/AIDeskForm';
import { DEFAULT_AI_DESK_FORM } from '@/features/admin-ai-desk/constants';
import { buildAIDraftHandoffKey } from '@/features/admin-editor/ai-handoff';
import { getTimeLabel, isAgentStatus } from '@/features/admin-ai-desk/utils';
import { buildResolvedPromptManagerConfig, type AIPromptManagerConfig } from '@/lib/ai/prompt-manager';
import type {
    AgentStatus,
    AIDeskCompletePayload,
    AIDeskErrorPayload,
    AIDeskFormState,
    AIDeskLogPayload,
    AIDeskStatePayload,
    DashboardStep,
    LogEntry,
} from '@/features/admin-ai-desk/types';
import type { CategoryRecord } from '@/types/content';

export default function AIDeskPage() {
    const router = useRouter();
    const logScrollContainerRef = useRef<HTMLDivElement>(null);
    const [step, setStep] = useState<DashboardStep>('form');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentAgent, setCurrentAgent] = useState<AgentStatus>('idle');
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [categories, setCategories] = useState<CategoryRecord[]>([]);
    const [formData, setFormData] = useState<AIDeskFormState>(DEFAULT_AI_DESK_FORM);
    const [completionMode, setCompletionMode] = useState<'database' | 'local' | null>(null);
    const [usageSummary, setUsageSummary] = useState<AIDeskCompletePayload['usage'] | null>(null);
    const [promptConfig, setPromptConfig] = useState<AIPromptManagerConfig>(
        buildResolvedPromptManagerConfig(null)
    );

    useEffect(() => {
        const fetchDeskData = async () => {
            try {
                const data = await getAiPromptManagerData();
                const nextCategories = data.categories || [];
                setCategories(nextCategories);
                setPromptConfig(buildResolvedPromptManagerConfig(data.managerConfigRaw, nextCategories));

                if (nextCategories[0]?.id) {
                    setFormData((prev) => ({
                        ...prev,
                        categoryId: prev.categoryId || nextCategories[0].id,
                    }));
                }
            } catch (fetchError) {
                console.error('Failed to fetch AI desk data', fetchError);
            }
        };

        void fetchDeskData();
    }, []);

    useEffect(() => {
        if (step === 'dashboard') {
            const container = logScrollContainerRef.current;
            if (!container) {
                return;
            }

            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth',
            });
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
        setCompletionMode(null);
        setUsageSummary(null);

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
                throw new Error('AI draft request failed.');
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('Could not read stream response.');
            }

            const decoder = new TextDecoder();
            let buffer = '';
            let finished = false;
            let receivedComplete = false;

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

                    const payload = JSON.parse(payloadText) as AIDeskLogPayload | AIDeskStatePayload | AIDeskCompletePayload | AIDeskErrorPayload | { usage: AIDeskCompletePayload['usage'] };

                    if (eventName === 'log') {
                        const logPayload = payload as AIDeskLogPayload;
                        setLogs((prev) => [...prev, { time: getTimeLabel(), message: logPayload.message }]);
                        continue;
                    }

                    if (eventName === 'state') {
                        const statePayload = payload as AIDeskStatePayload;
                        if (isAgentStatus(statePayload.currentAgent)) {
                            setCurrentAgent(statePayload.currentAgent);
                        }
                        setProgress(statePayload.progress);
                        continue;
                    }

                    if (eventName === 'complete') {
                        const completePayload = payload as AIDeskCompletePayload;
                        receivedComplete = true;
                        setCurrentAgent('done');
                        setProgress(100);
                        setCompletionMode(completePayload.savedToDatabase ? 'database' : 'local');
                        setUsageSummary(completePayload.usage);
                        if (typeof window !== 'undefined') {
                            window.localStorage.setItem(
                                buildAIDraftHandoffKey(completePayload.postId),
                                JSON.stringify(completePayload.handoff)
                            );
                        }
                        if (!completePayload.savedToDatabase) {
                            setLogs((prev) => [
                                ...prev,
                                {
                                    time: getTimeLabel(),
                                    message: 'Database save skipped. Opening the editor with a local draft snapshot.',
                                },
                            ]);
                        }
                        setTimeout(() => {
                            router.push(completePayload.editorTarget);
                        }, 1200);
                        continue;
                    }

                    if (eventName === 'usage') {
                        setUsageSummary((payload as { usage: AIDeskCompletePayload['usage'] }).usage);
                        continue;
                    }

                    if (eventName === 'error') {
                        const errorPayload = payload as AIDeskErrorPayload;
                        throw new Error(errorPayload.message);
                    }
                }
            }

            if (!receivedComplete) {
                throw new Error('AI 생성 스트림이 완료 신호 없이 중단되었습니다. 프롬프트 길이나 서버 시간을 확인해 주세요.');
            }
        } catch (submitError: unknown) {
            setError(submitError instanceof Error ? submitError.message : 'A server communication error occurred.');
            setStep('form');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#050505] font-body text-white selection:bg-accent-green/30 selection:text-white">
            <AdminSidebar />

            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-7xl p-5 font-display sm:p-8 md:p-10 lg:p-12">
                    <div className="sticky top-0 z-30 -mx-5 border-b border-white/10 bg-[#050505]/95 px-5 pb-5 pt-4 shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur-md sm:-mx-8 sm:px-8 md:-mx-10 md:px-10 lg:-mx-12 lg:px-12">
                        <AIDeskHeader
                            progress={progress}
                            completionMode={completionMode}
                            usage={usageSummary}
                            compact
                        />

                        {error ? (
                            <div className="mb-4 flex items-center gap-3 border border-red-500/20 bg-red-500/10 p-4 text-xs tracking-wider text-red-400">
                                <div className="h-1 w-1 animate-ping rounded-full bg-red-500"></div>
                                {error}
                            </div>
                        ) : null}

                        <div className="grid grid-cols-1 gap-4 animate-fade-in lg:grid-cols-12">
                            <AIDeskWorkflow
                                currentAgent={currentAgent}
                                progress={progress}
                                logsCount={logs.length}
                                isLoading={isLoading}
                                compact
                            />
                            <AIDeskLogPanel
                                logs={logs}
                                isLoading={isLoading}
                                currentAgent={currentAgent}
                                scrollContainerRef={logScrollContainerRef}
                                compact
                            />
                        </div>
                    </div>

                    <div className="pb-20 pt-8">
                        <AIDeskForm
                            formData={formData}
                            categories={categories}
                            promptConfig={promptConfig}
                            isLoading={isLoading}
                            onInputChange={handleInputChange}
                            onSubmit={handleSubmit}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
