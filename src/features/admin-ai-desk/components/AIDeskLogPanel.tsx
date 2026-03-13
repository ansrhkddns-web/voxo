import React from 'react';
import { Terminal } from 'lucide-react';
import type { LogEntry, AgentStatus } from '../types';

interface AIDeskLogPanelProps {
    logs: LogEntry[];
    isLoading: boolean;
    currentAgent: AgentStatus;
    scrollContainerRef: React.RefObject<HTMLDivElement | null>;
    compact?: boolean;
}

export function AIDeskLogPanel({
    logs,
    isLoading,
    currentAgent,
    scrollContainerRef,
    compact = false,
}: AIDeskLogPanelProps) {
    return (
        <div className={`group relative flex flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] font-mono text-xs shadow-2xl lg:col-span-4 ${
            compact ? 'h-[220px]' : 'h-[400px] lg:h-auto'
        }`}>
            <div className="absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-accent-green/20 to-transparent"></div>

            <div className={`flex items-center justify-between border-b border-white/5 bg-black/50 ${compact ? 'px-3 py-2.5' : 'px-4 py-3'}`}>
                <div className="flex items-center gap-2 text-gray-500">
                    <Terminal size={12} />
                    <span className="text-[9px] uppercase tracking-widest">Live Event Source</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-gray-800"></div>
                    <div className="h-2 w-2 rounded-full bg-gray-800"></div>
                    <div className="h-2 w-2 animate-pulse rounded-full bg-accent-green/50"></div>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className={`custom-scrollbar flex-1 space-y-3 overflow-y-auto ${compact ? 'p-3' : 'p-4'}`}
            >
                {logs.length === 0 ? (
                    <div className="leading-relaxed text-gray-600">
                        No logs yet. Start a draft session below to stream the progress here.
                    </div>
                ) : null}

                {logs.map((log, index) => (
                    <div key={`${log.time}-${index}`} className="flex gap-3 leading-relaxed animate-fade-in-up">
                        <span className="shrink-0 text-gray-600">{log.time}</span>
                        <span className="break-words font-light text-gray-300">{log.message}</span>
                    </div>
                ))}

                {isLoading && currentAgent !== 'done' ? (
                    <div className="flex gap-3 animate-pulse text-gray-600">
                        <span>--:--:--</span>
                        <span>Pipeline is streaming...</span>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
