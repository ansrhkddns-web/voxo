import { createClient } from '@/lib/supabase/server';
import {
    createAdminSessionToken,
    getFallbackAdminCredentials,
    hashAdminPassword,
} from '@/lib/admin-auth';

const ADMIN_EMAIL_KEY = 'admin_login_email';
const ADMIN_PASSWORD_HASH_KEY = 'admin_password_hash';

interface SiteSettingRow {
    setting_key: string;
    setting_value: string | null;
}

export async function getAdminAuthConfig() {
    const fallback = getFallbackAdminCredentials();
    const fallbackPasswordHash = hashAdminPassword(fallback.password);

    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('site_settings')
            .select('setting_key, setting_value')
            .in('setting_key', [ADMIN_EMAIL_KEY, ADMIN_PASSWORD_HASH_KEY]);

        if (error) {
            console.error('Failed to load admin auth config', error);
            return {
                email: fallback.email,
                passwordHash: fallbackPasswordHash,
                isUsingFallback: true,
            };
        }

        const settings = new Map(
            ((data ?? []) as SiteSettingRow[]).map((item) => [item.setting_key, item.setting_value ?? ''])
        );
        const email = settings.get(ADMIN_EMAIL_KEY)?.trim() || fallback.email;
        const passwordHash = settings.get(ADMIN_PASSWORD_HASH_KEY)?.trim() || fallbackPasswordHash;

        return {
            email,
            passwordHash,
            isUsingFallback: !settings.get(ADMIN_EMAIL_KEY) || !settings.get(ADMIN_PASSWORD_HASH_KEY),
        };
    } catch (error) {
        console.error('Unexpected admin auth config error', error);
        return {
            email: fallback.email,
            passwordHash: fallbackPasswordHash,
            isUsingFallback: true,
        };
    }
}

export async function verifyAdminCredentials(email: string, password: string) {
    const config = await getAdminAuthConfig();

    return (
        email.trim().toLowerCase() === config.email.toLowerCase() &&
        hashAdminPassword(password) === config.passwordHash
    );
}

export async function getAdminSessionTokenForCurrentConfig() {
    const config = await getAdminAuthConfig();
    return createAdminSessionToken(config.email, config.passwordHash);
}

export async function getAdminLoginEmail() {
    const config = await getAdminAuthConfig();
    return config.email;
}
