import { auth, User } from "@/lib/database/auth";
import { grafbase } from "@/lib/database/grafbase";
import { graphql } from "@/app/api/graphql/types";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ScrimDetail } from "@/components/scrims/ScrimDetail";
import { OrgMemberStatus, OrgRole } from "@/app/api/graphql/types/graphql";

const GetViewerOrgQuery = graphql(`
    query GetViewerOrg($user_id: String!) {
        getUser(user_id: $user_id) {
            organization { _id }
        }
    }
`);

const GetScrimmageQuery = graphql(`
    query GetScrimmageDetail($scrimmage_id: String!) {
        getScrimmage(scrimmage_id: $scrimmage_id) {
            _id
            status
            result
            bestOf
            isPrivate
            scheduledAt
            wagerAmount
            partyCode
            readyHost
            readyOpponent
            note
            createdAt
            updatedAt
            matches {
                number
                match_id
                result
                startedAt
                concludedAt
            }
            host { _id name mmr }
            hostOrg { _id name }
            hostTeam {
                leader { _id name mmr }
                members { _id name mmr }
            }
            opponentOrg {
                _id
                name
                coreTeam { _id name mmr }
                members {
                    orgRole
                    user {
                        _id
                        name
                        mmr
                    }
                    status
                }
            }
            opponentTeam {
                leader { _id name mmr }
                members { _id name mmr }
            }
            invitations {
                _id
                user { _id name }
                side
                status
            }
        }
    }
`);

export default async function ScrimPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    const user = session?.user as User | undefined;

    const [{ getScrimmage: scrim }, viewerData] = await Promise.all([
        grafbase.request(GetScrimmageQuery, { scrimmage_id: id }),
        user ? grafbase.request(GetViewerOrgQuery, { user_id: user.id }) : Promise.resolve(null),
    ]);

    if (!scrim) notFound();

    const viewerOrgId = viewerData?.getUser?.organization?._id ?? null;
    const isHost = user?.id === scrim.host._id;
    const hostMemberIds = scrim.hostTeam?.members.map((m) => m._id) ?? [];
    const opponentMemberIds = scrim.opponentTeam?.members.map((m) => m._id) ?? [];
    const isHostMember = user ? hostMemberIds.includes(user.id) : false;
    const isOpponentMember = user ? opponentMemberIds.includes(user.id) : false;
    const isHostLeader = user?.id === scrim.hostTeam?.leader._id;
    const isOpponentLeader = user?.id === scrim.opponentTeam?.leader._id;
    const isOpponentOrgManager = scrim.opponentOrg?.members.some(member => member.user._id === user?.id&& member.orgRole === OrgRole.Manager&&member.status === OrgMemberStatus.Active) ?? false;

    return (
        <main className="flex-1">

            <ScrimDetail
                scrim={scrim}
                userId={user?.id}
                isHost={isHost}
                isHostLeader={isHostLeader}
                isOpponentLeader={isOpponentLeader}
                isHostMember={isHostMember}
                isOpponentMember={isOpponentMember}
                hostOrgId={scrim.hostOrg?._id ?? null}
                opponentOrg={scrim.opponentOrg ?? null}
                isOpponentOrgManager={isOpponentOrgManager}
                viewerOrgId={viewerOrgId}
            />
        </main>
    );
}
