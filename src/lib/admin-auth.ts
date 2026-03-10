import { createHash } from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'voxo_admin_session';
export const DEFAULT_ADMIN_EMAIL = 'admin@voxo.local';
export const DEFAULT_ADMIN_PASSWORD = 'voxo1234!';

const ADMIN_SESSION_SALT = 'voxo-admin-session-v2';

export function getFallbackAdminCredentials() {
    return {
        email: process.env.ADMIN_DEFAULT_EMAIL || DEFAULT_ADMIN_EMAIL,
        password: process.env.ADMIN_DEFAULT_PASSWORD || DEFAULT_ADMIN_PASSWORD,
    };
}

export function getAdminCredentialHint() {
    return getFallbackAdminCredentials();
}

export function hashAdminPassword(password: string) {
    return createHash('sha256').update(password).digest('hex');
}

export function createAdminSessionToken(email: string, passwordHash: string) {
    return createHash('sha256')
        .update(`${email.toLowerCase()}:${passwordHash}:${ADMIN_SESSION_SALT}`)
        .digest('hex');
}
