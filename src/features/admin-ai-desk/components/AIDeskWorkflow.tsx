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
}

export function AIDeskWorkflow({ currentAgent, progress, logsCount, isLoading }: AIDeskWorkflowProps) {
    return (
        <div className="space-y-8 lg:col-span-8">
            <h3 className="mb-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gray-500">
                <Activity size={12} /> Active Agents Workflow
            </h3>

            <div className="custom-scrollbar flex items-center justify-between gap-4 overflow-x-auto pb-4 sm:flex-row sm:gap-2">
                {aiDeskAgents.map((agent, index) => {
                    const state = getAgentState(currentAgent, agent.id);
                    const Icon = agent.icon;

                    return (
                        <React.Fragment key={agent.id}>
                            <div
                                className={`relative flex h-32 w-full flex-col justify-between rounded-lg border p-4 transition-all duration-500 sm:w-48 ${
                                    state === 'active'
                                        ? 'border-accent-green/50 bg-accent-green/10 shadow-[0_0_20px_rgba(20,200,100,0.1)]'
                                        : state === 'done'
                                            ? 'border-white/20 bg-black opacity-60'
                                            : 'border-white/5 bg-black opacity-40'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className={`rounded-md p-2 ${state === 'active' ? 'bg-accent-green text-black' : 'bg-white/5 text-gray-400'}`}>
                                        <Icon size={14} />
                                    </div>

                                    {state === 'done' ? (
                                        <span className="flex items-center gap-1 rounded-full bg-accent-green/10 px-2 py-1 text-[8px] uppercase tracking-widest text-accent-green">
                                            <CheckCircle2 size={10} /> Done
                                        </span>
                                    ) : null}

                                    {state === 'active' ? (
                                        <span className="flex items-center gap-1">
                                            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-accent-green"></span>
                                            <span className="text-[8px] uppercase tracking-widest text-accent-green">Running</span>
                                        </span>
                                    ) : null}
                                </div>

                                <div>
                                    <h4 className="mb-1 text-xs font-semibold tracking-wider text-white">{agent.name}</h4>
                                    <p className="text-[9px] uppercase tracking-wider text-gray-500">{agent.model}</p>
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

            <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-lg border border-white/5 bg-black/40 p-6 sm:flex-row sm:items-center">
                <div className="space-y-1">
                    <h4 className="text-[9px] uppercase tracking-[0.3em] text-gray-500">Session Metrics</h4>
                    <p className="text-xl font-light tracking-widest text-white">
                        {logsCount.toString().padStart(2, '0')} <span className="text-[10px] text-gray-600">LIVE EVENTS</span>
                    </p>
                </div>

                <div className="w-full space-y-2 sm:w-1/2">
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
