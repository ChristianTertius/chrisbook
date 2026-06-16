import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import SessionFlashWatcher from '@/components/session-flash-watcher';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            <SessionFlashWatcher />
            {children}
        </AppLayoutTemplate>
    );
}
