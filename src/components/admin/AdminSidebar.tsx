'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    Layers,
    Settings,
    LogOut,
    PlusSquare,
    Users,
    Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminLanguage } from '@/providers/AdminLanguageProvider';

// We dynamically compute names in the render loop now instead of a static array for name, but keep href/icon here
const NAV_ITEMS_DATA = [
    { id: 'dashboard', href: '/admin', icon: LayoutDashboard },
    { id: 'categories', href: '/admin/categories', icon: Layers },
    { id: 'allPosts', href: '/admin/posts', icon: FileText },
    { id: 'subscribers', href: '/admin/subscribers', icon: Users },
    { id: 'newsletter', href: '/admin/newsletter', icon: Mail },
    { id: 'settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { t } = useAdminLanguage();

    return (
        <aside className="w-64 border-r border-white/5 bg-black flex flex-col h-screen sticky top-0 font-display">
            {/* Admin Logo */}
            <div className="p-8 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-white rotate-45" />
                    <span className="text-sm font-light text-white tracking-[0.2em] uppercase">Voxo Admin</span>
                </div>
            </div>

            <div className="p-6 flex flex-col gap-10 flex-1 mt-4">
                <Link
                    href="/admin/editor"
                    className="flex items-center justify-center gap-2 w-full border border-white/10 hover:border-white/30 bg-transparent text-white text-[10px] uppercase tracking-[0.2em] py-3 rounded-none transition-all duration-300"
                >
                    <PlusSquare size={14} className="text-accent-green" />
                    <span>{t('newPost', 'sidebar')}</span>
                </Link>

                <nav className="flex flex-col gap-2">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-gray-700 mb-2 ml-2">{t('navigation', 'sidebar')}</p>
                    {NAV_ITEMS_DATA.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2 text-[10px] uppercase tracking-[0.15em] transition-all duration-300 group",
                                    isActive
                                        ? "text-white border-l border-accent-green pl-5"
                                        : "text-gray-500 hover:text-white"
                                )}
                            >
                                <Icon size={14} className={cn(isActive ? "text-accent-green" : "group-hover:text-accent-green")} />
                                {t(item.id, 'sidebar')}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="p-6 border-t border-white/5">
                <button className="flex items-center gap-3 px-4 py-2 w-full text-[10px] uppercase tracking-[0.2em] text-gray-600 hover:text-red-500 transition-all duration-300">
                    <LogOut size={14} />
                    {t('logout', 'sidebar')}
                </button>
            </div>
        </aside>
    );
}
