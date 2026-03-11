import Link from 'next/link';
import { getSiteSettings } from '@/lib/site-settings';

export const dynamic = 'force-dynamic';

export default async function MaintenancePage() {
    const settings = await getSiteSettings();

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(125,211,163,0.18),transparent_45%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.08),transparent_35%)]"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04]"></div>

            <section className="relative z-10 w-full max-w-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm md:p-12">
                <p className="font-display text-[10px] uppercase tracking-[0.4em] text-accent-green">
                    Maintenance Mode
                </p>
                <h1 className="mt-6 font-display text-4xl font-light uppercase tracking-[0.18em] text-white md:text-6xl">
                    {settings.maintenanceTitle}
                </h1>
                <p className="mt-4 font-display text-[10px] uppercase tracking-[0.3em] text-gray-500">
                    {settings.siteName}
                </p>
                <p className="mt-8 max-w-2xl text-sm leading-7 text-gray-300 md:text-base">
                    {settings.maintenanceMessage}
                </p>

                <div className="mt-10 grid gap-4 md:grid-cols-3">
                    <div className="border border-white/10 bg-black/30 p-5">
                        <p className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-500">Status</p>
                        <p className="mt-3 text-lg text-white">점검 진행 중</p>
                        <p className="mt-2 text-sm text-gray-400">
                            관리자 페이지와 운영 기능은 계속 사용할 수 있습니다.
                        </p>
                    </div>
                    <div className="border border-white/10 bg-black/30 p-5">
                        <p className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-500">ETA</p>
                        <p className="mt-3 text-lg text-white">
                            {settings.maintenanceEta || '복구 예정 시간 미정'}
                        </p>
                        <p className="mt-2 text-sm text-gray-400">
                            관리자에서 입력한 복구 예정 시간이 있으면 여기에 표시됩니다.
                        </p>
                    </div>
                    <div className="border border-white/10 bg-black/30 p-5">
                        <p className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-500">Contact</p>
                        <p className="mt-3 text-lg text-white">{settings.contactEmail}</p>
                        <p className="mt-2 text-sm text-gray-400">
                            급한 문의가 있으면 위 메일로 연락할 수 있습니다.
                        </p>
                    </div>
                </div>

                <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-3">
                        <p className="text-sm text-gray-500">{settings.siteDescription}</p>
                        {settings.maintenanceNoticeUrl ? (
                            <a
                                href={settings.maintenanceNoticeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm text-accent-green transition-colors hover:text-white"
                            >
                                공지 링크 열기
                            </a>
                        ) : null}
                    </div>

                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center border border-white/20 px-6 py-3 font-display text-[10px] uppercase tracking-[0.25em] text-white transition-colors hover:border-accent-green hover:text-accent-green"
                    >
                        Admin Access
                    </Link>
                </div>
            </section>
        </main>
    );
}
