'use client';

import React, { useState } from 'react';
import { subscribeNewsletter } from '@/app/actions/newsletterActions';
import { Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            const res = await subscribeNewsletter(email);
            if (res.success) {
                setStatus('success');
                toast.success('DECODER SEQUENCE REGISTERED');
            } else {
                toast.error(res.message || 'SUBSCRIPTION INTERRUPTED');
                setStatus('idle');
            }
        } catch (error) {
            toast.error('CONNECTION FAILED');
            setStatus('idle');
        }
    };

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-950/50 border border-white/5 animate-in fade-in zoom-in duration-500">
                <CheckCircle2 className="text-accent-green mb-4" size={32} strokeWidth={1} />
                <p className="text-[10px] uppercase tracking-[0.3em] text-white">Entry Secure. Ready for Broadcast.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-md mx-auto relative">
            <input
                className="flex-1 bg-transparent border border-white/10 text-white placeholder-gray-600 text-sm tracking-widest px-6 py-4 focus:outline-none focus:border-accent-green/50 transition-all rounded-none font-body"
                placeholder="youremail@mail.com"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
            />
            <button
                className="bg-white text-black px-12 py-4 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-accent-green transition-all rounded-none font-display disabled:opacity-50 flex items-center justify-center min-w-[140px]"
                type="submit"
                disabled={status === 'loading'}
            >
                {status === 'loading' ? <Loader2 className="animate-spin" size={16} /> : 'INITIALIZE'}
            </button>
        </form>
    );
}
