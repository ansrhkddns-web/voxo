'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { getCategories } from '@/app/actions/categoryActions';
import { createPost, getPostById, updatePost } from '@/app/actions/postActions';
import { searchArtistImageCandidates } from '@/app/actions/artistImageActions';
import { searchSpotifyTrackCandidates } from '@/app/actions/spotifyActions';
import { getTags } from '@/app/actions/tagActions';
import { uploadImage } from '@/app/actions/uploadActions';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
    buildAIDraftHandoffKey,
    type AIDraftHandoff,
    type AIDraftImageSuggestion,
    type AIDraftLinkSuggestion,
} from '@/features/admin-editor/ai-handoff';
import {
    extractManagedBodyImages,
    extractManagedVideoEmbed,
    injectManagedArticleMedia,
    MAX_BODY_IMAGE_SELECTION,
    type ArtistImageCandidate,
} from '@/features/admin-editor/artist-image';
import { AIDraftAssistCard } from '@/features/admin-editor/components/AIDraftAssistCard';
import { EditorHeader } from '@/features/admin-editor/components/EditorHeader';
import { LocalDraftNotice } from '@/features/admin-editor/components/LocalDraftNotice';
import { EditorMainSection } from '@/features/admin-editor/sections/EditorMainSection';
import { EditorSidebarSection } from '@/features/admin-editor/sections/EditorSidebarSection';
import {
    buildHeroExcerpt,
    buildEditorChecklist,
    buildEditorContent,
    buildSeoDescription,
    buildShareCopy,
    extractEditorMetadata,
    filterEditorTags,
    generatePostSlug,
    getSpotifyTypeLabel,
    normalizeEditorTagName,
} from '@/features/admin-editor/utils';
import { useAdminLanguage } from '@/providers/AdminLanguageProvider';
import type { CategoryRecord, PostInput, TagRecord } from '@/types/content';
import type { SpotifyTrackCandidate } from '@/types/spotify';

function EditorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const postId = searchParams.get('id');
    const draftId = searchParams.get('draft');
    const { t, language } = useAdminLanguage();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [spotifyUri, setSpotifyUri] = useState('');
    const [rating, setRating] = useState('8.0');
    const [artistName, setArtistName] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [coverUrl, setCoverUrl] = useState('');
    const [categories, setCategories] = useState<CategoryRecord[]>([]);
    const [availableTags, setAvailableTags] = useState<TagRecord[]>([]);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isInlineImageUploading, setIsInlineImageUploading] = useState(false);
    const [loading, setLoading] = useState(Boolean(postId));
    const [excerpt, setExcerpt] = useState('');
    const [intro, setIntro] = useState('');
    const [seoDescription, setSeoDescription] = useState('');
    const [shareCopy, setShareCopy] = useState('');
    const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
    const [tagSearch, setTagSearch] = useState('');
    const [customTag, setCustomTag] = useState('');
    const [aiHandoff, setAiHandoff] = useState<AIDraftHandoff | null>(null);
    const [editorSyncKey, setEditorSyncKey] = useState(0);
    const [artistImageSearchArtist, setArtistImageSearchArtist] = useState('');
    const [artistImageSearchTrack, setArtistImageSearchTrack] = useState('');
    const [artistImageSearchAlbum, setArtistImageSearchAlbum] = useState('');
    const [artistImageCandidates, setArtistImageCandidates] = useState<ArtistImageCandidate[]>([]);
    const [selectedBodyImages, setSelectedBodyImages] = useState<ArtistImageCandidate[]>([]);
    const [isSearchingArtistImages, setIsSearchingArtistImages] = useState(false);
    const [artistImageRetryIndex, setArtistImageRetryIndex] = useState(0);
    const [spotifyCandidates, setSpotifyCandidates] = useState<SpotifyTrackCandidate[]>([]);
    const [isSearchingSpotifyCandidates, setIsSearchingSpotifyCandidates] = useState(false);
    const [showLocalDraftNotice, setShowLocalDraftNotice] = useState(false);
    const autoImageSearchKeyRef = useRef('');

    useEffect(() => {
        const fetchEditorData = async () => {
            const [categoryData, tagData] = await Promise.all([getCategories(), getTags()]);
            setCategories(categoryData);
            setAvailableTags(tagData);

            if (!postId) {
                setLoading(false);
                return;
            }

            try {
                const post = await getPostById(postId);
                const parsedContent = extractEditorMetadata(post.content ?? '');
                const recommendedExcerpt = buildHeroExcerpt({
                    title: post.title,
                    artistName: post.artist_name || '',
                    intro: parsedContent.intro,
                    seoDescription: parsedContent.seoDescription,
                    content: parsedContent.bodyContent,
                });

                setTitle(post.title);
                setExcerpt(parsedContent.excerpt || recommendedExcerpt);
                setIntro(parsedContent.intro);
                setSeoDescription(parsedContent.seoDescription);
                setShareCopy(parsedContent.shareCopy);
                setContent(sanitizeLegacyGeneratedContent(parsedContent.bodyContent));
                setSelectedBodyImages(extractManagedBodyImages(parsedContent.bodyContent));
                setEditorSyncKey((prev) => prev + 1);
                setCategory(post.category_id || '');
                setSpotifyUri(post.spotify_uri || '');
                setRating(post.rating?.toString() || '8.0');
                setArtistName(post.artist_name || '');
                setTags(post.tags || []);
                setCoverUrl(post.cover_image || '');
                setArtistImageSearchAlbum(parsedContent.albumTitle || '');
            } catch {
                toast.error(language === 'ko' ? '글 데이터를 불러오지 못했습니다.' : 'Failed to load article');
            } finally {
                setLoading(false);
            }
        };

        void fetchEditorData();
    }, [language, postId]);

    useEffect(() => {
        const handoffStorageKey = postId || draftId;
        if (!handoffStorageKey || typeof window === 'undefined') {
            return;
        }

        const savedHandoff = window.localStorage.getItem(buildAIDraftHandoffKey(handoffStorageKey));
        if (!savedHandoff) {
            return;
        }

        try {
            const parsed = JSON.parse(savedHandoff) as AIDraftHandoff;
            const handoffBody = extractEditorMetadata(parsed.bodyHtml || '');
            setAiHandoff(parsed);
            setSeoDescription((prev) => prev || parsed.seoDescription);
            setShareCopy((prev) => prev || parsed.shareCopy);

            if (!postId) {
                setShowLocalDraftNotice(true);
                setTitle((prev) => prev || parsed.title);
                setExcerpt(
                    (prev) =>
                        prev ||
                        parsed.excerpt ||
                        buildHeroExcerpt({
                            title: parsed.title,
                            artistName: parsed.artistName,
                            intro: parsed.intro,
                            seoDescription: parsed.seoDescription,
                            content: handoffBody.bodyContent || parsed.bodyHtml || '',
                        })
                );
                setContent(
                    (prev) =>
                        prev ||
                        sanitizeLegacyGeneratedContent(handoffBody.bodyContent || parsed.bodyHtml || '')
                );
                setSelectedBodyImages(
                    extractManagedBodyImages(handoffBody.bodyContent || parsed.bodyHtml || '')
                );
                setEditorSyncKey((prev) => prev + 1);
                setCategory((prev) => prev || parsed.categoryId);
                setSpotifyUri((prev) => prev || parsed.spotifyUri || '');
                setArtistName((prev) => prev || parsed.artistName);
                setTags((prev) => (prev.length > 0 ? prev : parsed.tags));
                setCoverUrl((prev) => prev || parsed.coverImage || '');
                setIntro((prev) => prev || parsed.intro);
                setArtistImageSearchAlbum((prev) => prev || parsed.albumTitle || handoffBody.albumTitle || '');
            }
        } catch (error) {
            console.error('Failed to parse AI draft handoff', error);
        }
    }, [draftId, postId]);

    useEffect(() => {
        setArtistImageSearchArtist((prev) => prev || artistName);
    }, [artistName]);

    useEffect(() => {
        setArtistImageRetryIndex(0);
    }, [artistImageSearchArtist, artistImageSearchTrack, artistImageSearchAlbum]);

    useEffect(() => {
        if (!aiHandoff) {
            return;
        }

        setArtistImageSearchArtist((prev) => prev || aiHandoff.artistName);
        setArtistImageSearchTrack((prev) => prev || aiHandoff.songTitle);
        setArtistImageSearchAlbum((prev) => prev || aiHandoff.albumTitle || '');
    }, [aiHandoff]);

    useEffect(() => {
        const embeddedVideo = extractManagedVideoEmbed(content);
        const nextContent = sanitizeLegacyGeneratedContent(
            injectManagedArticleMedia(content, selectedBodyImages, embeddedVideo)
        );

        if (nextContent !== content) {
            setContent(nextContent);
            setEditorSyncKey((prev) => prev + 1);
        }
    }, [content, selectedBodyImages]);

    useEffect(() => {
        const artist = artistImageSearchArtist.trim();
        if (!artist || artistImageCandidates.length > 0) {
            return;
        }

        if (!aiHandoff && !draftId && !postId) {
            return;
        }

        const searchKey = [artist, artistImageSearchTrack.trim(), artistImageSearchAlbum.trim()].join('|');
        if (!searchKey || autoImageSearchKeyRef.current === searchKey) {
            return;
        }

        autoImageSearchKeyRef.current = searchKey;

        const loadCandidates = async () => {
            setIsSearchingArtistImages(true);
            try {
                const candidates = await searchArtistImageCandidates({
                    artistName: artist,
                    trackTitle: artistImageSearchTrack,
                    albumTitle: artistImageSearchAlbum,
                    retryIndex: 0,
                    excludeImageUrls: Array.from(
                        new Set([
                            ...selectedBodyImages.map((image) => image.imageUrl),
                            coverUrl,
                        ].filter(Boolean))
                    ),
                });

                setArtistImageCandidates(candidates);
            } catch (error) {
                console.error('Failed to auto-load artist image candidates', error);
            } finally {
                setIsSearchingArtistImages(false);
            }
        };

        void loadCandidates();
    }, [
        aiHandoff,
        artistImageCandidates.length,
        artistImageSearchAlbum,
        artistImageSearchArtist,
        artistImageSearchTrack,
        coverUrl,
        draftId,
        postId,
        selectedBodyImages,
    ]);

    const escapeHtml = (value: string) =>
        value
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

    void escapeHtml;

    const sanitizeLegacyGeneratedContent = (value: string) =>
        value
            .replace(/<p>\s*https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^<]*<\/p>/gi, '')
            .replace(/<p>\s*!\[[\s\S]*?\((?:IMAGE_URL|SECOND_IMAGE_URL)[^)]+\)\s*<\/p>/gi, '')
            .replace(/<p>[\s\S]*?(?:IMAGE_URL|SECOND_IMAGE_URL)[\s\S]*?<\/p>/gi, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

    const clearDraftSnapshot = () => {
        if (typeof window === 'undefined') {
            return;
        }

        const handoffStorageKey = postId || draftId;
        if (!handoffStorageKey) {
            return;
        }

        window.localStorage.removeItem(buildAIDraftHandoffKey(handoffStorageKey));
    };

    const uploadEditorImage = async (file: File) => {
        try {
            return await uploadImage(file);
        } catch {
            toast.error(language === 'ko' ? '이미지 업로드에 실패했습니다.' : 'Upload failed');
            return '';
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setIsUploading(true);
        try {
            const url = await uploadEditorImage(file);
            if (!url) {
                return;
            }

            setCoverUrl(url);
            toast.success(language === 'ko' ? '커버 이미지를 업로드했습니다.' : 'Cover image uploaded');
        } finally {
            setIsUploading(false);
        }
    };

    const handleInlineImageUpload = async (file: File) => {
        setIsInlineImageUploading(true);
        try {
            const url = await uploadEditorImage(file);
            if (url) {
                toast.success(language === 'ko' ? '본문 이미지를 삽입했습니다.' : 'Inline image inserted');
            }
            return url;
        } finally {
            setIsInlineImageUploading(false);
        }
    };

    const appendHtmlSnippet = (htmlSnippet: string) => {
        setContent((prev) => `${prev}${prev.trim() ? '\n' : ''}${htmlSnippet}`);
        setEditorSyncKey((prev) => prev + 1);
    };

    const handleInsertLinkSuggestion = (suggestion: AIDraftLinkSuggestion) => {
        appendHtmlSnippet(
            `<p><strong>${suggestion.label}</strong>: <a href="${suggestion.url}" target="_blank" rel="noopener noreferrer">${suggestion.description}</a></p>`
        );
        toast.success(language === 'ko' ? '추천 링크를 본문에 넣었습니다.' : 'Link inserted');
    };

    const handleInsertImageSuggestion = (suggestion: AIDraftImageSuggestion) => {
        appendHtmlSnippet(
            `<blockquote><p><strong>${suggestion.label}</strong></p><p>${suggestion.caption}</p><p>ALT: ${suggestion.altText}</p><p>PROMPT: ${suggestion.prompt}</p></blockquote>`
        );
        toast.success(language === 'ko' ? '이미지 메모를 본문에 넣었습니다.' : 'Image note inserted');
    };

    const handleCreateCustomTag = () => {
        const normalizedTag = normalizeEditorTagName(customTag);
        if (!normalizedTag) {
            return;
        }

        if (!tags.includes(normalizedTag)) {
            setTags((prev) => [...prev, normalizedTag]);
        }

        setCustomTag('');
        setTagSearch('');
        setIsTagDropdownOpen(true);
    };

    const handleSearchArtistImages = async () => {
        if (!artistImageSearchArtist.trim()) {
            toast.error(language === 'ko' ? '아티스트 이름을 먼저 입력해 주세요.' : 'Enter an artist name first');
            return;
        }

        setIsSearchingArtistImages(true);
        try {
            const nextRetryIndex = artistImageRetryIndex + 1;
            const candidates = await searchArtistImageCandidates({
                artistName: artistImageSearchArtist,
                trackTitle: artistImageSearchTrack,
                albumTitle: artistImageSearchAlbum,
                retryIndex: nextRetryIndex,
                excludeImageUrls: Array.from(
                    new Set([
                        ...selectedBodyImages.map((image) => image.imageUrl),
                        coverUrl,
                    ].filter(Boolean))
                ),
            });

            setArtistImageCandidates(candidates);
            setArtistImageRetryIndex(nextRetryIndex);

            if (candidates.length === 0) {
                toast.error(
                    language === 'ko'
                        ? '다른 검색 조건으로 다시 찾아봤지만 이미지를 찾지 못했습니다.'
                        : 'No image candidates found'
                );
                return;
            }

            toast.success(
                language === 'ko'
                    ? `${candidates.length}개의 이미지 후보를 다른 조건으로 다시 찾았습니다.`
                    : `${candidates.length} image candidates found`
            );
        } catch {
            toast.error(language === 'ko' ? '이미지 검색 중 오류가 발생했습니다.' : 'Image search failed');
        } finally {
            setIsSearchingArtistImages(false);
        }
    };

    const handleSelectArtistImage = (candidate: ArtistImageCandidate) => {
        setCoverUrl(candidate.imageUrl);
        toast.success(
            language === 'ko'
                ? '선택한 이미지를 기사 대표 이미지로 적용했습니다.'
                : 'Selected image applied'
        );
    };

    const handleInsertArtistImageToBody = (candidate: ArtistImageCandidate) => {
        handleToggleBodyImageSelection(candidate);

        
        toast.success(
            language === 'ko' ? '선택한 이미지를 본문에 삽입했습니다.' : 'Image inserted into body'
        );
    };

    void handleInsertArtistImageToBody;

    const handleToggleBodyImageSelection = (candidate: ArtistImageCandidate) => {
        const existingIndex = selectedBodyImages.findIndex(
            (image) => image.imageUrl === candidate.imageUrl
        );

        if (existingIndex >= 0) {
            setSelectedBodyImages((prev) =>
                prev.filter((image) => image.imageUrl !== candidate.imageUrl)
            );
            toast.success(
                language === 'ko'
                    ? '본문 이미지 선택에서 해제했습니다.'
                    : 'Removed from body image selection'
            );
            return;
        }

        if (selectedBodyImages.length >= MAX_BODY_IMAGE_SELECTION) {
            toast.error(
                language === 'ko'
                    ? '본문 이미지는 2개만 고정할 수 있습니다. 먼저 하나를 해제해 주세요.'
                    : 'Only two body images can be selected. Remove one first.'
            );
            return;
        }

        const nextSelection = [...selectedBodyImages, candidate];
        setSelectedBodyImages(nextSelection);
        toast.success(
            language === 'ko'
                ? `본문 이미지 ${nextSelection.length}/2 선택 완료`
                : `Body image ${nextSelection.length}/2 selected`
        );
    };

    const handleSearchSpotifyCandidates = async () => {
        if (!artistName.trim() || !artistImageSearchTrack.trim()) {
            toast.error(
                language === 'ko'
                    ? '아티스트명과 트랙명을 먼저 확인해 주세요.'
                    : 'Check the artist and track title first.'
            );
            return;
        }

        setIsSearchingSpotifyCandidates(true);
        try {
            const candidates = await searchSpotifyTrackCandidates({
                artistName,
                trackTitle: artistImageSearchTrack,
                albumTitle: artistImageSearchAlbum,
            });

            setSpotifyCandidates(candidates);

            if (candidates.length === 0) {
                toast.error(
                    language === 'ko'
                        ? 'Spotify 후보를 찾지 못했습니다. 트랙명이나 앨범명을 조금 다르게 입력해 보세요.'
                        : 'No Spotify candidates found.'
                );
                return;
            }

            toast.success(
                language === 'ko'
                    ? `${candidates.length}개의 Spotify 후보를 찾았습니다.`
                    : `${candidates.length} Spotify candidates found.`
            );
        } catch {
            toast.error(
                language === 'ko'
                    ? 'Spotify 후보 검색 중 오류가 발생했습니다.'
                    : 'Spotify candidate search failed.'
            );
        } finally {
            setIsSearchingSpotifyCandidates(false);
        }
    };

    const handleApplySpotifyCandidate = (candidate: SpotifyTrackCandidate) => {
        setSpotifyUri(candidate.externalUrl);
        setArtistImageSearchAlbum((prev) => prev || candidate.albumTitle);
        toast.success(
            language === 'ko'
                ? '선택한 Spotify 트랙을 적용했습니다.'
                : 'Selected Spotify track applied.'
        );
    };

    const handlePublish = async (isDraft = false) => {
        if (!title || !content || !category) {
            toast.error(language === 'ko' ? '필수 항목을 확인해 주세요.' : 'Required fields missing');
            return;
        }

        setIsPublishing(true);
        try {
            const computedExcerpt =
                excerpt.trim() ||
                buildHeroExcerpt({
                    title,
                    artistName,
                    intro,
                    seoDescription,
                    content,
                });
            const computedSeoDescription =
                seoDescription.trim() ||
                buildSeoDescription({
                    title,
                    artistName,
                    excerpt: computedExcerpt,
                    intro,
                    content,
                });
            const computedShareCopy =
                shareCopy.trim() ||
                buildShareCopy({
                    title,
                    artistName,
                    excerpt: computedExcerpt,
                });

            const postData: PostInput = {
                title,
                content: buildEditorContent(content, {
                    excerpt: computedExcerpt,
                    intro,
                    seoDescription: computedSeoDescription,
                    shareCopy: computedShareCopy,
                    albumTitle: artistImageSearchAlbum,
                }),
                category_id: category,
                spotify_uri: spotifyUri,
                cover_image: coverUrl,
                rating: parseFloat(rating),
                artist_name: artistName,
                tags,
                is_published: !isDraft,
                slug: generatePostSlug(title),
            };

            if (postId) {
                await updatePost(postId, postData);
                toast.success(
                    isDraft
                        ? language === 'ko'
                            ? '글을 업데이트했습니다.'
                            : 'Article updated'
                        : language === 'ko'
                            ? '글을 발행했습니다.'
                            : 'Article published'
                );
            } else {
                await createPost(postData);
                toast.success(
                    isDraft
                        ? language === 'ko'
                            ? '임시 저장을 완료했습니다.'
                            : 'Draft saved'
                        : language === 'ko'
                            ? '글을 발행했습니다.'
                            : 'Article published'
                );
            }

            clearDraftSnapshot();
            router.push('/admin');
        } catch {
            toast.error(language === 'ko' ? '저장 중 오류가 발생했습니다.' : 'Sync failed');
        } finally {
            setIsPublishing(false);
        }
    };

    const filteredTags = useMemo(
        () => filterEditorTags(availableTags, tagSearch),
        [availableTags, tagSearch]
    );

    const checklist = useMemo(
        () =>
            buildEditorChecklist({
                title,
                excerpt,
                intro,
                seoDescription,
                shareCopy,
                content,
                category,
                coverUrl,
                artistName,
                tags,
                spotifyUri,
            }),
        [
            title,
            excerpt,
            intro,
            seoDescription,
            shareCopy,
            content,
            category,
            coverUrl,
            artistName,
            tags,
            spotifyUri,
        ]
    );

    return loading ? (
        <div className="flex min-h-screen items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-accent-green" size={32} strokeWidth={1} />
                <p className="font-display text-[10px] uppercase tracking-[0.4em] text-gray-500">
                    {t('decrypting', 'editor')}
                </p>
            </div>
        </div>
    ) : (
        <div className="flex min-h-screen bg-black text-white selection:bg-accent-green/30">
            <Toaster position="top-center" />
            <AdminSidebar />

            <main className="flex h-screen flex-1 flex-col overflow-hidden">
                <EditorHeader
                    title={t('title', 'editor')}
                    saveDraftLabel={t('saveDraft', 'editor')}
                    publishLabel={t('publish', 'editor')}
                    publishingLabel={t('transmit', 'editor')}
                    isPublishing={isPublishing}
                    onSaveDraft={() => void handlePublish(true)}
                    onPublish={() => void handlePublish(false)}
                />

                <div className="custom-scrollbar flex-1 overflow-y-auto p-5 sm:p-8 lg:p-10">
                    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:gap-12 xl:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="space-y-8">
                            {draftId && showLocalDraftNotice ? (
                                <LocalDraftNotice onDismiss={() => setShowLocalDraftNotice(false)} />
                            ) : null}

                            {aiHandoff ? (
                                <AIDraftAssistCard
                                    handoff={aiHandoff}
                                    onApplyTags={() => {
                                        setTags((prev) => Array.from(new Set([...prev, ...aiHandoff.tags])));
                                        toast.success(
                                            language === 'ko'
                                                ? 'AI 추천 태그를 다시 적용했습니다.'
                                                : 'AI tags applied'
                                        );
                                    }}
                                    onApplySpotify={() => {
                                        if (!aiHandoff.spotifyUri) {
                                            return;
                                        }

                                        setSpotifyUri(aiHandoff.spotifyUri);
                                        toast.success(
                                            language === 'ko'
                                                ? 'AI가 찾은 Spotify 정보를 적용했습니다.'
                                                : 'Spotify info applied'
                                        );
                                    }}
                                    onApplyCover={() => {
                                        if (!aiHandoff.coverImage) {
                                            return;
                                        }

                                        setCoverUrl(aiHandoff.coverImage);
                                        toast.success(
                                            language === 'ko'
                                                ? 'AI가 찾은 커버 이미지를 적용했습니다.'
                                                : 'Cover image applied'
                                        );
                                    }}
                                    onInsertLinkSuggestion={handleInsertLinkSuggestion}
                                    onInsertImageSuggestion={handleInsertImageSuggestion}
                                />
                            ) : null}

                            <EditorMainSection
                                language={language}
                                title={title}
                                excerpt={excerpt}
                                intro={intro}
                                seoDescription={seoDescription}
                                shareCopy={shareCopy}
                                coverUrl={coverUrl}
                                spotifyUri={spotifyUri}
                                editorSyncKey={editorSyncKey}
                                isUploading={isUploading}
                                isInlineImageUploading={isInlineImageUploading}
                                content={content}
                                headlinePlaceholder={t('headlinePlaceholder', 'editor')}
                                uploadLabel={t('injectVisual', 'editor')}
                                replaceImageLabel={t('replaceImage', 'editor')}
                                artistImageSearchArtist={artistImageSearchArtist}
                                artistImageSearchTrack={artistImageSearchTrack}
                                artistImageSearchAlbum={artistImageSearchAlbum}
                                artistImageCandidates={artistImageCandidates}
                                selectedBodyImages={selectedBodyImages}
                                isSearchingArtistImages={isSearchingArtistImages}
                                recommendedExcerpt={buildHeroExcerpt({
                                    title,
                                    artistName,
                                    intro,
                                    seoDescription,
                                    content,
                                })}
                                onTitleChange={(value, element) => {
                                    setTitle(value);
                                    element.style.height = 'auto';
                                    element.style.height = `${element.scrollHeight}px`;
                                }}
                                onExcerptChange={setExcerpt}
                                onIntroChange={setIntro}
                                onSeoDescriptionChange={setSeoDescription}
                                onShareCopyChange={setShareCopy}
                                onContentChange={setContent}
                                onImageUpload={handleImageUpload}
                                onInlineImageUpload={handleInlineImageUpload}
                                onArtistImageSearchArtistChange={setArtistImageSearchArtist}
                                onArtistImageSearchTrackChange={setArtistImageSearchTrack}
                                onArtistImageSearchAlbumChange={setArtistImageSearchAlbum}
                                onSearchArtistImages={() => void handleSearchArtistImages()}
                                onSelectArtistImage={handleSelectArtistImage}
                                onToggleArtistBodyImageSelection={handleToggleBodyImageSelection}
                            />
                        </div>

                        <EditorSidebarSection
                            language={language}
                            rating={rating}
                            artistName={artistName}
                            trackTitle={artistImageSearchTrack}
                            albumTitle={artistImageSearchAlbum}
                            category={category}
                            spotifyUri={spotifyUri}
                            spotifyCandidates={spotifyCandidates}
                            isSearchingSpotifyCandidates={isSearchingSpotifyCandidates}
                            tags={tags}
                            tagSearch={tagSearch}
                            customTag={customTag}
                            spotifyTypeLabel={getSpotifyTypeLabel(spotifyUri)}
                            categories={categories}
                            availableTags={availableTags}
                            filteredTags={filteredTags}
                            checklist={checklist}
                            isTagDropdownOpen={isTagDropdownOpen}
                            reviewRatingLabel={t('reviewRating', 'editor')}
                            artistNameLabel={t('artistName', 'editor')}
                            artistPlaceholder={t('artistPlaceholder', 'editor')}
                            categoryLabel={t('metaClass', 'editor')}
                            selectCategoryLabel={t('selectArchive', 'editor')}
                            tagsLabel={t('tags', 'editor')}
                            tagsPlaceholder={t('tagsPlaceholder', 'editor')}
                            audioLabel={t('audioInt', 'editor')}
                            audioPlaceholder={t('audioPlaceholder', 'editor')}
                            audioSupport={t('audioSupport', 'editor')}
                            noTagsLabel={language === 'ko' ? '등록된 태그가 없습니다' : 'No tags configured'}
                            onRatingChange={setRating}
                            onArtistNameChange={setArtistName}
                            onTrackTitleChange={setArtistImageSearchTrack}
                            onAlbumTitleChange={setArtistImageSearchAlbum}
                            onCategoryChange={setCategory}
                            onSpotifyUriChange={setSpotifyUri}
                            onSearchSpotifyCandidates={() => void handleSearchSpotifyCandidates()}
                            onApplySpotifyCandidate={handleApplySpotifyCandidate}
                            onTagSearchChange={setTagSearch}
                            onCustomTagChange={setCustomTag}
                            onCreateCustomTag={handleCreateCustomTag}
                            onToggleTags={() => setIsTagDropdownOpen((prev) => !prev)}
                            onToggleTag={(tagName) => {
                                setTags((prev) =>
                                    prev.includes(tagName)
                                        ? prev.filter((item) => item !== tagName)
                                        : [...prev, tagName]
                                );
                            }}
                            onRemoveTag={(tagName) => {
                                setTags((prev) => prev.filter((item) => item !== tagName));
                            }}
                        />
                    </div>
                </div>
            </main>

            <div className="pointer-events-none fixed inset-0 z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
        </div>
    );
}

export default function EditorPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-black">
                    <Loader2 className="animate-spin text-accent-green" size={32} strokeWidth={1} />
                </div>
            }
        >
            <EditorContent />
        </Suspense>
    );
}
