import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/database/auth";
import { Role } from "@/app/api/graphql/server";
import { getUsersAction } from "../actions";
import { UsersPanel } from "@/components/admin/UsersPanel";

const ALLOWED_ROLES: string[] = [Role.Admin, Role.Moderator, Role.Support];

export default function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const headersPromise = headers();

    return (
        <div className="p-4 sm:p-6 flex flex-col gap-5">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-px w-6 bg-primary" />
                    <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">Admin</span>
                </div>
                <h1 className="text-3xl font-black uppercase text-foreground">Users</h1>
                <p className="text-sm text-dimmed mt-1">Browse users and view detailed profiles.</p>
            </div>
            <Suspense fallback={<AdminTableSkeleton />}>
                <UsersData headersPromise={headersPromise} searchParamsPromise={searchParams} />
            </Suspense>
        </div>
    );
}

async function UsersData({
    headersPromise,
    searchParamsPromise,
}: {
    headersPromise: ReturnType<typeof headers>;
    searchParamsPromise: Promise<{ q?: string }>;
}) {
    const h = await headersPromise;
    const session = await auth.api.getSession({ headers: h });
    const role = (session?.user as { role?: string } | undefined)?.role ?? "";
    if (!ALLOWED_ROLES.includes(role)) redirect("/admin");

    const { q } = await searchParamsPromise;
    const users = await getUsersAction(q);
    return <UsersPanel initialUsers={users} initialSearch={q ?? ""} adminRole={role} />;
}

function AdminTableSkeleton() {
    return (
        <div className="animate-pulse space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 bg-surface-2 rounded-lg border border-edge" />
            ))}
        </div>
    );
}
