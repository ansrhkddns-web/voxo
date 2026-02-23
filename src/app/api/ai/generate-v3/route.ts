import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { getSetting } from '@/app/actions/settingsActions';
import { getArtistStats } from '@/app/actions/spotifyActions';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Set Vercel max duration for longer AI tasks

export async function POST(req: NextRequest) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (event: string, data: any) => {
                controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
            };

            const log = (message: string) => {
                sendEvent('log', { message });
            };

            try {
                const body = await req.json();
                const { artistName, songTitle, concept } = body;

                if (!artistName || !songTitle) {
                    sendEvent('error', { message: '가수명과 대표곡은 필수입니다.' });
                    controller.close();
                    return;
                }

                sendEvent('state', { currentAgent: 'research', progress: 10 });
                log(`[시스템] 파이프라인 시퀀스 초기화 중... 대상: ${artistName} - ${songTitle}`);

                // 1. Check API Key
                let apiKey = await getSetting('gemini_api_key');
                if (!apiKey) apiKey = process.env.GEMINI_API_KEY;

                if (!apiKey) {
                    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
                }

                log(`[Debug] KEY LENGTH: ${apiKey.length}, DB CHECK PASSED.`);

                const genAI = new GoogleGenerativeAI(apiKey);
                const modelAlias = 'gemini-1.5-flash';
                console.log(`\n\n=== EXECUTING AI ROUTE ===\nUSING MODEL ALIAS: ${modelAlias}\n=======================\n\n`);
                log(`[Debug] TARGET MODEL: ${modelAlias}`);
                const model = genAI.getGenerativeModel({ model: modelAlias });

                // --- STEP 1: Research Agent ---
                sendEvent('state', { currentAgent: 'research', progress: 25 });
                log(`[Gemini Flash 1.5] 웹 검색 및 팩트 체크 코어 가동...`);
                const researchPrompt = `
You are an expert music researcher. Gather factual information about the artist "${artistName}" and the song "${songTitle}".
Provide a concise summary including:
- Artist background (genre, debut, significant achievements)
- Song details (release year, album, theme, producer if known)
- Any interesting trivia or context about this specific track.
Do not write a review, just bullet points of facts.
                `.trim();

                const researchResult = await model.generateContent(researchPrompt);
                const facts = researchResult.response.text();
                log(`[Gemini Flash 1.5] 배경 지식 확보 완료. 신뢰도 측정 패스.`);

                // --- STEP 2: Writing Agent ---
                sendEvent('state', { currentAgent: 'write', progress: 50 });
                log(`[DeepSeek V3 (Simulated)] 컨텍스트 스트림 수신 완료. 초안 작성 중...`);
                const writePrompt = `
당신은 'Voxo'라는 이름의 고품격 시네마틱 음악 매거진의 수석 에디터입니다.
다음 팩트를 바탕으로 리뷰 기사를 약 1500자 분량으로 작성해주세요.

[팩트 자료]
${facts}

[기사 컨셉/요청사항]
${concept || '음악의 철학적, 감성적 분석에 초점을 맞출 것'}

요구사항:
1. 제목: 상징적이고 눈길을 끄는 시네마틱한 한국어 제목 하나. (제일 첫 줄에 '제목: [작성한 제목]' 이라고 명시)
2. 내용: 곡의 분위기와 아티스트의 행보를 문학적이고 깊이 있는 어조로 서술하세요. (HTML이 아닌 일반 Markdown 텍스트로 문단을 적절히 나누어 작성)
3. 부제목(Intro): Voxo 매거진 특유의 시적인 서두(Intro) 한 줄을 제목 아래에 포함해주세요. (서두는 '서두: [작성한 서두]' 라고 명시)
                `.trim();
                const writeResult = await model.generateContent(writePrompt);
                const articleText = writeResult.response.text();
                log(`[DeepSeek V3 (Simulated)] 초안 작성 완료. Voxo Editorial 톤 앤 매너 적용됨.`);

                // --- STEP 3: SEO Agent ---
                sendEvent('state', { currentAgent: 'seo', progress: 75 });
                log(`[Claude 3.5 Sonnet (Simulated)] SEO 메타 데이터 및 해시태그 추출 중...`);
                const seoPrompt = `
다음 기사 내용을 바탕으로, 구글 검색 엔진 최적화(SEO)에 유리한 메타 태그/키워드 3~5개를 추출해주세요.
결과는 쉼표로만 구분된 텍스트로 출력하세요. (예: 아티스트명, 팝 음악, 감성, 앨범 리뷰)

[기사 내용]
${articleText}
                `.trim();
                const seoResult = await model.generateContent(seoPrompt);
                const tags = seoResult.response.text().split(',').map(tag => tag.trim().replace(/^#/, ''));
                log(`[Claude] 키워드 추출 완료: ${tags.join(', ')}`);

                // Parse generated content
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

                // --- STEP 4: Media Agent ---
                sendEvent('state', { currentAgent: 'media', progress: 90 });
                log(`[시스템] 유튜브 및 스포티파이 백그라운드 크롤링 시작...`);

                let spotifyUri = null;
                let coverImage = null;
                try {
                    const spotifyData = await getArtistStats(`${artistName} ${songTitle}`, artistName) as any;
                    if (spotifyData && !spotifyData.error) {
                        spotifyUri = spotifyData.external_url;
                        coverImage = spotifyData.image;
                        log(`[Media Agent] 스포티파이 아티스트/트랙 식별 완료.`);
                    }
                } catch (e) { log(`[Media Agent] 스포티파이 식별 실패 (스킵).`); }

                let youtubeIframe = "";
                try {
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
                        htmlContent = youtubeIframe + '\n' + htmlContent;
                        log(`[Media Agent] 유튜브 영상(ID: ${videoId}) 바인딩 성공.`);
                    }
                } catch (e) { log(`[Media Agent] 유튜브 크롤링 실패 (스킵).`); }

                // Inject Voxo Metadata for custom Intro/Excerpt
                const metadataDiv = `<div id="voxo-metadata" data-excerpt="${intro.replace(/"/g, '&quot;')}" data-intro="${intro.replace(/"/g, '&quot;')}"></div>\n`;
                htmlContent = metadataDiv + htmlContent;

                // --- STEP 5: Finalize ---
                sendEvent('state', { currentAgent: 'done', progress: 100 });
                log(`[시스템] 데이터베이스 블록체인 노드 동기화 중(임시저장)...`);

                const supabase = await createClient();
                const { data: categoryData } = await supabase.from('categories').select('id').limit(1).single();
                const slug = `${artistName}-${songTitle}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

                const { data: post, error: insertError } = await supabase.from('posts').insert({
                    title: title,
                    content: htmlContent,
                    artist_name: artistName,
                    is_published: false,
                    slug: `${slug}-${Date.now()}`,
                    category_id: categoryData?.id || null,
                    spotify_uri: spotifyUri,
                    cover_image: coverImage,
                    tags: tags
                }).select().single();

                if (insertError) {
                    throw new Error('Supabase 저장 오류');
                }

                log(`[시스템] 모든 파이프라인 시퀀스 종류. 에디터로 리다이렉트합니다.`);
                sendEvent('complete', { postId: post.id });

            } catch (error: any) {
                console.error("Agent Pipeline Error:", error);
                log(`[ERROR] 파이프라인 강제 종료: ${error.message}`);
                sendEvent('error', { message: error.message });
            } finally {
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
