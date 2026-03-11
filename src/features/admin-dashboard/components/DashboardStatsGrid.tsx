import React from 'react';
import { CheckCircle, TrendingUp, Users } from 'lucide-react';
import { formatDashboardNumber } from '../utils';

interface DashboardStatsGridProps {
    totalPosts: number;
    publishedPosts: number;
    activeSubscribers: number;
    totalViews: number;
    locale: string;
    labels: {
        totalPosts: string;
        publishedPosts: string;
        activeSubscribers: string;
        totalViews: string;
    };
}

export function DashboardStatsGrid({
    totalPosts,
    publishedPosts,
    activeSubscribers,
    totalViews,
    locale,
    labels,
}: DashboardStatsGridProps) {
    const items = [
        { label: labels.totalPosts, value: totalPosts, icon: <TrendingUp size={16} /> },
        { label: labels.publishedPosts, value: publishedPosts, icon: <CheckCircle size={16} /> },
        { label: labels.activeSubscribers, value: activeSubscribers, icon: <Users size={16} /> },
        { label: labels.totalViews, value: totalViews, icon: <TrendingUp size={16} /> },
    ];

    return (
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
                <div key={item.label} className="border border-white/5 bg-white/[0.02] p-6">
                    <div className="mb-4 flex items-center gap-3 text-gray-500">
                        {item.icon}
                        <p className="font-display text-[10px] uppercase tracking-[0.2em]">{item.label}</p>
                    </div>
                    <p className="font-display text-4xl font-light text-white">{formatDashboardNumber(item.value, locale)}</p>
                </div>
            ))}
        </div>
    );
}
