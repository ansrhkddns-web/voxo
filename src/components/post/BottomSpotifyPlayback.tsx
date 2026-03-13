'use client';

import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { Disc3, Pause, Play } from 'lucide-react';

interface BottomSpotifyPlaybackProps {
    uri?: string;
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
    if (duration <= 0) {
        return '--:--';
    }

    const remaining = Math.max(duration - position, 0);
    const totalSeconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `-${minutes}:${String(seconds).padStart(2, '0')}`;
}

function normalizeText(value: string | null | undefined) {
    return (value || '').replace(/\s+/g, ' ').trim();
}

export default function BottomSpotifyPlayback({
    uri = 'spotify:track:0VjIj9H9tPjS9SqmAtvEnl',
    title,
    artistName,
    artworkUrl,
}: BottomSpotifyPlaybackProps) {
    const { type, id } = resolveSpotifyTarget(uri);
    const [playbackState, setPlaybackState] = useState<SpotifyPlaybackState>({
        isPaused: true,
        position: 0,
        duration: 0,
    });
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    const controllerHostRef = useRef<HTMLDivElement>(null);
    const controllerRef = useRef<SpotifyIframeController | null>(null);
    const readyRef = useRef(false);
    const pendingResumeRef = useRef(false);

    useEffect(() => {
        document.documentElement.style.setProperty(
            PLAYER_OFFSET_VAR,
            type && id ? '3.25rem' : '0px',
        );

        return () => {
            document.documentElement.style.setProperty(PLAYER_OFFSET_VAR, '0px');
        };
    }, [id, type]);

    useEffect(() => {
        const article = document.querySelector('[data-post-article]');
        if (!article) {
            return;
        }

        article.querySelectorAll('iframe[src*="open.spotify.com"], a[href*="open.spotify.com"]').forEach((node) => {
            const block = node.closest('figure, section, aside, div, p');
            if (block && block !== article) {
                block.remove();
                return;
            }

            node.remove();
        });

        const legacyRoots = Array.from(
            article.querySelectorAll<HTMLElement>('div, section, figure, aside, article, p'),
        ).filter((element) => {
            const text = normalizeText(element.textContent);
            return text.includes('SPOTIFY WIDGET') || text.includes('Saved on Spotify');
        });

        const outermostRoots = legacyRoots.filter(
            (element) => !legacyRoots.some((other) => other !== element && other.contains(element)),
        );

        outermostRoots.forEach((element) => {
            if (element !== article) {
                element.remove();
            }
        });
    }, []);

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

                        const markPlayerReady = () => {
                            if (destroyed) {
                                return;
                            }

                            readyRef.current = true;
                            setIsPlayerReady(true);

                            if (pendingResumeRef.current) {
                                pendingResumeRef.current = false;
                                window.setTimeout(() => {
                                    controller.resume();
                                }, 150);
                            }
                        };

                        controllerRef.current = controller;
                        markPlayerReady();
                        controller.addListener('ready', markPlayerReady);
                        controller.addListener('playback_update', playbackListener);
                        controller.addListener('playback_started', () => {
                            if (destroyed) {
                                return;
                            }

                            setPlaybackState((current) => ({
                                ...current,
                                isPaused: false,
                            }));
                        });
                    },
                );
            })
            .catch((error) => {
                console.error('Failed to initialize Spotify iFrame player', error);
            });

        return () => {
            destroyed = true;
            readyRef.current = false;
            pendingResumeRef.current = false;
            setIsPlayerReady(false);
            controllerRef.current?.destroy?.();
            controllerRef.current = null;
        };
    }, [id, type, uri]);

    useEffect(() => {
        if (!controllerRef.current || !readyRef.current) {
            return;
        }

        controllerRef.current.loadUri(uri);

        const frame = window.requestAnimationFrame(() => {
            setPlaybackState({
                isPaused: true,
                position: 0,
                duration: 0,
            });
        });

        if (pendingResumeRef.current) {
            pendingResumeRef.current = false;
            window.setTimeout(() => {
                controllerRef.current?.resume();
            }, 150);
        }

        return () => window.cancelAnimationFrame(frame);
    }, [uri]);

    const progressRatio = Math.min(
        100,
        Math.max(
            0,
            playbackState.duration > 0 ? (playbackState.position / playbackState.duration) * 100 : 0,
        ),
    );

    const cardTitle = title || 'Spotify Track';
    const cardArtist = artistName || 'VOXO article soundtrack';

    const handleTogglePlayback = () => {
        if (!controllerRef.current || !readyRef.current) {
            pendingResumeRef.current = true;
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
                className="pointer-events-none fixed bottom-0 left-0 h-px w-px overflow-hidden opacity-0"
                aria-hidden="true"
            >
                <div ref={controllerHostRef} />
            </div>

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
                                style={{ width: `${progressRatio}%` }}
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
                        title={isPlayerReady ? (playbackState.isPaused ? 'Play' : 'Pause') : 'Preparing player'}
                        aria-busy={!isPlayerReady}
                    >
                        {playbackState.isPaused ? (
                            <Play size={16} className="translate-x-[1px]" />
                        ) : (
                            <Pause size={16} />
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}
