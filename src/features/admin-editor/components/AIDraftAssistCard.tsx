import React from 'react';
import {
    BadgeCheck,
    Image as ImageIcon,
    Link2,
    Music2,
    Sparkles,
    Tag,
} from 'lucide-react';
import type {
    AIDraftHandoff,
    AIDraftImageSuggestion,
    AIDraftLinkSuggestion,
} from '../ai-handoff';

interface AIDraftAssistCardProps {
    handoff: AIDraftHandoff;
    onApplyTags: () => void;
    onApplySpotify: () => void;
    onApplyCover: () => void;
    onInsertLinkSuggestion: (suggestion: AIDraftLinkSuggestion) => void;
    onInsertImageSuggestion: (suggestion: AIDraftImageSuggestion) => void;
}

function getSpotifyMatchLabel(handoff: AIDraftHandoff) {
    switch (handoff.spotifyMatchSource) {
        case 'direct-track':
        case 'track-search':
            return 'Track match';
        case 'album-fallback':
            return 'Album fallback';
        case 'direct-album':
            return 'Album link';
        case 'direct-artist':
        case 'artist-search':
            return 'Artist fallback';
        case 'scrape-fallback':
            return 'Scrape fallback';
        default:
            return 'Auto match';
    }
}

export function AIDraftAssistCard({
    handoff,
    onApplyTags,
    onApplySpotify,
    onApplyCover,
    onInsertLinkSuggestion,
    onInsertImageSuggestion,
}: AIDraftAssistCardProps) {
    return (
        <section className="space-y-6 border border-accent-green/20 bg-accent-green/5 p-6">
            <div className="flex items-start gap-3">
                <Sparkles size={16} className="mt-1 text-accent-green" />
                <div className="space-y-2">
                    <p className="font-display text-[10px] uppercase tracking-[0.3em] text-accent-green">
                        AI Draft Assist
                    </p>
                    <p className="text-sm text-white">
                        {handoff.artistName} - {handoff.songTitle}
                    </p>
                    {handoff.albumTitle ? (
                        <p className="text-xs text-gray-400">Album: {handoff.albumTitle}</p>
                    ) : null}
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="border border-white/10 bg-black/20 p-4 lg:col-span-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Draft Context</p>
                    <p className="mt-3 text-sm leading-relaxed text-gray-200">
                        {handoff.concept || 'No extra direction'}
                    </p>
                    <p className="mt-3 text-xs text-gray-500">
                        {handoff.language} / {handoff.categoryName || 'Uncategorized'}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className="border border-white/10 px-2 py-1 text-[10px] uppercase tracking-widest text-gray-400">
                            Tone: {handoff.tone}
                        </span>
                        <span className="border border-white/10 px-2 py-1 text-[10px] uppercase tracking-widest text-gray-400">
                            Image: {handoff.imageStyle}
                        </span>
                        <span className="border border-white/10 px-2 py-1 text-[10px] uppercase tracking-widest text-gray-400">
                            Links: {handoff.linkPriority}
                        </span>
                    </div>
                </div>

                <div className="border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Music Match</p>
                    <div className="mt-3 space-y-3">
                        <div className="inline-flex items-center gap-2 border border-accent-green/20 bg-accent-green/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-accent-green">
                            <BadgeCheck size={12} />
                            <span>{getSpotifyMatchLabel(handoff)}</span>
                        </div>
                        {handoff.spotifyMatchedTrack ? (
                            <p className="text-sm text-white">Matched track: {handoff.spotifyMatchedTrack}</p>
                        ) : null}
                        {handoff.spotifyUri ? (
                            <p className="break-all text-xs leading-relaxed text-gray-500">{handoff.spotifyUri}</p>
                        ) : (
                            <p className="text-sm text-gray-500">Spotify link not detected yet.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Suggested Intro</p>
                    <p className="mt-3 text-sm italic text-gray-200">
                        {handoff.intro || 'No intro note'}
                    </p>
                </div>

                <div className="border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Hero Excerpt</p>
                    <p className="mt-3 text-sm italic text-gray-200">
                        {handoff.excerpt || 'No excerpt note'}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={onApplyTags}
                    className="inline-flex items-center gap-2 border border-white/10 px-4 py-3 text-[11px] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green"
                >
                    <Tag size={14} />
                    <span>Apply suggested tags</span>
                </button>

                <button
                    type="button"
                    onClick={onApplySpotify}
                    className="inline-flex items-center gap-2 border border-white/10 px-4 py-3 text-[11px] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green"
                >
                    <Music2 size={14} />
                    <span>Apply Spotify info</span>
                </button>

                <button
                    type="button"
                    onClick={onApplyCover}
                    className="inline-flex items-center gap-2 border border-white/10 px-4 py-3 text-[11px] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green"
                >
                    <ImageIcon size={14} />
                    <span>Apply cover image</span>
                </button>
            </div>

            {handoff.linkSuggestions.length > 0 ? (
                <div className="space-y-3 border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
                        Suggested Links
                    </p>
                    <div className="space-y-3">
                        {handoff.linkSuggestions.map((suggestion) => (
                            <div
                                key={suggestion.id}
                                className="flex flex-col gap-3 border-b border-white/5 pb-3 last:border-b-0 last:pb-0 md:flex-row md:items-center md:justify-between"
                            >
                                <div>
                                    <p className="text-sm text-white">{suggestion.label}</p>
                                    <p className="mt-1 text-xs text-gray-400">{suggestion.description}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onInsertLinkSuggestion(suggestion)}
                                    className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green"
                                >
                                    <Link2 size={12} />
                                    <span>Insert into body</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {handoff.imageSuggestions.length > 0 ? (
                <div className="space-y-3 border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
                        Suggested Image Notes
                    </p>
                    <div className="space-y-3">
                        {handoff.imageSuggestions.map((suggestion) => (
                            <div
                                key={suggestion.id}
                                className="flex flex-col gap-3 border-b border-white/5 pb-3 last:border-b-0 last:pb-0"
                            >
                                <div>
                                    <p className="text-sm text-white">{suggestion.label}</p>
                                    <p className="mt-1 text-xs text-gray-400">{suggestion.caption}</p>
                                    <p className="mt-2 text-xs text-gray-500">{suggestion.prompt}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onInsertImageSuggestion(suggestion)}
                                    className="inline-flex w-fit items-center gap-2 border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green"
                                >
                                    <ImageIcon size={12} />
                                    <span>Insert note</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {handoff.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {handoff.tags.map((tag) => (
                        <span
                            key={tag}
                            className="border border-accent-green/20 bg-accent-green/10 px-3 py-1 text-[10px] uppercase tracking-widest text-accent-green"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            ) : null}
        </section>
    );
}
