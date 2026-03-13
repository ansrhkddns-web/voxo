import type { NewsletterHistoryEntry } from '@/app/actions/newsletterActions';
import type { SettingsAuditEntry } from '@/app/actions/settingsActions';
import type { AdminPostSummary } from '@/types/content';

export type DashboardLanguage = 'en' | 'ko';

export interface DashboardSubscriberRecord {
    id: string;
    email: string;
    status: 'active' | 'unsubscribed';
    created_at?: string;
}

export interface DashboardSiteSettingRecord {
    setting_key: string;
    setting_value: string | null;
    updated_at?: string | null;
}

export interface DashboardDataBundle {
    posts: AdminPostSummary[];
    subscribers: DashboardSubscriberRecord[];
    settings: DashboardSiteSettingRecord[];
    auditLog: SettingsAuditEntry[];
    newsletterHistory: NewsletterHistoryEntry[];
}
