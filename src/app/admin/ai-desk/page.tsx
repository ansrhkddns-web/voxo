'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, Music, Mic2, Tag } from 'lucide-react';
import { generatePostDraft } from '@/app/actions/aiActions';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AIDeskPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError(null);

        try {
            const res = await generatePostDraft(formData);
            if (res.success && res.postId) {
                // 임시저장 성공시 글 수정 페이지로 이동
                router.push(`/admin/editor/${res.postId}`);
            } else {
                setError(res.error || '알 수 없는 오류가 발생했습니다.');
            }
        } catch (err: any) {
            setError(err.message || '서버 통신 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen bg-black text-white font-body">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-4xl mx-auto font-display">
                    <header className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="text-accent-green" size={24} />
                            <h1 className="text-3xl tracking-[0.2em] font-light uppercase text-white">AI Auto Desk</h1>
                        </div>
                        <p className="text-gray-400 text-xs uppercase tracking-widest leading-relaxed">
                            Voxo의 AI 에이전트(Gemini 1.5 Flash)가 아티스트와 곡 정보를 분석하여 리뷰 초안을 자동으로 작성합니다.
                            생성된 글은 '임시저장' 상태로 등록되며, 에디터 화면으로 이동합니다.
                        </p>
                    </header>

                    {error && (
                        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs tracking-wider">
                            {error}
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-8 bg-gray-950/30 border border-white/5 p-8 relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Artist Input */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gray-500">
                                    <Mic2 size={12} />
                                    아티스트 명 (Artist) *
                                </label>
                                <input
                                    type="text"
                                    name="artistName"
                                    required
                                    placeholder="예: The Weeknd"
                                    className="w-full bg-black border border-white/10 px-4 py-3 text-white text-sm focus:border-accent-green outline-none transition-colors placeholder:text-gray-700"
                                />
                            </div>

                            {/* Song Input */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gray-500">
                                    <Music size={12} />
                                    타이틀 곡 (Song) *
                                </label>
                                <input
                                    type="text"
                                    name="songTitle"
                                    required
                                    placeholder="예: Blinding Lights"
                                    className="w-full bg-black border border-white/10 px-4 py-3 text-white text-sm focus:border-accent-green outline-none transition-colors placeholder:text-gray-700"
                                />
                            </div>
                        </div>

                        {/* Concept Input */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gray-500">
                                <Tag size={12} />
                                기사 컨셉 (Concept)
                            </label>
                            <textarea
                                name="concept"
                                rows={4}
                                placeholder="예: 80년대 신스팝의 화려한 부활과 그 이면에 담긴 고독함에 초점을 맞춰서 감성적으로 리뷰해 줘."
                                className="w-full bg-black border border-white/10 p-4 text-white text-sm focus:border-accent-green outline-none transition-colors placeholder:text-gray-700 resize-none"
                            ></textarea>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-black font-display uppercase tracking-[0.2em] py-4 text-xs font-semibold hover:bg-accent-green hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>AI가 초안을 작성 중입니다... (최대 30초 소요)</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} className="group-hover:animate-pulse" />
                                    <span>자동 포스팅 생성 시작 (Generate Draft)</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
