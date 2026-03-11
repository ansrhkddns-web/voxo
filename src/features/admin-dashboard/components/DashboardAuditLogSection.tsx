import React from 'react';
import { History } from 'lucide-react';
import type { SettingsAuditEntry } from '@/app/actions/settingsActions';
import type { DashboardLanguage } from '../types';
import {
    formatDashboardDate,
    getDashboardAuditSummary,
    getDashboardSettingLabel,
} from '../utils';
import { DashboardSection } from './DashboardSection';

interface DashboardAuditLogSectionProps {
    auditLog: SettingsAuditEntry[];
    locale: string;
    language: DashboardLanguage;
}

export function DashboardAuditLogSection({
    auditLog,
    locale,
    language,
}: DashboardAuditLogSectionProps) {
    return (
        <DashboardSection
            title={language === 'ko' ? '설정 변경 로그' : 'Settings Audit Log'}
            icon={<History size={14} className="text-accent-green" />}
        >
            <div className="space-y-4">
                {auditLog.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-sm text-white">
                                {getDashboardSettingLabel(entry.key, language)}
                            </p>
                            <span className="font-mono text-[10px] text-gray-500">
                                {formatDashboardDate(entry.changedAt, locale)}
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-400">
                            {getDashboardAuditSummary(entry, language)}
                        </p>
                    </div>
                ))}
                {auditLog.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        {language === 'ko'
                            ? '아직 설정 변경 로그가 없습니다.'
                            : 'No settings audit history yet.'}
                    </p>
                ) : null}
            </div>
        </DashboardSection>
    );
}
