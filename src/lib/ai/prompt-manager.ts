import {
    articleLengthPresets,
    curationProfiles,
    defaultArticleLengthId,
    defaultCurationProfileId,
    type ArticleLengthPreset,
    type CurationProfileDefinition,
} from '@/features/admin-ai-desk/curation-profiles';
import {
    categoryProfiles,
    getCategoryEditorialProfile,
    type CategoryEditorialProfile,
} from '@/features/admin-ai-desk/category-profiles';
import type { CategoryRecord } from '@/types/content';

export const AI_PROMPT_SETTING_KEYS = {
    concept: 'ai_prompt_concept',
    research: 'ai_prompt_research',
    write: 'ai_prompt_write',
    refine: 'ai_prompt_refine',
    seo: 'ai_prompt_seo',
    matrix: 'ai_prompt_matrix',
} as const;

export interface AIPromptTemplates {
    concept: string;
    research: string;
    write: string;
    refine: string;
    seo: string;
}

export interface ManagedCategoryPrompt extends CategoryEditorialProfile {
    slug: string;
    displayName: string;
}

export interface AIPromptManagerConfig {
    version: number;
    categoryPrompts: ManagedCategoryPrompt[];
    curationProfiles: CurationProfileDefinition[];
    articleLengths: ArticleLengthPreset[];
}

export const DEFAULT_AI_PROMPT_TEMPLATES: AIPromptTemplates = {
    concept: 'Focus on mood, production detail, and why the song matters.',
    research: [
        'You are researching the artist "{artistName}" and the song "{songTitle}".',
        'Return concise bullet points only.',
        'Include artist background, release context, production details, lyrical themes, performance context, and notable trivia when available.',
        'Do not write the review yet.',
    ].join('\n'),
    write: [
        'You are the lead editor for Voxo, a polished music culture magazine.',
        'Write the full article in {language}.',
        'Category context: {categoryName}.',
        'Preferred tone: {tone}.',
        'Primary curation profile: {curationProfileLabel}.',
        'Creative direction: {concept}',
        '',
        'Curation prompt block:',
        '{curationPromptBlock}',
        '',
        'Category prompt block:',
        '{categoryPromptBlock}',
        '',
        'Use the research notes below as factual grounding:',
        '{facts}',
        '',
        'Output rules:',
        '1. Start with one line in the format "Title: ...". The title must obey the category title directive.',
        '2. Add one line in the format "Intro: ...". This intro line will be used as the hero excerpt seed, so it must obey the hero excerpt directive.',
        '3. Then write the article body in plain Markdown-style paragraphs.',
        '4. Aim for a rich but readable feature article with clear structure and a final volume around {articleWordRange}.',
        '5. Do not return HTML.',
        '6. Do not include image placeholders such as IMAGE_URL, SECOND_IMAGE_URL, or markdown image syntax.',
        '7. Do not include raw YouTube, Spotify, or other external URLs inside the article body.',
        '8. The system will add one official video embed and two article images separately.',
        '9. Write in polished magazine prose, not listicle language.',
        '10. Make the emotional argument concrete by pointing to vocals, lyrics, production, arrangement, or performance details.',
        '11. Follow the category opening directive for the first paragraph and the category ending directive for the final paragraph.',
        '12. Use the category middle-paragraph flow to determine how the core body develops from paragraph to paragraph.',
        '13. Keep the title and intro distinct: the title should be compact and magnetic, while the intro should feel like the clickable emotional summary.',
        '14. Write enough paragraph volume for a feature structure: opening text, mid-article text expansion, late-article text before the official video embed, and one final closing paragraph after the video.',
        '15. Aim for at least 6 substantial paragraphs so the article can hold two image beats and one late video beat without feeling empty.',
    ].join('\n'),
    refine: [
        'You are polishing a completed Voxo draft.',
        'Keep the article in {language}.',
        'Preserve factual accuracy and keep the emotional argument specific.',
        'Do not shorten the article into a summary.',
        '',
        'Curation prompt block:',
        '{curationPromptBlock}',
        '',
        'Category prompt block:',
        '{categoryPromptBlock}',
        '',
        'Original direction:',
        '{concept}',
        '',
        'Current draft:',
        '{draftText}',
        '',
        'Output rules:',
        '1. Return the final article only.',
        '2. Keep the "Title:" line first and the "Intro:" line second.',
        '3. Improve flow, paragraph movement, and sentence rhythm.',
        '4. Keep the article substantial and publication-ready.',
        '5. Do not add markdown images, URLs, or HTML.',
    ].join('\n'),
    seo: 'Create comma-separated SEO tags from {articleText}. Prefer existing tags from {existingTags}.',
};

