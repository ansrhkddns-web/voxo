export interface CurationProfileDefinition {
    id: string;
    label: string;
    shortDescription: string;
    longDescription: string;
    readerPromise: string;
    defaultConcept: string;
    requiredSections: string[];
    writingDirectives: string[];
    preferredPhrases: string[];
    avoidPhrases: string[];
    styleExamples: string[];
}

export interface ArticleLengthPreset {
    id: string;
    label: string;
    wordRangeLabel: string;
    guidance: string;
}

export const defaultCurationProfileId = 'deep-review';
export const defaultArticleLengthId = 'feature';

export const curationProfiles: CurationProfileDefinition[] = [
    {
        id: 'deep-review',
        label: 'Deep Review',
        shortDescription: '한 곡을 깊이 파고드는 감성 중심 리뷰',
        longDescription:
            '트랙의 감정선, 보컬 결, 프로덕션, 가사 정서를 치밀하게 짚으면서도 독자가 음악을 다시 듣고 싶어지게 만드는 정통 큐레이션 리뷰.',
        readerPromise:
            '이 글을 읽으면 왜 이 노래가 오래 남는지, 어디서 감정이 터지는지, 어떤 사운드가 마음을 건드리는지까지 따라가게 된다.',
        defaultConcept:
            'Lead with atmosphere and emotion, then dig into vocals, production detail, lyrical tension, and why the track lingers after it ends.',
        requiredSections: [
            'Opening scene and emotional hook',
            'Track context and release-era framing',
            'Close listening: vocals, production, arrangement',
            'Artist angle: what this song reveals about the musician',
            'Why it still matters now',
        ],
        writingDirectives: [
            'Write with tactile, emotional language instead of generic praise.',
            'Move from feeling to evidence: explain which musical detail creates each emotion.',
            'Avoid bullet-point review tone. Keep it as flowing magazine prose.',
        ],
        preferredPhrases: [
            'lingers after the chorus fades',
            'the vocal sounds close enough to bruise',
            'the arrangement opens like a slow-burning confession',
            'the production gives the emotion its shadow',
        ],
        avoidPhrases: [
            'masterpiece',
            'great song',
            'good beat',
            'easy listening summary',
        ],
        styleExamples: [
            'The song does not explode so much as it seeps in, leaving its ache behind each line.',
            'What sounds understated at first becomes devastating once the vocal and arrangement start leaning on each other.',
        ],
    },
    {
        id: 'editor-pick',
        label: 'Editor Pick',
        shortDescription: '지금 꼭 들어야 하는 이유를 설득하는 추천형 기사',
        longDescription:
            '독자에게 이 곡을 왜 지금 들어야 하는지, 어떤 순간에 어울리는지, 어떤 감정으로 연결되는지를 부드럽고 매력적으로 권하는 에디터 추천 글.',
        readerPromise:
            '이 글을 읽으면 낯선 곡이어도 한번 틀어보고 싶어지고, 이미 아는 곡이어도 다시 꺼내 듣고 싶어진다.',
        defaultConcept:
            'Write like an editor making a heartfelt recommendation: accessible, stylish, emotionally vivid, and persuasive without sounding promotional.',
        requiredSections: [
            'Immediate recommendation hook',
            'What kind of listener or moment this song fits',
            'Key sonic details that make it memorable',
            'Artist context in a concise, inviting way',
            'Closing invitation to listen',
        ],
        writingDirectives: [
            'Keep the piece inviting and warm, but still specific about the music.',
            'Use scene-setting language so the song feels tied to a moment, mood, or time of day.',
            'End with a memorable takeaway, not a dry summary.',
        ],
        preferredPhrases: [
            'if you need one track tonight',
            'this is the kind of song that stays with you on the way home',
            'an immediate recommendation',
            'easy to return to, hard to shake off',
        ],
        avoidPhrases: [
            'you must listen',
            'perfect track',
            'everyone will love this',
            'stream it now',
        ],
        styleExamples: [
            'If you need one song to carry the late-night air tonight, this is an easy place to start.',
            'It wins you over quietly, then leaves you wondering why you did not return to it sooner.',
        ],
    },
    {
        id: 'artist-focus',
        label: 'Artist Focus',
        shortDescription: '한 곡을 통해 가수의 세계관과 커리어를 읽는 기사',
        longDescription:
            '단일 트랙을 출발점으로 삼아 아티스트의 커리어, 미학, 세계관, 시대적 위치를 파고드는 피처형 기사.',
        readerPromise:
            '이 글을 읽으면 이 노래가 그 가수 전체 작업 안에서 왜 중요한지, 어떤 미학을 대표하는지까지 이어서 보게 된다.',
        defaultConcept:
            'Treat the song as an entry point into the artist’s larger world, career arc, signature themes, and emotional identity.',
        requiredSections: [
            'Why this song is a revealing entry point',
            'Artist career or era background',
            'How the song reflects the artist’s style and worldview',
            'Specific musical analysis tied to identity',
            'Legacy or future-facing significance',
        ],
        writingDirectives: [
            'Zoom out from the song into the artist, then return to the song with sharper meaning.',
            'Use the track as evidence of a larger artistic pattern.',
            'Balance biography and music analysis carefully.',
        ],
        preferredPhrases: [
            'as an entry point into the artist’s world',
            'you can hear the larger worldview taking shape',
            'the track clarifies the artist’s signature tension',
            'a revealing piece of the artist’s bigger arc',
        ],
        avoidPhrases: [
            'fun facts about the artist',
            'basic biography summary',
            'career overview only',
            'fan wiki tone',
        ],
        styleExamples: [
            'The song matters not only on its own terms, but because it sharpens the outline of the artist behind it.',
            'What sounds like a single mood piece is actually a small map of the artist’s larger emotional grammar.',
        ],
    },
    {
        id: 'mood-essay',
        label: 'Mood Essay',
        shortDescription: '감정과 장면 중심으로 공감을 끌어내는 에세이형 큐레이션',
        longDescription:
            '음악을 감정, 장면, 기억과 연결해서 독자가 자기 경험을 겹쳐 읽게 만드는 감성적인 큐레이션 에세이.',
        readerPromise:
            '이 글을 읽으면 음악 정보만 얻는 것이 아니라, 이 노래를 듣는 자신의 장면까지 떠올리게 된다.',
        defaultConcept:
            'Write like a cinematic music essay: emotionally immersive, sensory, reflective, and rooted in concrete details from the song.',
        requiredSections: [
            'Scene-setting opening',
            'The emotional temperature of the song',
            'Musical details that create that mood',
            'Why listeners project themselves into it',
            'Soft, resonant closing image',
        ],
        writingDirectives: [
            'Lean into sensory detail, rhythm, and atmosphere.',
            'Keep the prose lyrical but still grounded in actual sound and performance details.',
            'Do not become vague; each emotional claim should connect back to the music.',
        ],
        preferredPhrases: [
            'it feels like a memory arriving late',
            'the song carries a weather of its own',
            'the melody moves like light through a room',
            'the mood settles before the meaning does',
        ],
        avoidPhrases: [
            'vibes only',
            'pure mood',
            'sad song',
            'beautiful track',
        ],
        styleExamples: [
            'The song arrives like weather more than narrative, changing the room before it explains itself.',
            'Its emotion lands softly, but the details in the arrangement keep that softness from turning vague.',
        ],
    },
];

