'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, RotateCcw, Save, SlidersHorizontal } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import {
    getAiPromptManagerData,
    saveAiPromptManagerData,
    type AIPromptManagerData,
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
import { StickyTabBar } from '@/features/admin-ai-prompts/components/StickyTabBar';
import type {
    AIPromptManagerCopy,
    AIPromptManagerTabDefinition,
    AIPromptManagerTabId,
} from '@/features/admin-ai-prompts/types';

const BasicSettingsTab = dynamic(
    () => import('@/features/admin-ai-prompts/components/tabs/BasicSettingsTab'),
    { loading: () => <PromptManagerTabLoader /> }
);
const BaseTemplatesTab = dynamic(
    () => import('@/features/admin-ai-prompts/components/tabs/BaseTemplatesTab'),
    { loading: () => <PromptManagerTabLoader /> }
);
const CategoryRulesTab = dynamic(
    () => import('@/features/admin-ai-prompts/components/tabs/CategoryRulesTab'),
    { loading: () => <PromptManagerTabLoader /> }
);
const CurationProfilesTab = dynamic(
    () => import('@/features/admin-ai-prompts/components/tabs/CurationProfilesTab'),
    { loading: () => <PromptManagerTabLoader /> }
);
const LengthRulesTab = dynamic(
    () => import('@/features/admin-ai-prompts/components/tabs/LengthRulesTab'),
    { loading: () => <PromptManagerTabLoader /> }
);
const PromptPreviewTab = dynamic(
    () => import('@/features/admin-ai-prompts/components/tabs/PromptPreviewTab'),
    { loading: () => <PromptManagerTabLoader /> }
);

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

function getInitialPromptManagerState(initialData: AIPromptManagerData | null) {
    const nextTemplates = normalizePromptTemplates(initialData?.templates);
    const nextConfig = buildResolvedPromptManagerConfig(
        initialData?.managerConfigRaw ?? null,
        initialData?.categories
    );

    return {
        nextTemplates,
        nextConfig,
        snapshot: initialData
            ? {
                  templates: cloneValue(nextTemplates),
                  config: cloneValue(nextConfig),
              }
            : null,
        selectedCategoryId: nextConfig.categoryPrompts[0]?.id || '',
        selectedProfileId: nextConfig.curationProfiles[0]?.id || '',
        selectedLengthId: nextConfig.articleLengths[0]?.id || '',
    };
}

function PromptManagerTabLoader() {
    return (
        <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-7 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
            <div className="space-y-4">
                <div className="h-5 w-48 animate-pulse rounded-full bg-white/8" />
                <div className="h-4 w-72 animate-pulse rounded-full bg-white/5" />
                <div className="h-32 animate-pulse rounded-2xl bg-black/30" />
                <div className="h-32 animate-pulse rounded-2xl bg-black/25" />
            </div>
        </div>
    );
}

interface AdminAIPromptManagerClientProps {
    initialData: AIPromptManagerData | null;
    initialLoadFailed?: boolean;
}

