import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { getArtistStats } from '@/app/actions/spotifyActions';
import type { SpotifyErrorResult, SpotifyStatsResult } from '@/types/spotify';

export type DraftAgent = 'research' | 'write' | 'seo' | 'media' | 'done';

export interface DraftGenerationInput {
  artistName: string;
  songTitle: string;
  language?: string;
  categoryId?: string;
  concept?: string;
}

export interface DraftGenerationResult {
  postId: string;
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
}

interface TagRow {
  name: string;
}

interface InsertedPostRow {
  id: string;
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
  return concept?.trim() || fallback?.trim() || 'Focus on mood, production detail, and why the song matters.';
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

function buildMetadataDiv(intro: string) {
  const safeIntro = intro.replace(/"/g, '&quot;');
  return `<div id="voxo-metadata" data-excerpt="${safeIntro}" data-intro="${safeIntro}"></div>`;
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
}) {
  const { facts, concept, language, categoryName } = params;

  return [
    'You are the lead editor for Voxo, a polished music culture magazine.',
    `Write the full article in ${language}.`,
    `Category context: ${categoryName}.`,
    `Creative direction: ${concept}`,
    '',
    'Use the research notes below as factual grounding:',
    facts,
    '',
    'Output rules:',
    '1. Start with one line in the format "Title: ..."',
    '2. Add one line in the format "Intro: ..."',
    '3. Then write the article body in plain Markdown-style paragraphs.',
    '4. Aim for a rich but readable feature article with clear structure.',
    '5. Do not return HTML.',
  ].join('\n');
}

function buildSeoPrompt(articleText: string, existingTags: string) {
  return [
    'You are preparing SEO tags for a music magazine article.',
    'Prefer tags that already exist when they are relevant.',
    'Create a short comma-separated list of 3 to 8 tags.',
    'Each tag should be a noun phrase of one or two words.',
    'Return only comma-separated tags.',
    '',
    `Existing tags: ${existingTags || 'none'}`,
    '',
    'Article:',
    articleText,
  ].join('\n');
}

function parseArticle(articleText: string, artistName: string, songTitle: string) {
  const fallbackTitle = `${artistName} - ${songTitle} Review`;
  const fallbackIntro = `A closer look at ${artistName} and the emotional architecture of "${songTitle}".`;
  const title = extractLabelValue(articleText, ['Title', 'TITLE', '제목']) || fallbackTitle;
  const articleWithoutTitle = removeLabelLine(articleText, ['Title', 'TITLE', '제목']);
  const intro = extractLabelValue(articleWithoutTitle, ['Intro', 'INTRO', '서두', '도입문']) || fallbackIntro;
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
      return 'Gemini 모델 호출 중 404 오류가 발생했습니다. 관리자 설정에서 Gemini API 키와 모델 사용 권한을 확인해주세요.';
    }

    return error.message || fallback;
  }

  return fallback;
}

export async function createGeneratedDraftPost(
  input: DraftGenerationInput,
  callbacks?: DraftCallbacks,
): Promise<DraftGenerationResult> {
  const { log, state } = createLogger(callbacks);
  const artistName = input.artistName?.trim();
  const songTitle = input.songTitle?.trim();
  const language = normalizeLanguage(input.language);

  if (!artistName || !songTitle) {
    throw new Error('아티스트명과 곡 제목은 꼭 입력해주세요.');
  }

  const apiKey = (await fetchSetting('gemini_api_key')) || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API 키가 설정되지 않았습니다. 관리자 설정에서 API 키를 먼저 등록해주세요.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const supabase = await createClient();

  let categoryName = 'General';
  if (input.categoryId) {
    const { data: category } = await supabase
      .from('categories')
      .select('name')
      .eq('id', input.categoryId)
      .maybeSingle<CategoryRow>();

    if (category?.name) {
      categoryName = category.name;
    }
  }

  state('research', 20);
  log(`Researching ${artistName} - ${songTitle}`);
  const researchPrompt =
    (await fetchSetting('ai_prompt_research'))?.replace(/{artistName}/g, artistName).replace(/{songTitle}/g, songTitle) ||
    buildResearchPrompt(artistName, songTitle);
  const researchResult = await model.generateContent(researchPrompt);
  const facts = researchResult.response.text();

  state('write', 50);
  log('Writing the Voxo draft');
  const conceptSetting = await fetchSetting('ai_prompt_concept');
  const writePromptTemplate = await fetchSetting('ai_prompt_write');
  const finalConcept = normalizeConcept(input.concept, conceptSetting);
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
    });
  const writeResult = await model.generateContent(writePrompt);
  const articleText = writeResult.response.text();

  state('seo', 72);
  log('Extracting SEO tags');
  const { data: allTags } = await supabase.from('tags').select('name');
  const existingTags = (allTags as TagRow[] | null)?.map((tag) => tag.name).join(', ') || '';
  const seoPromptTemplate = await fetchSetting('ai_prompt_seo');
  const seoPrompt =
    seoPromptTemplate
      ?.replace(/{articleText}/g, articleText)
      .replace(/{existingTags}/g, existingTags) ||
    buildSeoPrompt(articleText, existingTags);
  const seoResult = await model.generateContent(seoPrompt);
  const tags = Array.from(
    new Set(
      seoResult.response
        .text()
        .split(',')
        .map((tag) => tag.trim().replace(/^#/, ''))
        .filter(Boolean),
    ),
  );

  const parsedArticle = parseArticle(articleText, artistName, songTitle);
  let htmlContent = convertDraftToHtml(parsedArticle.content);

  state('media', 88);
  log('Fetching media assets');
  let spotifyUri: string | null = null;
  let coverImage: string | null = null;

  try {
    const spotifyData = await getArtistStats(`${artistName} ${songTitle}`, artistName);
    if (spotifyData && !isSpotifyErrorResult(spotifyData)) {
      spotifyUri = spotifyData.external_url || null;
      coverImage = spotifyData.image || null;
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

  htmlContent = `${buildMetadataDiv(parsedArticle.intro)}\n${htmlContent}`;

  const slugBase = sanitizeSlugPart(`${artistName}-${songTitle}`) || `draft-${Date.now()}`;
  const { data: post, error: insertError } = await supabase
    .from('posts')
    .insert({
      title: parsedArticle.title,
      content: htmlContent,
      artist_name: artistName,
      is_published: false,
      slug: `${slugBase}-${Date.now()}`,
      category_id: input.categoryId || null,
      spotify_uri: spotifyUri,
      cover_image: coverImage,
      tags,
    })
    .select('id')
    .single<InsertedPostRow>();

  if (insertError || !post?.id) {
    console.error('Failed to save generated draft', insertError);
    throw new Error('생성된 초안을 데이터베이스에 저장하지 못했습니다.');
  }

  state('done', 100);
  log('Draft saved successfully');

  return { postId: post.id };
}
