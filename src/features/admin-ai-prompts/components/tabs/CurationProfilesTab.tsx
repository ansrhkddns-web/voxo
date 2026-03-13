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
import type { CurationProfileDefinition } from '@/features/admin-ai-desk/curation-profiles';

interface CurationProfilesTabProps {
    copy: AIPromptManagerCopy;
    curationOptions: Array<{ label: string; value: string }>;
    selectedProfileId: string;
    selectedProfile: CurationProfileDefinition;
    onSelectProfile: (value: string) => void;
    onUpdateProfile: (patch: Partial<CurationProfileDefinition>) => void;
}

export default function CurationProfilesTab({
    copy,
    curationOptions,
    selectedProfileId,
    selectedProfile,
    onSelectProfile,
    onUpdateProfile,
}: CurationProfilesTabProps) {
    return (
        <div className="space-y-6">
            <SectionCard
                title={copy.curationSectionLabel}
                description={copy.tabs.curation.description}
            >
                <SelectField
                    label={copy.fields.selectProfile}
                    value={selectedProfileId}
                    onChange={onSelectProfile}
                    options={curationOptions}
                />

                <SubsectionCard title={copy.identityGroup}>
                    <div className="grid gap-5 lg:grid-cols-2">
                        <TextField
                            label={copy.fields.label}
                            value={selectedProfile.label}
                            onChange={(value) => onUpdateProfile({ label: value })}
                        />
                        <TextField
                            label={copy.fields.shortDescription}
                            value={selectedProfile.shortDescription}
                            onChange={(value) =>
                                onUpdateProfile({ shortDescription: value })
                            }
                        />
                        <TextareaField
                            label={copy.fields.longDescription}
                            value={selectedProfile.longDescription}
                            onChange={(value) => onUpdateProfile({ longDescription: value })}
                            rows={5}
                        />
                        <TextareaField
                            label={copy.fields.readerPromise}
                            value={selectedProfile.readerPromise}
                            onChange={(value) => onUpdateProfile({ readerPromise: value })}
                            rows={5}
                        />
                    </div>
                    <TextareaField
                        label={copy.fields.defaultConcept}
                        value={selectedProfile.defaultConcept}
                        onChange={(value) => onUpdateProfile({ defaultConcept: value })}
                        rows={4}
                    />
                </SubsectionCard>

                <SubsectionCard title={copy.writingGroup}>
                    <div className="grid gap-5 lg:grid-cols-2">
                        <RepeaterField
                            label={copy.fields.requiredSections}
                            description={copy.fields.onePerLine}
                            items={selectedProfile.requiredSections}
                            onChange={(items) => onUpdateProfile({ requiredSections: items })}
                            addLabel={copy.addItem}
                            emptyLabel={copy.emptyList}
                            moveUpLabel={copy.moveUp}
                            moveDownLabel={copy.moveDown}
                            removeLabel={copy.remove}
                        />
                        <RepeaterField
                            label={copy.fields.writingDirectives}
                            description={copy.fields.onePerLine}
                            items={selectedProfile.writingDirectives}
                            onChange={(items) => onUpdateProfile({ writingDirectives: items })}
                            addLabel={copy.addItem}
                            emptyLabel={copy.emptyList}
                            moveUpLabel={copy.moveUp}
                            moveDownLabel={copy.moveDown}
                            removeLabel={copy.remove}
                        />
                    </div>
                </SubsectionCard>

                <SubsectionCard title={copy.styleGroup}>
                    <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
                        <RepeaterField
                            label={copy.fields.preferredPhrases}
                            description={copy.fields.onePerLine}
                            items={selectedProfile.preferredPhrases}
                            onChange={(items) => onUpdateProfile({ preferredPhrases: items })}
                            addLabel={copy.addItem}
                            emptyLabel={copy.emptyList}
                            moveUpLabel={copy.moveUp}
                            moveDownLabel={copy.moveDown}
                            removeLabel={copy.remove}
                        />
                        <RepeaterField
                            label={copy.fields.avoidPhrases}
                            description={copy.fields.onePerLine}
                            items={selectedProfile.avoidPhrases}
                            onChange={(items) => onUpdateProfile({ avoidPhrases: items })}
                            addLabel={copy.addItem}
                            emptyLabel={copy.emptyList}
                            moveUpLabel={copy.moveUp}
                            moveDownLabel={copy.moveDown}
                            removeLabel={copy.remove}
                        />
                        <RepeaterField
                            label={copy.fields.styleExamples}
                            description={copy.fields.onePerLine}
                            items={selectedProfile.styleExamples}
                            onChange={(items) => onUpdateProfile({ styleExamples: items })}
                            addLabel={copy.addItem}
                            emptyLabel={copy.emptyList}
                            moveUpLabel={copy.moveUp}
                            moveDownLabel={copy.moveDown}
                            removeLabel={copy.remove}
                        />
                    </div>
                </SubsectionCard>
            </SectionCard>
        </div>
    );
}
