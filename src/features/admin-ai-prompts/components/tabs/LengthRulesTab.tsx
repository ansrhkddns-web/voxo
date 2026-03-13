'use client';

import React from 'react';
import {
    SectionCard,
    SelectField,
    SubsectionCard,
    TextareaField,
    TextField,
} from '@/features/admin-ai-prompts/components/FormFields';
import type { AIPromptManagerCopy } from '@/features/admin-ai-prompts/types';
import type { ArticleLengthPreset } from '@/features/admin-ai-desk/curation-profiles';

interface LengthRulesTabProps {
    copy: AIPromptManagerCopy;
    lengthOptions: Array<{ label: string; value: string }>;
    selectedLengthId: string;
    selectedLength: ArticleLengthPreset;
    onSelectLength: (value: string) => void;
    onUpdateLength: (patch: Partial<ArticleLengthPreset>) => void;
}

export default function LengthRulesTab({
    copy,
    lengthOptions,
    selectedLengthId,
    selectedLength,
    onSelectLength,
    onUpdateLength,
}: LengthRulesTabProps) {
    return (
        <div className="space-y-6">
            <SectionCard
                title={copy.lengthSectionLabel}
                description={copy.tabs.length.description}
            >
                <SelectField
                    label={copy.fields.selectLength}
                    value={selectedLengthId}
                    onChange={onSelectLength}
                    options={lengthOptions}
                />
                <SubsectionCard title={copy.lengthSectionLabel}>
                    <div className="grid gap-5 lg:grid-cols-2">
                        <TextField
                            label={copy.fields.label}
                            value={selectedLength.label}
                            onChange={(value) => onUpdateLength({ label: value })}
                        />
                        <TextField
                            label={copy.fields.wordRangeLabel}
                            value={selectedLength.wordRangeLabel}
                            onChange={(value) => onUpdateLength({ wordRangeLabel: value })}
                        />
                    </div>
                    <TextareaField
                        label={copy.fields.guidance}
                        value={selectedLength.guidance}
                        onChange={(value) => onUpdateLength({ guidance: value })}
                        rows={4}
                    />
                </SubsectionCard>
            </SectionCard>
        </div>
    );
}