export default function AdminAIPromptManagerClient({
    initialData,
    initialLoadFailed = false,
}: AdminAIPromptManagerClientProps) {
    const { language } = useAdminLanguage();
    const copy = aiPromptManagerCopy[language];
    const tabs = useMemo(() => getTabs(copy), [copy]);
    const initialState = getInitialPromptManagerState(initialData);
    const [activeTab, setActiveTab] = useState<AIPromptManagerTabId>('basic');
    const [loading, setLoading] = useState(initialLoadFailed);
    const [saving, setSaving] = useState(false);
    const [templates, setTemplates] = useState<AIPromptTemplates>(initialState.nextTemplates);
    const [config, setConfig] = useState<AIPromptManagerConfig>(initialState.nextConfig);
    const [selectedCategoryId, setSelectedCategoryId] = useState(initialState.selectedCategoryId);
    const [selectedProfileId, setSelectedProfileId] = useState(initialState.selectedProfileId);
    const [selectedLengthId, setSelectedLengthId] = useState(initialState.selectedLengthId);
    const [initialSnapshot, setInitialSnapshot] = useState<{
        templates: AIPromptTemplates;
        config: AIPromptManagerConfig;
    } | null>(initialState.snapshot);

    useEffect(() => {
        const nextState = getInitialPromptManagerState(initialData);
        setTemplates(nextState.nextTemplates);
        setConfig(nextState.nextConfig);
        setInitialSnapshot(nextState.snapshot);
        setSelectedCategoryId((current) => current || nextState.selectedCategoryId);
        setSelectedProfileId((current) => current || nextState.selectedProfileId);
        setSelectedLengthId((current) => current || nextState.selectedLengthId);
    }, [initialData]);

    useEffect(() => {
        if (!initialLoadFailed) {
            return;
        }

        const load = async () => {
            try {
                const data = await getAiPromptManagerData();
                const nextState = getInitialPromptManagerState(data);
                setTemplates(nextState.nextTemplates);
                setConfig(nextState.nextConfig);
                setInitialSnapshot(nextState.snapshot);
                setSelectedCategoryId(nextState.selectedCategoryId);
                setSelectedProfileId(nextState.selectedProfileId);
                setSelectedLengthId(nextState.selectedLengthId);
            } catch (error) {
                console.error('Failed to load AI prompt manager', error);
                toast.error(copy.failed);
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, [copy.failed, initialLoadFailed]);

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

    const handleTemplateChange = (field: keyof AIPromptTemplates, value: string) => {
        setTemplates((prev) => ({ ...prev, [field]: value }));
    };

    const handleCategoryChange = (patch: Partial<ManagedCategoryPrompt>) => {
        setConfig((prev) => mergeCategoryPrompt(prev, selectedCategory.id, patch));
    };

    const handleCurationChange = (patch: Partial<CurationProfileDefinition>) => {
        setConfig((prev) => mergeCurationProfile(prev, selectedProfile.id, patch));
    };

    const handleLengthChange = (patch: Partial<ArticleLengthPreset>) => {
        setConfig((prev) => mergeArticleLength(prev, selectedLength.id, patch));
    };

    const renderBasicTab = () => (
        <BasicSettingsTab
            copy={copy}
            onCopyVariable={(token) =>
                void copyToClipboard(token, copy.copied, copy.failed)
            }
            onCopyAllVariables={() =>
                void copyToClipboard(
                    AI_PROMPT_VARIABLES.join('\n'),
                    copy.copied,
                    copy.failed
                )
            }
        />
    );

    const renderTemplatesTab = () => (
        <BaseTemplatesTab
            copy={copy}
            templates={templates}
            onTemplateChange={handleTemplateChange}
        />
    );

    const renderCategoryTab = () => (
        <CategoryRulesTab
            copy={copy}
            categoryOptions={categoryOptions}
            selectedCategoryId={selectedCategoryId}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategoryId}
            onUpdateCategory={handleCategoryChange}
        />
    );

    const renderCurationTab = () => (
        <CurationProfilesTab
            copy={copy}
            curationOptions={curationOptions}
            selectedProfileId={selectedProfileId}
            selectedProfile={selectedProfile}
            onSelectProfile={setSelectedProfileId}
            onUpdateProfile={handleCurationChange}
        />
    );

    const renderLengthTab = () => (
        <LengthRulesTab
            copy={copy}
            lengthOptions={lengthOptions}
            selectedLengthId={selectedLengthId}
            selectedLength={selectedLength}
            onSelectLength={setSelectedLengthId}
            onUpdateLength={handleLengthChange}
        />
    );

    const renderPreviewTab = () => (
        <PromptPreviewTab
            copy={copy}
            categoryOptions={categoryOptions}
            curationOptions={curationOptions}
            lengthOptions={lengthOptions}
            selectedCategoryId={selectedCategoryId}
            selectedProfileId={selectedProfileId}
            selectedLengthId={selectedLengthId}
            selectedCategoryName={selectedCategory.displayName}
            selectedProfileName={selectedProfile.label}
            selectedLengthName={selectedLength.label}
            selectedLengthRange={selectedLength.wordRangeLabel}
            categoryPromptBlock={previewVariables.categoryPromptBlock}
            curationPromptBlock={previewVariables.curationPromptBlock}
            writePromptPreview={writePromptPreview}
            refinePromptPreview={refinePromptPreview}
            onSelectCategory={setSelectedCategoryId}
            onSelectProfile={setSelectedProfileId}
            onSelectLength={setSelectedLengthId}
            onCopyFullPrompt={() =>
                void copyToClipboard(
                    fullPromptPreview,
                    copy.copiedFullPrompt,
                    copy.failed
                )
            }
        />
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
        <>
            <Toaster position="top-center" />

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
        </>
    );
}
