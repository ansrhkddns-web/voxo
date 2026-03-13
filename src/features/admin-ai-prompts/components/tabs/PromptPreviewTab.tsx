'use client';

import React from 'react';
import { PreviewPanel } from '@/features/admin-ai-prompts/components/PreviewPanel';
import { SectionCard, SelectField } from '@/features/admin-ai-prompts/components/FormFields';
import type { AIPromptManagerCopy } from '@/features/admin-ai-prompts/types';

interface PromptPreviewTabProps {
    copy: AIPromptManagerCopy;
    categoryOptions: Array<{ label: string; value: string }>;
    curationOptions: Array<{ label: string; value: string }>;
    lengthOptions: Array<{ label: string; value: string }>;
    selectedCategoryId: string;
    selectedProfileId: string;
    selectedLengthId: string;
    selectedCategoryName: string;
    selectedProfileName: string;
    selectedLengthName: string;
    selectedLengthRange: string;
    categoryPromptBlock: string;
    curationPromptBlock: string;
    writePromptPreview: string;
    refinePromptPreview: string;
    onSelectCategory: (value: string) => void;
    onSelectProfile: (value: string) => void;
    onSelectLength: (value: string) => void;
    onCopyFullPrompt: () => void;
}

export default function PromptPreviewTab({
    copy,
    categoryOptions,
    curationOptions,
    lengthOptions,
    selectedCategoryId,
    selectedProfileId,
    selectedLengthId,
    selectedCategoryName,
    selectedProfileName,
    selectedLengthName,
    selectedLengthRange,
    categoryPromptBlock,
    curationPromptBlock,
    writePromptPreview,
    refinePromptPreview,
    onSelectCategory,
    onSelectProfile,
    onSelectLength,
    onCopyFullPrompt,
}: PromptPreviewTabProps) {
    return (
        <div className="space-y-6">
            <SectionCard
                title={copy.previewSectionLabel}
                description={copy.tabs.preview.description}
                actions={
                    <button
                        type="button"
                        onClick={onCopyFullPrompt}
                        className="rounded-full border border-accent-green/25 bg-accent-green/5 px-4 py-2 text-xs text-accent-green transition-colors hover:border-accent-green hover:bg-accent-green/10"
                    >
                        {copy.copyFullPrompt}
                    </button>
                }
            >
                <div className="grid gap-5 xl:grid-cols-3">
                    <SelectField
                        label={copy.fields.selectCategory}
                        value={selectedCategoryId}
                        onChange={onSelectCategory}
                        options={categoryOptions}
                    />
                    <SelectField
                        label={copy.fields.selectProfile}
                        value={selectedProfileId}
                        onChange={onSelectProfile}
                        options={curationOptions}
                    />
                    <SelectField
                        label={copy.fields.selectLength}
                        value={selectedLengthId}
                        onChange={onSelectLength}
                        options={lengthOptions}
                    />
                </div>

                <div className="space-y-4">
                    <p className="font-display text-[10px] uppercase tracking-[0.24em] text-gray-500">
                        {copy.compactSummary}
                    </p>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                    <div className="rounded-2xl bg-black/30 p-5">
                        <p className="font-display text-[10px] uppercase tracking-[0.22em] text-gray-500">
                            {copy.currentCategory}
                        </p>
                        <p className="mt-3 text-sm text-white">{selectedCategoryName}</p>
                    </div>
                    <div className="rounded-2xl bg-black/30 p-5">
                        <p className="font-display text-[10px] uppercase tracking-[0.22em] text-gray-500">
                            {copy.currentProfile}
                        </p>
                        <p className="mt-3 text-sm text-white">{selectedProfileName}</p>
                    </div>
                    <div className="rounded-2xl bg-black/30 p-5">
                        <p className="font-display text-[10px] uppercase tracking-[0.22em] text-gray-500">
                            {copy.currentLength}
                        </p>
                        <p className="mt-3 text-sm text-white">
                            {selectedLengthName} 쨌 {selectedLengthRange}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <PreviewPanel
                        title={copy.previews.categoryBlock}
                        content={categoryPromptBlock}
                        expandLabel={copy.expand}
                        collapseLabel={copy.collapse}
                    />
                    <PreviewPanel
                        title={copy.previews.curationBlock}
                        content={curationPromptBlock}
                        expandLabel={copy.expand}
                        collapseLabel={copy.collapse}
                    />
                    <PreviewPanel
                        title={copy.previews.writePrompt}
                        content={writePromptPreview}
                        expandLabel={copy.expand}
                        collapseLabel={copy.collapse}
                    />
                    <PreviewPanel
                        title={copy.previews.refinePrompt}
                        content={refinePromptPreview}
                        expandLabel={copy.expand}
                        collapseLabel={copy.collapse}
                    />
                </div>
            </SectionCard>
        </div>
    );
}
