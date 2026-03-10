'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { hashAdminPassword } from '@/lib/admin-auth';

interface SettingRow {
    setting_key: string;
    setting_value: string | null;
    updated_at?: string | null;
}

export interface SettingsAuditEntry {
    id: string;
    key: string;
    type: 'setting' | 'security';
    previousValue: string | null;
    nextValue: string | null;
    changedAt: string;
}

const SETTINGS_AUDIT_KEY = 'settings_audit_log';
const MAX_AUDIT_ITEMS = 40;

function normalizeSettingValue(value: string | null) {
    return value ?? '';
}

function summarizeSettingValue(key: string, value: string | null) {
    if (!value) {
        return '';
    }

    if (key === 'maintenance_mode') {
        return value === 'true' ? 'enabled' : 'disabled';
    }

    if (key === 'gemini_api_key') {
        return 'configured';
    }

    if (key === 'admin_password_hash') {
        return 'updated';
    }

    return value.length > 80 ? `${value.slice(0, 80)}...` : value;
}

async function readAuditLog() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', SETTINGS_AUDIT_KEY)
        .maybeSingle();

    if (error) {
        console.error('Failed to read settings audit log', error);
        return [] as SettingsAuditEntry[];
    }

    if (!data?.setting_value) {
        return [];
    }

    try {
        const parsed = JSON.parse(data.setting_value) as SettingsAuditEntry[];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Failed to parse settings audit log', error);
        return [];
    }
}

async function writeAuditLog(entries: SettingsAuditEntry[]) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('site_settings')
        .upsert(
            {
                setting_key: SETTINGS_AUDIT_KEY,
                setting_value: JSON.stringify(entries.slice(0, MAX_AUDIT_ITEMS)),
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'setting_key' }
        );

    if (error) {
        console.error('Failed to write settings audit log', error);
    }
}

async function appendAuditEntries(entries: SettingsAuditEntry[]) {
    if (entries.length === 0) {
        return;
    }

    const history = await readAuditLog();
    await writeAuditLog([...entries, ...history]);
    revalidatePath('/admin');
    revalidatePath('/admin/settings');
}

export async function getSetting(key: string) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('site_settings')
            .select('setting_value')
            .eq('setting_key', key)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }

            console.error(`Error fetching setting ${key}:`, error);
            return null;
        }

        return data?.setting_value || null;
    } catch (error) {
        console.error('getSetting error:', error);
        return null;
    }
}

export async function getAllSettings() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('site_settings')
            .select('setting_key, setting_value, updated_at')
            .order('updated_at', { ascending: false, nullsFirst: false });

        if (error) {
            console.error('Error fetching all settings:', error);
            return [];
        }

        return (data ?? []) as SettingRow[];
    } catch (error) {
        console.error('getAllSettings error:', error);
        return [];
    }
}

export async function getSettingsAuditLog() {
    return readAuditLog();
}

export async function updateSetting(key: string, value: string) {
    try {
        const supabase = await createClient();
        const previousValue = await getSetting(key);
        const updatedAt = new Date().toISOString();
        const { error } = await supabase
            .from('site_settings')
            .upsert(
                {
                    setting_key: key,
                    setting_value: value,
                    updated_at: updatedAt,
                },
                { onConflict: 'setting_key' }
            );

        if (error) {
            console.error(`Error updating setting ${key}:`, error);
            return { success: false, error: error.message };
        }

        if (normalizeSettingValue(previousValue) !== normalizeSettingValue(value)) {
            await appendAuditEntries([
                {
                    id: crypto.randomUUID(),
                    key,
                    type: 'setting',
                    previousValue: summarizeSettingValue(key, previousValue),
                    nextValue: summarizeSettingValue(key, value),
                    changedAt: updatedAt,
                },
            ]);
        }

        revalidatePath('/', 'layout');
        revalidatePath('/maintenance');
        revalidatePath('/login');
        revalidatePath('/admin');
        revalidatePath('/admin/settings');

        return { success: true };
    } catch (error) {
        console.error('updateSetting error:', error);
        return { success: false, error: 'Internal Server Error' };
    }
}

export async function updateAdminCredentials(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail) {
        return { success: false, error: '관리자 이메일을 입력해 주세요.' };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return { success: false, error: '올바른 이메일 형식을 입력해 주세요.' };
    }

    if (normalizedPassword.length < 8) {
        return { success: false, error: '비밀번호는 8자 이상으로 입력해 주세요.' };
    }

    try {
        const supabase = await createClient();
        const updatedAt = new Date().toISOString();
        const passwordHash = hashAdminPassword(normalizedPassword);
        const previousEmail = await getSetting('admin_login_email');
        const previousPasswordHash = await getSetting('admin_password_hash');

        const { error } = await supabase
            .from('site_settings')
            .upsert(
                [
                    {
                        setting_key: 'admin_login_email',
                        setting_value: normalizedEmail,
                        updated_at: updatedAt,
                    },
                    {
                        setting_key: 'admin_password_hash',
                        setting_value: passwordHash,
                        updated_at: updatedAt,
                    },
                ],
                { onConflict: 'setting_key' }
            );

        if (error) {
            console.error('Error updating admin credentials:', error);
            return { success: false, error: '관리자 계정 저장에 실패했습니다.' };
        }

        const auditEntries: SettingsAuditEntry[] = [];

        if (normalizeSettingValue(previousEmail) !== normalizedEmail) {
            auditEntries.push({
                id: crypto.randomUUID(),
                key: 'admin_login_email',
                type: 'security',
                previousValue: previousEmail,
                nextValue: normalizedEmail,
                changedAt: updatedAt,
            });
        }

        if (normalizeSettingValue(previousPasswordHash) !== passwordHash) {
            auditEntries.push({
                id: crypto.randomUUID(),
                key: 'admin_password_hash',
                type: 'security',
                previousValue: previousPasswordHash ? 'updated' : '',
                nextValue: 'updated',
                changedAt: updatedAt,
            });
        }

        await appendAuditEntries(auditEntries);

        revalidatePath('/admin');
        revalidatePath('/admin/settings');
        revalidatePath('/login');

        return { success: true };
    } catch (error) {
        console.error('updateAdminCredentials error:', error);
        return { success: false, error: '관리자 계정 저장 중 오류가 발생했습니다.' };
    }
}
