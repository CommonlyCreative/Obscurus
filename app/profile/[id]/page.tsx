import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfileOrgInvites } from "@/components/profile/ProfileOrgInvites";
import { ProfileScrimInvites } from "@/components/profile/ProfileScrimInvites";
import { ProfileTeamInvite } from "@/components/profile/ProfileTeamInvite";
import { ProfileActiveScrim } from "@/components/profile/ProfileActiveScrim";
import { TeamPanel } from "@/components/profile/TeamPanel";
import { MatchHistoryPanel } from "@/components/profile/MatchHistoryPanel";
import { auth, User } from "@/lib/database/auth";
import { graphql } from "../../api/graphql/types";
import { redirect } from "next/navigation";
import { grafbase } from "@/lib/database/grafbase";
import { headers } from "next/headers";
import { getHeroes } from "@/lib/actions/deadlockapi";
import { ScrimmageStatus } from "@/app/api/graphql/types/graphql";

// const MOCK_PLAYER: Player = {
//     name: "ShadowStriker",
//     tag: "#2847",
//     role: "Flex",
//     rank: "Diamond II",
//     rankColor: "text-[#b9f2ff]",
//     rankBg: "bg-[#b9f2ff]/10",
//     region: "NA",
//     wins: 38,
//     losses: 14,
//     scrims: 52,
//     hours: 214,
//     bio: "Flex player focused on support/carry. Looking for serious teams for weekly scrims. Available most evenings EST.",
// };


const UserProfileRoute = graphql(`
  query UserProfile($user_id: String!) {
    getUsers {
        _id
        name
        mmr
        heroes
        online
        blockInvites
    }
    getUserOrgInvitations(user_id: $user_id) {
        _id
        name
        slug
        members {
            user {
                _id
                name
            }
            orgRole
            status
        }
    }
    getScrimmageInvitations(user_id: $user_id) {
        _id
        side
        scrimmage {
            _id
            host {
                name
            }
            hostOrg {
                name
                slug
            }
            scheduledAt
        }
    }
    getUser(user_id: $user_id) {
        _id
        name
        mmr
        region
        bio
        steam {
            avatar
            username
        }
        organization {
            _id
            name
            slug
            owner {
                _id
                name
            }
            members {
                user {
                    _id
                    name
                    mmr
                }
                orgRole
                status
            }
            coreTeam {
                _id
            }
        }
        scrimmages {
            _id
            hostOrg {
                name
            }
            opponentOrg {
                name
            }
            hostTeam {
                name
                leader {
                    name
                }
                members {
                    _id
                }
            }
            opponentTeam {
                name
                leader {
                    name
                }
                members {
                    _id
                }
            }
            status
            result
            createdAt
        }
    }
  }
`);

const GetOrgScrimsQuery = graphql(`
  query GetOrgScrims($org_id: String!) {
    getOrgScrimmages(org_id: $org_id) {
        _id
        status
        scheduledAt
        hostOrg {
            _id
            name
        }
        opponentOrg {
            _id
            name
        }
        region
        wagerAmount
        bestOf
    }
  }
`);

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({ headers: await headers() });
    const user = session?.user as User;
    const userId = await params.then(p => p.id);

    const [{ getUser: profile, getUsers: allUsers, getUserOrgInvitations: orgInvitations, getScrimmageInvitations: scrimInvitations }, heroes] = await Promise.all([
        grafbase.request(UserProfileRoute, { user_id: userId }),
        getHeroes(),
    ]);

    if (!profile) {
        redirect("/");
    }

    const orgScrims = profile.organization
        ? (await grafbase.request(GetOrgScrimsQuery, { org_id: profile.organization._id }))
            .getOrgScrimmages
        : [];

    return (
        <main className="flex-1">
            <ProfileHeader
                profile={profile}
                heroes={heroes.filter(hero => user.heroes.includes(hero.id))}
                editHref={user?.id === profile._id ? `/profile/${profile._id}/edit` : undefined}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {profile.scrimmages.some(scrim => scrim.status === ScrimmageStatus.Active) && (
                    <ProfileActiveScrim isOwner={user?.id === profile._id} activeScrims={profile.scrimmages.filter(scrim => scrim.status === ScrimmageStatus.Active)} profileId={profile._id} />
                )}
                {user?.id === profile._id && orgInvitations && orgInvitations.length > 0 && (
                    <ProfileOrgInvites invites={orgInvitations.filter(i => i !== null)} profileId={profile._id} />
                )}
                {user?.id === profile._id && scrimInvitations && scrimInvitations.length > 0 && (
                    <ProfileScrimInvites invites={scrimInvitations} profileId={profile._id} />
                )}
                {user?.id === profile._id && (
                    <ProfileTeamInvite
                        userName={profile.name}
                        userMmr={profile.mmr}
                        profileId={profile._id}
                    />
                )}
                <ProfileStats _id={profile._id} scrimmages={profile.scrimmages.filter(scrim => scrim.status !== ScrimmageStatus.Active)} />
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
                    <div className="lg:col-span-2">
                        <TeamPanel
                            profileUserId={profile._id}
                            isOwner={user?.id === profile._id}
                            org={profile.organization ?? null}
                            orgScrims={orgScrims ?? []}
                            allUsers={allUsers ?? []}
                        />
                    </div>
                    <div className="lg:col-span-3">
                        <MatchHistoryPanel scrimmages={profile.scrimmages} profileUserId={profile._id} />
                    </div>
                </div>
            </div>
        </main>
    );
}
