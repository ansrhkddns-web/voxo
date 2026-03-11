import { GoogleGenerativeAI } from '@google/generative-ai';
import { getArtistStats } from '@/app/actions/spotifyActions';
import { hasValidDefaultAdminSession } from '@/lib/admin-auth-server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type {
    AIDraftHandoff,
    AIDraftImageSuggestion,
    AIDraftLinkSuggestion,
} from '@/features/admin-editor/ai-handoff';
import {
    buildHeroExcerpt,
    buildSeoDescription,
    buildShareCopy,
} from '@/features/admin-editor/utils';
import {
    buildCurationPromptBlock,
    defaultArticleLengthId,
    defaultCurationProfileId,
    getArticleLengthPreset,
    getCurationProfile,
} from '@/features/admin-ai-desk/curation-profiles';
import { buildCategoryPromptBlock } from '@/features/admin-ai-desk/category-profiles';
import type { SpotifyErrorResult, SpotifyStatsResult } from '@/types/spotify';

export type DraftAgent = 'research' | 'write' | 'refine' | 'seo' | 'media' | 'done';

export interface DraftGenerationInput {
    artistName: string;
    songTitle: string;
    language?: string;
    categoryId?: string;
    curationProfileId?: string;
    articleLengthId?: string;
    concept?: string;
    tone?: string;
    imageStyle?: string;
    linkPriority?: string;
}

export interface DraftGenerationResult {
    postId: string;
    handoff: AIDraftHandoff;
    editorTarget: string;
    savedToDatabase: boolean;
}

interface DraftCallbacks {
    onLog?: (message: string) => void;
    onState?: (agent: DraftAgent, progress: number) => void;
}

interface SettingRow {
    setting_value: string | null;
}

interface CategoryRow {
    name: string;
    slug?: string;
}

interface TagRow {
    name: string;
    show_in_menu?: boolean;
    menu_order?: number;
}

interface InsertedPostRow {
    id: string;
}

interface SupabaseErrorLike {
    code?: string;
    message?: string;
}

function createLogger(callbacks?: DraftCallbacks) {
    return {
        log(message: string) {
            callbacks?.onLog?.(message);
        },
        state(agent: DraftAgent, progress: number) {
            callbacks?.onState?.(agent, progress);
        },
    };
}

function normalizeLanguage(language?: string) {
    return language?.trim() || 'English';
}

function normalizeConcept(concept?: string, fallback?: string | null) {
    return (
        concept?.trim() ||
        fallback?.trim() ||
        'Focus on mood, production detail, and why the song matters.'
    );
}

function normalizeTone(tone?: string) {
    return tone?.trim() || 'Editorial';
}

function normalizeImageStyle(imageStyle?: string) {
    return imageStyle?.trim() || 'Cinematic';
}

function normalizeLinkPriority(linkPriority?: string) {
    return linkPriority?.trim() || 'Listening';
}

