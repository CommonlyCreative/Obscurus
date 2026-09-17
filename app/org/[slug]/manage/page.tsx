import { Suspense } from "react";
import { auth, User } from "@/lib/database/auth";
import { grafbase } from "@/lib/database/grafbase";
import { graphql } from "@/app/api/graphql/types";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OrgMemberStatus, OrgRole } from "@/app/api/graphql/types/graphql";
import { OrgManagePanel } from "@/components/org/OrgManagePanel";
import type { OrgUserSearch } from "@/components/org/types";
import { ChevronLeft } from "lucide-react";

const OrgManagePageQuery = graphql(`
  query OrgManagePage($slug: String!) {
    getOrganizationBySlug(slug: $slug) {
      _id
      name
      slug
      owner { _id }
      members {
        user { _id name }
        orgRole
        isPlayer
        status
      }
      coreTeam { _id }
    }
    getUsers {
      _id
      name
      organization {
        _id
        name
      }
    }
  }
`);

export default function OrgManagePage({ params }: { params: Promise<{ slug: string }> }) {
    return (
        <main className="flex-1">
            <Suspense fallback={<ManageSkeleton />}>
                <OrgManageContent params={params} />
            </Suspense>
        </main>
    );
}

async function OrgManageContent({ params }: { params: Promise<{ slug: string }> }) {
    const [session, { slug }] = await Promise.all([
        auth.api.getSession({ headers: await headers() }),
        params,
    ]);
    if (!session) redirect(`/org/${slug}`);
    const user = session.user as User;

    const { getOrganizationBySlug: org, getUsers: allUsers } = await grafbase.request(OrgManagePageQuery, { slug });
    if (!org) notFound();

    const myMembership = org.members.find(
        (m) => m.user._id === user.id && m.status === OrgMemberStatus.Active
    );
    if (myMembership?.orgRole !== OrgRole.Manager) redirect(`/org/${slug}`);

    const activeMembers = org.members
        .filter((m) => m.status === OrgMemberStatus.Active)
        .map((m) => ({ _id: m.user._id, name: m.user.name, orgRole: m.orgRole, isPlayer: m.isPlayer }));

    const coreTeamIds = org.coreTeam.map((u) => u._id);

    const users = allUsers.reduce((acc, u) => {
        if (org.members.some(m => m.user._id === u._id)) return acc;
        let index = acc.findIndex(x => (!u.organization && x.organization === "No organization") || (u.organization && x.organization !== "No organization" && x.organization._id === u.organization._id));

        if (index === -1) {
            index = acc.length;
            acc.push({ organization: u.organization ?? "No organization", items: [] });
        }

        const element = acc.at(index);
        if (element) {
            element.items.push(u);
            acc[index] = { organization: element.organization, items: element.items };
        }

        return acc;
    }, [] as OrgUserSearch).sort((a, b) => a.organization === "No organization" ? -1 : b.organization === "No organization" ? 1 : 0);

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <Link
                    href={`/org/${org.slug}`}
                    className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mb-3"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to {org.name}
                </Link>
                <h1 className="text-2xl font-bold text-foreground">Manage {org.name}</h1>
                <p className="text-sm text-muted mt-1">Roster, invitations, and organization settings.</p>
            </div>
            <OrgManagePanel
                org={{
                    _id: org._id,
                    name: org.name,
                    slug: org.slug,
                    ownerId: org.owner._id,
                    members: activeMembers,
                    coreTeamIds,
                }}
                users={users}
                currentUserId={user.id}
            />
        </div>
    );
}

function ManageSkeleton() {
    return (
        <div className="animate-pulse max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
            <div className="space-y-2">
                <div className="h-4 w-32 bg-surface-2 rounded-lg" />
                <div className="h-8 w-56 bg-surface-2 rounded-lg" />
                <div className="h-4 w-72 bg-surface-2 rounded-lg" />
            </div>
            <div className="h-48 bg-surface-2 rounded-xl border border-edge" />
            <div className="h-48 bg-surface-2 rounded-xl border border-edge" />
            <div className="h-64 bg-surface-2 rounded-xl border border-edge" />
        </div>
    );
}
