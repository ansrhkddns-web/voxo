import React from 'react';
import Image from 'next/image';
import { ExternalLink, Search } from 'lucide-react';
import type { ArtistImageCandidate } from '../artist-image';

interface ArtistImageSearchPanelProps {
    language: 'en' | 'ko';
    artistName: string;
    trackTitle: string;
    albumTitle: string;
    candidates: ArtistImageCandidate[];
    selectedBodyImages: ArtistImageCandidate[];
    isSearching: boolean;
    onArtistNameChange: (value: string) => void;
    onTrackTitleChange: (value: string) => void;
    onAlbumTitleChange: (value: string) => void;
    onSearch: () => void;
    onSelectCover: (candidate: ArtistImageCandidate) => void;
    onToggleBodyImageSelection: (candidate: ArtistImageCandidate) => void;
}

export function ArtistImageSearchPanel({
    language,
    artistName,
    trackTitle,
    albumTitle,
    candidates,
    selectedBodyImages,
    isSearching,
    onArtistNameChange,
    onTrackTitleChange,
    onAlbumTitleChange,
    onSearch,
    onSelectCover,
    onToggleBodyImageSelection,
}: ArtistImageSearchPanelProps) {
    const isKorean = language === 'ko';

    return (
        <section className="space-y-6 border border-white/10 bg-black/20 p-6">
            <div className="flex items-start gap-3">
                <Search size={14} className="mt-1 text-accent-green" />
                <div className="space-y-2">
                    <p className="font-display text-[10px] uppercase tracking-[0.3em] text-white">
                        {isKorean ? '실존 아티스트 이미지 선택' : 'Real Artist Image Search'}
                    </p>
                    <p className="text-sm leading-relaxed text-gray-500">
                        {isKorean
                            ? '대표 이미지용 후보를 고르고, 본문 중간에 들어갈 이미지는 5개 후보 중 2개만 선택해 고정 위치에 자동 배치합니다.'
                            : 'Search real artist photos, pick one for the cover, and choose exactly two body images to place at fixed positions.'}
                    </p>
                    <p className="text-xs leading-relaxed text-gray-600">
                        {isKorean
                            ? '다시 검색하면 아티스트, 앨범, 트랙, 라이브, 포트레이트, 에디토리얼, 백스테이지 같은 조건을 번갈아 섞어서 이전과 다른 이미지를 우선 찾아옵니다.'
                            : 'Each re-search rotates through artist, album, track, live, portrait, editorial, and backstage conditions to surface different images first.'}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border border-accent-green/20 bg-accent-green/5 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-accent-green">
                    {isKorean ? '본문 이미지 선택' : 'Body Image Selection'}
                </p>
                <p className="text-sm text-gray-300">
                    {isKorean
                        ? `${selectedBodyImages.length}/2 선택됨. 2장을 모두 고르면 본문 중간 고정 위치에 자동 배치됩니다.`
                        : `${selectedBodyImages.length}/2 selected. Once both images are chosen, they are inserted into fixed positions in the article body.`}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <input
                    value={artistName}
                    onChange={(event) => onArtistNameChange(event.target.value)}
                    placeholder={isKorean ? '아티스트 이름' : 'Artist name'}
                    className="border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-accent-green focus:outline-none"
                />
                <input
                    value={trackTitle}
                    onChange={(event) => onTrackTitleChange(event.target.value)}
                    placeholder={isKorean ? '트랙 제목' : 'Track title'}
                    className="border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-accent-green focus:outline-none"
                />
                <input
                    value={albumTitle}
                    onChange={(event) => onAlbumTitleChange(event.target.value)}
                    placeholder={isKorean ? '앨범 제목' : 'Album title'}
                    className="border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-accent-green focus:outline-none"
                />
            </div>

            <button
                type="button"
                onClick={onSearch}
                disabled={isSearching || !artistName.trim()}
                className="inline-flex items-center gap-2 border border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green disabled:cursor-not-allowed disabled:opacity-50"
            >
                <Search size={14} />
                <span>
                    {isSearching
                        ? isKorean
                            ? '이미지 후보 검색 중...'
                            : 'Searching...'
                        : isKorean
                            ? '다른 조건으로 이미지 5개 검색'
                            : 'Search 5 different candidates'}
                </span>
            </button>

            {candidates.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {candidates.map((candidate) => (
                        <article key={candidate.id} className="overflow-hidden border border-white/10 bg-black/20">
                            <div className="relative aspect-[4/5] bg-black">
                                <Image
                                    src={candidate.imageUrl}
                                    alt={candidate.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                    className="object-cover"
                                />
                            </div>
                            <div className="space-y-3 p-4">
                                {selectedBodyImages.find((image) => image.imageUrl === candidate.imageUrl) ? (
                                    <div className="inline-flex items-center border border-accent-green/20 bg-accent-green/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-accent-green">
                                        {isKorean
                                            ? `본문 이미지 ${selectedBodyImages.findIndex((image) => image.imageUrl === candidate.imageUrl) + 1}`
                                            : `Body image ${selectedBodyImages.findIndex((image) => image.imageUrl === candidate.imageUrl) + 1}`}
                                    </div>
                                ) : null}
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.22em] text-accent-green">
                                        {candidate.source}
                                    </p>
                                    <p className="mt-2 text-sm text-white">{candidate.title}</p>
                                    <p className="mt-1 text-xs text-gray-500">{candidate.subtitle}</p>
                                </div>
                                <div className="grid gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onSelectCover(candidate)}
                                        className="border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green"
                                    >
                                        {isKorean ? '대표 이미지로 사용' : 'Use as cover'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onToggleBodyImageSelection(candidate)}
                                        className="border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-gray-300 transition-colors hover:border-accent-green hover:text-accent-green"
                                    >
                                        {selectedBodyImages.find((image) => image.imageUrl === candidate.imageUrl)
                                            ? isKorean
                                                ? '본문 이미지에서 해제'
                                                : 'Remove from body'
                                            : isKorean
                                                ? '본문 이미지로 선택'
                                                : 'Select as body image'}
                                    </button>
                                    {candidate.externalUrl ? (
                                        <a
                                            href={candidate.externalUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-2 border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-gray-400 transition-colors hover:border-accent-green hover:text-accent-green"
                                        >
                                            <ExternalLink size={12} />
                                            <span>{isKorean ? '출처 열기' : 'Open source'}</span>
                                        </a>
                                    ) : null}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="border border-dashed border-white/10 px-4 py-6 text-sm text-gray-500">
                    {isKorean
                        ? '검색을 실행하면 실존 아티스트 이미지 후보 5개를 불러옵니다.'
                        : 'Run the search to load real image candidates from external music and reference sources.'}
                </div>
            )}
        </section>
    );
}
