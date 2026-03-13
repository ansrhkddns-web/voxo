import React from 'react';
import dynamic from 'next/dynamic';
import {
    CheckCircle2,
    Disc3,
    Music,
    Search,
    Tag,
    UserRound,
    XCircle,
} from 'lucide-react';
import type { PostRevisionEntry } from '@/app/actions/postActions';
import type { CategoryRecord, TagRecord } from '@/types/content';
import type { SpotifyTrackCandidate } from '@/types/spotify';

const PostRevisionHistoryCard = dynamic(
    () =>
        import('@/features/admin-editor/components/PostRevisionHistoryCard').then(
            (module) => module.PostRevisionHistoryCard
        ),
    {
        loading: () => <SidebarHistorySkeleton />,
    }
);

interface EditorChecklistItem {
    id: string;
    label: string;
    completed: boolean;
}

export interface EditorSidebarSectionProps {
    language: 'en' | 'ko';
    rating: string;
    artistName: string;
    trackTitle: string;
    albumTitle: string;
    category: string;
    spotifyUri: string;
    spotifyCandidates: SpotifyTrackCandidate[];
    isSearchingSpotifyCandidates: boolean;
    tags: string[];
    tagSearch: string;
    customTag: string;
    spotifyTypeLabel: string;
    categories: CategoryRecord[];
    availableTags: TagRecord[];
    filteredTags: TagRecord[];
    checklist: EditorChecklistItem[];
    isTagDropdownOpen: boolean;
    revisions: PostRevisionEntry[];
    reviewRatingLabel: string;
    artistNameLabel: string;
    artistPlaceholder: string;
    categoryLabel: string;
    selectCategoryLabel: string;
    tagsLabel: string;
    tagsPlaceholder: string;
    audioLabel: string;
    audioPlaceholder: string;
    audioSupport: string;
    noTagsLabel: string;
    onRatingChange: (value: string) => void;
    onArtistNameChange: (value: string) => void;
    onTrackTitleChange: (value: string) => void;
    onAlbumTitleChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onSpotifyUriChange: (value: string) => void;
    onSearchSpotifyCandidates: () => void;
    onApplySpotifyCandidate: (candidate: SpotifyTrackCandidate) => void;
    onTagSearchChange: (value: string) => void;
    onCustomTagChange: (value: string) => void;
    onCreateCustomTag: () => void;
    onToggleTags: () => void;
    onToggleTag: (tagName: string) => void;
    onRemoveTag: (tagName: string) => void;
    onRestoreRevision: (revision: PostRevisionEntry) => void;
}

function SidebarHistorySkeleton() {
    return (
        <section className="space-y-4 border border-white/10 bg-white/[0.02] p-6">
            <div className="h-4 w-40 animate-pulse rounded-full bg-white/10" />
            <div className="space-y-3">
                <div className="h-20 animate-pulse rounded-sm bg-black/30" />
                <div className="h-20 animate-pulse rounded-sm bg-black/30" />
            </div>
        </section>
    );
}

function PanelTitle({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="space-y-2">
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-accent-green">
                {title}
            </p>
            <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
    );
}

