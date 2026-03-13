'use client';

import React from 'react';
import { RepeaterField } from '@/features/admin-ai-prompts/components/RepeaterField';
import {
    SectionCard,
    SelectField,
    SubsectionCard,
    TextareaField,
    TextField,
} from '@/features/admin-ai-prompts/components/FormFields';
import type { AIPromptManagerCopy } from '@/features/admin-ai-prompts/types';
import type { ManagedCategoryPrompt } from '@/lib/ai/prompt-manager';

interface CategoryRulesTabProps {
    copy: AIPromptManagerCopy;
    categoryOptions: Array<{ label: string; value: string }>;
    selectedCategoryId: string;
    selectedCategory: ManagedCategoryPrompt;
    onSelectCategory: (value: string) => void;
    onUpdateCategory: (patch: Partial<ManagedCategoryPrompt>) => void;
}

export default function CategoryRulesTab({
    copy,
    categoryOptions,
    selectedCategoryId,
    selectedCategory,
    onSelectCategory,
    onUpdateCategory,
}: CategoryRulesTabProps) {
    return (
        <div className="space-y-6">
            <SectionCard
                title={copy.categorySectionLabel}
                description={copy.tabs.category.description}
            >
                <SelectField
                    label={copy.fields.selectCategory}
                    value={selectedCategoryId}
                    onChange={onSelectCategory}
                    options={categoryOptions}
                />

                <SubsectionCard title={copy.basicInfoGroup}>
                    <div className="grid gap-5 lg:grid-cols-2">
                        <TextField
                            label={copy.fields.displayName}
                            value={selectedCategory.displayName}
                            onChange={(value) => onUpdateCategory({ displayName: value })}
                        />
                        <TextField
                            label={copy.fields.label}
                            value={selectedCategory.label}
                            onChange={(value) => onUpdateCategory({ label: value })}
                        />
                    </div>
                    <div className="grid gap-5 lg:grid-cols-2">
                        <TextareaField
                            label={copy.fields.summary}
                            value={selectedCategory.summary}
                            onChange={(value) => onUpdateCategory({ summary: value })}
                            rows={5}
                        />
                        <TextareaField
                            label={copy.fields.editorialGoal}
                            value={selectedCategory.editorialGoal}
                            onChange={(value) => onUpdateCategory({ editorialGoal: value })}
                            rows={5}
                        />
                    </div>
                </SubsectionCard>

                <SubsectionCard title={copy.rulesGroup}>
                    <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
                        <RepeaterField
                            label={copy.fields.toneDirectives}
                            description={copy.fields.onePerLine}
                            items={selectedCategory.toneDirectives}
                            onChange={(items) => onUpdateCategory({ toneDirectives: items })}
                            addLabel={copy.addItem}
                            emptyLabel={copy.emptyList}
                            moveUpLabel={copy.moveUp}
                            moveDownLabel={copy.moveDown}
                            removeLabel={copy.remove}
                        />
                        <RepeaterField
                            label={copy.fields.structureDirectives}
                            description={copy.fields.onePerLine}
                            items={selectedCategory.structureDirectives}
                            onChange={(items) =>
                                onUpdateCategory({ structureDirectives: items })
                            }
                            addLabel={copy.addItem}
                            emptyLabel={copy.emptyList}
                            moveUpLabel={copy.moveUp}
                            moveDownLabel={copy.moveDown}
                            removeLabel={copy.remove}
                        />
                        <RepeaterField
                            label={copy.fields.middleParagraphMoves}
                            description={copy.fields.onePerLine}
                            items={selectedCategory.middleParagraphMoves}
                            onChange={(items) =>
                                onUpdateCategory({ middleParagraphMoves: items })
                            }
                            addLabel={copy.addItem}
                            emptyLabel={copy.emptyList}
                            moveUpLabel={copy.moveUp}
                            moveDownLabel={copy.moveDown}
                            removeLabel={copy.remove}
                        />
                    </div>
                </SubsectionCard>

                <SubsectionCard title={copy.framingGroup}>
                    <div className="grid gap-5 lg:grid-cols-2">
                        <TextareaField
                            label={copy.fields.titleDirective}
                            value={selectedCategory.titleDirective}
                            onChange={(value) => onUpdateCategory({ titleDirective: value })}
                            rows={4}
                        />
                        <TextareaField
                            label={copy.fields.heroExcerptDirective}
                            value={selectedCategory.heroExcerptDirective}
                            onChange={(value) =>
                                onUpdateCategory({ heroExcerptDirective: value })
                            }
                            rows={4}
                        />
                        <TextareaField
                            label={copy.fields.openingDirective}
                            value={selectedCategory.openingDirective}
                            onChange={(value) => onUpdateCategory({ openingDirective: value })}
                            rows={4}
                        />
                        <TextareaField
                            label={copy.fields.endingDirective}
                            value={selectedCategory.endingDirective}
                            onChange={(value) => onUpdateCategory({ endingDirective: value })}
                            rows={4}
                        />
                    </div>
                </SubsectionCard>
            </SectionCard>
        </div>
    );
}
