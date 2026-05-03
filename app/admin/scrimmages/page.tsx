import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/database/auth";
import { Role } from "@/app/api/graphql/server";
import { getScrimmagesForAdminAction } from "../actions";
import { ScrimsPanel } from "@/components/admin/ScrimsPanel";

const ALLOWED_ROLES: string[] = [Role.Admin, Role.Moderator, Role.Support];

export default function AdminScrimmagesPage() {
    const headersPromise = headers();

    return (
        <div className="p-4 sm:p-6 flex flex-col gap-5">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-px w-6 bg-primary" />
                    <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">Admin</span>
                </div>
                <h1 className="text-3xl font-black uppercase text-foreground">Scrimmages</h1>
                <p className="text-sm text-dimmed mt-1">Monitor and manage active scrimmages.</p>
            </div>
            <Suspense fallback={<AdminTableSkeleton />}>
                <ScrimmagesData headersPromise={headersPromise} />
            </Suspense>
        </div>
    );
}

async function ScrimmagesData({
    headersPromise,
}: {
    headersPromise: ReturnType<typeof headers>;
}) {
    const h = await headersPromise;
    const session = await auth.api.getSession({ headers: h });
    const role = (session?.user as { role?: string } | undefined)?.role ?? "";
    if (!ALLOWED_ROLES.includes(role)) redirect("/admin");

    const scrims = await getScrimmagesForAdminAction();
    return <ScrimsPanel scrims={scrims} adminRole={role} />;
}

function AdminTableSkeleton() {
    return (
        <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-surface-2 rounded-lg border border-edge" />
            ))}
        </div>
    );
}
