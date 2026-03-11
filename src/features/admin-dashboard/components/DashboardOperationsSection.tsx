import React from 'react';
import { Terminal } from 'lucide-react';
import type { DashboardLanguage } from '../types';
import { DashboardSection } from './DashboardSection';

interface DashboardOperationsSectionProps {
    settingsMap: Record<string, string>;
    language: DashboardLanguage;
}

export function DashboardOperationsSection({
    settingsMap,
    language,
}: DashboardOperationsSectionProps) {
    return (
        <DashboardSection
            title={language === 'ko' ? '운영 상태' : 'Operations Snapshot'}
            icon={<Terminal size={14} className="text-accent-green" />}
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <span className="text-sm text-gray-400">
                        {language === 'ko' ? '서비스 모드' : 'Service mode'}
                    </span>
                    <span className="text-sm text-white">
                        {settingsMap.maintenance_mode === 'true'
                            ? language === 'ko'
                                ? '점검 중'
                                : 'Maintenance'
                            : language === 'ko'
                                ? '정상 운영'
                                : 'Live'}
                    </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <span className="text-sm text-gray-400">
                        {language === 'ko' ? '복구 예정 시간' : 'ETA'}
                    </span>
                    <span className="text-sm text-white">{settingsMap.maintenance_eta || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                        {language === 'ko' ? '공지 링크' : 'Notice link'}
                    </span>
                    <span className="max-w-[60%] truncate text-sm text-white">
                        {settingsMap.maintenance_notice_url || '-'}
                    </span>
                </div>
            </div>
        </DashboardSection>
    );
}