export const articleLengthPresets: ArticleLengthPreset[] = [
    {
        id: 'standard',
        label: 'Standard',
        wordRangeLabel: '1,100-1,400 words',
        guidance: '읽기 부담은 적되, 분석과 감정선이 모두 살아 있는 기본형 길이',
    },
    {
        id: 'feature',
        label: 'Feature',
        wordRangeLabel: '1,500-2,000 words',
        guidance: '지금 프로젝트 기본 추천 길이. 감성, 분석, 맥락을 모두 담는 피처형 분량',
    },
    {
        id: 'longform',
        label: 'Longform',
        wordRangeLabel: '2,100-2,800 words',
        guidance: '아티스트 해설과 시대 맥락까지 깊게 들어가는 장문형',
    },
];

export function getCurationProfile(profileId?: string) {
    return (
        curationProfiles.find((profile) => profile.id === profileId) ??
        curationProfiles.find((profile) => profile.id === defaultCurationProfileId) ??
        curationProfiles[0]
    );
}

export function getArticleLengthPreset(lengthId?: string) {
    return (
        articleLengthPresets.find((preset) => preset.id === lengthId) ??
        articleLengthPresets.find((preset) => preset.id === defaultArticleLengthId) ??
        articleLengthPresets[0]
    );
}

export function buildCurationPromptBlock(profileId?: string, articleLengthId?: string) {
    const profile = getCurationProfile(profileId);
    const lengthPreset = getArticleLengthPreset(articleLengthId);

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
