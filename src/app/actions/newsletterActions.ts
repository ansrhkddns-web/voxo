'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

interface SubscriberRow {
    id: string;
    email: string;
    status: 'active' | 'unsubscribed';
    created_at: string;
}

interface ResendErrorResponse {
    message?: string;
    error?: string;
}

export interface NewsletterHistoryEntry {
    id: string;
    subject: string;
    preview: string;
    recipientCount: number;
    status: 'success' | 'failed';
    deliveryType: 'broadcast' | 'test';
    message: string;
    sentAt: string;
}

const NEWSLETTER_HISTORY_KEY = 'newsletter_send_history';
const MAX_HISTORY_ITEMS = 20;

function buildNewsletterHtml(subject: string, content: string) {
    const escapedSubject = subject.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const htmlBody = content
        .split('\n')
        .map((line) => line.trim())
        .map((line) =>
            line
                ? `<p style="margin:0 0 16px;line-height:1.7;">${line}</p>`
                : '<div style="height:12px"></div>'
        )
        .join('');

    return `
        <div style="background:#050505;padding:40px 20px;font-family:Arial,sans-serif;color:#f5f5f5;">
            <div style="max-width:640px;margin:0 auto;border:1px solid rgba(255,255,255,0.08);background:#0d0d0d;padding:40px;">
                <div style="font-size:11px;letter-spacing:0.35em;text-transform:uppercase;color:#7dd3a3;margin-bottom:16px;">VOXO Newsletter</div>
                <h1 style="font-size:28px;line-height:1.2;margin:0 0 24px;color:#ffffff;">${escapedSubject}</h1>
                <div style="font-size:15px;color:#d1d5db;">${htmlBody}</div>
            </div>
        </div>
    `;
}

function chunk<T>(items: T[], size: number) {
    const result: T[][] = [];

    for (let index = 0; index < items.length; index += size) {
        result.push(items.slice(index, index + size));
    }

    return result;
}

function createPreview(content: string) {
    return content.replace(/\s+/g, ' ').trim().slice(0, 140);
}

function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function readNewsletterHistory() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', NEWSLETTER_HISTORY_KEY)
        .maybeSingle();

    if (error) {
        console.error('Failed to read newsletter history', error);
        return [] as NewsletterHistoryEntry[];
    }

    if (!data?.setting_value) {
        return [];
    }

    try {
        const parsed = JSON.parse(data.setting_value) as NewsletterHistoryEntry[];
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.map((item) => ({
            ...item,
            deliveryType: (item.deliveryType === 'test' ? 'test' : 'broadcast') as
                | 'test'
                | 'broadcast',
        }));
    } catch (error) {
        console.error('Failed to parse newsletter history', error);
        return [];
    }
}

async function writeNewsletterHistory(entries: NewsletterHistoryEntry[]) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('site_settings')
        .upsert(
            {
                setting_key: NEWSLETTER_HISTORY_KEY,
                setting_value: JSON.stringify(entries.slice(0, MAX_HISTORY_ITEMS)),
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'setting_key' }
        );

    if (error) {
        console.error('Failed to write newsletter history', error);
    }
}

async function appendNewsletterHistory(entry: NewsletterHistoryEntry) {
    const history = await readNewsletterHistory();
    await writeNewsletterHistory([entry, ...history]);
    revalidatePath('/admin');
    revalidatePath('/admin/newsletter');
}

async function sendWithResend(to: string[], subject: string, content: string) {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.NEWSLETTER_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;

    if (!apiKey || !fromEmail) {
        return {
            success: false,
            message: 'RESEND_API_KEY와 NEWSLETTER_FROM_EMAIL 환경변수가 필요합니다.',
        };
    }

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: fromEmail,
            to,
            subject,
            html: buildNewsletterHtml(subject, content),
            text: content,
        }),
        cache: 'no-store',
    });

    if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as
            | ResendErrorResponse
            | null;

        return {
            success: false,
            message:
                errorPayload?.message ||
                errorPayload?.error ||
                '메일 발송 서비스 응답이 올바르지 않습니다.',
        };
    }

    return { success: true, message: '' };
}

export async function subscribeNewsletter(email: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('subscribers').insert([{ email, status: 'active' }]);

    if (error) {
        if (error.code === '23505') {
            return { success: false, message: 'Already subscribed' };
        }

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

    if (error) {
        throw error;
    }

    return (data ?? []) as SubscriberRow[];
}

export async function deleteSubscriber(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('subscribers').delete().eq('id', id);

    if (error) {
        throw error;
    }

    revalidatePath('/admin/subscribers');
}

export async function getNewsletterHistory() {
    return readNewsletterHistory();
}

export async function sendTestNewsletter(subject: string, content: string, email: string) {
    const normalizedEmail = normalizeEmail(email);

    if (!subject.trim() || !content.trim()) {
        return { success: false, message: '제목과 본문을 모두 입력해 주세요.' };
    }

    if (!normalizedEmail) {
        return { success: false, message: '테스트 수신 이메일을 입력해 주세요.' };
    }

    if (!isValidEmail(normalizedEmail)) {
        return { success: false, message: '올바른 이메일 형식을 입력해 주세요.' };
    }

    const result = await sendWithResend([normalizedEmail], `[TEST] ${subject}`, content);
    const baseHistoryEntry = {
        id: crypto.randomUUID(),
        subject: `[TEST] ${subject}`,
        preview: createPreview(content),
        recipientCount: 1,
        deliveryType: 'test' as const,
        sentAt: new Date().toISOString(),
    };

    if (!result.success) {
        await appendNewsletterHistory({
            ...baseHistoryEntry,
            status: 'failed',
            message: result.message,
        });

        return result;
    }

    const successMessage = `${normalizedEmail}로 테스트 메일을 보냈습니다.`;
    await appendNewsletterHistory({
        ...baseHistoryEntry,
        status: 'success',
        message: successMessage,
    });

    return {
        success: true,
        message: successMessage,
    };
}

export async function broadcastNewsletter(subject: string, content: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('subscribers')
        .select('id, email, status, created_at')
        .eq('status', 'active');

    if (error) {
        throw error;
    }

    const recipients = ((data ?? []) as SubscriberRow[])
        .map((subscriber) => subscriber.email)
        .filter(Boolean);

    const baseHistoryEntry = {
        id: crypto.randomUUID(),
        subject,
        preview: createPreview(content),
        recipientCount: recipients.length,
        deliveryType: 'broadcast' as const,
        sentAt: new Date().toISOString(),
    };

    if (recipients.length === 0) {
        const message = '발송할 활성 구독자가 없습니다.';
        await appendNewsletterHistory({
            ...baseHistoryEntry,
            status: 'failed',
            message,
        });

        return { success: false, message };
    }

    for (const batch of chunk(recipients, 50)) {
        const result = await sendWithResend(batch, subject, content);

        if (!result.success) {
            await appendNewsletterHistory({
                ...baseHistoryEntry,
                status: 'failed',
                message: result.message,
            });

            return result;
        }
    }

    const successMessage = `${recipients.length}명에게 뉴스레터를 발송했습니다.`;
    await appendNewsletterHistory({
        ...baseHistoryEntry,
        status: 'success',
        message: successMessage,
    });

    return {
        success: true,
        message: successMessage,
    };
}
