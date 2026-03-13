'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Disc3, Pause, Play } from 'lucide-react';

interface PostSpotifyPlayerProps {
    uri?: string;
    autoPlayOnLoad?: boolean;
    title?: string;
    artistName?: string;
    artworkUrl?: string;
}

interface SpotifyPlaybackState {
    isPaused: boolean;
    position: number;
    duration: number;
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

function normalizeText(value: string | null | undefined) {
    return (value || '').replace(/\s+/g, ' ').trim();
}

export default function PostSpotifyPlayer({
    uri = 'spotify:track:0VjIj9H9tPjS9SqmAtvEnl',
    autoPlayOnLoad = false,
    title,
    artistName,
    artworkUrl,
}: PostSpotifyPlayerProps) {
    const { type, id } = resolveSpotifyTarget(uri);
    const [autoplayEnabled, setAutoplayEnabled] = useState(autoPlayOnLoad);
    const [playbackState, setPlaybackState] = useState<SpotifyPlaybackState>({
        isPaused: true,
        position: 0,
        duration: 1,
    });
    const [showStickyBar, setShowStickyBar] = useState(false);

    const controllerHostRef = useRef<HTMLDivElement>(null);
    const controllerRef = useRef<SpotifyIframeController | null>(null);
    const playerReadyRef = useRef(false);
    const articleWidgetRef = useRef<HTMLDivElement>(null);

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
        document.documentElement.style.setProperty(
            PLAYER_OFFSET_VAR,
            type && id && showStickyBar ? '3.25rem' : '0px',
        );

        return () => {
            document.documentElement.style.setProperty(PLAYER_OFFSET_VAR, '0px');
        };
    }, [id, showStickyBar, type]);

    useEffect(() => {
        const article = document.querySelector('[data-post-article]');
        if (!article) {
            return;
        }

        article.querySelectorAll('iframe[src*="open.spotify.com"]').forEach((node) => {
            const target = node.closest('figure, div, section, aside, p');
            if (target && target !== article) {
                target.remove();
                return;
            }

            node.remove();
        });

        article.querySelectorAll('a[href*="open.spotify.com"]').forEach((node) => {
            const target = node.closest('figure, div, section, aside, p');
            if (target && target !== article) {
                target.remove();
                return;
            }

            node.remove();
        });

        const candidates = Array.from(
            article.querySelectorAll<HTMLElement>('div, section, figure, aside, article, p'),
        );

        const legacyWidgetRoots = candidates.filter((element) => {
            const text = normalizeText(element.textContent);
            if (!text) {
                return false;
            }

            return (
                text.includes('SPOTIFY WIDGET') ||
                text.includes('Saved on Spotify') ||
                (text.includes('Spotify') && text.includes('로그인'))
            );
        });

        const outermostRoots = legacyWidgetRoots.filter(
            (element) => !legacyWidgetRoots.some((other) => other !== element && other.contains(element)),
        );

        outermostRoots.forEach((element) => {
            if (element !== article) {
                element.remove();
            }
        });
    }, []);

    useEffect(() => {
        if (!articleWidgetRef.current || !type || !id) {
            return;
        }

        let frame = 0;

        const updateVisibility = () => {
            if (!articleWidgetRef.current) {
                setShowStickyBar(false);
                return;
            }

            const rect = articleWidgetRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            const isVisible = rect.top < viewportHeight && rect.bottom > 0;

            setShowStickyBar(!isVisible);
        };

        const scheduleUpdate = () => {
            window.cancelAnimationFrame(frame);
            frame = window.requestAnimationFrame(updateVisibility);
        };

        scheduleUpdate();

        window.addEventListener('scroll', scheduleUpdate, { passive: true });
        window.addEventListener('resize', scheduleUpdate);

        return () => {
            window.cancelAnimationFrame(frame);
            window.removeEventListener('scroll', scheduleUpdate);
            window.removeEventListener('resize', scheduleUpdate);
        };
    }, [id, type]);

    useEffect(() => {
        if (!controllerHostRef.current || controllerRef.current || !type || !id) {
            return;
        }

        let destroyed = false;

        const playbackListener = (event: {
            data?: { isPaused?: boolean; position?: number; duration?: number };
        }) => {
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
                        width: '420',
                        height: '152',
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
    }, [autoplayEnabled, id, type, uri]);

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

    const progressRatio = Math.min(
        100,
        Math.max(0, (playbackState.position / Math.max(playbackState.duration, 1)) * 100),
    );

    const cardTitle = useMemo(() => title || 'Spotify Track', [title]);
    const cardArtist = useMemo(() => artistName || 'VOXO article soundtrack', [artistName]);

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

    if (!type || !id) {
        return null;
    }

    return (
        <>
            <div
                ref={controllerHostRef}
                className="pointer-events-none fixed left-[-9999px] top-[-9999px] h-[152px] w-[420px] opacity-0"
                aria-hidden="true"
            />

            <div
                ref={articleWidgetRef}
                className="not-prose mt-16 overflow-hidden rounded-[28px] border border-white/10 bg-[#14141c]/95 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            >
                <div className="flex items-center gap-4 border-b border-white/8 px-5 py-5 md:px-6">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-black/30 md:h-20 md:w-20">
                        {artworkUrl ? (
                            <Image
                                src={artworkUrl}
                                alt={cardTitle}
                                fill
                                sizes="80px"
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <Disc3 size={20} className="text-white/70" />
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-2xl font-semibold text-white">{cardTitle}</p>
                        <p className="mt-1 truncate text-base text-white/60">{cardArtist}</p>
                    </div>

                    <button
                        type="button"
                        onClick={handleTogglePlayback}
                        className="inline-flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:opacity-90"
                        title={playbackState.isPaused ? 'Play' : 'Pause'}
                    >
                        {playbackState.isPaused ? (
                            <Play size={22} className="translate-x-[1px]" />
                        ) : (
                            <Pause size={22} />
                        )}
                    </button>
                </div>

                <div className="px-5 py-5 md:px-6">
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                        <div
                            className="h-full rounded-full bg-white transition-all duration-300"
                            style={{ width: `${progressRatio || (playbackState.isPaused ? 10 : 28)}%` }}
                        />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm text-white/55">
                        <span>{cardArtist}</span>
                        <span>{formatRemaining(playbackState.duration, playbackState.position)}</span>
                    </div>
                </div>
            </div>

            {showStickyBar ? (
                <div
                    className="fixed inset-x-0 bottom-0 z-[100] border-t border-white/10 bg-[#050505]/96 shadow-[0_-18px_40px_rgba(0,0,0,0.38)] backdrop-blur-2xl"
                    style={{ bottom: 'env(safe-area-inset-bottom)' }}
                >
                    <div className="mx-auto flex w-full max-w-[1800px] items-center gap-4 px-4 py-2 md:px-6">
                        <div className="flex min-w-[220px] max-w-[420px] flex-1 items-center gap-3 md:flex-[0_1_420px]">
                            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-black/30">
                                {artworkUrl ? (
                                    <Image
                                        src={artworkUrl}
                                        alt={cardTitle}
                                        fill
                                        sizes="40px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <Disc3 size={14} className="text-white/70" />
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0">
                                <p className="truncate font-display text-[12px] font-medium text-white">
                                    {cardTitle}
                                </p>
                                <p className="truncate text-[11px] text-white/55">{cardArtist}</p>
                            </div>
                        </div>

                        <div className="min-w-0 flex-[1.6]">
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
    );
}
