import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/database/auth";
import { Role } from "@/app/api/graphql/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const ADMIN_ROLES: string[] = [Role.Admin, Role.Moderator, Role.Support];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/");

    const role = (session.user as { role: string }).role;
    if (!ADMIN_ROLES.includes(role)) redirect("/");

    return (
        <div className="flex flex-1 min-h-0">
            <AdminSidebar role={role} />
            <main className="flex-1 min-w-0 overflow-auto">
                {children}
            </main>
        </div>
    );
}
