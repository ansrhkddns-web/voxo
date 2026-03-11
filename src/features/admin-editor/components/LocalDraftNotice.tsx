import React from 'react';
import { AlertTriangle, Database, FilePenLine } from 'lucide-react';

interface LocalDraftNoticeProps {
    onDismiss?: () => void;
}

export function LocalDraftNotice({ onDismiss }: LocalDraftNoticeProps) {
    return (
        <section className="space-y-4 border border-amber-400/30 bg-amber-400/10 p-5 text-amber-100">
            <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="mt-0.5 text-amber-300" />
                <div className="space-y-2">
                    <p className="font-display text-[10px] uppercase tracking-[0.3em] text-amber-300">
                        Local Draft Recovery
                    </p>
                    <p className="text-sm leading-6">
                        이 글은 데이터베이스 저장 전에 임시 로컬 초안으로 복구된 상태입니다. 내용은 편집할 수 있지만,
                        아직 정식 저장은 끝나지 않았습니다.
                    </p>
                </div>
            </div>

            <div className="grid gap-3 text-xs text-amber-50 md:grid-cols-2">
                <div className="flex items-start gap-2 border border-amber-300/20 bg-black/20 p-3">
                    <FilePenLine size={14} className="mt-0.5 text-amber-300" />
                    <p>내용을 확인한 뒤 상단의 임시 저장 또는 발행 버튼으로 직접 저장해 주세요.</p>
                </div>
                <div className="flex items-start gap-2 border border-amber-300/20 bg-black/20 p-3">
                    <Database size={14} className="mt-0.5 text-amber-300" />
                    <p>
                        AI 자동 저장이 계속 실패하면 <code>SUPABASE_SERVICE_ROLE_KEY</code> 설정을 확인해야 합니다.
                    </p>
                </div>
            </div>

            {onDismiss ? (
                <button
                    type="button"
                    onClick={onDismiss}
                    className="border border-amber-300/30 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-amber-100 transition-colors hover:border-amber-200 hover:text-white"
                >
                    Dismiss
                </button>
            ) : null}
        </section>
    );
}
