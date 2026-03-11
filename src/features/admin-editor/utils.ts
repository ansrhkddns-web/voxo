import type { TagRecord } from '@/types/content';

export interface EditorMetadataFields {
    excerpt: string;
    intro: string;
    seoDescription: string;
    shareCopy: string;
    albumTitle: string;
}

export interface ExtractedEditorMetadata extends EditorMetadataFields {
    bodyContent: string;
}

const EMPTY_EDITOR_METADATA: EditorMetadataFields = {
    excerpt: '',
    intro: '',
    seoDescription: '',
    shareCopy: '',
    albumTitle: '',
};

function escapeMetadataValue(value: string) {
    return value.replace(/"/g, '&quot;');
}

function unescapeMetadataValue(value: string) {
    return value.replace(/&quot;/g, '"');
}

function extractMetadataAttribute(block: string, attribute: string) {
    const match = block.match(new RegExp(`${attribute}="(.*?)"`));
    return match?.[1] ? unescapeMetadataValue(match[1]) : '';
}

function stripMarkup(value: string) {
    return value
        .replace(/<div id="voxo-metadata"[^>]*><\/div>/g, ' ')
        .replace(/<iframe[\s\S]*?<\/iframe>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/!\[[^\]]*]\(([^)]+)\)/g, ' ')
        .replace(/\[([^\]]+)]\(([^)]+)\)/g, '$1')
        .replace(/[*_#>`-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function trimToSentence(value: string, maxLength: number) {
    const cleaned = stripMarkup(value);
    if (!cleaned) {
        return '';
    }

    if (cleaned.length <= maxLength) {
        return cleaned;
    }

    const sliced = cleaned.slice(0, maxLength);
    const lastPunctuation = Math.max(
        sliced.lastIndexOf('.'),
        sliced.lastIndexOf('!'),
        sliced.lastIndexOf('?'),
    );

    if (lastPunctuation > 50) {
        return sliced.slice(0, lastPunctuation + 1).trim();
    }

    return `${sliced.trim()}...`;
}

export function normalizePostSlugBase(title: string) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function generatePostSlug(title: string) {
    const sanitized = normalizePostSlugBase(title);
    const randomIndex = Math.floor(10000000 + Math.random() * 90000000);

    return sanitized ? `${sanitized}-${randomIndex}` : `${randomIndex}`;
}

export function buildHeroExcerpt(params: {
    title: string;
    artistName: string;
    intro: string;
    seoDescription: string;
    content: string;
}) {
    const candidates = [
        params.seoDescription,
        params.intro,
        `${params.artistName || '아티스트'}의 ${params.title}를 감정과 사운드 결 중심으로 정리한 리뷰입니다.`,
        params.content,
    ];

    for (const candidate of candidates) {
        const excerpt = trimToSentence(candidate, 150);
        if (excerpt.length >= 30) {
            return excerpt;
        }
    }

    return trimToSentence(
        `${params.title}의 인상과 메시지를 차분하게 풀어낸 큐레이션 리뷰입니다.`,
        150,
    );
}

export function buildSeoDescription(params: {
    title: string;
    artistName: string;
    excerpt: string;
    intro: string;
    content?: string;
}) {
    const base =
        params.excerpt.trim() ||
        params.intro.trim() ||
        trimToSentence(params.content || '', 160) ||
        `${params.artistName || 'VOXO'}의 ${params.title} 리뷰와 곡의 핵심 인상을 지금 바로 확인해보세요.`;

    return trimToSentence(base, 160);
}

export function buildShareCopy(params: {
    title: string;
    artistName: string;
    excerpt: string;
}) {
    const summary =
        trimToSentence(params.excerpt, 120) ||
        `${params.artistName || 'VOXO'}의 이야기를 감성적으로 정리한 큐레이션입니다.`;

    return trimToSentence(`${params.title} - ${summary}`, 180);
}

export function extractEditorMetadata(content: string): ExtractedEditorMetadata {
    const metaMatch = content.match(/<div id="voxo-metadata"([^>]*)><\/div>/);

    if (!metaMatch) {
        return {
            ...EMPTY_EDITOR_METADATA,
            bodyContent: content,
        };
    }

    const metadataBlock = metaMatch[0];
    const attributes = metaMatch[1] || '';

    return {
        excerpt: extractMetadataAttribute(attributes, 'data-excerpt'),
        intro: extractMetadataAttribute(attributes, 'data-intro'),
        seoDescription: extractMetadataAttribute(attributes, 'data-seo'),
        shareCopy: extractMetadataAttribute(attributes, 'data-share'),
        albumTitle: extractMetadataAttribute(attributes, 'data-album'),
        bodyContent: content.replace(metadataBlock, '').trim(),
    };
}

export function buildEditorContent(content: string, metadata: EditorMetadataFields) {
    const hasMetadata = Object.values(metadata).some((value) => value.trim());
    if (!hasMetadata) {
        return content;
    }

    const metadataDiv =
        `<div id="voxo-metadata"` +
        ` data-excerpt="${escapeMetadataValue(metadata.excerpt)}"` +
        ` data-intro="${escapeMetadataValue(metadata.intro)}"` +
        ` data-seo="${escapeMetadataValue(metadata.seoDescription)}"` +
        ` data-share="${escapeMetadataValue(metadata.shareCopy)}"` +
        ` data-album="${escapeMetadataValue(metadata.albumTitle)}"` +
        `></div>`;

    return `${metadataDiv}${content}`;
}

export function normalizeEditorTagName(value: string) {
    return value.trim().replace(/\s+/g, '-').toLowerCase();
}

export function filterEditorTags(tags: TagRecord[], query: string) {
    const normalizedQuery = normalizeEditorTagName(query);

    if (!normalizedQuery) {
        return tags;
    }

    return tags.filter((tag) => tag.name.toLowerCase().includes(normalizedQuery));
}

export function getSpotifyTypeLabel(uri: string) {
    if (!uri.trim()) {
        return '';
    }

    if (uri.startsWith('spotify:track:') || uri.includes('/track/')) {
        return 'Track';
    }

    if (uri.startsWith('spotify:album:') || uri.includes('/album/')) {
        return 'Album';
    }

    if (uri.startsWith('spotify:artist:') || uri.includes('/artist/')) {
        return 'Artist';
    }

    if (uri.startsWith('spotify:playlist:') || uri.includes('/playlist/')) {
        return 'Playlist';
    }

    return 'Link';
}

export function buildEditorChecklist(input: {
    title: string;
    excerpt: string;
    intro: string;
    seoDescription: string;
    shareCopy: string;
    content: string;
    category: string;
    coverUrl: string;
    artistName: string;
    tags: string[];
    spotifyUri: string;
}) {
    const plainTextLength = stripMarkup(input.content).length;

    return [
        { id: 'title', label: '제목', completed: input.title.trim().length >= 8 },
        { id: 'excerpt', label: '히어로 요약', completed: input.excerpt.trim().length >= 20 },
        { id: 'intro', label: '도입 문구', completed: input.intro.trim().length >= 10 },
        { id: 'seo', label: 'SEO 설명문', completed: input.seoDescription.trim().length >= 40 },
        { id: 'share', label: '공유 문구', completed: input.shareCopy.trim().length >= 20 },
        { id: 'body', label: '본문', completed: plainTextLength >= 200 },
        { id: 'category', label: '카테고리', completed: Boolean(input.category) },
        { id: 'cover', label: '커버 이미지', completed: Boolean(input.coverUrl) },
        { id: 'artist', label: '아티스트명', completed: Boolean(input.artistName.trim()) },
        { id: 'tags', label: '태그 2개 이상', completed: input.tags.length >= 2 },
        { id: 'spotify', label: 'Spotify 링크', completed: Boolean(input.spotifyUri.trim()) },
    ];
}