const REQUIRED_WRITE_OUTPUT_BLOCK = [
    '1. Start with one line in the format "Title: ...".',
    '2. Add one line in the format "Intro: ...".',
    '3. After the intro, continue with plain Markdown-style paragraphs only.',
    '4. Do not return HTML, image placeholders, or external URLs.',
].join('\n');

const REQUIRED_REFINE_OUTPUT_BLOCK = [
    '1. Return the final article only.',
    '2. Keep the "Title:" line first.',
    '3. Keep the "Intro:" line second.',
    '4. Preserve the paused draft structure and continue refining the body paragraphs without resetting the draft shape.',
].join('\n');

function asString(value: unknown, fallback = '') {
    return typeof value === 'string' ? value.trim() : fallback;
}

function asFilledString(value: unknown, fallback = '') {
    const normalized = asString(value, fallback);
    return normalized || fallback;
}

function asStringArray(value: unknown, fallback: string[] = []) {
    if (!Array.isArray(value)) {
        return fallback;
    }

    return value
        .map((item) => asString(item))
        .filter(Boolean);
}

function ensureRequiredPromptBlock(
    template: string,
    requiredNeedles: string[],
    requiredBlock: string
) {
    const normalizedTemplate = template.toLowerCase();
    const hasRequiredFormat = requiredNeedles.every((needle) =>
        normalizedTemplate.includes(needle.toLowerCase())
    );

    if (hasRequiredFormat || normalizedTemplate.includes('mandatory output format:')) {
        return template;
    }

    return `${template.trim()}\n\nMandatory output format:\n${requiredBlock}`.trim();
}

