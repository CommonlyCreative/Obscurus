import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/database/auth";
import { Role } from "@/app/api/graphql/server";
import { getOrgRequestsAction } from "../actions";
import { OrgRequestsPanel } from "@/components/admin/OrgRequestsPanel";

const ALLOWED_ROLES: string[] = [Role.Admin, Role.Moderator];

export default async function AdminOrgRequestsPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    const role = (session?.user as { role?: string } | undefined)?.role ?? "";
    if (!ALLOWED_ROLES.includes(role)) redirect("/admin");

    const requests = await getOrgRequestsAction();

    return (
        <div className="p-4 sm:p-6 flex flex-col gap-5">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-px w-6 bg-primary" />
                    <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">Admin</span>
                </div>
                <h1 className="text-3xl font-black uppercase text-foreground">Org Requests</h1>
                <p className="text-sm text-dimmed mt-1">Review and action organization creation requests.</p>
            </div>

            <OrgRequestsPanel requests={requests} adminRole={role} />
        </div>
    );
}
