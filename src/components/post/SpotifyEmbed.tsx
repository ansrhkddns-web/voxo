'use client';

import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import {
    Check,
    Disc3,
    LoaderCircle,
    LogIn,
    Pause,
    Play,
    Plus,
    RefreshCw,
    RotateCcw,
    Unplug,
} from 'lucide-react';

interface SpotifyEmbedProps {
    uri?: string;
    autoPlayOnLoad?: boolean;
    title?: string;
    artistName?: string;
    artworkUrl?: string;
    categoryName?: string;
}

interface SpotifyPlaybackState {
    isPaused: boolean;
    position: number;
    duration: number;
}

interface PlayerNotice {
    tone: 'success' | 'error' | 'info';
    message: string;
}

interface SpotifyIframeController {
    loadUri: (uri: string) => void;
    play: () => void;
    pause: () => void;
    resume: () => void;
    addListener: (
        event: string,
        callback: (event: { data?: { isPaused?: boolean; position?: number; duration?: number } }) => void,
    ) => void;
    destroy?: () => void;
}

interface SpotifyIframeApi {
    createController: (
        element: HTMLElement,
        options: { uri: string; theme?: 'dark' | 'light'; width?: string; height?: string },
        callback: (controller: SpotifyIframeController) => void,
    ) => void;
}

interface SpotifyLibraryStatus {
    connected: boolean;
    saved: boolean;
    authorizeUrl?: string;
}

declare global {
    interface Window {
        SpotifyIframeApi?: SpotifyIframeApi;
        onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
    }
}

const AUTOPLAY_STORAGE_KEY = 'voxo-post-spotify-autoplay';
const PLAYER_OFFSET_VAR = '--voxo-player-offset';

let spotifyIframeApiPromise: Promise<SpotifyIframeApi> | null = null;

function loadSpotifyIframeApi() {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('Spotify iFrame API is only available in the browser.'));
    }

    if (window.SpotifyIframeApi) {
        return Promise.resolve(window.SpotifyIframeApi);
    }

    if (spotifyIframeApiPromise) {
        return spotifyIframeApiPromise;
    }

    spotifyIframeApiPromise = new Promise<SpotifyIframeApi>((resolve, reject) => {
        const previousReady = window.onSpotifyIframeApiReady;

        window.onSpotifyIframeApiReady = (api: SpotifyIframeApi) => {
            window.SpotifyIframeApi = api;
            previousReady?.(api);
            resolve(api);
        };

        const existingScript = document.querySelector<HTMLScriptElement>('script[data-voxo-spotify-iframe-api]');
        if (existingScript) {
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://open.spotify.com/embed/iframe-api/v1';
        script.async = true;
        script.dataset.voxoSpotifyIframeApi = 'true';
        script.onerror = () => reject(new Error('Failed to load Spotify iFrame API.'));
        document.body.appendChild(script);
    });

    return spotifyIframeApiPromise;
}

function resolveSpotifyTarget(uri: string) {
    let type = '';
    let id = '';

    if (uri.startsWith('spotify:')) {
        const parts = uri.split(':');
        type = parts[1] || '';
        id = parts[2] || '';
    } else if (uri.includes('open.spotify.com')) {
        try {
            const url = new URL(uri);
            const pathParts = url.pathname.split('/').filter(Boolean);
            type = pathParts[0] || '';
            id = pathParts[1] || '';
        } catch {
            console.error('Invalid Spotify URL:', uri);
        }
    }

    return { type, id };
}

function formatRemaining(duration: number, position: number) {
    const remaining = Math.max(duration - position, 0);
    const totalSeconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `-${minutes}:${String(seconds).padStart(2, '0')}`;
}

async function fetchSpotifyLibraryStatus(uri: string, returnTo: string): Promise<SpotifyLibraryStatus> {
    const response = await fetch(
        `/api/spotify/library/status?uri=${encodeURIComponent(uri)}&returnTo=${encodeURIComponent(returnTo)}`,
        { cache: 'no-store' },
    );

    if (!response.ok && response.status !== 401) {
        throw new Error('Failed to read Spotify library status.');
    }

    const data = (await response.json()) as SpotifyLibraryStatus;
    return {
        connected: Boolean(data.connected),
        saved: Boolean(data.saved),
        authorizeUrl: data.authorizeUrl,
    };
}

