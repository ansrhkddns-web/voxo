import React from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { CirclePlus, Loader2, Sparkles } from 'lucide-react';
import type { ArtistImageCandidate } from '@/features/admin-editor/artist-image';
const MarkdownEditor = dynamic(() => import('@/components/admin/MarkdownEditor'), {
    ssr: false,
    loading: () => <EditorComposerSkeleton />,
});
const ArtistImageSearchPanel = dynamic(
    () =>
        import('@/features/admin-editor/components/ArtistImageSearchPanel').then(
            (module) => module.ArtistImageSearchPanel
        ),
    {
        loading: () => <EditorSupportPanelSkeleton />,
    }
);

export interface EditorMainSectionProps {
    language: 'en' | 'ko';
    title: string;
    excerpt: string;
    intro: string;
    seoDescription: string;
    shareCopy: string;
    coverUrl: string;
    spotifyUri: string;
    editorSyncKey: number;
    isUploading: boolean;
    isInlineImageUploading: boolean;
    artistImageSearchArtist: string;
    artistImageSearchTrack: string;
    artistImageSearchAlbum: string;
    artistImageCandidates: ArtistImageCandidate[];
    selectedBodyImages: ArtistImageCandidate[];
    isSearchingArtistImages: boolean;
    recommendedExcerpt?: string;
    onTitleChange: (value: string, element: HTMLTextAreaElement) => void;
    onExcerptChange: (value: string) => void;
    onIntroChange: (value: string) => void;
    onSeoDescriptionChange: (value: string) => void;
    onShareCopyChange: (value: string) => void;
    onContentChange: (value: string) => void;
    onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onInlineImageUpload: (file: File) => Promise<string>;
    onArtistImageSearchArtistChange: (value: string) => void;
    onArtistImageSearchTrackChange: (value: string) => void;
    onArtistImageSearchAlbumChange: (value: string) => void;
    onSearchArtistImages: () => void;
    onSelectArtistImage: (candidate: ArtistImageCandidate) => void;
    onToggleArtistBodyImageSelection: (candidate: ArtistImageCandidate) => void;
    content: string;
    headlinePlaceholder: string;
    uploadLabel: string;
    replaceImageLabel: string;
}

function EditorSupportPanelSkeleton() {
    return (
        <div className="space-y-4 rounded-sm border border-white/10 bg-black/20 p-5">
            <div className="h-4 w-32 animate-pulse rounded-full bg-white/10" />
            <div className="grid gap-3 md:grid-cols-3">
                <div className="h-11 animate-pulse rounded-sm bg-black/40" />
                <div className="h-11 animate-pulse rounded-sm bg-black/40" />
                <div className="h-11 animate-pulse rounded-sm bg-black/40" />
            </div>
            <div className="h-28 animate-pulse rounded-sm bg-black/35" />
        </div>
    );
}

function EditorComposerSkeleton() {
    return (
        <div className="overflow-hidden border border-white/10 bg-[#050505] shadow-2xl">
            <div className="space-y-3 border-b border-white/10 bg-white/5 p-4">
                <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
                <div className="h-3 w-80 animate-pulse rounded-full bg-white/5" />
            </div>
            <div className="h-[420px] animate-pulse bg-black/40" />
        </div>
    );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
    return (
        <div className="space-y-2">
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-accent-green">
                {title}
            </p>
            <p className="text-sm leading-relaxed text-gray-500">{description}</p>
        </div>
    );
}