function sanitizeSlugPart(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

function extractLabelValue(source: string, labels: string[]) {
    for (const label of labels) {
        const match = source.match(new RegExp(`^${label}:\\s*(.+)$`, 'im'));
        if (match?.[1]) {
            return match[1].trim();
        }
    }

    return null;
}

function removeLabelLine(source: string, labels: string[]) {
    let next = source;

    for (const label of labels) {
        next = next.replace(new RegExp(`^${label}:\\s*.+$`, 'im'), '').trim();
    }

    return next;
}

function convertDraftToHtml(markdownLikeText: string) {
    return markdownLikeText
        .split('\n\n')
        .map((paragraph) => {
            const text = paragraph.trim();

            if (!text) return '';
            if (text.startsWith('#')) {
                return `<h3>${text.replace(/^#+\s*/, '')}</h3>`;
            }

            return `<p>${text.replace(/\n/g, '<br/>')}</p>`;
        })
        .filter(Boolean)
        .join('\n');
}

function buildMetadataDiv(params: {
    excerpt: string;
    intro: string;
    seoDescription: string;
    shareCopy: string;
    albumTitle: string;
}) {
    const safeExcerpt = params.excerpt.replace(/"/g, '&quot;');
    const safeIntro = params.intro.replace(/"/g, '&quot;');
    const safeSeo = params.seoDescription.replace(/"/g, '&quot;');
    const safeShare = params.shareCopy.replace(/"/g, '&quot;');
    const safeAlbumTitle = params.albumTitle.replace(/"/g, '&quot;');

    return `<div id="voxo-metadata" data-excerpt="${safeExcerpt}" data-intro="${safeIntro}" data-seo="${safeSeo}" data-share="${safeShare}" data-album="${safeAlbumTitle}"></div>`;
}

function buildResearchPrompt(artistName: string, songTitle: string) {
    return [
        `You are researching the artist "${artistName}" and the song "${songTitle}".`,
        'Return concise bullet points only.',
        'Include artist background, release context, production details, lyrical themes, and notable trivia when available.',
        'Do not write a review yet.',
    ].join('\n');
}

function buildWritingPrompt(params: {
    facts: string;
    concept: string;
    language: string;
    categoryName: string;
    categorySlug?: string;
    tone: string;
    curationProfileId: string;
    articleLengthId: string;
}) {
    const {
        facts,
        concept,
        language,
        categoryName,
        categorySlug,
        tone,
        curationProfileId,
        articleLengthId,
    } = params;
    const curationBlock = buildCurationPromptBlock(curationProfileId, articleLengthId);
    const categoryBlock = buildCategoryPromptBlock({ name: categoryName, slug: categorySlug });
    const profile = getCurationProfile(curationProfileId);
    const lengthPreset = getArticleLengthPreset(articleLengthId);

    return [
        'You are the lead editor for Voxo, a polished music culture magazine.',
        `Write the full article in ${language}.`,
        `Category context: ${categoryName}.`,
        `Preferred tone: ${tone}.`,
        `Primary curation profile: ${profile.label}.`,
        `Creative direction: ${concept}`,
        '',
        curationBlock,
        '',
        categoryBlock,
        '',
        'Use the research notes below as factual grounding:',
        facts,
        '',
        'Output rules:',
        '1. Start with one line in the format "Title: ...". The title must obey the category title directive.',
        '2. Add one line in the format "Intro: ...". This intro line will be used as the hero excerpt seed, so it must obey the hero excerpt directive.',
        '3. Then write the article body in plain Markdown-style paragraphs.',
        `4. Aim for a rich but readable feature article with clear structure and a final volume around ${lengthPreset.wordRangeLabel}.`,
        '5. Do not return HTML.',
        '6. Do not include image placeholders such as IMAGE_URL, SECOND_IMAGE_URL, or markdown image syntax.',
        '7. Do not include raw YouTube, Spotify, or other external URLs inside the article body.',
        '8. The system will add one official video embed and two article images separately.',
        '9. Write in polished magazine prose, not listicle language.',
        '10. Make the emotional argument concrete by pointing to vocals, lyrics, production, arrangement, or performance details.',
        '11. Follow the category opening directive for the first paragraph and the category ending directive for the final paragraph.',
        '12. Use the category middle-paragraph flow to determine how the core body develops from paragraph to paragraph.',
        '13. Keep the title and intro distinct: the title should be compact and magnetic, while the intro should feel like the clickable emotional summary.',
    ].join('\n');
}

function buildRefinementPrompt(params: {
    draftText: string;
    concept: string;
    language: string;
    categoryName: string;
    categorySlug?: string;
    tone: string;
    curationProfileId: string;
    articleLengthId: string;
}) {
    const {
        draftText,
        concept,
        language,
        categoryName,
        categorySlug,
        tone,
        curationProfileId,
        articleLengthId,
    } = params;
    const curationBlock = buildCurationPromptBlock(curationProfileId, articleLengthId);
    const categoryBlock = buildCategoryPromptBlock({ name: categoryName, slug: categorySlug });

    return [
        'You are now the senior rewrite editor for Voxo.',
        `Refine the following draft in ${language}.`,
        `Keep the same song and factual claims, but improve the execution.`,
        `Preferred tone: ${tone}.`,
        `Creative direction: ${concept}`,
        '',
        curationBlock,
        '',
        categoryBlock,
        '',
        'Rewrite goals:',
        '1. Strengthen the title so it matches the category title directive.',
        '2. Strengthen the intro so it works as a clickable hero excerpt and follows the hero excerpt directive.',
        '3. Improve paragraph-to-paragraph flow using the category middle-paragraph guidance.',
        '4. Make the opening paragraph and closing paragraph obey the category opening and ending directives.',
        '5. Remove vague praise, repetition, weak filler, and generic wording.',
        '6. Keep the prose magazine-quality, emotionally vivid, and grounded in musical evidence.',
        '7. Preserve the output format exactly:',
        '   - one line: "Title: ..."',
        '   - one line: "Intro: ..."',
        '   - then the body in plain Markdown-style paragraphs',
        '8. Do not add HTML, image placeholders, markdown images, or raw external URLs.',
        '',
        'Draft to refine:',
        draftText,
    ].join('\n');
}

function sanitizeGeneratedArticleBody(content: string) {
    return content
        .split('\n')
        .filter((line) => {
            const trimmed = line.trim();
            if (!trimmed) {
                return true;
            }

            if (trimmed.includes('IMAGE_URL') || trimmed.includes('SECOND_IMAGE_URL')) {
                return false;
            }

            if (/!\[[^\]]*]\(([^)]+)\)/.test(trimmed)) {
                return false;
            }

            if (/https?:\/\/(www\.)?(youtube\.com|youtu\.be|open\.spotify\.com)\//i.test(trimmed)) {
                return false;
            }

            return true;
        })
        .join('\n')
        .trim();
}

function normalizeTagToken(value: string) {
    return value
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9가-힣]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function buildGenreAliasMap() {
    return {
        'k pop': ['k pop', 'kpop', 'korean pop', 'korean idol'],
        'hip hop': ['hip hop', 'hiphop', 'rap', 'trap', 'drill', 'boom bap'],
        'r b': ['r b', 'rnb', 'rhythm and blues', 'contemporary r b', 'alt r b'],
        soul: ['soul', 'neo soul', 'souful'],
        jazz: ['jazz', 'bebop', 'swing', 'fusion'],
        blues: ['blues', 'delta blues', 'electric blues'],
        folk: ['folk', 'indie folk', 'acoustic folk', 'singer songwriter'],
        punk: ['punk', 'pop punk', 'post punk', 'hardcore punk'],
        lofi: ['lofi', 'lo fi', 'chillhop'],
        rock: ['rock', 'indie rock', 'alt rock', 'alternative rock'],
        pop: ['pop', 'synthpop', 'synth pop', 'dance pop', 'electropop'],
        electronic: ['electronic', 'edm', 'house', 'techno', 'ambient'],
        metal: ['metal', 'heavy metal', 'black metal', 'death metal'],
    } satisfies Record<string, string[]>;
}

function scoreEditorialTag(params: {
    tag: TagRow;
    evidenceText: string;
    spotifyGenres: string[];
}) {
    const { tag, evidenceText, spotifyGenres } = params;
    const normalizedTag = normalizeTagToken(tag.name);
    const aliasMap = buildGenreAliasMap();
    const aliases = aliasMap[normalizedTag as keyof ReturnType<typeof buildGenreAliasMap>] ?? [normalizedTag];
    let score = 0;

    for (const alias of aliases) {
        const normalizedAlias = normalizeTagToken(alias);
        if (!normalizedAlias) {
            continue;
        }

        if (evidenceText.includes(normalizedAlias)) {
            score += 4;
        }

        if (spotifyGenres.some((genre) => normalizeTagToken(genre).includes(normalizedAlias))) {
            score += 5;
        }
    }

    if (tag.show_in_menu) {
        score += 1;
    }

    return score;
}

function selectEditorialTags(params: {
    availableTags: TagRow[];
    spotifyGenres: string[];
    researchFacts: string;
    articleText: string;
    artistName: string;
    songTitle: string;
}) {
    const { availableTags, spotifyGenres, researchFacts, articleText, artistName, songTitle } = params;
    const evidenceText = normalizeTagToken(
        [spotifyGenres.join(' '), researchFacts, articleText, artistName, songTitle].join(' ')
    );

    const rankedTags = availableTags
        .map((tag) => ({
            tag,
            score: scoreEditorialTag({
                tag,
                evidenceText,
                spotifyGenres,
            }),
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }

            const aOrder = a.tag.menu_order ?? 999;
            const bOrder = b.tag.menu_order ?? 999;
            if (aOrder !== bOrder) {
                return aOrder - bOrder;
            }

            return a.tag.name.localeCompare(b.tag.name);
        })
        .slice(0, 3)
        .map((item) => item.tag.name);

    return Array.from(new Set(rankedTags));
}

function buildLinkSuggestions(params: {
    artistName: string;
    songTitle: string;
    spotifyUri: string | null;
    linkPriority: string;
}): AIDraftLinkSuggestion[] {
    const { artistName, songTitle, spotifyUri, linkPriority } = params;
    const query = encodeURIComponent(`${artistName} ${songTitle}`);
    const suggestions: AIDraftLinkSuggestion[] = [
        {
            id: 'youtube-search',
            label: 'YouTube Performance Search',
            url: `https://www.youtube.com/results?search_query=${query}`,
            description: `${artistName}의 라이브나 공식 퍼포먼스를 바로 찾을 수 있는 링크`,
        },
        {
            id: 'news-search',
            label: 'Reference Search',
            url: `https://www.google.com/search?q=${query}%20interview%20review`,
            description: '인터뷰나 리뷰 문맥을 보강할 때 참고할 수 있는 검색 링크',
        },
    ];

    if (spotifyUri) {
        suggestions.unshift({
            id: 'spotify',
            label: 'Spotify Listening Link',
            url: spotifyUri,
            description: '독자가 바로 음악을 재생해 볼 수 있는 대표 링크',
        });
    }

    const priorityMap: Record<string, string> = {
        Listening: 'spotify',
        Performance: 'youtube-search',
        Reference: 'news-search',
    };
    const firstId = priorityMap[linkPriority];

    if (firstId) {
        suggestions.sort((a, b) => {
            if (a.id === firstId) return -1;
            if (b.id === firstId) return 1;
            return 0;
        });
    }

    return suggestions;
}

function buildImageSuggestions(params: {
    artistName: string;
    songTitle: string;
    concept: string;
    imageStyle: string;
}): AIDraftImageSuggestion[] {
    const { artistName, songTitle, concept, imageStyle } = params;

    return [
        {
            id: 'cover-hero',
            label: 'Hero Cover',
            altText: `${artistName}와 ${songTitle}를 상징하는 메인 커버 이미지`,
            caption: `${artistName}의 ${songTitle}가 가진 분위기를 압축한 메인 비주얼`,
            prompt: `${artistName} inspired editorial hero image for "${songTitle}", ${imageStyle} style, premium music magazine cover, ${concept}`,
        },
        {
            id: 'detail-cut',
            label: 'Detail Cut',
            altText: `${songTitle}의 사운드 결을 표현하는 디테일 컷`,
            caption: '사운드의 질감과 감정을 보여주는 디테일 이미지',
            prompt: `Abstract editorial detail image inspired by "${songTitle}" by ${artistName}, ${imageStyle} style, texture-driven composition, atmospheric, magazine feature style`,
        },
        {
            id: 'portrait',
            label: 'Portrait Visual',
            altText: `${artistName}의 분위기를 강조한 포트레이트 스타일 이미지`,
            caption: `${artistName}의 캐릭터와 무드를 강조하는 포트레이트 비주얼`,
            prompt: `Stylized portrait visual inspired by ${artistName}, ${imageStyle} style, moody lighting, contemporary music editorial, dramatic shadows`,
        },
    ];
}

function parseArticle(articleText: string, artistName: string, songTitle: string) {
    const fallbackTitle = `${artistName} - ${songTitle} Review`;
    const fallbackIntro = `A closer look at ${artistName} and the emotional architecture of "${songTitle}".`;
    const title = extractLabelValue(articleText, ['Title', 'TITLE', '제목']) || fallbackTitle;
    const articleWithoutTitle = removeLabelLine(articleText, ['Title', 'TITLE', '제목']);
    const intro =
        extractLabelValue(articleWithoutTitle, ['Intro', 'INTRO', '서두', '도입문']) ||
        fallbackIntro;
    const content = removeLabelLine(articleWithoutTitle, ['Intro', 'INTRO', '서두', '도입문']);

    return {
        title,
        intro,
        content,
    };
}

function isSpotifyErrorResult(result: SpotifyStatsResult): result is SpotifyErrorResult {
    return Boolean(result && typeof result === 'object' && 'error' in result);
}

async function fetchSetting(settingKey: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', settingKey)
        .maybeSingle<SettingRow>();

    if (error) {
        console.error(`Failed to load setting: ${settingKey}`, error);
        return null;
    }

    return data?.setting_value ?? null;
}

async function fetchYoutubeEmbed(artistName: string, songTitle: string) {
    const query = encodeURIComponent(`${artistName} ${songTitle} official music video`);
    const response = await fetch(`https://m.youtube.com/results?search_query=${query}`, {
        headers: {
            'User-Agent': 'Mozilla/5.0',
        },
        cache: 'no-store',
    });

    if (!response.ok) {
        return '';
    }

    const html = await response.text();
    const match = html.match(/watch\?v=([a-zA-Z0-9_-]{11})/);

    if (!match?.[1]) {
        return '';
    }

    const videoId = match[1];
    return `<div class="my-10 w-full aspect-video"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
}

export function toDraftErrorMessage(error: unknown) {
    const fallback = 'AI 초안 생성 중 오류가 발생했습니다.';

    if (error instanceof Error) {
        if (error.message.includes('404')) {
            return 'Gemini 모델 호출 중 404 오류가 발생했습니다. 관리자 설정에서 Gemini API 키와 모델 권한을 확인해 주세요.';
        }

        if (error.message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
            return error.message;
        }

        return error.message || fallback;
    }

    return fallback;
}

export async function createGeneratedDraftPost(
    input: DraftGenerationInput,
    callbacks?: DraftCallbacks
): Promise<DraftGenerationResult> {
    const { log, state } = createLogger(callbacks);
    const artistName = input.artistName?.trim();
    const songTitle = input.songTitle?.trim();
    const language = normalizeLanguage(input.language);
    const curationProfileId = input.curationProfileId?.trim() || defaultCurationProfileId;
    const articleLengthId = input.articleLengthId?.trim() || defaultArticleLengthId;
    const tone = normalizeTone(input.tone);
    const imageStyle = normalizeImageStyle(input.imageStyle);
    const linkPriority = normalizeLinkPriority(input.linkPriority);

    if (!artistName || !songTitle) {
        throw new Error('아티스트명과 곡 제목을 입력해 주세요.');
    }

    const apiKey = (await fetchSetting('gemini_api_key')) || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Gemini API 키가 설정되지 않았습니다. 관리자 설정에서 API 키를 먼저 등록해 주세요.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const supabase = await createClient();
    const [{ data: { user } }, hasDefaultAdminSession] = await Promise.all([
        supabase.auth.getUser(),
        hasValidDefaultAdminSession(),
    ]);
    const adminClient = hasDefaultAdminSession && !user ? createAdminClient() : null;
    const writeClient = adminClient || supabase;

    let categoryName = 'General';
    let categorySlug = 'features';
    if (input.categoryId) {
        const { data: category } = await supabase
            .from('categories')
            .select('name, slug')
            .eq('id', input.categoryId)
            .maybeSingle<CategoryRow>();

        if (category?.name) {
            categoryName = category.name;
            categorySlug = category.slug || category.name;
        }
    }

    state('research', 20);
    log(`Researching ${artistName} - ${songTitle}`);
    const researchPrompt =
        (await fetchSetting('ai_prompt_research'))
            ?.replace(/{artistName}/g, artistName)
            .replace(/{songTitle}/g, songTitle) ||
        buildResearchPrompt(artistName, songTitle);
    const researchResult = await model.generateContent(researchPrompt);
    const facts = researchResult.response.text();

    state('write', 50);
    log('Writing the Voxo draft');
    const conceptSetting = await fetchSetting('ai_prompt_concept');
    const writePromptTemplate = await fetchSetting('ai_prompt_write');
    const profile = getCurationProfile(curationProfileId);
    const finalConcept = normalizeConcept(input.concept, conceptSetting || profile.defaultConcept);
    const writePrompt =
        writePromptTemplate
            ?.replace(/{facts}/g, facts)
            .replace(/{concept}/g, finalConcept)
            .replace(/{language}/g, language)
            .replace(/{categoryName}/g, categoryName) ||
        buildWritingPrompt({
            facts,
            concept: finalConcept,
            language,
            categoryName,
            categorySlug,
            tone,
            curationProfileId,
            articleLengthId,
        });
    const writeResult = await model.generateContent(writePrompt);
    const articleText = writeResult.response.text();

    state('refine', 66);
    log('Refining title, hero excerpt, and paragraph flow');
    let refinedArticleText = articleText;

    try {
        const refinePrompt = buildRefinementPrompt({
            draftText: articleText,
            concept: finalConcept,
            language,
            categoryName,
            categorySlug,
            tone,
            curationProfileId,
            articleLengthId,
        });
        const refineResult = await model.generateContent(refinePrompt);
        const nextDraft = refineResult.response.text().trim();
        if (nextDraft) {
            refinedArticleText = nextDraft;
        }
    } catch (error) {
        console.error('Draft refinement failed', error);
        log('Refine pass skipped. Continuing with the first draft.');
    }

    state('seo', 76);
    log('Matching editorial tags from existing tag library');
    const { data: allTags } = await supabase
        .from('tags')
        .select('name, show_in_menu, menu_order');

    const parsedArticle = parseArticle(refinedArticleText, artistName, songTitle);
    const cleanedArticleBody = sanitizeGeneratedArticleBody(parsedArticle.content);
    const seoDescription = buildSeoDescription({
        title: parsedArticle.title,
        artistName,
        excerpt: parsedArticle.intro,
        intro: parsedArticle.intro,
        content: cleanedArticleBody,
    });
    const excerpt = buildHeroExcerpt({
        title: parsedArticle.title,
        artistName,
        intro: parsedArticle.intro,
        seoDescription,
        content: cleanedArticleBody,
    });
    const shareCopy = buildShareCopy({
        title: parsedArticle.title,
        artistName,
        excerpt,
    });
    let htmlContent = convertDraftToHtml(cleanedArticleBody);

    state('media', 88);
    log('Fetching media assets');
    let spotifyUri: string | null = null;
    let coverImage: string | null = null;
    let spotifyGenres: string[] = [];
    let albumTitle = '';
    let spotifyMatchedTrack = '';
    let spotifyMatchType = '';
    let spotifyMatchSource = '';

    try {
        const spotifyData = await getArtistStats('', artistName, '', songTitle);
        if (spotifyData && !isSpotifyErrorResult(spotifyData)) {
            spotifyUri = spotifyData.external_url || null;
            coverImage = spotifyData.image || null;
            spotifyGenres = spotifyData.genres || [];
            albumTitle = spotifyData.album_title || '';
            spotifyMatchedTrack = spotifyData.matched_track_title || '';
            spotifyMatchType = spotifyData.matched_entity_type || '';
            spotifyMatchSource = spotifyData.match_source || '';
        }
    } catch (error) {
        console.error('Spotify enrichment failed', error);
    }

    try {
        const youtubeEmbed = await fetchYoutubeEmbed(artistName, songTitle);
        if (youtubeEmbed) {
            htmlContent = `${youtubeEmbed}\n${htmlContent}`;
        }
    } catch (error) {
        console.error('YouTube enrichment failed', error);
    }

    htmlContent = `${buildMetadataDiv({
        excerpt,
        intro: parsedArticle.intro,
        seoDescription,
        shareCopy,
        albumTitle,
    })}\n${htmlContent}`;

    const tags = selectEditorialTags({
        availableTags: (allTags as TagRow[] | null) ?? [],
        spotifyGenres,
        researchFacts: facts,
        articleText: refinedArticleText,
        artistName,
        songTitle,
    });

    const draftTimestamp = Date.now();
    const slugBase = sanitizeSlugPart(`${artistName}-${songTitle}`) || `draft-${draftTimestamp}`;
    const { data: post, error: insertError } = await writeClient
        .from('posts')
        .insert({
            title: parsedArticle.title,
            content: htmlContent,
            artist_name: artistName,
            is_published: false,
            slug: `${slugBase}-${draftTimestamp}`,
            category_id: input.categoryId || null,
            spotify_uri: spotifyUri,
            cover_image: coverImage,
            tags,
            author_id: user?.id ?? null,
        })
        .select('id')
        .single<InsertedPostRow>();

    if (insertError || !post?.id) {
        console.error('Failed to save generated draft', insertError);
        const databaseError = insertError as SupabaseErrorLike | null;
        const isPolicyError =
            databaseError?.code === '42501' ||
            databaseError?.message?.toLowerCase().includes('row-level security');

        if (hasDefaultAdminSession && !user && !adminClient && isPolicyError) {
            const tempDraftId = `temp-${slugBase}-${draftTimestamp}`;

            state('done', 100);
            log('Draft generated locally. Database save skipped because service role is missing.');

            return {
                postId: tempDraftId,
                editorTarget: `/admin/editor?draft=${tempDraftId}`,
                savedToDatabase: false,
                handoff: {
                    artistName,
                    songTitle,
                    albumTitle,
                    spotifyMatchedTrack,
                    spotifyMatchType,
                    spotifyMatchSource,
                    language,
                    concept: finalConcept,
                    tone,
                    imageStyle,
                    linkPriority,
                    title: parsedArticle.title,
                    excerpt,
                    intro: parsedArticle.intro,
                    seoDescription,
                    shareCopy,
                    tags,
                    spotifyUri,
                    coverImage,
                    categoryId: input.categoryId || '',
                    categoryName,
                    generatedAt: new Date().toISOString(),
                    bodyHtml: htmlContent,
                    linkSuggestions: buildLinkSuggestions({
                        artistName,
                        songTitle,
                        spotifyUri,
                        linkPriority,
                    }),
                    imageSuggestions: buildImageSuggestions({
                        artistName,
                        songTitle,
                        concept: finalConcept,
                        imageStyle,
                    }),
                },
            };
        }

        if (isPolicyError) {
            throw new Error('현재 데이터베이스 쓰기 권한이 없어 초안을 저장하지 못했습니다.');
        }

        throw new Error('생성한 초안을 데이터베이스에 저장하지 못했습니다.');
    }

    state('done', 100);
    log('Draft saved successfully');

    return {
        postId: post.id,
        editorTarget: `/admin/editor?id=${post.id}`,
        savedToDatabase: true,
        handoff: {
            artistName,
            songTitle,
            albumTitle,
            spotifyMatchedTrack,
            spotifyMatchType,
            spotifyMatchSource,
            language,
            concept: finalConcept,
            tone,
            imageStyle,
            linkPriority,
            title: parsedArticle.title,
            excerpt,
            intro: parsedArticle.intro,
            seoDescription,
            shareCopy,
            tags,
            spotifyUri,
            coverImage,
            categoryId: input.categoryId || '',
            categoryName,
            generatedAt: new Date().toISOString(),
            bodyHtml: htmlContent,
            linkSuggestions: buildLinkSuggestions({
                artistName,
                songTitle,
                spotifyUri,
                linkPriority,
            }),
            imageSuggestions: buildImageSuggestions({
                artistName,
                songTitle,
                concept: finalConcept,
                imageStyle,
            }),
        },
    };
}
