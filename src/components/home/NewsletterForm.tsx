'use client';

import React, { useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscribeNewsletter } from '@/app/actions/newsletterActions';

export default function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [inlineError, setInlineError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedEmail = email.trim();
        if (!trimmedEmail) return;

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
        if (!isValidEmail) {
            setInlineError('올바른 이메일 주소를 입력해주세요.');
            return;
        }

        setInlineError('');
        setStatus('loading');

        try {
            const res = await subscribeNewsletter(trimmedEmail);

            if (res.success) {
                setStatus('success');
                setEmail('');
                toast.success('뉴스레터 구독이 완료되었습니다.');
            } else {
                toast.error(res.message || '구독 처리 중 문제가 발생했습니다.');
                setStatus('idle');
            }
        } catch {
            toast.error('연결 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
            setStatus('idle');
        }
    };

    if (status === 'success') {
        return (
            <div className="animate-in zoom-in fade-in flex flex-col items-center justify-center border border-white/5 bg-gray-950/50 p-8 duration-500">
                <CheckCircle2 className="mb-4 text-accent-green" size={32} strokeWidth={1} />
                <p className="text-[10px] uppercase tracking-[0.3em] text-white">구독 등록 완료</p>
                <p className="mt-3 max-w-sm text-center text-sm leading-relaxed text-gray-500">
                    매주 큐레이션, 추천 리뷰, 새로운 발견을 메일로 보내드립니다.
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-xl space-y-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:flex-row">
                <input
                    className="flex-1 rounded-none border border-white/10 bg-transparent px-6 py-4 font-body text-sm tracking-widest text-white placeholder-gray-600 transition-all focus:border-accent-green/50 focus:outline-none"
                    placeholder="youremail@mail.com"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (inlineError) {
                            setInlineError('');
                        }
                    }}
                    disabled={status === 'loading'}
                />
                <button
                    className="flex min-w-[140px] items-center justify-center rounded-none bg-white px-12 py-4 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-accent-green disabled:opacity-50"
                    type="submit"
                    disabled={status === 'loading'}
                >
                    {status === 'loading' ? <Loader2 className="animate-spin" size={16} /> : 'SUBSCRIBE'}
                </button>
            </form>

            {inlineError ? (
                <p className="text-left text-sm text-red-300">{inlineError}</p>
            ) : (
                <p className="text-left text-sm leading-relaxed text-gray-500">
                    리뷰, 에디터 픽, 아티스트 발견까지. 광고보다 큐레이션 중심으로 간결하게 보내드립니다.
                </p>
            )}
        </div>
    );
}