export default function SpotifyEmbed({
    uri = 'spotify:track:0VjIj9H9tPjS9SqmAtvEnl',
    autoPlayOnLoad = false,
    title,
    artistName,
    artworkUrl,
}: SpotifyEmbedProps) {
    const { type, id } = resolveSpotifyTarget(uri);
    const [autoplayEnabled, setAutoplayEnabled] = useState(autoPlayOnLoad);
    const [isInlineVisible, setIsInlineVisible] = useState(true);
    const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
    const [isTrackSaved, setIsTrackSaved] = useState(false);
    const [isLibraryLoading, setIsLibraryLoading] = useState(true);
    const [notice, setNotice] = useState<PlayerNotice | null>(null);
    const [playbackState, setPlaybackState] = useState<SpotifyPlaybackState>({
        isPaused: true,
        position: 0,
        duration: 1,
    });

    const wrapperRef = useRef<HTMLDivElement>(null);
    const inlinePlayerRef = useRef<HTMLDivElement>(null);
    const controllerHostRef = useRef<HTMLDivElement>(null);
    const controllerRef = useRef<SpotifyIframeController | null>(null);
    const playerReadyRef = useRef(false);

    const applyLibraryStatus = (status: SpotifyLibraryStatus) => {
        setIsSpotifyConnected(status.connected);
        setIsTrackSaved(status.saved);
    };

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            const storedAutoplay = window.localStorage.getItem(AUTOPLAY_STORAGE_KEY);
            if (storedAutoplay === 'true' || storedAutoplay === 'false') {
                setAutoplayEnabled(storedAutoplay === 'true');
            }
        });

        return () => window.cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        window.localStorage.setItem(AUTOPLAY_STORAGE_KEY, String(autoplayEnabled));
    }, [autoplayEnabled]);

    useEffect(() => {
        if (!notice || notice.tone === 'error') {
            return;
        }

        const timeout = window.setTimeout(() => {
            setNotice(null);
        }, 4000);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [notice]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const url = new URL(window.location.href);
        const saved = url.searchParams.get('spotifySaved');
        const auth = url.searchParams.get('spotifyAuth');

        if (saved === '1') {
            setIsSpotifyConnected(true);
            setIsTrackSaved(true);
            setIsLibraryLoading(false);
            setNotice({
                tone: 'success',
                message: '이 곡이 Spotify 보관함에 저장되었습니다.',
            });
            url.searchParams.delete('spotifySaved');
        }

        if (auth === 'connected' && saved !== '1') {
            setIsSpotifyConnected(true);
            setNotice({
                tone: 'success',
                message: 'Spotify 로그인이 연결되었습니다.',
            });
        }

        if (auth === 'disconnected') {
            setIsSpotifyConnected(false);
            setIsTrackSaved(false);
            setNotice({
                tone: 'info',
                message: 'Spotify 연결이 해제되었습니다. 필요하면 다시 로그인해 저장 기능을 사용할 수 있습니다.',
            });
        }

        if (auth === 'error') {
            setNotice({
                tone: 'error',
                message: 'Spotify 로그인 설정을 확인해주세요. Redirect URI가 Spotify 대시보드와 정확히 같아야 합니다.',
            });
        }

        if (auth) {
            url.searchParams.delete('spotifyAuth');
        }

        if (saved === '1' || auth) {
            window.history.replaceState({}, '', url.toString());
        }
    }, []);

    useEffect(() => {
        const element = inlinePlayerRef.current;
        if (!element || typeof window === 'undefined') {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInlineVisible(entry.isIntersecting && entry.intersectionRatio > 0.35);
            },
            {
                threshold: [0, 0.15, 0.35, 0.65, 1],
                rootMargin: '0px 0px -12px 0px',
            },
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, []);

    const showStickyPlayer = !isInlineVisible;

    useEffect(() => {
        document.documentElement.style.setProperty(
            PLAYER_OFFSET_VAR,
            showStickyPlayer ? '4.75rem' : '0px',
        );

        return () => {
            document.documentElement.style.setProperty(PLAYER_OFFSET_VAR, '0px');
        };
    }, [showStickyPlayer]);

    useEffect(() => {
        if (!type || !id || typeof window === 'undefined') {
            setIsLibraryLoading(false);
            return;
        }

        let cancelled = false;

        const loadLibraryStatus = async () => {
            setIsLibraryLoading(true);

            try {
                const status = await fetchSpotifyLibraryStatus(uri, window.location.href);

                if (cancelled) {
                    return;
                }

                applyLibraryStatus(status);
            } catch (error) {
                if (!cancelled) {
                    console.error('Failed to load Spotify library status', error);
                    setIsSpotifyConnected(false);
                    setIsTrackSaved(false);
                    setNotice({
                        tone: 'error',
                        message: 'Spotify 저장 상태를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.',
                    });
                }
            } finally {
                if (!cancelled) {
                    setIsLibraryLoading(false);
                }
            }
        };

        void loadLibraryStatus();

        const handleFocusRefresh = () => {
            void loadLibraryStatus();
        };

        const handleVisibilityRefresh = () => {
            if (document.visibilityState === 'visible') {
                void loadLibraryStatus();
            }
        };

        window.addEventListener('focus', handleFocusRefresh);
        document.addEventListener('visibilitychange', handleVisibilityRefresh);

        return () => {
            cancelled = true;
            window.removeEventListener('focus', handleFocusRefresh);
            document.removeEventListener('visibilitychange', handleVisibilityRefresh);
        };
    }, [id, type, uri]);

    useEffect(() => {
        if (!controllerHostRef.current || controllerRef.current) {
            return;
        }

        let destroyed = false;
        const playbackListener = (event: { data?: { isPaused?: boolean; position?: number; duration?: number } }) => {
            const nextData = event.data;
            if (!nextData) {
                return;
            }

            setPlaybackState((current) => ({
                isPaused: nextData.isPaused ?? current.isPaused,
                position: nextData.position ?? current.position,
                duration: nextData.duration ?? current.duration,
            }));
        };

        loadSpotifyIframeApi()
            .then((api) => {
                if (!controllerHostRef.current || destroyed) {
                    return;
                }

                api.createController(
                    controllerHostRef.current,
                    {
                        uri,
                        theme: 'dark',
                        width: '340',
                        height: type === 'track' ? '152' : '220',
                    },
                    (controller) => {
                        if (destroyed) {
                            return;
                        }

                        controllerRef.current = controller;
                        controller.addListener('playback_update', playbackListener);
                        playerReadyRef.current = true;

                        if (autoplayEnabled) {
                            window.setTimeout(() => {
                                controller.play();
                            }, 250);
                        }
                    },
                );
            })
            .catch((error) => {
                console.error('Failed to initialize Spotify iFrame player', error);
            });

        return () => {
            destroyed = true;
            controllerRef.current?.destroy?.();
            controllerRef.current = null;
        };
    }, [autoplayEnabled, type, uri]);

    useEffect(() => {
        if (!controllerRef.current || !playerReadyRef.current) {
            return;
        }

        controllerRef.current.loadUri(uri);
        const frame = window.requestAnimationFrame(() => {
            setPlaybackState({
                isPaused: true,
                position: 0,
                duration: 1,
            });
        });

        if (autoplayEnabled) {
            window.setTimeout(() => {
                controllerRef.current?.play();
            }, 250);
        }

        return () => window.cancelAnimationFrame(frame);
    }, [autoplayEnabled, uri]);

    const embedUrl =
        type && id
            ? `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0${autoplayEnabled ? '&autoplay=1' : ''}`
            : '';
    const embedHeight = type === 'track' ? 152 : 380;
    const progressRatio = Math.min(
        100,
        Math.max(0, (playbackState.position / Math.max(playbackState.duration, 1)) * 100),
    );
    const cardTitle = title || 'Spotify Track';
    const cardArtist = artistName || 'VOXO article soundtrack';

    const handleTogglePlayback = () => {
        if (!controllerRef.current) {
            return;
        }

        if (playbackState.isPaused) {
            controllerRef.current.resume();
        } else {
            controllerRef.current.pause();
        }
    };

    const handleReconnect = () => {
        if (typeof window === 'undefined') {
            return;
        }

        const returnTo = window.location.href;
        window.location.href = `/api/spotify/login?returnTo=${encodeURIComponent(returnTo)}&trackUri=${encodeURIComponent(uri)}`;
    };

    const handleDisconnect = async () => {
        if (typeof window === 'undefined') {
            return;
        }

        setIsLibraryLoading(true);

        try {
            const response = await fetch('/api/spotify/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    returnTo: window.location.href,
                }),
            });

            const data = (await response.json()) as { redirectTo?: string };

            if (data.redirectTo) {
                window.location.href = data.redirectTo;
                return;
            }

            setIsSpotifyConnected(false);
            setIsTrackSaved(false);
            setNotice({
                tone: 'info',
                message: 'Spotify 연결이 해제되었습니다. 필요하면 다시 로그인해 저장 기능을 사용할 수 있습니다.',
            });
        } catch (error) {
            console.error('Failed to disconnect Spotify session', error);
            setNotice({
                tone: 'error',
                message: 'Spotify 연결 해제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            });
        } finally {
            setIsLibraryLoading(false);
        }
    };

    const handleRefreshStatus = async () => {
        if (typeof window === 'undefined') {
            return;
        }

        setIsLibraryLoading(true);

        try {
            const status = await fetchSpotifyLibraryStatus(uri, window.location.href);
            applyLibraryStatus(status);
            setNotice({
                tone: 'info',
                message: status.connected
                    ? status.saved
                        ? '이 곡은 이미 Spotify 보관함에 저장되어 있습니다.'
                        : 'Spotify 연결 상태를 다시 확인했습니다. 아직 저장되지 않은 곡입니다.'
                    : 'Spotify 로그인 상태가 확인되지 않았습니다. 다시 로그인 후 저장할 수 있습니다.',
            });
        } catch (error) {
            console.error('Failed to refresh Spotify library status', error);
            setNotice({
                tone: 'error',
                message: 'Spotify 상태를 새로 확인하지 못했습니다. 잠시 후 다시 시도해주세요.',
            });
        } finally {
            setIsLibraryLoading(false);
        }
    };

    const handleSaveAction = async () => {
        if (typeof window === 'undefined') {
            return;
        }

        const returnTo = window.location.href;

        if (!isSpotifyConnected) {
            setNotice({
                tone: 'info',
                message: 'Spotify 로그인이 필요합니다. 로그인 후 이 곡을 보관함에 저장할 수 있습니다.',
            });
            window.location.href = `/api/spotify/login?returnTo=${encodeURIComponent(returnTo)}&trackUri=${encodeURIComponent(uri)}`;
            return;
        }

        if (isTrackSaved) {
            setNotice({
                tone: 'success',
                message: '이미 Spotify 보관함에 저장된 곡입니다.',
            });
            return;
        }

        setIsLibraryLoading(true);

        try {
            const response = await fetch('/api/spotify/library/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uri,
                    returnTo,
                }),
            });

            const data = (await response.json()) as {
                saved?: boolean;
                connected?: boolean;
                authorizeUrl?: string;
            };

            if (response.status === 401 && data.authorizeUrl) {
                setNotice({
                    tone: 'info',
                    message: 'Spotify 로그인이 필요합니다. 로그인 후 다시 저장할 수 있습니다.',
                });
                window.location.href = data.authorizeUrl;
                return;
            }

            setIsSpotifyConnected(Boolean(data.connected));
            setIsTrackSaved(Boolean(data.saved));
            setNotice({
                tone: data.saved ? 'success' : 'error',
                message: data.saved
                    ? '이 곡이 Spotify 보관함에 저장되었습니다.'
                    : 'Spotify 저장 상태를 확인하지 못했습니다.',
            });
        } catch (error) {
            console.error('Failed to save track on Spotify', error);
            setNotice({
                tone: 'error',
                message: 'Spotify 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            });
        } finally {
            setIsLibraryLoading(false);
        }
    };

    const noticeToneClass =
        notice?.tone === 'success'
            ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
            : notice?.tone === 'error'
                ? 'border-rose-400/25 bg-rose-400/10 text-rose-100'
                : 'border-white/10 bg-white/5 text-white/75';

    return (
        <div ref={wrapperRef} className="relative my-20 w-full">
            {embedUrl ? (
                <>
                    <div
                        ref={controllerHostRef}
                        className="pointer-events-none fixed left-[-9999px] top-[-9999px] h-[220px] w-[340px] opacity-0"
                        aria-hidden="true"
                    />

                    <div
                        ref={inlinePlayerRef}
                        className="overflow-hidden rounded-[20px] border border-white/10 bg-[#202026]/95 shadow-2xl shadow-black/40"
                    >
                        <iframe
                            src={embedUrl}
                            height={embedHeight}
                            frameBorder="0"
                            allowFullScreen={true}
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            style={{ width: '100%' }}
                            className="block"
                        />
                    </div>

                    {notice ? (
                        <div
                            aria-live="polite"
                            className={`mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm leading-relaxed ${noticeToneClass}`}
                        >
                            <span>{notice.message}</span>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleRefreshStatus}
                                    disabled={isLibraryLoading}
                                    className="inline-flex items-center gap-2 rounded-full border border-current/20 px-3 py-1.5 text-[11px] font-medium transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                                >
                                    <RefreshCw size={12} className={isLibraryLoading ? 'animate-spin' : ''} />
                                    상태 다시 확인
                                </button>

                                {notice.tone === 'error' ? (
                                    <button
                                        type="button"
                                        onClick={handleReconnect}
                                        className="inline-flex items-center gap-2 rounded-full border border-current/20 px-3 py-1.5 text-[11px] font-medium transition-opacity hover:opacity-90"
                                    >
                                        <RotateCcw size={12} />
                                        다시 연결
                                    </button>
                                ) : null}

                                {isSpotifyConnected ? (
                                    <button
                                        type="button"
                                        onClick={handleDisconnect}
                                        disabled={isLibraryLoading}
                                        className="inline-flex items-center gap-2 rounded-full border border-current/20 px-3 py-1.5 text-[11px] font-medium transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                                    >
                                        <Unplug size={12} />
                                        연결 해제
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    ) : null}

                    {showStickyPlayer ? (
                        <div
                            className="fixed inset-x-0 bottom-0 z-[100] border-t border-white/10 bg-[#050505]/96 shadow-[0_-18px_40px_rgba(0,0,0,0.38)] backdrop-blur-2xl animate-fade-in-up"
                            style={{ bottom: 'env(safe-area-inset-bottom)' }}
                        >
                            <div className="mx-auto flex max-w-[1800px] items-center gap-3 px-4 py-1.5 md:px-6">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-md bg-black/30">
                                        {artworkUrl ? (
                                            <Image
                                                src={artworkUrl}
                                                alt={cardTitle}
                                                fill
                                                sizes="36px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Disc3 size={13} className="text-white/70" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate font-display text-[11px] font-medium text-white">
                                            {cardTitle}
                                        </p>
                                        <p className="truncate text-[11px] text-white/55">
                                            {cardArtist}
                                            <span className="ml-2 text-white/35">
                                                {isLibraryLoading
                                                    ? '확인 중'
                                                    : isSpotifyConnected
                                                        ? isTrackSaved
                                                            ? '저장됨'
                                                            : '저장 가능'
                                                        : '로그인 필요'}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {isSpotifyConnected ? (
                                    <button
                                        type="button"
                                        onClick={handleSaveAction}
                                        disabled={isLibraryLoading}
                                        className="inline-flex h-8 min-w-8 flex-shrink-0 items-center justify-center rounded-full px-1 text-white/75 transition hover:text-white disabled:cursor-wait disabled:opacity-60"
                                        title={isTrackSaved ? 'Saved on Spotify' : 'Save on Spotify'}
                                    >
                                        {isLibraryLoading ? (
                                            <LoaderCircle size={16} className="animate-spin" />
                                        ) : isTrackSaved ? (
                                            <Check size={16} />
                                        ) : (
                                            <Plus size={16} />
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSaveAction}
                                        disabled={isLibraryLoading}
                                        className="inline-flex h-7 flex-shrink-0 items-center justify-center gap-1 rounded-full border border-white/10 px-3 text-[10px] uppercase tracking-[0.12em] text-white/75 transition hover:text-white disabled:cursor-wait disabled:opacity-60"
                                        title="Spotify 로그인 후 저장"
                                    >
                                        {isLibraryLoading ? (
                                            <LoaderCircle size={12} className="animate-spin" />
                                        ) : (
                                            <LogIn size={12} />
                                        )}
                                        로그인
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={handleRefreshStatus}
                                    disabled={isLibraryLoading}
                                    className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white/55 transition hover:text-white disabled:cursor-wait disabled:opacity-60"
                                    title="Spotify 상태 다시 확인"
                                >
                                    <RefreshCw size={14} className={isLibraryLoading ? 'animate-spin' : ''} />
                                </button>

                                <div className="min-w-0 flex-1">
                                    <div className="h-1 overflow-hidden rounded-full bg-white/15">
                                        <div
                                            className="h-full rounded-full bg-white transition-all duration-300"
                                            style={{ width: `${progressRatio || (playbackState.isPaused ? 14 : 32)}%` }}
                                        />
                                    </div>
                                </div>

                                <span className="flex-shrink-0 text-[11px] text-white/60">
                                    {formatRemaining(playbackState.duration, playbackState.position)}
                                </span>

                                <button
                                    type="button"
                                    onClick={handleTogglePlayback}
                                    className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:opacity-90"
                                    title={playbackState.isPaused ? 'Play' : 'Pause'}
                                >
                                    {playbackState.isPaused ? (
                                        <Play size={16} className="translate-x-[1px]" />
                                    ) : (
                                        <Pause size={16} />
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : null}
                </>
            ) : (
                <div className="relative z-10 rounded-2xl border border-dashed border-white/5 bg-black/40 py-12 text-center backdrop-blur-sm">
                    <p className="font-display text-[9px] uppercase tracking-[0.4em] text-gray-700">
                        오디오 연결 정보를 기다리는 중입니다...
                    </p>
                </div>
            )}
        </div>
    );
}
