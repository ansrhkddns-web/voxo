'use client';

import React, { useState } from 'react';
import { ArrowRight, Lock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { getAdminCredentialHint } from '@/lib/admin-auth';

const defaultAdmin = getAdminCredentialHint();

export default function LoginPage() {
    const [email, setEmail] = useState(defaultAdmin.email);
    const [password, setPassword] = useState(defaultAdmin.password);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        try {
            const adminResponse = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const adminResult = (await adminResponse.json().catch(() => null)) as
                | { success?: boolean; message?: string }
                | null;

            if (adminResponse.ok && adminResult?.success) {
                toast.success(adminResult.message || '기본 관리자 계정으로 로그인했습니다.');
                router.push('/admin');
                router.refresh();
                return;
            }

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast.error(adminResult?.message || error.message || '로그인에 실패했습니다.');
                return;
            }

            toast.success('로그인되었습니다.');
            router.push('/admin');
            router.refresh();
        } catch {
            toast.error('로그인 중 문제가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background-light font-body text-gray-900 transition-colors duration-500 dark:bg-background-dark dark:text-white">
            <Toaster position="top-center" />

            <div
                className="pointer-events-none absolute inset-0 z-0 scale-105 bg-cover bg-center opacity-40 mix-blend-overlay dark:opacity-20"
                style={{
                    backgroundImage:
                        'url("https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop")',
                }}
            />
            <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-transparent via-black/80 to-black" />

            <main className="fade-in-up relative z-10 w-full max-w-md p-8">
                <div className="mb-16 flex flex-col items-center">
                    <div className="mb-6 opacity-90 transition-opacity duration-300 hover:opacity-100">
                        <svg
                            className="h-12 w-12 text-black dark:text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect fill="currentColor" height="7" width="2" x="7" y="10"></rect>
                            <rect fill="currentColor" height="10" width="2" x="11" y="7"></rect>
                            <rect fill="currentColor" height="5" width="2" x="15" y="12"></rect>
                        </svg>
                    </div>
                    <h1 className="mb-3 text-center font-display text-4xl font-bold uppercase tracking-[0.3em]">
                        Voxo
                    </h1>
                    <p className="font-display text-[10px] font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 md:text-xs">
                        Editorial Administration
                    </p>
                </div>

                <div className="mb-8 border border-white/10 bg-black/40 p-5 text-white backdrop-blur-sm">
                    <p className="font-display text-[10px] uppercase tracking-[0.3em] text-accent-green">
                        Default Admin Access
                    </p>
                    <div className="mt-4 space-y-2 text-sm">
                        <p>
                            <span className="text-gray-400">ID</span>{' '}
                            <span className="font-mono">{defaultAdmin.email}</span>
                        </p>
                        <p>
                            <span className="text-gray-400">PW</span>{' '}
                            <span className="font-mono">{defaultAdmin.password}</span>
                        </p>
                    </div>
                    <p className="mt-4 text-[11px] leading-relaxed text-gray-400">
                        지금은 바로 접속할 수 있도록 기본 관리자 계정을 함께 제공하고 있습니다. 실제 운영 배포 전에는 별도 관리자 계정으로 바꾸는 것을 권장합니다.
                    </p>
                    <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
                        관리자 설정에서 로그인 정보를 바꿨다면, 기본값 대신 변경한 이메일과 비밀번호로 로그인하면 됩니다.
                    </p>
                </div>

                <form className="space-y-12" onSubmit={handleLogin}>
                    <div className="group relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-0">
                            <User className="h-4 w-4 text-gray-400 transition-colors duration-300 group-focus-within:text-white dark:text-gray-500" />
                        </div>
                        <input
                            autoComplete="username"
                            className="block w-full border-0 border-b border-gray-300 bg-transparent py-3 pl-8 pr-0 text-sm font-light tracking-widest text-gray-900 transition-all duration-300 placeholder-gray-400 focus:border-black focus:ring-0 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-600 dark:focus:border-white"
                            id="admin-id"
                            placeholder="ADMIN ID"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>

                    <div className="group relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-0">
                            <Lock className="h-4 w-4 text-gray-400 transition-colors duration-300 group-focus-within:text-white dark:text-gray-500" />
                        </div>
                        <input
                            autoComplete="current-password"
                            className="block w-full border-0 border-b border-gray-300 bg-transparent py-3 pl-8 pr-0 text-sm font-light tracking-widest text-gray-900 transition-all duration-300 placeholder-gray-400 focus:border-black focus:ring-0 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-600 dark:focus:border-white"
                            id="password"
                            placeholder="PASSWORD"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col space-y-8 pt-4">
                        <div className="flex justify-center">
                            <button
                                className="font-display text-[10px] uppercase tracking-[0.15em] text-gray-500 transition-colors duration-300 hover:text-black dark:text-gray-500 dark:hover:text-white"
                                type="button"
                            >
                                Access Issue?
                            </button>
                        </div>
                        <button
                            className="group relative flex w-full justify-center border border-gray-300 bg-transparent py-4 font-display text-xs font-semibold uppercase tracking-[0.25em] text-black transition-all duration-500 ease-out hover:bg-black hover:text-white disabled:opacity-50 dark:border-white/30 dark:text-white dark:hover:bg-white dark:hover:text-black"
                            type="submit"
                            disabled={loading}
                        >
                            <span className="flex items-center gap-2">
                                {loading ? '확인 중...' : '로그인'}
                                <ArrowRight className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                            </span>
                        </button>
                    </div>
                </form>
            </main>

            <footer className="absolute bottom-8 z-10 w-full text-center opacity-50">
                <p className="font-display text-[9px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">
                    © 2026 Voxo Editorial. Secure Access Only.
                </p>
            </footer>

            <div
                className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
                style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
            ></div>
        </div>
    );
}
