import { AdminLanguageProvider } from '@/providers/AdminLanguageProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminLanguageProvider>
            {children}
        </AdminLanguageProvider>
    );
}
