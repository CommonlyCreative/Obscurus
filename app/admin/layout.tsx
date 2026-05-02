import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/database/auth";
import { Role } from "@/app/api/graphql/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const ADMIN_ROLES: string[] = [Role.Admin, Role.Moderator, Role.Support];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const headersPromise = headers();

    return (
        <div className="flex flex-1 min-h-0">
            <Suspense fallback={<AdminLayoutSkeleton />}>
                <AdminAuthGate headersPromise={headersPromise}>
                    {children}
                </AdminAuthGate>
            </Suspense>
        </div>
    );
}

async function AdminAuthGate({
    headersPromise,
    children,
}: {
    headersPromise: ReturnType<typeof headers>;
    children: React.ReactNode;
}) {
    const h = await headersPromise;
    const session = await auth.api.getSession({ headers: h });
    if (!session) redirect("/");

    const role = (session.user as { role: string }).role;
    if (!ADMIN_ROLES.includes(role)) redirect("/");

    return (
        <>
            <AdminSidebar role={role} />
            <main className="flex-1 min-w-0 overflow-auto">
                {children}
            </main>
        </>
    );
}

function AdminLayoutSkeleton() {
    return (
        <>
            <div className="w-56 shrink-0 border-r border-edge bg-surface animate-pulse" />
            <div className="flex-1 p-8 space-y-4 animate-pulse">
                <div className="h-8 w-48 bg-surface-2 rounded-lg" />
                <div className="h-4 w-64 bg-surface-2 rounded-lg" />
                <div className="h-64 bg-surface-2 rounded-xl border border-edge" />
            </div>
        </>
    );
}
