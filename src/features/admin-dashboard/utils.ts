import type { NewsletterHistoryEntry } from '@/app/actions/newsletterActions';
import type { SettingsAuditEntry } from '@/app/actions/settingsActions';
import type { DashboardLanguage } from './types';

const LABELS = {
    site_name: { en: 'Site name', ko: '사이트 이름' },
    site_description: { en: 'Site description', ko: '사이트 설명' },
    contact_email: { en: 'Contact email', ko: '문의 이메일' },
    maintenance_mode: { en: 'Maintenance mode', ko: '점검 모드' },
    maintenance_eta: { en: 'Maintenance ETA', ko: '복구 예정 시간' },
    maintenance_notice_url: { en: 'Notice link', ko: '공지 링크' },
    admin_login_email: { en: 'Admin email', ko: '관리자 이메일' },
    admin_password_hash: { en: 'Admin password', ko: '관리자 비밀번호' },
} as const;

export function getDashboardLocale(language: DashboardLanguage) {
    return language === 'ko' ? 'ko-KR' : 'en-US';
}

export function formatDashboardNumber(value: number, locale: string) {
    return new Intl.NumberFormat(locale).format(value);
}

export function formatDashboardDate(value: string | null | undefined, locale: string) {
    if (!value) return '-';

    return new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(new Date(value));
}

export function getDashboardSettingLabel(key: string, language: DashboardLanguage) {
    return LABELS[key as keyof typeof LABELS]?.[language] || key;
}

export function getDashboardSettingSummary(
    key: string,
    value: string | null,
    language: DashboardLanguage
) {
    if (!value) return language === 'ko' ? '비어 있음' : 'Empty';

    if (key === 'maintenance_mode') {
        return value === 'true'
            ? language === 'ko'
                ? '활성화'
                : 'Enabled'
            : language === 'ko'
                ? '비활성화'
                : 'Disabled';
    }

    return value.length > 56 ? `${value.slice(0, 56)}...` : value;
}

export function getDashboardAuditSummary(
    entry: SettingsAuditEntry,
    language: DashboardLanguage
) {
    if (entry.key === 'admin_password_hash') {
        return language === 'ko'
            ? '관리자 비밀번호가 변경되었습니다.'
            : 'Admin password was updated.';
    }

    const before = entry.previousValue || (language === 'ko' ? '비어 있음' : 'Empty');
    const after = entry.nextValue || (language === 'ko' ? '비어 있음' : 'Empty');
    return `${before} -> ${after}`;
}

export function getDashboardDeliveryLabel(
    item: NewsletterHistoryEntry,
    language: DashboardLanguage
) {
    return item.deliveryType === 'test'
        ? language === 'ko'
            ? '테스트'
            : 'Test'
        : language === 'ko'
            ? '전체 발송'
            : 'Broadcast';
}
