export type AdminSettingsTabId = 'general' | 'ai' | 'integrations' | 'security' | 'notifications';

export interface AdminSettingsState {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    geminiApiKey: string;
    globalPlaylist: string;
    maintenanceMode: boolean;
    maintenanceTitle: string;
    maintenanceMessage: string;
    maintenanceEta: string;
    maintenanceNoticeUrl: string;
    aiPromptResearch: string;
    aiPromptWrite: string;
    aiPromptSeo: string;
    aiPromptConcept: string;
}

export interface AdminSecurityState {
    adminEmail: string;
    newPassword: string;
    confirmPassword: string;
}

export interface AdminSettingsCopy {
    title: string;
    subtitle: string;
    save: string;
    saving: string;
    saved: string;
    failed: string;
    loading: string;
    tabs: Record<AdminSettingsTabId, string>;
    general: {
        section: string;
        siteName: string;
        siteDescription: string;
        contactEmail: string;
        adminLanguage: string;
        languageHelp: string;
        koreanLabel: string;
        englishLabel: string;
    };
    ai: {
        section: string;
        description: string;
        concept: string;
        research: string;
        write: string;
        seo: string;
    };
    integrations: {
        section: string;
        spotify: string;
        gemini: string;
        playlist: string;
    };
    security: {
        section: string;
        description: string;
        adminEmail: string;
        newPassword: string;
        confirmPassword: string;
        saveAccess: string;
        savingAccess: string;
        savedAccess: string;
        passwordHelp: string;
        mismatch: string;
        maintenance: string;
        maintenanceHelp: string;
        maintenanceTitle: string;
        maintenanceMessage: string;
        maintenanceEta: string;
        maintenanceNoticeUrl: string;
        fallbackTitle: string;
        fallbackText: string;
        fallbackId: string;
        fallbackPassword: string;
    };
    notifications: {
        section: string;
        placeholder: string;
    };
}
