'use client';

import React from 'react';
import { AI_PROMPT_VARIABLES } from '@/features/admin-ai-prompts/constants';
import { PromptEditor } from '@/features/admin-ai-prompts/components/PromptEditor';
import { SectionCard } from '@/features/admin-ai-prompts/components/FormFields';
import type { AIPromptManagerCopy } from '@/features/admin-ai-prompts/types';
import type { AIPromptTemplates } from '@/lib/ai/prompt-manager';

interface BaseTemplatesTabProps {
    copy: AIPromptManagerCopy;
    templates: AIPromptTemplates;
    onTemplateChange: (field: keyof AIPromptTemplates, value: string) => void;
}

export default function BaseTemplatesTab({
    copy,
    templates,
    onTemplateChange,
}: BaseTemplatesTabProps) {
    return (
        <div className="space-y-6">
            <SectionCard title={copy.promptSectionLabel} description={copy.templateFlowHint}>
                <div className="space-y-5">
                    <PromptEditor
                        title={copy.templates.concept}
                        description={copy.templates.conceptDescription}
                        value={templates.concept}
                        onChange={(value) => onTemplateChange('concept', value)}
                        rows={6}
                    />
                    <PromptEditor
                        title={copy.templates.research}
                        description={copy.templates.researchDescription}
                        value={templates.research}
                        onChange={(value) => onTemplateChange('research', value)}
                        rows={10}
                        helper={copy.templates.variablesHelper}
                        variableTokens={AI_PROMPT_VARIABLES}
                    />
                    <PromptEditor
                        title={copy.templates.write}
                        description={copy.templates.writeDescription}
                        value={templates.write}
                        onChange={(value) => onTemplateChange('write', value)}
                        rows={18}
                        helper={copy.templates.variablesHelper}
                        variableTokens={AI_PROMPT_VARIABLES}
                    />
                    <PromptEditor
                        title={copy.templates.refine}
                        description={copy.templates.refineDescription}
                        value={templates.refine}
                        onChange={(value) => onTemplateChange('refine', value)}
                        rows={14}
                        helper={copy.templates.variablesHelper}
                        variableTokens={AI_PROMPT_VARIABLES}
                    />
                    <PromptEditor
                        title={copy.templates.seo}
                        description={copy.templates.seoDescription}
                        value={templates.seo}
                        onChange={(value) => onTemplateChange('seo', value)}
                        rows={8}
                        helper={copy.templates.variablesHelper}
                        variableTokens={AI_PROMPT_VARIABLES}
                    />
                </div>
            </SectionCard>
        </div>
    );
}
