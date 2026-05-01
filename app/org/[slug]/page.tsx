import { auth, User } from "@/lib/database/auth";
import { grafbase } from "@/lib/database/grafbase";
import { graphql } from "../../api/graphql/types";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { OrgHeader } from "@/components/org/OrgHeader";
import { OrgStats } from "@/components/org/OrgStats";
import { OrgRosterPanel } from "@/components/org/OrgRosterPanel";
import { OrgScrimCalendar } from "@/components/org/OrgScrimCalendar";
import { OrgScrimHistory } from "@/components/org/OrgScrimHistory";
import { OrgInviteBanner } from "@/components/org/OrgInviteBanner";
import { OrgMemberStatus, OrgRole } from "@/app/api/graphql/types/graphql";
import { OrgAvailabilityPanel } from "@/components/org/OrgAvailabilityPanel";

const OrgPageQuery = graphql(`
  query OrgPage($slug: String!) {
    getOrganizationBySlug(slug: $slug) {
      _id
      name
      slug
      description
      createdAt
      owner { _id name }
      members {
        user { _id name steam { id } }
        orgRole
        status
        joinedAt
      }
      coreTeam { _id }
      blocks {
        day
        timesheets {
          startTime
          endTime
        }
      }
    }
  }
`);

const OrgScrimsQuery = graphql(`
  query OrgPageScrims($org_id: String!) {
    getOrgScrimmages(org_id: $org_id) {
      _id
      status
      scheduledAt
      result
      createdAt
      hostOrg { _id name }
      opponentOrg { _id name }
      hostTeam { name leader { name } }
      opponentTeam { name leader { name } }
      region
      wagerAmount
      bestOf
      note
    }
  }
`);

export default async function OrgPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth.api.getSession({ headers: await headers() });
    const user = session?.user as User | undefined;
    const { slug } = await params;

    const { getOrganizationBySlug: org } = await grafbase.request(OrgPageQuery, { slug });

    if (!org) notFound();

    const { getOrgScrimmages: scrims } = await grafbase.request(OrgScrimsQuery, { org_id: org._id });
    const orgScrims = scrims ?? [];

    const userMember = user ? org.members.find(m => m.user._id === user.id) : undefined;
    const isInvited = userMember?.status === OrgMemberStatus.Invited;
    const isManager =
        userMember?.orgRole === OrgRole.Manager &&
        userMember?.status === OrgMemberStatus.Active;

    const activeMemberCount = org.members.filter(m => m.status === OrgMemberStatus.Active).length;

    return (
        <main className="flex-1">
            <OrgHeader org={org} isManager={isManager} activeMemberCount={activeMemberCount} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {isInvited && user && (
                    <div className="pt-6">
                        <OrgInviteBanner
                            orgId={org._id}
                            userId={user.id}
                            orgName={org.name}
                            slug={slug}
                        />
                    </div>
                )}
                <div className="py-8">
                    <OrgStats orgId={org._id} scrims={orgScrims} memberCount={activeMemberCount} />
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
                        <div className="lg:col-span-2">
                            <OrgRosterPanel org={org} currentUserId={user?.id} />
                        </div>
                        <div className="lg:col-span-3">
                            <OrgScrimHistory orgId={org._id} scrims={orgScrims} />
                        </div>
                    </div>
                    <OrgAvailabilityPanel
                        orgId={org._id}
                        slug={slug}
                        isManager={isManager}
                        blocks={org.blocks}
                    />
                    <div className="bg-surface border border-edge rounded-lg overflow-hidden mt-4">
                        <div className="px-5 py-4 border-b border-edge">
                            <div className="text-sm font-bold text-foreground">Scrim Calendar</div>
                            <div className="text-xs text-muted mt-0.5">Weekly schedule overview</div>
                        </div>
                        <OrgScrimCalendar scrims={orgScrims} />
                    </div>
                </div>
            </div>
        </main>
    );
}
