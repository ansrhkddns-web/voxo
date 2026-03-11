import type { NewsletterHistoryEntry } from '@/app/actions/newsletterActions';

export type NewsletterLanguage = 'en' | 'ko';

export interface NewsletterSiteSettingRecord {
    setting_key: string;
    setting_value: string | null;
}

export interface NewsletterTemplateOption {
    id: string;
    label: string;
    subject: string;
    content: string;
}

export interface NewsletterComposerState {
    subject: string;
    content: string;
    testEmail: string;
}

export interface NewsletterHistoryListProps {
    history: NewsletterHistoryEntry[];
    historyLoading: boolean;
    locale: string;
    language: NewsletterLanguage;
}