export function EditorSidebarSection({
    language,
    rating,
    artistName,
    trackTitle,
    albumTitle,
    category,
    spotifyUri,
    spotifyCandidates,
    isSearchingSpotifyCandidates,
    tags,
    tagSearch,
    customTag,
    spotifyTypeLabel,
    categories,
    availableTags,
    filteredTags,
    checklist,
    isTagDropdownOpen,
    revisions,
    reviewRatingLabel,
    artistNameLabel,
    artistPlaceholder,
    categoryLabel,
    selectCategoryLabel,
    tagsLabel,
    tagsPlaceholder,
    audioLabel,
    audioPlaceholder,
    audioSupport,
    noTagsLabel,
    onRatingChange,
    onArtistNameChange,
    onTrackTitleChange,
    onAlbumTitleChange,
    onCategoryChange,
    onSpotifyUriChange,
    onSearchSpotifyCandidates,
    onApplySpotifyCandidate,
    onTagSearchChange,
    onCustomTagChange,
    onCreateCustomTag,
    onToggleTags,
    onToggleTag,
    onRemoveTag,
    onRestoreRevision,
}: EditorSidebarSectionProps) {
    const isKorean = language === 'ko';

    return (
        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            <section className="space-y-6 border border-white/10 bg-white/[0.02] p-6">
                <PanelTitle
                    title={isKorean ? '곡 정보' : 'Track Info'}
                    subtitle={
                        isKorean
                            ? '리뷰에 필요한 기본 음악 정보를 한 번에 정리합니다.'
                            : 'Keep the core music metadata organized in one place.'
                    }
                />

                <div className="grid gap-5">
                    <div>
                        <label className="mb-3 flex items-center gap-2 font-display text-[9px] uppercase tracking-[0.3em] text-gray-500">
                            <UserRound size={12} />
                            {artistNameLabel}
                        </label>
                        <input
                            placeholder={artistPlaceholder}
                            className="w-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white transition-all focus:border-accent-green focus:outline-none"
                            value={artistName}
                            onChange={(event) => onArtistNameChange(event.target.value)}
                        />
                    </div>

                    <div>
                        <label className="mb-3 flex items-center gap-2 font-display text-[9px] uppercase tracking-[0.3em] text-gray-500">
                            <Music size={12} />
                            {isKorean ? '트랙 제목' : 'Track Title'}
                        </label>
                        <input
                            placeholder={isKorean ? 'Spotify 검색에 사용할 트랙명' : 'Track title used for Spotify matching'}
                            className="w-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white transition-all focus:border-accent-green focus:outline-none"
                            value={trackTitle}
                            onChange={(event) => onTrackTitleChange(event.target.value)}
                        />
                    </div>

                    <div>
                        <label className="mb-3 flex items-center gap-2 font-display text-[9px] uppercase tracking-[0.3em] text-gray-500">
                            <Disc3 size={12} />
                            {isKorean ? '앨범 제목' : 'Album Title'}
                        </label>
                        <input
                            placeholder={
                                isKorean ? '자동으로 잡히면 여기에 채워집니다.' : 'Detected album title appears here.'
                            }
                            className="w-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white transition-all focus:border-accent-green focus:outline-none"
                            value={albumTitle}
                            onChange={(event) => onAlbumTitleChange(event.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-[1fr_120px] gap-4">
                        <div>
                            <label className="mb-3 block font-display text-[9px] uppercase tracking-[0.3em] text-gray-500">
                                {categoryLabel}
                            </label>
                            <select
                                className="w-full cursor-pointer appearance-none border border-white/10 bg-black/40 px-4 py-3 text-sm text-white transition-all focus:border-accent-green focus:outline-none"
                                value={category}
                                onChange={(event) => onCategoryChange(event.target.value)}
                            >
                                <option value="" className="bg-black">
                                    {selectCategoryLabel}
                                </option>
                                {categories.map((item) => (
                                    <option key={item.id} value={item.id} className="bg-black">
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-3 block font-display text-[9px] uppercase tracking-[0.3em] text-gray-500">
                                {reviewRatingLabel}
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="10"
                                placeholder="8.0"
                                className="w-full border border-white/10 bg-black/40 px-4 py-3 text-lg text-white transition-all focus:border-accent-green focus:outline-none"
                                value={rating}
                                onChange={(event) => onRatingChange(event.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-6 border border-white/10 bg-white/[0.02] p-6">
                <PanelTitle
                    title={audioLabel}
                    subtitle={
                        isKorean
                            ? 'Spotify 트랙 링크를 직접 확인하고, 필요하면 후보 중에서 골라 적용할 수 있습니다.'
                            : 'Review the Spotify link and choose from candidates when the auto match is not ideal.'
                    }
                />

                <div className="relative">
                    <Music
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700"
                        size={14}
                        strokeWidth={1}
                    />
                    <input
                        placeholder={audioPlaceholder}
                        className="w-full border border-white/10 bg-black/40 py-3 pl-11 pr-4 font-mono text-xs text-white transition-all focus:border-accent-green focus:outline-none"
                        value={spotifyUri}
                        onChange={(event) => onSpotifyUriChange(event.target.value)}
                    />
                </div>

                <p className="text-xs leading-relaxed text-gray-500">{audioSupport}</p>

                <div className="flex flex-wrap items-center gap-3">
                    {spotifyTypeLabel ? (
                        <div className="inline-flex items-center gap-2 border border-accent-green/20 bg-accent-green/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-accent-green">
                            <Music size={12} />
                            <span>Detected: {spotifyTypeLabel}</span>
                        </div>
                    ) : null}

                    <button
                        type="button"
                        onClick={onSearchSpotifyCandidates}
                        disabled={isSearchingSpotifyCandidates}
                        className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Search size={12} />
                        <span>{isSearchingSpotifyCandidates ? 'Searching...' : 'Search candidates'}</span>
                    </button>
                </div>

                {spotifyCandidates.length > 0 ? (
                    <div className="space-y-3">
                        {spotifyCandidates.map((candidate) => (
                            <div
                                key={candidate.id}
                                className="rounded-sm border border-white/10 bg-black/30 p-4"
                            >
                                <div className="space-y-2">
                                    <p className="text-sm text-white">{candidate.title}</p>
                                    <p className="text-xs text-gray-500">{candidate.artistName}</p>
                                    <p className="text-xs text-gray-600">{candidate.albumTitle}</p>
                                </div>
                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => onApplySpotifyCandidate(candidate)}
                                        className="border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green"
                                    >
                                        {isKorean ? '이 트랙 사용' : 'Use this track'}
                                    </button>
                                    <a
                                        href={candidate.externalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] uppercase tracking-[0.18em] text-accent-green hover:text-white"
                                    >
                                        {isKorean ? 'Spotify에서 열기' : 'Open in Spotify'}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null}
            </section>

            <section className="space-y-6 border border-white/10 bg-white/[0.02] p-6">
                <PanelTitle
                    title={tagsLabel}
                    subtitle={
                        isKorean
                            ? '기존 태그를 빠르게 검색해서 붙이거나 필요한 경우 직접 추가합니다.'
                            : 'Search existing tags quickly or add one manually if needed.'
                    }
                />

                <div className="mb-4 flex items-center gap-2 rounded-sm border border-white/10 bg-black/40 px-4 py-3">
                    <Search size={14} className="text-gray-700" />
                    <input
                        value={tagSearch}
                        onChange={(event) => onTagSearchChange(event.target.value)}
                        placeholder={isKorean ? '태그 검색' : 'Search tags'}
                        className="w-full bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none"
                    />
                </div>

                <div className="flex gap-2">
                    <input
                        value={customTag}
                        onChange={(event) => onCustomTagChange(event.target.value)}
                        placeholder={isKorean ? '직접 태그 추가' : 'Add a custom tag'}
                        className="w-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-accent-green focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={onCreateCustomTag}
                        className="border border-white/10 px-4 py-3 text-[10px] uppercase tracking-widest text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green"
                    >
                        Add
                    </button>
                </div>

                <div className="relative">
                    <div
                        className="flex min-h-[52px] w-full cursor-pointer flex-wrap gap-2 rounded-sm border border-white/10 bg-black/40 px-4 py-3 text-white"
                        onClick={onToggleTags}
                    >
                        {tags.length === 0 ? (
                            <span className="select-none text-sm text-gray-500">{tagsPlaceholder}</span>
                        ) : null}
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="flex items-center gap-1 border border-accent-green/30 bg-accent-green/10 px-2 py-1 text-[11px] uppercase tracking-widest text-accent-green"
                            >
                                <Tag size={11} />
                                {tag}
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onRemoveTag(tag);
                                    }}
                                    className="transition-colors hover:text-white"
                                >
                                    &times;
                                </button>
                            </span>
                        ))}
                    </div>

                    {isTagDropdownOpen ? (
                        <div className="absolute left-0 top-full z-10 mt-2 max-h-60 w-full overflow-y-auto border border-white/10 bg-gray-950 shadow-2xl">
                            {availableTags.length === 0 ? (
                                <div className="p-4 text-sm text-gray-500">{noTagsLabel}</div>
                            ) : filteredTags.length === 0 ? (
                                <div className="p-4 text-sm text-gray-500">
                                    {isKorean ? '검색 결과가 없습니다.' : 'No matching tags.'}
                                </div>
                            ) : (
                                filteredTags.map((tag) => {
                                    const selected = tags.includes(tag.name);
                                    return (
                                        <div
                                            key={tag.id}
                                            onClick={() => onToggleTag(tag.name)}
                                            className={`flex cursor-pointer items-center justify-between p-3 text-sm transition-colors ${
                                                selected
                                                    ? 'bg-accent-green/5 text-accent-green'
                                                    : 'text-gray-300 hover:bg-white/5'
                                            }`}
                                        >
                                            <span>{tag.name}</span>
                                            {selected ? (
                                                <span className="h-2 w-2 rounded-full bg-accent-green" />
                                            ) : null}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : null}
                </div>
            </section>

            <section className="space-y-6 border border-white/10 bg-white/[0.02] p-6">
                <PanelTitle
                    title={isKorean ? '발행 체크리스트' : 'Publishing Checklist'}
                    subtitle={
                        isKorean
                            ? '지금 바로 발행해도 되는지 빠르게 점검합니다.'
                            : 'Quickly check whether the post is ready to publish.'
                    }
                />

                <div className="space-y-3">
                    {checklist.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between gap-4 rounded-sm border border-white/5 bg-black/30 px-4 py-3 text-sm"
                        >
                            <span className="text-gray-300">{item.label}</span>
                            {item.completed ? (
                                <CheckCircle2 size={16} className="text-accent-green" />
                            ) : (
                                <XCircle size={16} className="text-red-400" />
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <PostRevisionHistoryCard
                revisions={revisions}
                language={language}
                onRestore={onRestoreRevision}
            />
        </aside>
    );
}
