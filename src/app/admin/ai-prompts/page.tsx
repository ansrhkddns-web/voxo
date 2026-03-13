'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, RotateCcw, Save, SlidersHorizontal } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
    getAiPromptManagerData,
    saveAiPromptManagerData,
} from '@/app/actions/aiPromptActions';
import {
    applyPromptVariables,
    buildCategoryPromptBlockFromConfig,
    buildCurationPromptBlockFromConfig,
    buildResolvedPromptManagerConfig,
    normalizePromptTemplates,
    resolveManagedArticleLength,
    resolveManagedCategoryPrompt,
    resolveManagedCurationProfile,
    serializePromptManagerConfig,
    type AIPromptManagerConfig,
    type AIPromptTemplates,
    type ManagedCategoryPrompt,
} from '@/lib/ai/prompt-manager';
import { useAdminLanguage } from '@/providers/AdminLanguageProvider';
import type {
    ArticleLengthPreset,
    CurationProfileDefinition,
} from '@/features/admin-ai-desk/curation-profiles';
import { AI_PROMPT_VARIABLES, aiPromptManagerCopy } from '@/features/admin-ai-prompts/constants';
import { PromptEditor } from '@/features/admin-ai-prompts/components/PromptEditor';
import { PreviewPanel } from '@/features/admin-ai-prompts/components/PreviewPanel';
import { RepeaterField } from '@/features/admin-ai-prompts/components/RepeaterField';
import { StickyTabBar } from '@/features/admin-ai-prompts/components/StickyTabBar';
import {
    SectionCard,
    SelectField,
    SubsectionCard,
    TextareaField,
    TextField,
    TokenChipList,
} from '@/features/admin-ai-prompts/components/FormFields';
import type {
    AIPromptManagerCopy,
    AIPromptManagerTabDefinition,
    AIPromptManagerTabId,
} from '@/features/admin-ai-prompts/types';

function cloneValue<T>(value: T) {
    return JSON.parse(JSON.stringify(value)) as T;
}

function mergeCategoryPrompt(
    config: AIPromptManagerConfig,
    categoryId: string,
    patch: Partial<ManagedCategoryPrompt>
) {
    return {
        ...config,
        categoryPrompts: config.categoryPrompts.map((prompt) =>
            prompt.id === categoryId ? { ...prompt, ...patch } : prompt
        ),
    };
}

function mergeCurationProfile(
    config: AIPromptManagerConfig,
    profileId: string,
    patch: Partial<CurationProfileDefinition>
) {
    return {
        ...config,
        curationProfiles: config.curationProfiles.map((profile) =>
            profile.id === profileId ? { ...profile, ...patch } : profile
        ),
    };
}

function mergeArticleLength(
    config: AIPromptManagerConfig,
    lengthId: string,
    patch: Partial<ArticleLengthPreset>
) {
    return {
        ...config,
        articleLengths: config.articleLengths.map((preset) =>
            preset.id === lengthId ? { ...preset, ...patch } : preset
        ),
    };
}

async function copyToClipboard(text: string, successMessage: string, errorMessage: string) {
    try {
        await navigator.clipboard.writeText(text);
        toast.success(successMessage);
    } catch (error) {
        console.error('Clipboard copy failed', error);
        toast.error(errorMessage);
    }
}

function getTabs(copy: AIPromptManagerCopy): AIPromptManagerTabDefinition[] {
    return [
        copy.tabs.basic,
        copy.tabs.templates,
        copy.tabs.category,
        copy.tabs.curation,
        copy.tabs.length,
        copy.tabs.preview,
    ];
}

