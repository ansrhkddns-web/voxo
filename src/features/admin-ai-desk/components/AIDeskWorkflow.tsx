import React from 'react';
import { Activity, CheckCircle2, ChevronRight } from 'lucide-react';
import { aiDeskAgents } from '../constants';
import { getAgentState } from '../utils';
import type { AgentStatus } from '../types';

interface AIDeskWorkflowProps {
    currentAgent: AgentStatus;
    progress: number;
    logsCount: number;
    isLoading: boolean;
    compact?: boolean;
}

export function AIDeskWorkflow({
    currentAgent,
    progress,
    logsCount,
    isLoading,
    compact = false,
}: AIDeskWorkflowProps) {
    return (
        <div className={`${compact ? 'space-y-4' : 'space-y-8'} lg:col-span-8`}>
            <h3 className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gray-500 ${compact ? 'mb-4' : 'mb-6'}`}>
                <Activity size={12} /> Active Agents Workflow
            </h3>

            <div className={`custom-scrollbar flex items-center gap-3 overflow-x-auto ${compact ? 'pb-1' : 'justify-between pb-4'} sm:flex-row sm:gap-2`}>
                {aiDeskAgents.map((agent, index) => {
                    const state = getAgentState(currentAgent, agent.id);
                    const Icon = agent.icon;

                    return (
                        <React.Fragment key={agent.id}>
                            <div
                                className={`relative flex w-full flex-col justify-between rounded-lg border transition-all duration-500 ${
                                    compact ? 'h-20 min-w-[140px] p-3 sm:w-36' : 'h-32 p-4 sm:w-48'
                                } ${
                                    state === 'active'
                                        ? 'border-accent-green/50 bg-accent-green/10 shadow-[0_0_20px_rgba(20,200,100,0.1)]'
                                        : state === 'done'
                                            ? 'border-white/20 bg-black opacity-60'
                                            : 'border-white/5 bg-black opacity-40'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className={`rounded-md ${compact ? 'p-1.5' : 'p-2'} ${state === 'active' ? 'bg-accent-green text-black' : 'bg-white/5 text-gray-400'}`}>
                                        <Icon size={compact ? 12 : 14} />
                                    </div>

                                    {state === 'done' ? (
                                        <span className={`flex items-center gap-1 rounded-full bg-accent-green/10 px-2 py-1 uppercase tracking-widest text-accent-green ${compact ? 'text-[7px]' : 'text-[8px]'}`}>
                                            <CheckCircle2 size={10} /> Done
                                        </span>
                                    ) : null}

                                    {state === 'active' ? (
                                        <span className="flex items-center gap-1">
                                            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-accent-green"></span>
                                            <span className={`${compact ? 'text-[7px]' : 'text-[8px]'} uppercase tracking-widest text-accent-green`}>Running</span>
                                        </span>
                                    ) : null}
                                </div>

                                <div>
                                    <h4 className={`mb-1 font-semibold tracking-wider text-white ${compact ? 'text-[11px]' : 'text-xs'}`}>
                                        {agent.name}
                                    </h4>
                                    <p className={`uppercase tracking-wider text-gray-500 ${compact ? 'text-[8px]' : 'text-[9px]'}`}>
                                        {agent.model}
                                    </p>
                                </div>

                                {state === 'active' ? (
                                    <div className="absolute bottom-0 left-0 h-0.5 w-full animate-pulse bg-accent-green"></div>
                                ) : null}
                            </div>

                            {index < aiDeskAgents.length - 1 ? (
                                <div className="hidden text-gray-700 sm:flex">
                                    <ChevronRight size={16} className={state === 'done' ? 'text-accent-green' : ''} />
                                </div>
                            ) : null}
                        </React.Fragment>
                    );
                })}
            </div>

            <div className={`grid rounded-lg border border-white/5 bg-black/40 ${compact ? 'grid-cols-1 gap-3 p-4 sm:grid-cols-[auto,1fr]' : 'mt-12 grid-cols-1 gap-6 p-6 sm:grid-cols-[auto,1fr]'}`}>
                <div className="space-y-1">
                    <h4 className="text-[9px] uppercase tracking-[0.3em] text-gray-500">Session Metrics</h4>
                    <p className={`${compact ? 'text-base' : 'text-xl'} font-light tracking-widest text-white`}>
                        {logsCount.toString().padStart(2, '0')} <span className="text-[10px] text-gray-600">LIVE EVENTS</span>
                    </p>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-[8px] uppercase tracking-widest text-gray-500">
                        <span>Pipeline Health</span>
                        <span className="text-accent-green">{isLoading ? 'Running' : 'Ready'}</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                        <div className="h-full bg-accent-green transition-all duration-700" style={{ width: `${Math.max(progress, 4)}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
