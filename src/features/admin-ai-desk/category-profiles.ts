export interface CategoryEditorialProfile {
    id: string;
    label: string;
    summary: string;
    editorialGoal: string;
    toneDirectives: string[];
    structureDirectives: string[];
    middleParagraphMoves: string[];
    titleDirective: string;
    heroExcerptDirective: string;
    openingDirective: string;
    endingDirective: string;
}

export const categoryProfiles: CategoryEditorialProfile[] = [
    {
        id: 'archives',
        label: 'Archives',
        summary: '기록성과 맥락을 살리는 아카이브형 기사',
        editorialGoal:
            '작품을 단순 감상이 아니라 기록과 재조명의 대상으로 다루고, 시대적 맥락과 다시 꺼내 읽을 이유를 남긴다.',
        toneDirectives: [
            'Write with a reflective, archival tone.',
            'Emphasize why the song deserves to be revisited or preserved.',
            'Let the article feel like a rediscovery, not a breaking update.',
        ],
        structureDirectives: [
            'Frame the piece through memory, legacy, or revisitation.',
            'Include release-era or historical context naturally.',
        ],
        middleParagraphMoves: [
            'Move from present-day listening back into release-era context.',
            'Explain what details feel preserved or newly revealed on revisit.',
            'Tie the song to memory, legacy, or artistic afterlife.',
        ],
        titleDirective:
            'Use a reflective, archival headline that suggests rediscovery, legacy, or renewed relevance.',
        heroExcerptDirective:
            'The hero excerpt should feel like a reintroduction: calm, evocative, and aware of time, memory, and return.',
        openingDirective:
            'Open with a sense of rediscovery, memory, or afterlife, as if the song is returning to the present.',
        endingDirective:
            'Close by explaining what remains worth preserving, replaying, or remembering about the song.',
    },
    {
        id: 'cover-story',
        label: 'Cover Story',
        summary: '대표 기사처럼 넓고 입체적으로 쓰는 메인 피처',
        editorialGoal:
            '한 곡을 넘어 가수와 시대감, 미학까지 넓게 엮어 메인 특집 기사처럼 읽히게 만든다.',
        toneDirectives: [
            'Write with prestige-feature confidence and breadth.',
            'Balance intimacy with scale.',
            'Let the article feel expansive and headline-worthy.',
        ],
        structureDirectives: [
            'Open with a strong cinematic scene or thesis.',
            'Move between the song, the artist, and the wider cultural frame.',
        ],
        middleParagraphMoves: [
            'Expand from the track into the artist’s wider identity.',
            'Widen the lens to scene, era, or cultural meaning.',
            'Return repeatedly to concrete music details so the scale still feels earned.',
        ],
        titleDirective:
            'Use a flagship, cinematic headline with ambition and scale, without becoming bloated or vague.',
        heroExcerptDirective:
            'The hero excerpt should feel expansive and premium, promising a big-angle read with emotional weight.',
        openingDirective:
            'Open big, with a cinematic image, bold thesis, or scene that feels worthy of a flagship feature.',
        endingDirective:
            'Close with scale and resonance, leaving the reader with a sense of artistic or cultural significance.',
    },
    {
        id: 'editors-pick',
        label: "Editor's Pick",
        summary: '에디터가 독자에게 직접 권하는 추천형 기사',
        editorialGoal:
            '독자가 바로 플레이 버튼을 누르게 만드는 추천의 설득력을 만든다.',
        toneDirectives: [
            'Keep the article warm, inviting, and recommendation-driven.',
            'Sound confident, but never like ad copy.',
            'Prioritize immediacy and emotional accessibility.',
        ],
        structureDirectives: [
            'Explain quickly why this is worth hearing now.',
            'Keep the pacing brisk and persuasive.',
        ],
        middleParagraphMoves: [
            'Identify the most immediate sonic pleasure or emotional entry point.',
            'Explain who this song is for and when it lands best.',
            'Keep the analysis selective and listener-friendly.',
        ],
        titleDirective:
            'Use a warm, persuasive, recommendation-style headline that makes the reader curious immediately.',
        heroExcerptDirective:
            'The hero excerpt should quickly explain why this song is worth hearing now and what kind of feeling it delivers.',
        openingDirective:
            'Open with an immediate recommendation hook that tells the reader why this should be their next listen.',
        endingDirective:
            'Close with a gentle but memorable invitation to press play.',
    },
    {
        id: 'features',
        label: 'Features',
        summary: '분석과 감성, 맥락을 균형 있게 담는 피처 기사',
        editorialGoal:
            '읽는 맛과 정보, 감정의 균형이 살아 있는 정석적인 뮤직 피처를 만든다.',
        toneDirectives: [
            'Write with polished magazine-feature rhythm.',
            'Blend narrative, analysis, and emotional reading evenly.',
            'Avoid news brevity and avoid academic stiffness.',
        ],
        structureDirectives: [
            'Give each section enough breathing room.',
            'Let the article build in layers rather than rushing to the conclusion.',
        ],
        middleParagraphMoves: [
            'Layer narrative framing, sound analysis, and context in sequence.',
            'Let each section add one new dimension to the reader’s understanding.',
            'Balance intimacy, information, and emotional interpretation.',
        ],
        titleDirective:
            'Use a polished feature headline that balances style, clarity, and curiosity.',
        heroExcerptDirective:
            'The hero excerpt should promise depth, context, and mood in one compact paragraph.',
        openingDirective:
            'Open with a stylish but controlled hook that balances narrative and analysis.',
        endingDirective:
            'Close by gathering the layers of the feature into one strong, reflective takeaway.',
    },
    {
        id: 'focus',
        label: 'Focus',
        summary: '특정 포인트를 선명하게 파고드는 집중형 기사',
        editorialGoal:
            '핵심 한두 포인트를 깊고 선명하게 파고들어, 읽고 나면 무엇이 중요한지 분명하게 남게 한다.',
        toneDirectives: [
            'Stay sharp, focused, and intentional.',
            'Cut away unnecessary detours and keep the article centered on the strongest angle.',
            'Make each paragraph serve the main thesis.',
        ],
        structureDirectives: [
            'Choose one strong perspective and keep returning to it.',
            'Use repetition carefully to sharpen emphasis.',
        ],
        middleParagraphMoves: [
            'Choose one dominant idea and test the song against it from several angles.',
            'Use each middle section to sharpen, not broaden, the thesis.',
            'Keep examples highly selective and on-point.',
        ],
        titleDirective:
            'Use a sharp, angle-driven headline that signals exactly what this piece is focusing on.',
        heroExcerptDirective:
            'The hero excerpt should be concentrated and precise, making the central argument obvious right away.',
        openingDirective:
            'Open by stating the key angle or tension as early and clearly as possible.',
        endingDirective:
            'Close by sharpening the main point one last time, with clarity rather than breadth.',
    },
    {
        id: 'news',
        label: 'News',
        summary: '사실 전달과 의미 정리를 우선하는 뉴스형 기사',
        editorialGoal:
            '새 소식 전달이 우선이지만, 단순 전달에서 끝나지 않고 왜 중요한지까지 짚는다.',
        toneDirectives: [
            'Be clear, timely, and factual first.',
            'Keep the tone tighter and more direct than a review or essay.',
            'Add interpretation only after the core facts are established.',
        ],
        structureDirectives: [
            'Lead with the key news value immediately.',
            'Then explain significance, artist context, and listener impact.',
        ],
        middleParagraphMoves: [
            'Establish the confirmed facts first.',
            'Add artist or release context only after the update is clear.',
            'Then explain what the development means for listeners or the conversation around the artist.',
        ],
        titleDirective:
            'Use a clear, timely, informative headline that surfaces the news value first.',
        heroExcerptDirective:
            'The hero excerpt should summarize the factual development and then add one line of significance.',
        openingDirective:
            'Open with the most important factual development first, in a direct and timely way.',
        endingDirective:
            'Close with concise significance: what this means for the artist, listeners, or the broader conversation.',
    },
    {
        id: 'reviews',
        label: 'Reviews',
        summary: '감정과 근거를 함께 밀어붙이는 정통 리뷰',
        editorialGoal:
            '좋고 싫음의 단순 평가가 아니라, 왜 그렇게 들리는지까지 설득력 있게 리뷰한다.',
        toneDirectives: [
            'Write as a serious critic with emotional sensitivity.',
            'Make every opinion accountable to the music.',
            'Let the review feel immersive, not score-driven only.',
        ],
        structureDirectives: [
            'Balance judgment, close listening, and context.',
            'Do not rush to verdict language too early.',
        ],
        middleParagraphMoves: [
            'Move from emotional impression into close listening.',
            'Test the song’s strongest and weakest points against actual musical evidence.',
            'Only then widen into context and critical judgment.',
        ],
        titleDirective:
            'Use a critic’s headline: emotionally charged but anchored in a clear evaluative angle.',
        heroExcerptDirective:
            'The hero excerpt should hint at both feeling and judgment, making the reader want the full review.',
        openingDirective:
            'Open with an emotionally precise observation or tension inside the song, not with the score or verdict.',
        endingDirective:
            'Close with a considered critical verdict that feels earned by the analysis.',
    },
];

function normalizeCategoryId(value: string) {
    return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export function getCategoryEditorialProfile(input?: { slug?: string | null; name?: string | null } | string) {
    const normalized =
        typeof input === 'string'
            ? normalizeCategoryId(input)
            : normalizeCategoryId(input?.slug || input?.name || '');

    return (
        categoryProfiles.find((profile) => profile.id === normalized) ??
        categoryProfiles.find((profile) => profile.id === 'features') ??
        categoryProfiles[0]
    );
}

export function buildCategoryPromptBlock(input?: { slug?: string | null; name?: string | null } | string) {
    const profile = getCategoryEditorialProfile(input);

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
