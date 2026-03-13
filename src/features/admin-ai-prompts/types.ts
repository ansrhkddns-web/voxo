export type AIPromptManagerTabId =
    | 'basic'
    | 'templates'
    | 'category'
    | 'curation'
    | 'length'
    | 'preview';

export interface AIPromptManagerTabDefinition {
    id: AIPromptManagerTabId;
    label: string;
    description: string;
}

export interface AIPromptManagerCopy {
    title: string;
    subtitle: string;
    save: string;
    saving: string;
    reset: string;
    resettingHint: string;
    saved: string;
    failed: string;
    loading: string;
    variablesTitle: string;
    variablesDescription: string;
    copyVariable: string;
    copyAllVariables: string;
    copied: string;
    usageTipsTitle: string;
    usageTips: string[];
    promptSectionLabel: string;
    templateFlowHint: string;
    categorySectionLabel: string;
    curationSectionLabel: string;
    lengthSectionLabel: string;
    previewSectionLabel: string;
    basicInfoGroup: string;
    rulesGroup: string;
    framingGroup: string;
    identityGroup: string;
    writingGroup: string;
    styleGroup: string;
    compactSummary: string;
    currentCategory: string;
    currentProfile: string;
    currentLength: string;
    copyFullPrompt: string;
    copiedFullPrompt: string;
    expand: string;
    collapse: string;
    addItem: string;
    emptyList: string;
    moveUp: string;
    moveDown: string;
    remove: string;
    unsavedDotLabel: string;
    templates: {
        concept: string;
        conceptDescription: string;
        research: string;
        researchDescription: string;
        write: string;
        writeDescription: string;
        refine: string;
        refineDescription: string;
        seo: string;
        seoDescription: string;
        variablesHelper: string;
    };
    fields: {
        selectCategory: string;
        selectProfile: string;
        selectLength: string;
        displayName: string;
        label: string;
        summary: string;
        editorialGoal: string;
        toneDirectives: string;
        structureDirectives: string;
        middleParagraphMoves: string;
        titleDirective: string;
        heroExcerptDirective: string;
        openingDirective: string;
        endingDirective: string;
        shortDescription: string;
        longDescription: string;
        readerPromise: string;
        defaultConcept: string;
        requiredSections: string;
        writingDirectives: string;
        preferredPhrases: string;
        avoidPhrases: string;
        styleExamples: string;
        wordRangeLabel: string;
        guidance: string;
        onePerLine: string;
    };
    previews: {
        categoryBlock: string;
        curationBlock: string;
        writePrompt: string;
        refinePrompt: string;
    };
    tabs: Record<AIPromptManagerTabId, AIPromptManagerTabDefinition>;
}
