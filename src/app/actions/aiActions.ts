'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { getSetting } from '@/app/actions/settingsActions';

import { getArtistStats } from '@/app/actions/spotifyActions';

export async function generatePostDraft(formData: FormData) {
    // 1. Try DB first, then ENV
    let apiKey = await getSetting('gemini_api_key');
    if (!apiKey) {
        apiKey = process.env.GEMINI_API_KEY;
    }

    if (!apiKey) {
        return { success: false, error: 'GEMINI_API_KEY가 서버(설정 또는 환경변수)에 설정되지 않았습니다. 어드민 페이지 설정 탭에서 키를 등록해주세요.' };
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const artistName = formData.get('artistName') as string;
    const songTitle = formData.get('songTitle') as string;
    const language = formData.get('language') as string || 'English';
    const categoryId = formData.get('categoryId') as string;
    const concept = formData.get('concept') as string;

    if (!artistName || !songTitle) {
        return { success: false, error: '가수명과 대표곡은 필수 입력 사항입니다.' };
    }

    try {
        // Use gemini-2.5-flash to avoid 404
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Fetch Additional Context
        let categoryName = 'General';
        let supabase = await createClient(); // Initialize early for category fetch

        if (categoryId) {
            const { data: catData } = await supabase.from('categories').select('name').eq('id', categoryId).single();
            if (catData) categoryName = catData.name;
        }

        // --- STEP 1: Research Agent (Fact Checking & Data Gathering) ---
        console.log("VOXO_AI: [Agent 1] Researching...");
        const dbResearch = await getSetting('ai_prompt_research');
        const researchPromptTemplate = dbResearch || `You are an expert music researcher. Gather factual information about the artist "{artistName}" and the song "{songTitle}".\nProvide a concise summary including:\n- Artist background (genre, debut, significant achievements)\n- Song details (release year, album, theme, producer if known)\n- Any interesting trivia or context about this specific track.\nDo not write a review, just bullet points of facts.`;
        const researchPrompt = researchPromptTemplate
            .replace(/{artistName}/g, artistName)
            .replace(/{songTitle}/g, songTitle);
        const researchResult = await model.generateContent(researchPrompt);
        const facts = researchResult.response.text();

        // --- STEP 2: Writing Agent (Voxo Editorial Style) ---
        console.log("VOXO_AI: [Agent 2] Writing Content...");
        const dbWrite = await getSetting('ai_prompt_write');
        const dbConcept = await getSetting('ai_prompt_concept');

        const finalConcept = concept || dbConcept || '음악의 철학적, 감성적 분석에 초점을 맞출 것';
        const writePromptTemplate = dbWrite || `당신은 'Voxo'라는 이름의 고품격 시네마틱 음악 매거진의 수석 에디터입니다.\n다음 팩트를 바탕으로 리뷰 기사를 약 1500자 분량으로 작성해주세요.\n\n[팩트 자료]\n{facts}\n\n[기사 컨셉/요청사항]\n{concept}\n[카테고리 분류: {categoryName}]\n\n요구사항:\n1. 언어: 이 기사는 무조건 '{language}' 언어로만 작성되어야 합니다.\n2. 제목: 상징적이고 눈길을 끄는 시네마틱한 제목 하나. (제일 첫 줄에 '제목: [작성한 제목]' 이라고 명시)\n3. 내용: 곡의 분위기와 아티스트의 행보를 문학적이고 깊이 있는 어조로 서술하세요. (HTML이 아닌 일반 Markdown 텍스트로 문단을 적절히 나누어 작성)\n4. 부제목(Intro): Voxo 매거진 특유의 시적인 서두(Intro) 한 줄을 제목 아래에 포함해주세요. (서두는 '서두: [작성한 서두]' 라고 명시)`;

        const writePrompt = writePromptTemplate
            .replace(/{facts}/g, facts)
            .replace(/{concept}/g, finalConcept)
            .replace(/{language}/g, language)
            .replace(/{categoryName}/g, categoryName);
        const writeResult = await model.generateContent(writePrompt);
        const articleText = writeResult.response.text();

        // --- STEP 3: SEO Agent (Keywords Extraction) ---
        console.log("VOXO_AI: [Agent 3] Extracting SEO Tags...");

        // Fetch existing tags from database
        const { data: allTags } = await supabase.from('tags').select('name');
        const existingTagsStr = allTags ? allTags.map(t => t.name).join(', ') : '';

        const dbSeo = await getSetting('ai_prompt_seo');
        const seoPromptTemplate = dbSeo || `다음 기사 내용을 바탕으로, 구글 검색 엔진 최적화(SEO)에 가장 적합한 메타 태그/키워드들을 추출해주세요.

[기존 태그 목록]
{existingTags}

[기사 내용]
{articleText}

🚨 엄격한 요구사항 (반드시 지킬 것):
1. 최우선 순위: 위의 [기존 태그 목록] 중에서 기사와 연관된 태그를 찾아 결과의 앞쪽에 배치하세요.
2. 추가 태그: [기존 태그 목록]에서 고른 태그만으로 부족할 때만 1~5개 정도를 새롭게 만들어 추가하세요.
3. ⭐️형식 제한 (가장 중요)⭐️: 모든 태그는 '반드시 짧고 명료한 1~2 단어의 명사 형태'여야 합니다. (예: 팝, 신스팝, 라이브, 앨범리뷰)
4. 절대 금지: 문장형태, 서술형, 구구절절한 설명으로 태그를 생성하는 것을 절대 금지합니다.
5. 출력 형식: 오직 쉼표(,)로만 구분된 텍스트 하나만 출력하세요. 다른 말은 일절 덧붙이지 마세요.`;

        const seoPrompt = seoPromptTemplate
            .replace(/{articleText}/g, articleText)
            .replace(/{existingTags}/g, existingTagsStr);
        const seoResult = await model.generateContent(seoPrompt);
        const tags = seoResult.response.text().split(',').map(tag => tag.trim().replace(/^#/, ''));

        // Parse title, intro, and body
        let title = `${artistName} - ${songTitle} 리뷰`;
        let intro = `Examining the resonance within ${artistName}'s sonic landscape.`;
        let content = articleText;

        const titleMatch = articleText.match(/제목:\s*(.*)/);
        if (titleMatch) {
            title = titleMatch[1].trim();
            content = content.replace(titleMatch[0], '').trim();
        }

        const introMatch = content.match(/서두:\s*(.*)/);
        if (introMatch) {
            intro = introMatch[1].trim();
            content = content.replace(introMatch[0], '').trim();
        }

        // Convert simple markdown to HTML paragraphs
        let htmlContent = content.split('\n\n').map(p => {
            const text = p.trim();
            if (!text) return '';
            if (text.startsWith('#')) return `<h3>${text.replace(/^#+\s*/, '')}</h3>`;
            return `<p>${text.replace(/\n/g, '<br/>')}</p>`;
        }).filter(Boolean).join('\n');

        // --- STEP 4: Media Fetching (Spotify & YouTube) ---
        console.log("VOXO_AI: Fetching Multimedia...");
        let spotifyUri = null;
        let coverImage = null;
        try {
            const spotifyData = await getArtistStats(`${artistName} ${songTitle}`, artistName) as any;
            if (spotifyData && !spotifyData.error) {
                spotifyUri = spotifyData.external_url;
                coverImage = spotifyData.image;
            }
        } catch (e) { console.error("Spotify fetch failed:", e); }

        let youtubeIframe = "";
        try {
            // Simple public HTML scrape for YouTube
            const yQuery = encodeURIComponent(`${artistName} ${songTitle} official music video`);
            const yRes = await fetch(`https://m.youtube.com/results?search_query=${yQuery}`, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                cache: 'no-store'
            });
            const yHtml = await yRes.text();
            const vMatch = yHtml.match(/watch\?v=([a-zA-Z0-9_-]{11})/);
            if (vMatch && vMatch[1]) {
                const videoId = vMatch[1];
                youtubeIframe = `<div class="my-10 w-full aspect-video"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
                // Prepend youtube video to content
                htmlContent = youtubeIframe + '\n' + htmlContent;
            }
        } catch (e) { console.error("YouTube parse failed:", e); }

        // Inject Voxo Metadata for custom Intro/Excerpt
        const metadataDiv = `<div id="voxo-metadata" data-excerpt="${intro.replace(/"/g, '&quot;')}" data-intro="${intro.replace(/"/g, '&quot;')}"></div>\n`;
        htmlContent = metadataDiv + htmlContent;


        // --- STEP 5: Database Save ---
        console.log("VOXO_AI: Saving to Database...");

        const slug = `${artistName}-${songTitle}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const { data: post, error: insertError } = await supabase.from('posts').insert({
            title: title,
            content: htmlContent,
            artist_name: artistName,
            is_published: false,
            slug: `${slug}-${Date.now()}`,
            category_id: categoryId || null,
            spotify_uri: spotifyUri,
            cover_image: coverImage,
            tags: tags
        }).select().single();

        if (insertError) {
            console.error('Supabase Insert Error:', insertError);
            return { success: false, error: '데이터베이스 임시저장 중 오류가 발생했습니다.' };
        }

        return { success: true, postId: post.id };
    } catch (error: any) {
        console.error('Gemini AI Error:', error);

        // Let's try to fallback to gemini-1.5-flash if pro latest also 404s
        let errMsg = error.message || 'AI 생성 중 알 수 없는 오류가 발생했습니다.';
        if (errMsg.includes('404')) {
            errMsg = 'Gemini API 모델명 오류(404)가 발생했습니다. 구글 AI Studio에서 해당 API Key가 gemini-1.5 모델 사용 권한을 가졌는지 확인해주세요.';
        }

        return { success: false, error: errMsg };
    }
}
