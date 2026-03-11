export interface ArtistImageCandidate {
    id: string;
    source: string;
    imageUrl: string;
    title: string;
    subtitle: string;
    externalUrl?: string;
}

export const MAX_BODY_IMAGE_SELECTION = 2;

const MANAGED_BODY_IMAGE_REGEX = /<figure[^>]*data-voxo-body-image="(\d+)"[\s\S]*?<\/figure>/gi;
const MANAGED_VIDEO_EMBED_REGEX = /<div[^>]*class="[^"]*voxo-video-embed[^"]*"[^>]*data-voxo-video-embed="true"[^>]*>[\s\S]*?<\/div>/gi;
const GENERIC_VIDEO_EMBED_REGEX = /<div[^>]*class="[^"]*voxo-video-embed[^"]*"[^>]*>[\s\S]*?<\/div>/i;
const YOUTUBE_IFRAME_REGEX = /<iframe[^>]*src="https?:\/\/www\.youtube\.com\/embed\/[^"]+"[\s\S]*?<\/iframe>/i;

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function unescapeHtml(value: string) {
    return value
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

function readAttribute(block: string, attribute: string) {
    const match = block.match(new RegExp(`${attribute}="([^"]*)"`, 'i'));
    return match?.[1] ? unescapeHtml(match[1]) : '';
}

function buildCaption(candidate: ArtistImageCandidate) {
    const title = candidate.title.trim();
    const subtitle = candidate.subtitle.trim();
    const source = candidate.source.trim();

    return [title, subtitle].filter(Boolean).join(' - ') || source || 'Artist image';
}

function splitHtmlBlocks(content: string) {
    return content
        .split(/\n+/)
        .map((block) => block.trim())
        .filter(Boolean);
}

export function stripManagedBodyImages(content: string) {
    return content.replace(MANAGED_BODY_IMAGE_REGEX, '').replace(/\n{3,}/g, '\n\n').trim();
}

export function stripManagedVideoEmbed(content: string) {
    return content.replace(MANAGED_VIDEO_EMBED_REGEX, '').replace(/\n{3,}/g, '\n\n').trim();
}

export function buildManagedBodyImageBlock(candidate: ArtistImageCandidate, slot: number) {
    const safeTitle = escapeHtml(candidate.title);
    const safeSubtitle = escapeHtml(candidate.subtitle);
    const safeSource = escapeHtml(candidate.source);
    const safeCaption = escapeHtml(buildCaption(candidate));
    const safeExternalUrl = escapeHtml(candidate.externalUrl || '');
    const sourceMarkup = candidate.externalUrl
        ? `<a href="${candidate.externalUrl}" target="_blank" rel="noopener noreferrer">Source: ${safeSource}</a>`
        : `Source: ${safeSource}`;

    return (
        `<figure data-voxo-body-image="${slot}"` +
        ` data-image-url="${escapeHtml(candidate.imageUrl)}"` +
        ` data-title="${safeTitle}"` +
        ` data-subtitle="${safeSubtitle}"` +
        ` data-source="${safeSource}"` +
        ` data-external-url="${safeExternalUrl}">` +
        `<img src="${candidate.imageUrl}" alt="${safeTitle}" />` +
        `<figcaption>${safeCaption}. ${sourceMarkup}</figcaption>` +
        `</figure>`
    );
}

export function extractManagedBodyImages(content: string) {
    const matches = Array.from(content.matchAll(MANAGED_BODY_IMAGE_REGEX));

    return matches
        .map((match) => {
            const block = match[0];
            const slot = Number(match[1] || 0);

            return {
                slot,
                candidate: {
                    id: `managed-body-image-${slot}`,
                    imageUrl: readAttribute(block, 'data-image-url'),
                    title: readAttribute(block, 'data-title'),
                    subtitle: readAttribute(block, 'data-subtitle'),
                    source: readAttribute(block, 'data-source'),
                    externalUrl: readAttribute(block, 'data-external-url') || undefined,
                } satisfies ArtistImageCandidate,
            };
        })
        .filter((item) => item.candidate.imageUrl)
        .sort((a, b) => a.slot - b.slot)
        .map((item) => item.candidate);
}

function normalizeManagedVideoEmbed(embedHtml: string) {
    const trimmed = embedHtml.trim();
    if (!trimmed) {
        return '';
    }

    if (/data-voxo-video-embed="true"/i.test(trimmed)) {
        return trimmed;
    }

    if (GENERIC_VIDEO_EMBED_REGEX.test(trimmed)) {
        return trimmed.replace(
            /<div([^>]*)class="([^"]*voxo-video-embed[^"]*)"([^>]*)>/i,
            '<div$1class="$2"$3 data-voxo-video-embed="true">'
        );
    }

    const iframeMatch = trimmed.match(YOUTUBE_IFRAME_REGEX);
    if (iframeMatch?.[0]) {
        return `<div class="voxo-video-embed" data-voxo-video-embed="true">${iframeMatch[0]}</div>`;
    }

    return trimmed;
}

export function extractManagedVideoEmbed(content: string) {
    const managedMatch = content.match(MANAGED_VIDEO_EMBED_REGEX);
    if (managedMatch?.[0]) {
        return managedMatch[0];
    }

    const wrapperMatch = content.match(GENERIC_VIDEO_EMBED_REGEX);
    if (wrapperMatch?.[0]) {
        return normalizeManagedVideoEmbed(wrapperMatch[0]);
    }

    const iframeMatch = content.match(YOUTUBE_IFRAME_REGEX);
    if (iframeMatch?.[0]) {
        return normalizeManagedVideoEmbed(iframeMatch[0]);
    }

    return '';
}

export function injectManagedArticleMedia(
    content: string,
    selectedImages: ArtistImageCandidate[],
    videoEmbedHtml = ''
) {
    const cleanContent = stripManagedVideoEmbed(stripManagedBodyImages(content));
    const normalizedVideoEmbed = normalizeManagedVideoEmbed(videoEmbedHtml);
    if (selectedImages.length !== MAX_BODY_IMAGE_SELECTION && !normalizedVideoEmbed) {
        return cleanContent;
    }

    const blocks = splitHtmlBlocks(cleanContent);
    const figures = selectedImages.map((candidate, index) =>
        buildManagedBodyImageBlock(candidate, index + 1)
    );

    if (blocks.length === 0) {
        return [...figures, normalizedVideoEmbed].filter(Boolean).join('\n');
    }

    const firstInsertPosition = Math.max(1, Math.ceil(blocks.length / 3));
    const secondInsertPosition = Math.max(firstInsertPosition + 1, Math.ceil((blocks.length * 2) / 3));
    const videoInsertPosition =
        normalizedVideoEmbed && blocks.length > 1
            ? Math.max(secondInsertPosition + 1, blocks.length)
            : 0;
    const result: string[] = [];

    blocks.forEach((block, index) => {
        const position = index + 1;

        if (selectedImages.length === MAX_BODY_IMAGE_SELECTION && position === firstInsertPosition) {
            result.push(figures[0]);
        }

        if (selectedImages.length === MAX_BODY_IMAGE_SELECTION && position === secondInsertPosition) {
            result.push(figures[1]);
        }

        if (normalizedVideoEmbed && position === videoInsertPosition) {
            result.push(normalizedVideoEmbed);
        }

        result.push(block);
    });

    if (selectedImages.length === MAX_BODY_IMAGE_SELECTION && secondInsertPosition > blocks.length) {
        result.push(figures[1]);
    }

    if (normalizedVideoEmbed && !result.includes(normalizedVideoEmbed)) {
        result.push(normalizedVideoEmbed);
    }

    return result.join('\n');
}

export function injectManagedBodyImages(content: string, selectedImages: ArtistImageCandidate[]) {
    return injectManagedArticleMedia(content, selectedImages);
}
