import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth, User } from "@/lib/database/auth";
import { OrgRequestForm } from "@/components/org/OrgRequestForm";
import { getMyOrgRequestAction } from "./actions";

export default async function OrgRequestPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/");

    const user = session.user as User;
    const existingRequest = await getMyOrgRequestAction(user.id);

    return (
        <main className="flex-1">
            <div className="border-b border-edge bg-surface">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-px w-6 bg-primary" />
                        <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
                            Organizations
                        </span>
                    </div>
                    <h1 className="text-3xl font-black uppercase text-foreground">Request an Org</h1>
                    <p className="text-sm text-dimmed mt-1">
                        Submit a request to have an organization created for your team.
                    </p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <OrgRequestForm userId={user.id} existingRequest={existingRequest} />
            </div>
        </main>
    );
}
