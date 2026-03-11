import type { AgentStatus } from './types';

export function isAgentStatus(value: string): value is AgentStatus {
    return ['idle', 'research', 'write', 'refine', 'seo', 'media', 'done'].includes(value);
}

export function getTimeLabel() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
}

export function getAgentState(currentAgent: AgentStatus, agentId: AgentStatus) {
    const order: AgentStatus[] = ['idle', 'research', 'write', 'refine', 'seo', 'media', 'done'];
    const currentIndex = order.indexOf(currentAgent);
    const agentIndex = order.indexOf(agentId);

    if (currentIndex > agentIndex) return 'done';
    if (currentIndex === agentIndex) return 'active';
    return 'waiting';
}