export default function AIPromptManagerPage() {
    const { language } = useAdminLanguage();
    const copy = aiPromptManagerCopy[language];
    const tabs = useMemo(() => getTabs(copy), [copy]);
    const [activeTab, setActiveTab] = useState<AIPromptManagerTabId>('basic');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [templates, setTemplates] = useState<AIPromptTemplates>(normalizePromptTemplates());
    const [config, setConfig] = useState<AIPromptManagerConfig>(buildResolvedPromptManagerConfig(null));
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedProfileId, setSelectedProfileId] = useState('');
    const [selectedLengthId, setSelectedLengthId] = useState('');
    const [initialSnapshot, setInitialSnapshot] = useState<{
        templates: AIPromptTemplates;
        config: AIPromptManagerConfig;
    } | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getAiPromptManagerData();
                const nextTemplates = normalizePromptTemplates(data.templates);
                const nextConfig = buildResolvedPromptManagerConfig(
                    data.managerConfigRaw,
                    data.categories
                );

                setTemplates(nextTemplates);
                setConfig(nextConfig);
                setInitialSnapshot({
                    templates: cloneValue(nextTemplates),
                    config: cloneValue(nextConfig),
                });
                setSelectedCategoryId(nextConfig.categoryPrompts[0]?.id || '');
                setSelectedProfileId(nextConfig.curationProfiles[0]?.id || '');
                setSelectedLengthId(nextConfig.articleLengths[0]?.id || '');
            } catch (error) {
                console.error('Failed to load AI prompt manager', error);
                toast.error(copy.failed);
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, [copy.failed]);

    const selectedCategory = useMemo(
        () => resolveManagedCategoryPrompt(config, selectedCategoryId),
        [config, selectedCategoryId]
    );
    const selectedProfile = useMemo(
        () => resolveManagedCurationProfile(config, selectedProfileId),
        [config, selectedProfileId]
    );
    const selectedLength = useMemo(
        () => resolveManagedArticleLength(config, selectedLengthId),
        [config, selectedLengthId]
    );

    const dirtyState = useMemo(() => {
        if (!initialSnapshot) {
            return {
                templates: false,
                category: false,
                curation: false,
                length: false,
                hasUnsavedChanges: false,
            };
        }

        const templatesDirty =
            JSON.stringify(initialSnapshot.templates) !== JSON.stringify(templates);
        const categoryDirty =
            JSON.stringify(initialSnapshot.config.categoryPrompts) !==
            JSON.stringify(config.categoryPrompts);
        const curationDirty =
            JSON.stringify(initialSnapshot.config.curationProfiles) !==
            JSON.stringify(config.curationProfiles);
        const lengthDirty =
            JSON.stringify(initialSnapshot.config.articleLengths) !==
            JSON.stringify(config.articleLengths);

        return {
            templates: templatesDirty,
            category: categoryDirty,
            curation: curationDirty,
            length: lengthDirty,
            hasUnsavedChanges:
                templatesDirty || categoryDirty || curationDirty || lengthDirty,
        };
    }, [config, initialSnapshot, templates]);

    const dirtyTabs: Partial<Record<AIPromptManagerTabId, boolean>> = {
        templates: dirtyState.templates,
        category: dirtyState.category,
        curation: dirtyState.curation,
        length: dirtyState.length,
    };

    const activeTabDefinition = tabs.find((tab) => tab.id === activeTab) || tabs[0];

    const categoryOptions = useMemo(
        () =>
            config.categoryPrompts.map((prompt) => ({
                value: prompt.id,
                label: prompt.displayName,
            })),
        [config.categoryPrompts]
    );
    const curationOptions = useMemo(
        () =>
            config.curationProfiles.map((profile) => ({
                value: profile.id,
                label: profile.label,
            })),
        [config.curationProfiles]
    );
    const lengthOptions = useMemo(
        () =>
            config.articleLengths.map((preset) => ({
                value: preset.id,
                label: preset.label,
            })),
        [config.articleLengths]
    );

    const previewVariables = useMemo(() => {
        const categoryBlock = buildCategoryPromptBlockFromConfig(selectedCategory);
        const curationBlock = buildCurationPromptBlockFromConfig(selectedProfile, selectedLength);

        return {
            artistName: 'BLACKPINK',
            songTitle: 'Pink Venom',
            language: 'English',
            categoryName: selectedCategory.displayName,
            categorySlug: selectedCategory.slug,
            tone: 'Editorial',
            concept: templates.concept,
            facts: [
                '- Artist: BLACKPINK',
                '- Track: Pink Venom',
                '- Focus: swagger, tension, performance scale, signature hooks',
            ].join('\n'),
            draftText: [
                'Title: BLACKPINK Turn Swagger Into Spectacle on Pink Venom',
                'Intro: A look at how the group turns pressure, performance, and charisma into a pop event.',
                '',
                'The first paragraph would go here as a preview draft sample.',
            ].join('\n'),
            articleText: 'Sample article text for SEO prompt preview.',
            existingTags: 'k-pop, performance, pop',
            curationProfileLabel: selectedProfile.label,
            curationProfileSummary: selectedProfile.longDescription,
            articleLengthLabel: selectedLength.label,
            articleWordRange: selectedLength.wordRangeLabel,
            lengthGuidance: selectedLength.guidance,
            categoryPromptBlock: categoryBlock,
            curationPromptBlock: curationBlock,
        };
    }, [selectedCategory, selectedLength, selectedProfile, templates.concept]);

    const writePromptPreview = useMemo(
        () => applyPromptVariables(templates.write, previewVariables),
        [previewVariables, templates.write]
    );
    const refinePromptPreview = useMemo(
        () => applyPromptVariables(templates.refine, previewVariables),
        [previewVariables, templates.refine]
    );
    const fullPromptPreview = useMemo(
        () =>
            [
                `[${copy.previews.categoryBlock}]`,
                previewVariables.categoryPromptBlock,
                '',
                `[${copy.previews.curationBlock}]`,
                previewVariables.curationPromptBlock,
                '',
                `[${copy.previews.writePrompt}]`,
                writePromptPreview,
                '',
                `[${copy.previews.refinePrompt}]`,
                refinePromptPreview,
            ].join('\n'),
        [copy.previews, previewVariables, refinePromptPreview, writePromptPreview]
    );

    const handleReset = () => {
        if (!initialSnapshot) {
            return;
        }

        const nextTemplates = cloneValue(initialSnapshot.templates);
        const nextConfig = cloneValue(initialSnapshot.config);

        setTemplates(nextTemplates);
        setConfig(nextConfig);
        setSelectedCategoryId((current) =>
            nextConfig.categoryPrompts.some((prompt) => prompt.id === current)
                ? current
                : nextConfig.categoryPrompts[0]?.id || ''
        );
        setSelectedProfileId((current) =>
            nextConfig.curationProfiles.some((profile) => profile.id === current)
                ? current
                : nextConfig.curationProfiles[0]?.id || ''
        );
        setSelectedLengthId((current) =>
            nextConfig.articleLengths.some((preset) => preset.id === current)
                ? current
                : nextConfig.articleLengths[0]?.id || ''
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const normalizedTemplates = normalizePromptTemplates(templates);
            const result = await saveAiPromptManagerData({
                templates: normalizedTemplates,
                managerConfigRaw: serializePromptManagerConfig(config),
            });

            if (!result.success) {
                toast.error(result.error || copy.failed);
                return;
            }

            setTemplates(normalizedTemplates);
            setInitialSnapshot({
                templates: cloneValue(normalizedTemplates),
                config: cloneValue(config),
            });
            toast.success(copy.saved);
        } catch (error) {
            console.error('Failed to save AI prompt manager', error);
            toast.error(copy.failed);
        } finally {
            setSaving(false);
        }
    };

    const renderBasicTab = () => (
        <div className="space-y-6">
            <SectionCard title={copy.tabs.basic.label} description={copy.subtitle}>
                <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                    <div className="space-y-5 rounded-2xl bg-black/30 p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                                <h3 className="font-display text-sm uppercase tracking-[0.22em] text-white/90">
                                    {copy.variablesTitle}
                                </h3>
                                <p className="max-w-2xl text-sm leading-relaxed text-gray-500">
                                    {copy.variablesDescription}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    copyToClipboard(
                                        AI_PROMPT_VARIABLES.join('\n'),
                                        copy.copied,
                                        copy.failed
                                    )
                                }
                                className="rounded-full border border-accent-green/25 bg-accent-green/5 px-4 py-2 text-xs text-accent-green transition-colors hover:border-accent-green hover:bg-accent-green/10"
                            >
                                {copy.copyAllVariables}
                            </button>
                        </div>
                        <TokenChipList
                            tokens={AI_PROMPT_VARIABLES}
                            buttonLabel={copy.copyVariable}
                            onCopy={(token) =>
                                copyToClipboard(token, copy.copied, copy.failed)
                            }
                        />
                    </div>

                    <div className="space-y-4 rounded-2xl bg-black/30 p-6">
                        <h3 className="font-display text-sm uppercase tracking-[0.22em] text-white/90">
                            {copy.usageTipsTitle}
                        </h3>
                        <div className="space-y-3">
                            {copy.usageTips.map((tip) => (
                                <div
                                    key={tip}
                                    className="rounded-2xl border border-white/8 bg-black/35 px-4 py-4 text-sm leading-relaxed text-gray-300"
                                >
                                    {tip}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SectionCard>
        </div>
    );

    const renderTemplatesTab = () => (
        <div className="space-y-6">
            <SectionCard
                title={copy.promptSectionLabel}
                description={copy.templateFlowHint}
            >
                <div className="space-y-5">
                    <PromptEditor
                        title={copy.templates.concept}
                        description={copy.templates.conceptDescription}
                        value={templates.concept}
                        onChange={(value) =>
                            setTemplates((prev) => ({ ...prev, concept: value }))
                        }
                        rows={6}
                    />
                    <PromptEditor
                        title={copy.templates.research}
                        description={copy.templates.researchDescription}
                        value={templates.research}
                        onChange={(value) =>
                            setTemplates((prev) => ({ ...prev, research: value }))
                        }
                        rows={10}
                        helper={copy.templates.variablesHelper}
                        variableTokens={AI_PROMPT_VARIABLES}
                    />
                    <PromptEditor
                        title={copy.templates.write}
                        description={copy.templates.writeDescription}
                        value={templates.write}
                        onChange={(value) =>
                            setTemplates((prev) => ({ ...prev, write: value }))
                        }
                        rows={18}
                        helper={copy.templates.variablesHelper}
                        variableTokens={AI_PROMPT_VARIABLES}
                    />
                    <PromptEditor
                        title={copy.templates.refine}
                        description={copy.templates.refineDescription}
                        value={templates.refine}
                        onChange={(value) =>
                            setTemplates((prev) => ({ ...prev, refine: value }))
                        }
                        rows={14}
                        helper={copy.templates.variablesHelper}
                        variableTokens={AI_PROMPT_VARIABLES}
                    />
                    <PromptEditor
                        title={copy.templates.seo}
                        description={copy.templates.seoDescription}
                        value={templates.seo}
                        onChange={(value) =>
                            setTemplates((prev) => ({ ...prev, seo: value }))
                        }
                        rows={8}
                        helper={copy.templates.variablesHelper}
                        variableTokens={AI_PROMPT_VARIABLES}
                    />
                </div>
            </SectionCard>
        </div>
    );

    const renderCategoryTab = () => (
        <div className="space-y-6">
            <SectionCard
                title={copy.categorySectionLabel}
                description={copy.tabs.category.description}
            >
                <SelectField
                    label={copy.fields.selectCategory}
                    value={selectedCategoryId}
                    onChange={setSelectedCategoryId}
                    options={categoryOptions}
                />

                <SubsectionCard title={copy.basicInfoGroup}>
                    <div className="grid gap-5 lg:grid-cols-2">
                        <TextField
                            label={copy.fields.displayName}
                            value={selectedCategory.displayName}
                            onChange={(value) =>
                                setConfig((prev) =>
                                    mergeCategoryPrompt(prev, selectedCategory.id, {
                                        displayName: value,
                                    })
                                )
                            }
                        />
                        <TextField
                            label={copy.fields.label}
                            value={selectedCategory.label}
                            onChange={(value) =>
                                setConfig((prev) =>
                                    mergeCategoryPrompt(prev, selectedCategory.id, {
                                        label: value,
                                    })
                                )
                            }
                        />
                    </div>
                    <div className="grid gap-5 lg:grid-cols-2">
                        <TextareaField
                            label={copy.fields.summary}
                            value={selectedCategory.summary}
                            onChange={(value) =>
                                setConfig((prev) =>
                                    mergeCategoryPrompt(prev, selectedCategory.id, {
                                        summary: value,
                                    })
                                )
                            }
                            rows={5}
                        />
                        <TextareaField
                            label={copy.fields.editorialGoal}
                            value={selectedCategory.editorialGoal}
                            onChange={(value) =>
                                setConfig((prev) =>
                                    mergeCategoryPrompt(prev, selectedCategory.id, {
                                        editorialGoal: value,
                                    })
                                )
                            }
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
                            onChange={(items) =>
                                setConfig((prev) =>
                                    mergeCategoryPrompt(prev, selectedCategory.id, {
                                        toneDirectives: items,
                                    })
                                )
                            }
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
                                setConfig((prev) =>
                                    mergeCategoryPrompt(prev, selectedCategory.id, {
                                        structureDirectives: items,
                                    })
                                )
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
                                setConfig((prev) =>
                                    mergeCategoryPrompt(prev, selectedCategory.id, {
                                        middleParagraphMoves: items,
                                    })
                                )
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
                            onChange={(value) =>
                                setConfig((prev) =>
                                    mergeCategoryPrompt(prev, selectedCategory.id, {
                                        titleDirective: value,
                                    })
                                )
                            }
                            rows={4}
                        />
                        <TextareaField
                            label={copy.fields.heroExcerptDirective}
                            value={selectedCategory.heroExcerptDirective}
                            onChange={(value) =>
                                setConfig((prev) =>
                                    mergeCategoryPrompt(prev, selectedCategory.id, {
                                        heroExcerptDirective: value,
                                    })
                                )
                            }
                            rows={4}
                        />
                        <TextareaField
                            label={copy.fields.openingDirective}
                            value={selectedCategory.openingDirective}
                            onChange={(value) =>
                                setConfig((prev) =>
                                    mergeCategoryPrompt(prev, selectedCategory.id, {
                                        openingDirective: value,
                                    })
                                )
                            }
                            rows={4}
                        />
                        <TextareaField
                            label={copy.fields.endingDirective}
                            value={selectedCategory.endingDirective}
                            onChange={(value) =>
                                setConfig((prev) =>
                                    mergeCategoryPrompt(prev, selectedCategory.id, {
                                        endingDirective: value,
                                    })
                                )
                            }
                            rows={4}
                        />
                    </div>
                </SubsectionCard>
            </SectionCard>
        </div>
    );

    const renderCurationTab = () => (
        <div className="space-y-6">
            <SectionCard
                title={copy.curationSectionLabel}
                description={copy.tabs.curation.description}
            >
                <SelectField
                    label={copy.fields.selectProfile}
                    value={selectedProfileId}
                    onChange={setSelectedProfileId}
                    options={curationOptions}
                />

                <SubsectionCard title={copy.identityGroup}>
                    <div className="grid gap-5 lg:grid-cols-2">
                        <TextField
                            label={copy.fields.label}
                            value={selectedProfile.label}
                            onChange={(value) =>
                                setConfig((prev) =>
                                    mergeCurationProfile(prev, selectedProfile.id, {
                                        label: value,
                                    })
                                )
                            }
                        />
                        <TextField
                            label={copy.fields.shortDescription}
                            value={selectedProfile.shortDescription}
                            onChange={(value) =>
                                setConfig((prev) =>
                                    mergeCurationProfile(prev, selectedProfile.id, {
                                        shortDescription: value,
                                    })
                                )
                            }
                        />
                        <TextareaField
                            label={copy.fields.longDescription}
                            value={selectedProfile.longDescription}
                            onChange={(value) =>
                                setConfig((prev) =>
                                    mergeCurationProfile(prev, selectedProfile.id, {
                                        longDescription: value,
                                    })
                                )
                            }
                            rows={5}
                        />
                        <TextareaField
                            label={copy.fields.readerPromise}
                            value={selectedProfile.readerPromise}
                            onChange={(value) =>
                                setConfig((prev) =>
                                    mergeCurationProfile(prev, selectedProfile.id, {
                                        readerPromise: value,
                                    })
                                )
                            }
                            rows={5}
                        />
                    </div>
                    <TextareaField
                        label={copy.fields.defaultConcept}
                        value={selectedProfile.defaultConcept}
                        onChange={(value) =>
                            setConfig((prev) =>
                                mergeCurationProfile(prev, selectedProfile.id, {
                                    defaultConcept: value,
                                })
                            )
                        }
                        rows={4}
                    />
                </SubsectionCard>

                <SubsectionCard title={copy.writingGroup}>
                    <div className="grid gap-5 lg:grid-cols-2">
                        <RepeaterField
                            label={copy.fields.requiredSections}
                            description={copy.fields.onePerLine}
                            items={selectedProfile.requiredSections}
                            onChange={(items) =>
                                setConfig((prev) =>
                                    mergeCurationProfile(prev, selectedProfile.id, {
                                        requiredSections: items,
                                    })
                                )
                            }
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
                            onChange={(items) =>
                                setConfig((prev) =>
                                    mergeCurationProfile(prev, selectedProfile.id, {
                                        writingDirectives: items,
                                    })
                                )
                            }
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
                            onChange={(items) =>
                                setConfig((prev) =>
                                    mergeCurationProfile(prev, selectedProfile.id, {
                                        preferredPhrases: items,
                                    })
                                )
                            }
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
                            onChange={(items) =>
                                setConfig((prev) =>
                                    mergeCurationProfile(prev, selectedProfile.id, {
                                        avoidPhrases: items,
                                    })
                                )
                            }
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
                            onChange={(items) =>
                                setConfig((prev) =>
                                    mergeCurationProfile(prev, selectedProfile.id, {
                                        styleExamples: items,
                                    })
                                )
                            }
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

    const renderLengthTab = () => (
        <div className="space-y-6">
            <SectionCard
                title={copy.lengthSectionLabel}
                description={copy.tabs.length.description}
            >
                <SelectField
                    label={copy.fields.selectLength}
                    value={selectedLengthId}
                    onChange={setSelectedLengthId}
                    options={lengthOptions}
                />
                <SubsectionCard title={copy.lengthSectionLabel}>
                    <div className="grid gap-5 lg:grid-cols-2">
                        <TextField
                            label={copy.fields.label}
                            value={selectedLength.label}
                            onChange={(value) =>
                                setConfig((prev) =>
                                    mergeArticleLength(prev, selectedLength.id, {
                                        label: value,
                                    })
                                )
                            }
                        />
                        <TextField
                            label={copy.fields.wordRangeLabel}
                            value={selectedLength.wordRangeLabel}
                            onChange={(value) =>
                                setConfig((prev) =>
                                    mergeArticleLength(prev, selectedLength.id, {
                                        wordRangeLabel: value,
                                    })
                                )
                            }
                        />
                    </div>
                    <TextareaField
                        label={copy.fields.guidance}
                        value={selectedLength.guidance}
                        onChange={(value) =>
                            setConfig((prev) =>
                                mergeArticleLength(prev, selectedLength.id, {
                                    guidance: value,
                                })
                            )
                        }
                        rows={4}
                    />
                </SubsectionCard>
            </SectionCard>
        </div>
    );

    const renderPreviewTab = () => (
        <div className="space-y-6">
            <SectionCard
                title={copy.previewSectionLabel}
                description={copy.tabs.preview.description}
                actions={
                    <button
                        type="button"
                        onClick={() =>
                            copyToClipboard(fullPromptPreview, copy.copiedFullPrompt, copy.failed)
                        }
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
                        onChange={setSelectedCategoryId}
                        options={categoryOptions}
                    />
                    <SelectField
                        label={copy.fields.selectProfile}
                        value={selectedProfileId}
                        onChange={setSelectedProfileId}
                        options={curationOptions}
                    />
                    <SelectField
                        label={copy.fields.selectLength}
                        value={selectedLengthId}
                        onChange={setSelectedLengthId}
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
                        <p className="mt-3 text-sm text-white">{selectedCategory.displayName}</p>
                    </div>
                    <div className="rounded-2xl bg-black/30 p-5">
                        <p className="font-display text-[10px] uppercase tracking-[0.22em] text-gray-500">
                            {copy.currentProfile}
                        </p>
                        <p className="mt-3 text-sm text-white">{selectedProfile.label}</p>
                    </div>
                    <div className="rounded-2xl bg-black/30 p-5">
                        <p className="font-display text-[10px] uppercase tracking-[0.22em] text-gray-500">
                            {copy.currentLength}
                        </p>
                        <p className="mt-3 text-sm text-white">
                            {selectedLength.label} · {selectedLength.wordRangeLabel}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <PreviewPanel
                        title={copy.previews.categoryBlock}
                        content={previewVariables.categoryPromptBlock}
                        expandLabel={copy.expand}
                        collapseLabel={copy.collapse}
                    />
                    <PreviewPanel
                        title={copy.previews.curationBlock}
                        content={previewVariables.curationPromptBlock}
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

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'basic':
                return renderBasicTab();
            case 'templates':
                return renderTemplatesTab();
            case 'category':
                return renderCategoryTab();
            case 'curation':
                return renderCurationTab();
            case 'length':
                return renderLengthTab();
            case 'preview':
                return renderPreviewTab();
            default:
                return renderBasicTab();
        }
    };

    return (
        <div className="flex min-h-screen bg-black text-white selection:bg-accent-green/30">
            <Toaster position="top-center" />
            <AdminSidebar />

            <main className="flex-1 overflow-y-auto">
                <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-white/5 bg-black/88 px-10 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <SlidersHorizontal size={16} className="text-accent-green" />
                        <h1 className="font-display text-[10px] uppercase tracking-[0.4em] text-gray-400">
                            {copy.title}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={!dirtyState.hasUnsavedChanges || saving || loading}
                            title={
                                dirtyState.hasUnsavedChanges ? copy.reset : copy.resettingHint
                            }
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs text-gray-400 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <RotateCcw size={14} />
                            {copy.reset}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!dirtyState.hasUnsavedChanges || saving || loading}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 font-display text-[10px] font-bold uppercase tracking-[0.22em] text-black transition-all hover:bg-accent-green disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {dirtyState.hasUnsavedChanges && !saving ? (
                                <span
                                    aria-label={copy.unsavedDotLabel}
                                    className="h-2.5 w-2.5 rounded-full bg-accent-green shadow-[0_0_12px_rgba(102,255,170,0.7)]"
                                />
                            ) : null}
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {saving ? copy.saving : copy.save}
                        </button>
                    </div>
                </header>

                <div className="sticky top-20 z-40 border-b border-white/5 bg-black/95 backdrop-blur-xl">
                    <div className="mx-auto max-w-6xl px-8 py-4">
                        <StickyTabBar
                            tabs={tabs}
                            activeTab={activeTab}
                            onChange={setActiveTab}
                            dirtyTabs={dirtyTabs}
                            dirtyLabel={copy.unsavedDotLabel}
                        />
                    </div>
                </div>

                <div className="mx-auto max-w-6xl space-y-8 px-8 py-8">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-6 py-5">
                        <p className="font-display text-[10px] uppercase tracking-[0.28em] text-accent-green">
                            {activeTabDefinition.label}
                        </p>
                        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-500">
                            {activeTabDefinition.description}
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-white/8 bg-white/[0.02]">
                            <Loader2 className="animate-spin text-accent-green" size={28} />
                            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-600">
                                {copy.loading}
                            </p>
                        </div>
                    ) : (
                        renderActiveTab()
                    )}
                </div>
            </main>
        </div>
    );
}