export function EditorMainSection({
    language,
    title,
    excerpt,
    intro,
    seoDescription,
    shareCopy,
    coverUrl,
    spotifyUri,
    editorSyncKey,
    isUploading,
    isInlineImageUploading,
    artistImageSearchArtist,
    artistImageSearchTrack,
    artistImageSearchAlbum,
    artistImageCandidates,
    selectedBodyImages,
    isSearchingArtistImages,
    recommendedExcerpt,
    onTitleChange,
    onExcerptChange,
    onIntroChange,
    onSeoDescriptionChange,
    onShareCopyChange,
    onContentChange,
    onImageUpload,
    onInlineImageUpload,
    onArtistImageSearchArtistChange,
    onArtistImageSearchTrackChange,
    onArtistImageSearchAlbumChange,
    onSearchArtistImages,
    onSelectArtistImage,
    onToggleArtistBodyImageSelection,
    content,
    headlinePlaceholder,
    uploadLabel,
    replaceImageLabel,
}: EditorMainSectionProps) {
    const isKorean = language === 'ko';
    const previewExcerpt = excerpt.trim() || recommendedExcerpt || '';

    return (
        <div className="space-y-8">
            <section className="space-y-8 border border-white/10 bg-white/[0.02] p-8">
                <SectionHeader
                    title={isKorean ? '기본 헤드라인' : 'Main Headline'}
                    description={
                        isKorean
                            ? '먼저 제목과 독자가 클릭하게 만드는 핵심 요약을 정리합니다.'
                            : 'Start with the headline and the key hook that makes readers click.'
                    }
                />

                <textarea
                    placeholder={headlinePlaceholder}
                    className="w-full resize-none overflow-hidden border-none bg-transparent py-2 text-4xl font-display font-light leading-[0.95] tracking-tight text-white placeholder:text-gray-800 focus:outline-none focus:ring-0 md:text-6xl"
                    rows={1}
                    value={title}
                    onChange={(event) => onTitleChange(event.target.value, event.target)}
                />

                <div className="grid gap-8 xl:grid-cols-2">
                    <div className="space-y-3">
                        <label className="block font-display text-[10px] uppercase tracking-[0.3em] text-gray-400">
                            Hero Excerpt
                        </label>
                        <textarea
                            placeholder={
                                isKorean
                                    ? '독자가 글을 클릭하고 싶어지게 만드는 핵심 요약 문구를 입력해 주세요.'
                                    : 'Write the hook text that makes readers want to open the story.'
                            }
                            className="h-28 w-full resize-none border border-white/10 bg-black/30 px-4 py-4 font-serif text-sm italic leading-relaxed text-gray-200 transition-all focus:border-accent-green focus:outline-none"
                            value={excerpt}
                            onChange={(event) => onExcerptChange(event.target.value)}
                        />
                        {!excerpt.trim() && recommendedExcerpt ? (
                            <div className="flex items-start gap-3 rounded-sm border border-accent-green/20 bg-accent-green/5 px-4 py-3 text-sm text-gray-300">
                                <Sparkles size={15} className="mt-0.5 text-accent-green" />
                                <div>
                                    <p className="text-accent-green">
                                        {isKorean ? '자동 추천 요약' : 'Suggested excerpt'}
                                    </p>
                                    <p className="mt-1 leading-relaxed text-gray-400">{recommendedExcerpt}</p>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="space-y-3">
                        <label className="block font-display text-[10px] uppercase tracking-[0.3em] text-gray-400">
                            Content Intro Hook
                        </label>
                        <textarea
                            placeholder={
                                isKorean
                                    ? '본문 첫 문단 위에 보일 도입 문구를 입력해 주세요.'
                                    : 'Write the intro hook shown above the first paragraph.'
                            }
                            className="h-28 w-full resize-none border border-white/10 bg-black/30 px-4 py-4 font-serif text-sm italic leading-relaxed text-gray-200 transition-all focus:border-accent-green focus:outline-none"
                            value={intro}
                            onChange={(event) => onIntroChange(event.target.value)}
                        />
                    </div>
                </div>

                <div className="grid gap-8 xl:grid-cols-2">
                    <div className="space-y-3">
                        <label className="block font-display text-[10px] uppercase tracking-[0.3em] text-gray-400">
                            SEO Description
                        </label>
                        <textarea
                            placeholder={
                                isKorean
                                    ? '검색 결과와 공유 카드에 보일 설명문을 입력해 주세요.'
                                    : 'Write the description used in search results and social cards.'
                            }
                            className="h-28 w-full resize-none border border-white/10 bg-black/30 px-4 py-4 font-serif text-sm leading-relaxed text-gray-200 transition-all focus:border-accent-green focus:outline-none"
                            value={seoDescription}
                            onChange={(event) => onSeoDescriptionChange(event.target.value)}
                        />
                        <p className="text-[11px] text-gray-600">{seoDescription.trim().length} / 160</p>
                    </div>

                    <div className="space-y-3">
                        <label className="block font-display text-[10px] uppercase tracking-[0.3em] text-gray-400">
                            Share Copy
                        </label>
                        <textarea
                            placeholder={
                                isKorean
                                    ? 'SNS 공유 시 보일 짧은 소개 문구를 입력해 주세요.'
                                    : 'Write the short copy shown when the post is shared.'
                            }
                            className="h-28 w-full resize-none border border-white/10 bg-black/30 px-4 py-4 font-serif text-sm leading-relaxed text-gray-200 transition-all focus:border-accent-green focus:outline-none"
                            value={shareCopy}
                            onChange={(event) => onShareCopyChange(event.target.value)}
                        />
                        <p className="text-[11px] text-gray-600">{shareCopy.trim().length} / 180</p>
                    </div>
                </div>
            </section>

            <section className="space-y-6 border border-white/10 bg-white/[0.02] p-8">
                <SectionHeader
                    title={isKorean ? '커버와 이미지' : 'Cover And Images'}
                    description={
                        isKorean
                            ? '대표 이미지를 정하고, 실제 아티스트 이미지를 기사 본문에도 바로 넣을 수 있습니다.'
                            : 'Set the cover image and place real artist images directly into the article body.'
                    }
                />

                <label className="group relative flex aspect-[21/9] w-full cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden border border-white/5 bg-gray-950 transition-all hover:border-accent-green/30">
                    {coverUrl ? (
                        <div className="relative h-full w-full">
                            <Image
                                src={coverUrl}
                                alt="Cover"
                                fill
                                sizes="(max-width: 1024px) 100vw, 1200px"
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                <span className="border border-white/10 bg-black/80 px-4 py-2 text-[10px] uppercase tracking-widest">
                                    {replaceImageLabel}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 text-center">
                            <div className="relative inline-block">
                                {isUploading ? (
                                    <Loader2 className="animate-spin text-accent-green" size={24} />
                                ) : (
                                    <CirclePlus
                                        size={24}
                                        className="text-gray-700 transition-colors group-hover:text-accent-green"
                                        strokeWidth={1}
                                    />
                                )}
                            </div>
                            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-600">
                                {uploadLabel}
                            </p>
                        </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={onImageUpload} />
                </label>

                <ArtistImageSearchPanel
                    language={language}
                    artistName={artistImageSearchArtist}
                    trackTitle={artistImageSearchTrack}
                    albumTitle={artistImageSearchAlbum}
                    candidates={artistImageCandidates}
                    selectedBodyImages={selectedBodyImages}
                    isSearching={isSearchingArtistImages}
                    onArtistNameChange={onArtistImageSearchArtistChange}
                    onTrackTitleChange={onArtistImageSearchTrackChange}
                    onAlbumTitleChange={onArtistImageSearchAlbumChange}
                    onSearch={onSearchArtistImages}
                    onSelectCover={onSelectArtistImage}
                    onToggleBodyImageSelection={onToggleArtistBodyImageSelection}
                />
            </section>

            <section className="space-y-6 border border-white/10 bg-white/[0.02] p-8">
                <SectionHeader
                    title={isKorean ? '본문 작성' : 'Write Article'}
                    description={
                        isKorean
                            ? '유튜브 링크를 한 줄로 넣으면 자동 임베드되고, 이미지 URL도 본문 이미지로 변환됩니다.'
                            : 'A standalone YouTube link embeds automatically, and a direct image URL becomes an inline image.'
                    }
                />

                <MarkdownEditor
                    key={editorSyncKey}
                    content={content}
                    onChange={onContentChange}
                    spotifyUri={spotifyUri}
                    onUploadInlineImage={onInlineImageUpload}
                    isUploadingInlineImage={isInlineImageUploading}
                />
            </section>

            <section className="space-y-6 border border-white/10 bg-white/[0.02] p-8">
                <SectionHeader
                    title={isKorean ? '실시간 프리뷰' : 'Live Preview'}
                    description={
                        isKorean
                            ? '현재 작성 중인 글이 실제 화면에서 어떻게 보일지 바로 확인할 수 있습니다.'
                            : 'See how the current draft will look in the real article view.'
                    }
                />

                <article className="overflow-hidden border border-white/10 bg-[#040404]">
                    {coverUrl ? (
                        <div className="relative aspect-[21/9] w-full overflow-hidden bg-black">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={coverUrl}
                                alt={title || 'Article cover'}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ) : null}

                    <div className="space-y-10 p-8 md:p-12">
                        <div className="space-y-6">
                            <h2 className="font-display text-3xl font-light leading-tight text-white md:text-5xl">
                                {title || (isKorean ? '여기에 기사 제목이 보입니다.' : 'Your article title appears here.')}
                            </h2>

                            {previewExcerpt ? (
                                <p className="max-w-4xl whitespace-pre-wrap font-serif text-lg italic leading-relaxed text-gray-400 md:text-xl">
                                    {previewExcerpt}
                                </p>
                            ) : null}

                            {intro ? (
                                <div className="border-l border-accent-green/40 pl-6">
                                    <p className="whitespace-pre-wrap font-serif text-base italic leading-relaxed text-gray-500">
                                        {intro}
                                    </p>
                                </div>
                            ) : null}
                        </div>

                        <div
                            className="prose prose-invert prose-lg max-w-none text-gray-200 [&_a]:text-accent-green [&_figure]:my-10 [&_figure]:space-y-3 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-gray-500 [&_iframe]:min-h-[320px] [&_iframe]:w-full [&_iframe]:rounded-none [&_iframe]:border-0 [&_iframe]:bg-black [&_iframe]:shadow-2xl [&_img]:w-full [&_img]:rounded-none [&_img]:object-cover [&_p]:leading-8"
                            dangerouslySetInnerHTML={{
                                __html:
                                    content ||
                                    `<p>${isKorean ? '본문을 입력하면 여기에 실제 기사 형태로 보입니다.' : 'Your article body will appear here as a live preview.'}</p>`,
                            }}
                        />
                    </div>
                </article>
            </section>
        </div>
    );
}
