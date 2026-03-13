import { unstable_cache } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache-tags';
import { createPublicClient } from '@/lib/supabase/public';

type SiteSettingKey =
    | 'site_name'
    | 'site_description'
    | 'contact_email'
    | 'global_spotify_playlist'
    | 'maintenance_mode'
    | 'maintenance_title'
    | 'maintenance_message'
    | 'maintenance_eta'
    | 'maintenance_notice_url';

interface SiteSettingRow {
    setting_key: SiteSettingKey;
    setting_value: string | null;
}

const DEFAULTS = {
    siteName: 'Voxo | Cinematic Music Magazine',
    siteDescription: 'High-end music reviews and artist discoveries in cinematic perspective.',
    contactEmail: 'hello@voxo.edit',
    globalPlaylist: '',
    maintenanceMode: false,
    maintenanceTitle: '점검 진행 중',
    maintenanceMessage:
        '현재 사이트 점검이 진행 중입니다. 더 안정적인 서비스와 완성도 높은 콘텐츠 경험을 위해 잠시 공개 화면을 닫아두었습니다. 작업이 끝나면 다시 정상적으로 접속할 수 있습니다.',
    maintenanceEta: '',
    maintenanceNoticeUrl: '',
};

const loadSiteSettings = unstable_cache(
    async () => {
        const supabase = createPublicClient();
        const { data, error } = await supabase
            .from('site_settings')
            .select('setting_key, setting_value')
            .in('setting_key', [
                'site_name',
                'site_description',
                'contact_email',
                'global_spotify_playlist',
                'maintenance_mode',
                'maintenance_title',
                'maintenance_message',
                'maintenance_eta',
                'maintenance_notice_url',
            ]);

        if (error) {
            console.error('Failed to load site settings', error);
            return DEFAULTS;
        }

        const settingsMap = new Map(
            ((data ?? []) as SiteSettingRow[]).map((item) => [item.setting_key, item.setting_value ?? '']),
        );

        return {
            siteName: settingsMap.get('site_name') || DEFAULTS.siteName,
            siteDescription: settingsMap.get('site_description') || DEFAULTS.siteDescription,
            contactEmail: settingsMap.get('contact_email') || DEFAULTS.contactEmail,
            globalPlaylist: settingsMap.get('global_spotify_playlist') || DEFAULTS.globalPlaylist,
            maintenanceMode: settingsMap.get('maintenance_mode') === 'true',
            maintenanceTitle: settingsMap.get('maintenance_title') || DEFAULTS.maintenanceTitle,
            maintenanceMessage: settingsMap.get('maintenance_message') || DEFAULTS.maintenanceMessage,
            maintenanceEta: settingsMap.get('maintenance_eta') || DEFAULTS.maintenanceEta,
            maintenanceNoticeUrl: settingsMap.get('maintenance_notice_url') || DEFAULTS.maintenanceNoticeUrl,
        };
    },
    ['site-settings'],
    { revalidate: 300, tags: [CACHE_TAGS.siteSettings] },
);

export async function getSiteSettings() {
    return loadSiteSettings();
}
