import type { CategoryRecord } from '@/types/content';
import type { AIDraftHandoff } from '@/features/admin-editor/ai-handoff';
import type { AIPromptManagerConfig } from '@/lib/ai/prompt-manager';

export type AgentStatus = 'idle' | 'research' | 'write' | 'refine' | 'seo' | 'media' | 'done';
export type DashboardStep = 'form' | 'dashboard';

export interface LogEntry {
    time: string;
    message: string;
}

export interface AIDeskFormState {
    artistName: string;
    songTitle: string;
    language: string;
    categoryId: string;
    curationProfileId: string;
    articleLengthId: string;
    concept: string;
    tone: string;
    imageStyle: string;
    linkPriority: string;
}

export interface AIDeskStatePayload {
    currentAgent: AgentStatus;
    progress: number;
}

export interface AIDeskUsageStage {
    stage: 'research' | 'write' | 'refine';
    promptTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
}

export interface AIDeskUsageSummary {
    model: string;
    pricingLabel: string;
    pricingSourceUrl: string;
    promptTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
    stages: AIDeskUsageStage[];
}

export interface AIDeskCompletePayload {
    postId: string;
    handoff: AIDraftHandoff;
    editorTarget: string;
    savedToDatabase: boolean;
    usage: AIDeskUsageSummary;
}

export interface AIDeskLogPayload {
    message: string;
}

export interface AIDeskUsagePayload {
    usage: AIDeskUsageSummary;
}

export interface AIDeskErrorPayload {
    message: string;
}

export interface AIDeskAgentDefinition {
    id: Exclude<AgentStatus, 'idle' | 'done'>;
    name: string;
    model: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
}

export interface AIDeskFormProps {
    formData: AIDeskFormState;
    categories: CategoryRecord[];
    promptConfig: AIPromptManagerConfig;
    isLoading: boolean;
    onInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onSubmit: (event: React.FormEvent) => void;
}
