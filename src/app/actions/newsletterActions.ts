'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function subscribeNewsletter(email: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('subscribers')
        .insert([{ email, status: 'active' }]);

    if (error) {
        if (error.code === '23505') return { success: false, message: 'Already subscribed' };
        throw error;
    }

    return { success: true };
}

export async function getSubscribers() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function deleteSubscriber(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('subscribers')
        .delete()
        .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin/subscribers');
}

export async function broadcastNewsletter(subject: string, content: string) {
    const supabase = await createClient();
    // 실제 메일 발송 서비스(Resend, Mailgun 등) 연동 지점
    // 현재는 시스템 로그나 별도 발송 기록 테이블에 저장하는 것으로 시뮬레이션
    console.log(`Broadcasting Newsletter: ${subject}`);

    // TODO: 발송 기록 저장 로직 추가 가능

    return { success: true };
}
