import { auth, User } from "@/lib/database/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { grafbase } from "@/lib/database/grafbase";
import { graphql } from "../../api/graphql/types";
import { OrgMemberStatus, OrgRole } from "@/app/api/graphql/types/graphql";
import { CreateScrimForm } from "@/components/scrims/CreateScrimForm";
import type { OrgMember } from "@/components/scrims/types";

const CreateScrimPageQuery = graphql(`
  query CreateScrimPage($user_id: String!) {
    getUser(user_id: $user_id) {
      _id
      organization {
        _id
        name
        coreTeam {
          _id
          name
          stats {
            rank {
                name
                ranking
            }
            division
          }
        }
        members {
          user {
            _id
            name
            stats {
              rank {
                name
                ranking
              }
              division
            }
          }
          orgRole
          status
        }
      }
    }
    getOrganizations {
        _id
        name
        owner {
            _id
            online
        }
        coreTeam {
            _id
            name
        }
        slug
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

export default async function CreateScrimPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/");

    const user = session.user as User;
    const { getUser: userData, getOrganizations: orgs } = await grafbase.request(CreateScrimPageQuery, {
        user_id: user.id,
    });

    const org = userData?.organization ?? null;

    const myMembership = org?.members.find(
        (m) => m.user._id === user.id && m.status === OrgMemberStatus.Active
    ) ?? null;
    const isManager = myMembership?.orgRole === OrgRole.Manager;

    const coreTeam: OrgMember[] = org?.members.filter(m => org.coreTeam.some(c => c._id === m.user._id)) ?? [];

    const activeMembers: OrgMember[] = org?.members
        .filter((m) => m.status === OrgMemberStatus.Active) ?? [];

    return (
        <main className="flex-1">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground">Create Scrimmage</h1>
                    <p className="text-sm text-muted mt-1">
                        Post a match request for other teams to accept.
                    </p>
                </div>
                <CreateScrimForm
                    userId={user.id}
                    orgs={orgs}
                    org={org ? { _id: org._id, name: org.name, coreTeam, members: activeMembers } : null}
                    isManager={isManager}
                />
            </div>
        </main>
    );
}
