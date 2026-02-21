'use client';

import React, { useState } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Logged in successfully');
            router.push('/admin');
        }
        setLoading(false);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-white min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500 font-body">
            <Toaster position="top-center" />

            {/* Background Image Mix */}
            <div
                className="absolute inset-0 z-0 opacity-40 pointer-events-none bg-cover bg-center mix-blend-overlay dark:opacity-20 transform scale-105"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop")' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black z-0 pointer-events-none" />

            <main className="relative z-10 w-full max-w-md p-8 fade-in-up">
                <div className="flex flex-col items-center mb-16">
                    <div className="mb-6 opacity-90 hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-12 h-12 text-black dark:text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <rect fill="currentColor" height="7" width="2" x="7" y="10"></rect>
                            <rect fill="currentColor" height="10" width="2" x="11" y="7"></rect>
                            <rect fill="currentColor" height="5" width="2" x="15" y="12"></rect>
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold tracking-[0.3em] uppercase text-center mb-3 font-display">Voxo</h1>
                    <p className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-gray-500 dark:text-gray-400 font-medium font-display">Editorial Administration</p>
                </div>

                <form className="space-y-12" onSubmit={handleLogin}>
                    <div className="group relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-0 pointer-events-none">
                            <User className="text-gray-400 dark:text-gray-500 w-4 h-4 group-focus-within:text-white transition-colors duration-300" />
                        </div>
                        <input
                            autoComplete="off"
                            className="block w-full py-3 pl-8 pr-0 text-sm bg-transparent border-0 border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:ring-0 focus:border-black dark:focus:border-white placeholder-gray-400 dark:placeholder-gray-600 transition-all duration-300 tracking-widest font-light"
                            id="admin-id"
                            placeholder="ADMIN ID"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="group relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-0 pointer-events-none">
                            <Lock className="text-gray-400 dark:text-gray-500 w-4 h-4 group-focus-within:text-white transition-colors duration-300" />
                        </div>
                        <input
                            className="block w-full py-3 pl-8 pr-0 text-sm bg-transparent border-0 border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 focus:ring-0 focus:border-black dark:focus:border-white placeholder-gray-400 dark:placeholder-gray-600 transition-all duration-300 tracking-widest font-light"
                            id="password"
                            placeholder="PASSWORD"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col space-y-8 pt-4">
                        <div className="flex justify-center">
                            <button className="text-[10px] tracking-[0.15em] text-gray-500 hover:text-black dark:text-gray-500 dark:hover:text-white uppercase transition-colors duration-300 font-display" type="button">
                                Access Issue?
                            </button>
                        </div>
                        <button
                            className="group relative w-full flex justify-center py-4 border border-gray-300 dark:border-white/30 bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-xs font-semibold tracking-[0.25em] text-black dark:text-white uppercase transition-all duration-500 ease-out font-display"
                            type="submit"
                            disabled={loading}
                        >
                            <span className="flex items-center gap-2">
                                {loading ? 'Unlocking...' : 'Sign In'}
                                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                            </span>
                        </button>
                    </div>
                </form>
            </main>

            <footer className="absolute bottom-8 w-full text-center z-10 opacity-50">
                <p className="text-[9px] tracking-[0.2em] text-gray-400 dark:text-gray-600 uppercase font-display">
                    © 2024 Voxo Editorial. Secure Access Only.
                </p>
            </footer>

            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>
    );
}
