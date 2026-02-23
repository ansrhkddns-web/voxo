'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generatePostDraft(formData: FormData) {
    if (!genAI || !apiKey) {
        return { success: false, error: 'GEMINI_API_KEY가 서버에 설정되지 않았습니다. 관리자 문서(env.local)를 참고하여 키를 등록해주세요.' };
    }

    const artistName = formData.get('artistName') as string;
    const songTitle = formData.get('songTitle') as string;
    const concept = formData.get('concept') as string;

    if (!artistName || !songTitle) {
        return { success: false, error: '가수명과 대표곡은 필수 입력 사항입니다.' };
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
당신은 'Voxo'라는 이름의 고품격 시네마틱 음악 매거진의 전문 에디터입니다.
다음 정보를 바탕으로 SEO가 최적화된 심도 있는 음악 기사 형식의 리뷰를 작성해주세요.

- 아티스트: ${artistName}
- 대표곡(타이틀): ${songTitle}
- 기사 컨셉: ${concept || '심도 있는 감성적 리뷰'}

요구사항:
1. 제목: 독자의 이목을 끄는 시네마틱하고 상징적인 제목을 하나 만들어주세요. (제목 앞에는 '제목: ' 이라고 붙여주세요)
2. 내용: Voxo 매거진 스타일로, 곡명과 아티스트에 대한 철학적이고 감성적인 분석을 담아주세요. 마치 한 편의 영화를 음악으로 듣는 듯한 깊이 있는 평론이어야 합니다. 약 1000자 이상으로 작성하세요.
3. SEO 태그: 글의 맨 마지막 줄에 '#태그1, #태그2, #태그3' 형식으로 관련 키워드 3~5개를 추천해주세요.
4. 문단은 적절히 나누고 HTML이 아닌 일반 플레인 텍스트 마크다운(Markdown) 형식으로 작성하세요.
        `.trim();

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 파싱 (제목, 본문, 태그)
        let title = `${artistName} - ${songTitle} 리뷰`;
        let content = responseText;

        const titleMatch = responseText.match(/제목:\s*(.*)/);
        if (titleMatch) {
            title = titleMatch[1].trim();
            content = content.replace(titleMatch[0], '').trim();
        }

        // 간단한 HTML 변환 (줄바꿈 -> p 태그)
        const htmlContent = content.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('\n');

        // Supabase에 임시 저장
        const supabase = await createClient();

        // 카테고리 (기본값 설정 - 필요시 수정)
        const { data: categoryData } = await supabase.from('categories').select('id').limit(1).single();

        const slug = `${artistName}-${songTitle}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const { data: post, error: insertError } = await supabase.from('posts').insert({
            title: title,
            content: htmlContent,
            artist_name: artistName,
            is_published: false, // 임시저장
            slug: `${slug}-${Date.now()}`,
            category_id: categoryData?.id || null
        }).select().single();

        if (insertError) {
            console.error('Supabase Insert Error:', insertError);
            return { success: false, error: '데이터베이스 임시저장 중 오류가 발생했습니다.' };
        }

        return { success: true, postId: post.id };
    } catch (error: any) {
        console.error('Gemini AI Error:', error);
        return { success: false, error: error.message || 'AI 생성 중 알 수 없는 오류가 발생했습니다.' };
    }
}
