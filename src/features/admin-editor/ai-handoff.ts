export interface AIDraftLinkSuggestion {
    id: string;
    label: string;
    url: string;
    description: string;
}

export interface AIDraftImageSuggestion {
    id: string;
    label: string;
    altText: string;
    caption: string;
    prompt: string;
}

export interface AIDraftHandoff {
    artistName: string;
    songTitle: string;
    albumTitle?: string;
    spotifyMatchedTrack?: string;
    spotifyMatchType?: string;
    spotifyMatchSource?: string;
    language: string;
    concept: string;
    tone: string;
    imageStyle: string;
    linkPriority: string;
    title: string;
    excerpt: string;
    intro: string;
    seoDescription: string;
    shareCopy: string;
    tags: string[];
    spotifyUri: string | null;
    coverImage: string | null;
    categoryId: string;
    categoryName: string;
    generatedAt: string;
    bodyHtml?: string;
    linkSuggestions: AIDraftLinkSuggestion[];
    imageSuggestions: AIDraftImageSuggestion[];
}

const AI_DRAFT_HANDOFF_PREFIX = 'voxo-ai-draft-handoff';

export function buildAIDraftHandoffKey(postId: string) {
    return `${AI_DRAFT_HANDOFF_PREFIX}:${postId}`;
}
