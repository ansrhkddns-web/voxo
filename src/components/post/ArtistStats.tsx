import React from 'react';
import { BarChart2, TrendingUp } from 'lucide-react';

interface ArtistStatsProps {
    data: {
        name?: string;
        followers?: number;
        monthly_listeners?: number;
        genres?: string[];
        image?: string;
        external_url?: string;
        topTracks?: {
            id: string;
            title: string;
            duration: string;
        }[];
        error?: string;
    } | null;
}

function formatNumber(num: number) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
}

export default function ArtistStats({ data }: ArtistStatsProps) {
    if (!data || (data.error && !data.name && !data.followers && !data.monthly_listeners)) {
        return (
            <div className="group relative overflow-hidden border border-white/5 bg-gray-950/20 font-display">
                <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
                <div className="relative flex min-h-[300px] flex-col justify-center p-8">
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.02]"
                        style={{
                            backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)',
                            backgroundSize: '12px 12px',
                        }}
                    />

                    <h3 className="relative z-10 mb-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-white">
                        <span className="h-px w-4 bg-red-500/50" />
                        Spotify 통계 안내
                    </h3>

                    <div className="relative z-10 flex flex-grow flex-col justify-center space-y-6">
                        <div className="border border-red-500/10 bg-red-500/5 p-6">
                            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.3em] text-red-400/80">
                                Error 403: Origin Blocked
                            </p>
                            <p className="text-[10px] font-light leading-relaxed tracking-widest text-gray-500">
                                Spotify 개발자 설정 문제로 통계를 불러오지 못했습니다.
                            </p>
                        </div>

                        <div className="h-px w-full bg-white/5" />

                        <div>
                            <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-gray-600">
                                확인 방법
                            </p>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400">
                                Spotify Developer Dashboard에서 Redirect URI와 앱 설정을 다시
                                확인해 주세요.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="group relative overflow-hidden border border-white/5 bg-gray-950/20 font-display">
            <div className="absolute left-0 top-0 h-px w-full scale-x-0 bg-gradient-to-r from-transparent via-accent-green/30 to-transparent transition-transform duration-1000 group-hover:scale-x-100" />
            <div className="p-6">
                <h3 className="mb-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-white">
                    <span className="h-px w-4 bg-accent-green" />
                    아티스트 통계
                </h3>

                <div className="space-y-6">
                    <div className={`grid ${(data.followers || 0) > 0 ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                        {(data.followers || 0) > 0 ? (
                            <div>
                                <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-gray-400">
                                    팔로워
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-light tracking-tighter text-white">
                                        {formatNumber(data.followers || 0)}
                                    </span>
                                    <span className="flex items-center text-[10px] uppercase tracking-widest text-accent-green">
                                        <TrendingUp size={12} className="mr-1" />
                                        Followers
                                    </span>
                                </div>
                            </div>
                        ) : null}

                        <div>
                            <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-gray-400">
                                월간 리스너
                            </p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-light tracking-tighter text-white">
                                    {formatNumber(data.monthly_listeners || 0)}
                                </span>
                                <span className="flex items-center text-[10px] uppercase tracking-widest text-accent-green">
                                    <BarChart2 size={12} className="mr-1" />
                                    Monthly
                                </span>
                            </div>
                        </div>
                    </div>

                    {data.topTracks && data.topTracks.length > 0 ? (
                        <>
                            <div className="h-px w-full bg-white/5" />

                            <div>
                                <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-gray-400">
                                    인기 트랙
                                </p>
                                <ul className="space-y-4">
                                    {data.topTracks.map((track, index) => (
                                        <li key={track.id} className="group flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-[9px] text-gray-600 transition-colors group-hover:text-accent-green">
                                                    {(index + 1).toString().padStart(2, '0')}
                                                </span>
                                                <span className="text-[10px] uppercase tracking-widest text-gray-300 transition-all group-hover:text-white">
                                                    {track.title}
                                                </span>
                                            </div>
                                            <span className="font-mono text-[9px] text-gray-600">{track.duration}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    ) : null}

                    <div className="h-px w-full bg-white/5" />

                    <div>
                        <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-gray-400">
                            장르
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {data.genres?.length ? (
                                data.genres.map((genre) => (
                                    <span
                                        key={genre}
                                        className="border border-white/5 bg-white/[0.02] px-3 py-1.5 text-[9px] uppercase tracking-widest text-gray-400 transition-colors hover:border-white/10"
                                    >
                                        {genre}
                                    </span>
                                ))
                            ) : (
                                <span className="text-[10px] tracking-[0.18em] text-gray-500">
                                    장르 정보는 현재 제공되지 않습니다.
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {data.external_url ? (
                    <a
                        href={data.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-10 block w-full border border-white/10 py-4 text-center font-display text-[9px] uppercase tracking-[0.3em] text-gray-400 transition-all duration-500 hover:border-accent-green hover:text-white"
                    >
                        Spotify에서 열기
                    </a>
                ) : null}
            </div>
        </div>
    );
}