export function normalizePromptId(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

function sanitizeCurationProfile(
    input: Partial<CurationProfileDefinition>,
    fallback?: CurationProfileDefinition
): CurationProfileDefinition {
    const id =
        normalizePromptId(asString(input.id, fallback?.id || defaultCurationProfileId)) ||
        fallback?.id ||
        defaultCurationProfileId;

    return {
        id,
        label: asString(input.label, fallback?.label || id),
        shortDescription: asString(input.shortDescription, fallback?.shortDescription || ''),
        longDescription: asString(input.longDescription, fallback?.longDescription || ''),
        readerPromise: asString(input.readerPromise, fallback?.readerPromise || ''),
        defaultConcept: asString(input.defaultConcept, fallback?.defaultConcept || ''),
        requiredSections: asStringArray(input.requiredSections, fallback?.requiredSections || []),
        writingDirectives: asStringArray(input.writingDirectives, fallback?.writingDirectives || []),
        preferredPhrases: asStringArray(input.preferredPhrases, fallback?.preferredPhrases || []),
        avoidPhrases: asStringArray(input.avoidPhrases, fallback?.avoidPhrases || []),
        styleExamples: asStringArray(input.styleExamples, fallback?.styleExamples || []),
    };
}

function sanitizeArticleLengthPreset(
    input: Partial<ArticleLengthPreset>,
    fallback?: ArticleLengthPreset
): ArticleLengthPreset {
    const id =
        normalizePromptId(asString(input.id, fallback?.id || defaultArticleLengthId)) ||
        fallback?.id ||
        defaultArticleLengthId;

    return {
        id,
        label: asString(input.label, fallback?.label || id),
        wordRangeLabel: asString(input.wordRangeLabel, fallback?.wordRangeLabel || ''),
        guidance: asString(input.guidance, fallback?.guidance || ''),
    };
}

function sanitizeCategoryPrompt(
    input: Partial<ManagedCategoryPrompt>,
    fallback?: ManagedCategoryPrompt
): ManagedCategoryPrompt {
    const id =
        normalizePromptId(asString(input.id, input.slug || fallback?.id || 'features')) ||
        fallback?.id ||
        'features';
    const slug =
        normalizePromptId(asString(input.slug, fallback?.slug || id)) || fallback?.slug || id;

    return {
        id,
        slug,
        displayName: asString(input.displayName, fallback?.displayName || fallback?.label || slug),
        label: asString(input.label, fallback?.label || slug),
        summary: asString(input.summary, fallback?.summary || ''),
        editorialGoal: asString(input.editorialGoal, fallback?.editorialGoal || ''),
        toneDirectives: asStringArray(input.toneDirectives, fallback?.toneDirectives || []),
        structureDirectives: asStringArray(
            input.structureDirectives,
            fallback?.structureDirectives || []
        ),
        middleParagraphMoves: asStringArray(
            input.middleParagraphMoves,
            fallback?.middleParagraphMoves || []
        ),
        titleDirective: asString(input.titleDirective, fallback?.titleDirective || ''),
        heroExcerptDirective: asString(
            input.heroExcerptDirective,
            fallback?.heroExcerptDirective || ''
        ),
        openingDirective: asString(input.openingDirective, fallback?.openingDirective || ''),
        endingDirective: asString(input.endingDirective, fallback?.endingDirective || ''),
    };
}

export function normalizePromptTemplates(
    input?: Partial<AIPromptTemplates> | null
): AIPromptTemplates {
    const concept = asFilledString(input?.concept, DEFAULT_AI_PROMPT_TEMPLATES.concept);
    const research = asFilledString(input?.research, DEFAULT_AI_PROMPT_TEMPLATES.research);
    const write = ensureRequiredPromptBlock(
        asFilledString(input?.write, DEFAULT_AI_PROMPT_TEMPLATES.write),
        ['title:', 'intro:'],
        REQUIRED_WRITE_OUTPUT_BLOCK
    );
    const refine = ensureRequiredPromptBlock(
        asFilledString(input?.refine, DEFAULT_AI_PROMPT_TEMPLATES.refine),
        ['title:', 'intro:'],
        REQUIRED_REFINE_OUTPUT_BLOCK
    );
    const seo = asFilledString(input?.seo, DEFAULT_AI_PROMPT_TEMPLATES.seo);

    return {
        concept,
        research,
        write,
        refine,
        seo,
    };
}

export function getDefaultManagedCategoryPrompts(categories: CategoryRecord[] = []) {
    const items = [
        ...categories.map((category) => {
            const profile = getCategoryEditorialProfile(category);
            return sanitizeCategoryPrompt({
                ...profile,
                id: normalizePromptId(category.slug || category.name || profile.id),
                slug: normalizePromptId(category.slug || category.name || profile.id),
                displayName: category.name || profile.label,
            });
        }),
        ...categoryProfiles.map((profile) =>
            sanitizeCategoryPrompt({
                ...profile,
                slug: profile.id,
                displayName: profile.label,
            })
        ),
    ];

    const map = new Map<string, ManagedCategoryPrompt>();
    for (const item of items) {
        if (!map.has(item.id)) {
            map.set(item.id, item);
        }
    }

    return Array.from(map.values());
}

function mergeById<T extends { id: string }>(
    defaults: T[],
    overrides: T[],
    sanitize: (input: Partial<T>, fallback?: T) => T
) {
    const order = new Map<string, number>();
    defaults.forEach((item, index) => order.set(item.id, index));

    const merged = new Map<string, T>();
    defaults.forEach((item) => merged.set(item.id, item));

    for (const override of overrides) {
        const fallback = merged.get(override.id);
        const next = sanitize(override, fallback);
        if (!order.has(next.id)) {
            order.set(next.id, order.size + 1000);
        }
        merged.set(next.id, next);
    }

    return Array.from(merged.values()).sort((a, b) => {
        const aOrder = order.get(a.id) ?? 9999;
        const bOrder = order.get(b.id) ?? 9999;
        return aOrder - bOrder;
    });
}

export function parsePromptManagerConfig(raw: string | null) {
    if (!raw) {
        return null;
    }

    try {
        const parsed = JSON.parse(raw) as Partial<AIPromptManagerConfig>;

        return {
            version: Number(parsed.version) || 1,
            categoryPrompts: Array.isArray(parsed.categoryPrompts)
                ? parsed.categoryPrompts.map((item) =>
                      sanitizeCategoryPrompt(item as Partial<ManagedCategoryPrompt>)
                  )
                : [],
            curationProfiles: Array.isArray(parsed.curationProfiles)
                ? parsed.curationProfiles.map((item) =>
                      sanitizeCurationProfile(item as Partial<CurationProfileDefinition>)
                  )
                : [],
            articleLengths: Array.isArray(parsed.articleLengths)
                ? parsed.articleLengths.map((item) =>
                      sanitizeArticleLengthPreset(item as Partial<ArticleLengthPreset>)
                  )
                : [],
        } satisfies AIPromptManagerConfig;
    } catch (error) {
        console.error('Failed to parse AI prompt matrix setting', error);
        return null;
    }
}

export function buildResolvedPromptManagerConfig(
    raw: string | null,
    categories: CategoryRecord[] = []
): AIPromptManagerConfig {
    const parsed = parsePromptManagerConfig(raw);
    const defaultCategories = getDefaultManagedCategoryPrompts(categories);
    const defaultProfiles = curationProfiles.map((profile) => sanitizeCurationProfile(profile));
    const defaultLengths = articleLengthPresets.map((preset) => sanitizeArticleLengthPreset(preset));

    return {
        version: parsed?.version || 1,
        categoryPrompts: mergeById(
            defaultCategories,
            parsed?.categoryPrompts || [],
            sanitizeCategoryPrompt
        ),
        curationProfiles: mergeById(
            defaultProfiles,
            parsed?.curationProfiles || [],
            sanitizeCurationProfile
        ),
        articleLengths: mergeById(
            defaultLengths,
            parsed?.articleLengths || [],
            sanitizeArticleLengthPreset
        ),
    };
}

export function serializePromptManagerConfig(config: AIPromptManagerConfig) {
    return JSON.stringify(
        {
            version: config.version || 1,
            categoryPrompts: config.categoryPrompts,
            curationProfiles: config.curationProfiles,
            articleLengths: config.articleLengths,
        },
        null,
        2
    );
}

export function resolveManagedCurationProfile(
    config: AIPromptManagerConfig,
    profileId?: string
) {
    const normalizedId =
        normalizePromptId(profileId || defaultCurationProfileId) || defaultCurationProfileId;

    return (
        config.curationProfiles.find((profile) => profile.id === normalizedId) ||
        config.curationProfiles.find((profile) => profile.id === defaultCurationProfileId) ||
        config.curationProfiles[0]
    );
}

export function resolveManagedArticleLength(
    config: AIPromptManagerConfig,
    articleLengthId?: string
) {
    const normalizedId =
        normalizePromptId(articleLengthId || defaultArticleLengthId) || defaultArticleLengthId;

    return (
        config.articleLengths.find((preset) => preset.id === normalizedId) ||
        config.articleLengths.find((preset) => preset.id === defaultArticleLengthId) ||
        config.articleLengths[0]
    );
}

export function resolveManagedCategoryPrompt(
    config: AIPromptManagerConfig,
    input?: { slug?: string | null; name?: string | null } | string
) {
    const normalizedId =
        typeof input === 'string'
            ? normalizePromptId(input)
            : normalizePromptId(input?.slug || input?.name || '');

    const matched =
        config.categoryPrompts.find((profile) => profile.id === normalizedId) ||
        config.categoryPrompts.find((profile) => profile.slug === normalizedId);

    if (matched) {
        return matched;
    }

    const fallback = getCategoryEditorialProfile(input);

    return sanitizeCategoryPrompt({
        ...fallback,
        id: normalizedId || fallback.id,
        slug: normalizedId || fallback.id,
        displayName:
            typeof input === 'string' ? input : input?.name || fallback.label,
    });
}

export function buildCurationPromptBlockFromConfig(
    profile: CurationProfileDefinition,
    lengthPreset: ArticleLengthPreset
) {
    return [
        `Curation profile: ${profile.label}`,
        `Profile summary: ${profile.longDescription}`,
        `Reader promise: ${profile.readerPromise}`,
        `Target length: ${lengthPreset.wordRangeLabel}`,
        `Length guidance: ${lengthPreset.guidance}`,
        'Required article movement:',
        ...profile.requiredSections.map((section, index) => `${index + 1}. ${section}`),
        'Writing directives:',
        ...profile.writingDirectives.map((directive, index) => `${index + 1}. ${directive}`),
        'Preferred phrase direction:',
        ...profile.preferredPhrases.map((phrase, index) => `${index + 1}. ${phrase}`),
        'Avoid these weak expressions or tones:',
        ...profile.avoidPhrases.map((phrase, index) => `${index + 1}. ${phrase}`),
        'Style examples to emulate in spirit, not copy verbatim:',
        ...profile.styleExamples.map((example, index) => `${index + 1}. ${example}`),
    ].join('\n');
}

export function buildCategoryPromptBlockFromConfig(profile: ManagedCategoryPrompt) {
    return [
        `Category editorial mode: ${profile.label}`,
        `Category summary: ${profile.summary}`,
        `Editorial goal: ${profile.editorialGoal}`,
        'Category tone directives:',
        ...profile.toneDirectives.map((directive, index) => `${index + 1}. ${directive}`),
        'Category structure directives:',
        ...profile.structureDirectives.map((directive, index) => `${index + 1}. ${directive}`),
        'Category middle-paragraph flow:',
        ...profile.middleParagraphMoves.map((directive, index) => `${index + 1}. ${directive}`),
        `Title directive: ${profile.titleDirective}`,
        `Hero excerpt directive: ${profile.heroExcerptDirective}`,
        `Opening directive: ${profile.openingDirective}`,
        `Ending directive: ${profile.endingDirective}`,
    ].join('\n');
}

export function applyPromptVariables(template: string, variables: Record<string, string>) {
    return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key: string) => variables[key] ?? '');
}

export function textAreaValueToList(value: string) {
    return value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
}

export function listToTextAreaValue(items: string[]) {
    return items.join('\n');
}
