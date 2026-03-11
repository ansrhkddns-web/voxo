'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getCategories } from '@/app/actions/categoryActions';
import { AIDeskHeader } from '@/features/admin-ai-desk/components/AIDeskHeader';
import { AIDeskWorkflow } from '@/features/admin-ai-desk/components/AIDeskWorkflow';
import { AIDeskLogPanel } from '@/features/admin-ai-desk/components/AIDeskLogPanel';
import { AIDeskForm } from '@/features/admin-ai-desk/components/AIDeskForm';
import { DEFAULT_AI_DESK_FORM } from '@/features/admin-ai-desk/constants';
import { buildAIDraftHandoffKey } from '@/features/admin-editor/ai-handoff';
import { getTimeLabel, isAgentStatus } from '@/features/admin-ai-desk/utils';
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
    const logsEndRef = useRef<HTMLDivElement>(null);
    const [step, setStep] = useState<DashboardStep>('form');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentAgent, setCurrentAgent] = useState<AgentStatus>('idle');
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [categories, setCategories] = useState<CategoryRecord[]>([]);
    const [formData, setFormData] = useState<AIDeskFormState>(DEFAULT_AI_DESK_FORM);
    const [completionMode, setCompletionMode] = useState<'database' | 'local' | null>(null);

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

        void fetchCategories();
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
        setCompletionMode(null);

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

                    const payload = JSON.parse(payloadText) as AIDeskLogPayload | AIDeskStatePayload | AIDeskCompletePayload | AIDeskErrorPayload;

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
                        setCurrentAgent('done');
                        setProgress(100);
                        setCompletionMode(completePayload.savedToDatabase ? 'database' : 'local');
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

                    if (eventName === 'error') {
                        const errorPayload = payload as AIDeskErrorPayload;
                        throw new Error(errorPayload.message);
                    }
                }
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
                        <AIDeskHeader progress={progress} completionMode={completionMode} compact />

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
                                logsEndRef={logsEndRef}
                                compact
                            />
                        </div>
                    </div>

                    <div className="pb-20 pt-8">
                        <AIDeskForm
                            formData={formData}
                            categories={categories}
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
