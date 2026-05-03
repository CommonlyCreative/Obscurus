import { Suspense } from "react";
import { auth, User } from "@/lib/database/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { grafbase } from "@/lib/database/grafbase";
import { graphql } from "../../../api/graphql/types";
import { OrgMemberStatus, OrgRole } from "@/app/api/graphql/types/graphql";
import { EditProfileForm, OrgUserSearch } from "@/components/profile/EditProfileForm";
import { cn } from "@/lib/utils";
import { getHeroes } from "@/app/scrims/[id]/cache";

const EditProfilePageQuery = graphql(`
  query EditProfilePage($user_id: String!) {
    getUser(user_id: $user_id) {
      _id
      name
      heroes
      bio
      region
      stats { mmr }
      steam {
        id
        username
        avatar
      }
      organization {
        _id
        name
        owner {
          _id
        }
        members {
          user { _id name stats { rank { name } division} }
          orgRole
          status
        }
        coreTeam { _id name stats { rank { name } division} }
      }
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

export default function EditProfilePage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ disconnect_google?: string }>;
}) {
    const headersPromise = headers();

    return (
        <main className="flex-1">
            <Suspense fallback={<EditProfileSkeleton />}>
                <EditProfileData
                    headersPromise={headersPromise}
                    paramsPromise={params}
                    searchParamsPromise={searchParams}
                />
            </Suspense>
        </main>
    );
}

async function EditProfileData({
    headersPromise,
    paramsPromise,
    searchParamsPromise,
}: {
    headersPromise: ReturnType<typeof headers>;
    paramsPromise: Promise<{ id: string }>;
    searchParamsPromise: Promise<{ disconnect_google?: string }>;
}) {
    const [h, { id: profileId }, sp] = await Promise.all([headersPromise, paramsPromise, searchParamsPromise]);
    const session = await auth.api.getSession({ headers: h });
    if (!session) redirect("/");

    const user = session.user as User;
    if (user.id !== profileId) redirect(`/profile/${profileId}`);

    const [{ getUser: profile, getUsers: allUsers }, heroes] = await Promise.all([
        grafbase.request(EditProfilePageQuery, { user_id: profileId }),
        getHeroes(),
    ]);

    if (!profile) redirect("/");

    const org = profile.organization ?? null;

    const myMembership = org?.members.find(
        (m) => m.user._id === user.id && m.status === OrgMemberStatus.Active
    ) ?? null;
    const isManager = myMembership?.orgRole === OrgRole.Manager;

    const activeMembers = org?.members
        .filter((m) => m.status === OrgMemberStatus.Active)
        .map((m) => ({ _id: m.user._id, name: m.user.name, orgRole: m.orgRole })) ?? [];

    const coreTeamIds: string[] = org?.coreTeam.map((u) => u._id) ?? [];
    const steam = profile.steam ?? null;

    const users = allUsers.reduce((acc, u) => {
        if (org?.members.some(m => m.user._id === u._id)) return acc;
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
    }, [] as OrgUserSearch);

    return (
        <div className={cn("mx-auto px-4 sm:px-6 lg:px-8 py-10", org ? "max-w-6xl" : "max-w-3xl")}>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
                <p className="text-sm text-muted mt-1">Update your player information and preferences.</p>
            </div>
            <EditProfileForm
                userId={profileId}
                users={users.sort((a, b) => a.organization === "No organization" ? -1 : b.organization === "No organization" ? 1 : 0)}
                steam={steam}
                stats={profile.stats}
                initialHeroes={profile.heroes}
                initialBio={profile.bio ?? ""}
                heroes={heroes.filter(hero => !hero.in_development && !hero.disabled).sort((a, b) => a.name.localeCompare(b.name))}
                disconnectGoogleOnMount={sp.disconnect_google === "1"}
                org={org ? {
                    _id: org._id,
                    name: org.name,
                    ownerId: org.owner._id,
                    members: activeMembers,
                    coreTeamIds,
                } : null}
                isManager={isManager}
            />
        </div>
    );
}

function EditProfileSkeleton() {
    return (
        <div className="animate-pulse max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
            <div className="space-y-2">
                <div className="h-8 w-40 bg-surface-2 rounded-lg" />
                <div className="h-4 w-64 bg-surface-2 rounded-lg" />
            </div>
            <div className="h-48 bg-surface-2 rounded-xl border border-edge" />
            <div className="h-48 bg-surface-2 rounded-xl border border-edge" />
            <div className="h-64 bg-surface-2 rounded-xl border border-edge" />
            <div className="h-10 w-28 bg-surface-2 rounded-lg" />
        </div>
    );
}
