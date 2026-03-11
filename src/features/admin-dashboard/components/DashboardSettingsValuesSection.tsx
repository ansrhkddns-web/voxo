import React from 'react';
import { History } from 'lucide-react';
import type {
    DashboardLanguage,
    DashboardSiteSettingRecord,
} from '../types';
import {
    formatDashboardDate,
    getDashboardSettingLabel,
    getDashboardSettingSummary,
} from '../utils';
import { DashboardSection } from './DashboardSection';

interface DashboardSettingsValuesSectionProps {
    settings: DashboardSiteSettingRecord[];
    locale: string;
    language: DashboardLanguage;
}

export function DashboardSettingsValuesSection({
    settings,
    locale,
    language,
}: DashboardSettingsValuesSectionProps) {
    const visibleSettings = settings
        .filter((item) => item.setting_key !== 'admin_password_hash')
        .slice(0, 5);

    return (
        <DashboardSection
            title={language === 'ko' ? '최근 설정 상태' : 'Recent Setting Values'}
            icon={<History size={14} className="text-accent-green" />}
        >
            <div className="space-y-4">
                {visibleSettings.map((item) => (
                    <div key={item.setting_key} className="border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-sm text-white">
                                {getDashboardSettingLabel(item.setting_key, language)}
                            </p>
                            <span className="font-mono text-[10px] text-gray-500">
                                {formatDashboardDate(item.updated_at, locale)}
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-400">
                            {getDashboardSettingSummary(
                                item.setting_key,
                                item.setting_value,
                                language
                            )}
                        </p>
                    </div>
                ))}
            </div>
        </DashboardSection>
    );
}
