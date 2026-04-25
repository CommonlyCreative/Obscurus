"use server";

import { grafbase } from "@/lib/database/grafbase";
import { graphql } from "../../api/graphql/types";
import { InvitationStatus, MatchResult, MatchSide } from "@/app/api/graphql/types/graphql";
import { cache } from "react";
import { steam } from "@/lib/steam";
import { LiveTeam } from "@/lib/socket/teams";
import { APILimit } from "@/lib/actions/deadlockapi";
import { db } from "@/lib/database/mongo";

const ReadyUpMutation = graphql(`
    mutation ReadyUp($scrimmage_id: String!, $side: MatchSide!) {
        readyUp(scrimmage_id: $scrimmage_id, side: $side) { _id readyHost readyOpponent status }
    }
`);

const UnreadyMutation = graphql(`
    mutation Unready($scrimmage_id: String!, $side: MatchSide!) {
        unready(scrimmage_id: $scrimmage_id, side: $side) { _id readyHost readyOpponent status }
    }
`);

const SetPartyCodeMutation = graphql(`
    mutation SetPartyCode($scrimmage_id: String!, $partyCode: String!) {
        setPartyCode(scrimmage_id: $scrimmage_id, partyCode: $partyCode) { _id partyCode }
    }
`);

const StartMatchMutation = graphql(`
    mutation StartMatch($scrimmage_id: String!) {
        startMatch(scrimmage_id: $scrimmage_id) {
            _id status matches { number result startedAt concludedAt match_id }
        }
    }
`);

const CancelMatchMutation = graphql(`
    mutation CancelMatch($scrimmage_id: String!) {
        cancelMatch(scrimmage_id: $scrimmage_id) {
            _id status matches { number result startedAt concludedAt match_id }
        }
    }
`);

const SubmitMatchResultMutation = graphql(`
    mutation SubmitMatchResult(
        $scrimmage_id: String!
        $match_number: Int!
        $deadlock_match_id: String!
        $result: MatchResult!
    ) {
        submitMatchResult(
            scrimmage_id: $scrimmage_id
            match_number: $match_number
            deadlock_match_id: $deadlock_match_id
            result: $result
        ) {
            _id status result matches { number result startedAt concludedAt match_id }
        }
    }
`);

const EndScrimmageMutation = graphql(`
    mutation EndScrimmage($scrimmage_id: String!) {
        endScrimmage(scrimmage_id: $scrimmage_id) { _id status }
    }
`);

const CancelScrimmageMutation = graphql(`
    mutation CancelScrimmage($scrimmage_id: String!) {
        cancelScrimmage(scrimmage_id: $scrimmage_id) { _id status }
    }
`);

const LeaveScrimmageM = graphql(`
    mutation LeaveScrimmage($scrimmage_id: String!) {
        leaveScrimmage(scrimmage_id: $scrimmage_id) { _id status }
    }
`);

const DeclineChallengeMutation = graphql(`
    mutation DeclineChallenge($scrimmage_id: String!, $org_id: String!) {
        declineScrimmageChallenge(scrimmage_id: $scrimmage_id, org_id: $org_id) { _id status }
    }
`);

const JoinScrimmageM = graphql(`
    mutation JoinScrimmage($scrimmage_id: String!, $org_id: String, $team: [String!]!) {
        joinScrimmage(scrimmage_id: $scrimmage_id, org_id: $org_id, team: $team) { _id status }
    }
`);

const AcceptChallengeMutation = graphql(`
    mutation AcceptChallenge($scrimmage_id: String!, $org_id: String!) {
        acceptScrimmageChallenge(scrimmage_id: $scrimmage_id, org_id: $org_id) { _id status }
    }
`);

const SetOpponentRosterM = graphql(`
    mutation SetOpponentRoster($input: SetOpponentRosterInput!) {
        setOpponentRoster(input: $input) { _id status }
    }
`);

const RespondToInvitationMutation = graphql(`
  mutation ProfileRespondToScrimInvite($invitation_id: String!, $status: InvitationStatus!) {
    respondToInvitation(input: { invitation_id: $invitation_id, status: $status }) {
      status
    }
  }
`);

const GetMatchUserBySteamId = graphql(`
    query GetMatchUserBySteamId($steam_id: String!) {
        getUserBySteamId(steam_id: $steam_id) {
            _id
            steam {
                avatar
            }
            name
            role
            online
        }
    }
`);

export async function readyUpAction(scrimmageId: string, side: MatchSide) {
    const { readyUp } = await grafbase.request(ReadyUpMutation, {
        scrimmage_id: scrimmageId,
        side,
    });
    return readyUp;
}

export async function unreadyAction(scrimmageId: string, side: MatchSide) {
    const { unready } = await grafbase.request(UnreadyMutation, {
        scrimmage_id: scrimmageId,
        side,
    });
    return unready;
}

export async function setPartyCodeAction(scrimmageId: string, partyCode: string) {
    const { setPartyCode } = await grafbase.request(SetPartyCodeMutation, {
        scrimmage_id: scrimmageId,
        partyCode,
    });
    return setPartyCode;
}

export async function startMatchAction(scrimmageId: string) {
    const { startMatch } = await grafbase.request(StartMatchMutation, {
        scrimmage_id: scrimmageId,
    });
    return startMatch;
}

export async function cancelMatchAction(scrimmageId: string) {
    const { cancelMatch } = await grafbase.request(CancelMatchMutation, {
        scrimmage_id: scrimmageId,
    });
    return cancelMatch;
}

export async function submitMatchResultAction(
    scrimmageId: string,
    matchNumber: number,
    deadlockMatchId: string,
    result: MatchResult
) {
    const { submitMatchResult } = await grafbase.request(SubmitMatchResultMutation, {
        scrimmage_id: scrimmageId,
        match_number: matchNumber,
        deadlock_match_id: deadlockMatchId,
        result,
    });
    return submitMatchResult;
}

export async function endScrimmageAction(scrimmageId: string) {
    const { endScrimmage } = await grafbase.request(EndScrimmageMutation, {
        scrimmage_id: scrimmageId,
    });
    return endScrimmage;
}

export async function cancelScrimmageAction(scrimmageId: string) {
    const { cancelScrimmage } = await grafbase.request(CancelScrimmageMutation, {
        scrimmage_id: scrimmageId,
    });
    return cancelScrimmage;
}

export async function joinScrimmageAction(scrimmageId: string, orgId: string, team: string[]) {
    const { joinScrimmage } = await grafbase.request(JoinScrimmageM, {
        scrimmage_id: scrimmageId,
        org_id: orgId,
        team,
    });
    return joinScrimmage;
}

export async function leaveScrimmageAction(scrimmageId: string, orgId: string) {
    const { leaveScrimmage } = await grafbase.request(LeaveScrimmageM, {
        scrimmage_id: scrimmageId,
    });
    return leaveScrimmage;
}

export async function declineChallengeAction(scrimmageId: string, orgId: string) {
    const { declineScrimmageChallenge } = await grafbase.request(DeclineChallengeMutation, {
        scrimmage_id: scrimmageId,
        org_id: orgId,
    });
    return declineScrimmageChallenge;
}

export async function respondToInvitationAction(invitationId: string, status: InvitationStatus, team?: LiveTeam | null) {
    const { respondToInvitation } = await grafbase.request(RespondToInvitationMutation, {
        invitation_id: invitationId,
        status,
        team: team
    });
    return respondToInvitation;
}

export async function acceptChallengeAction(scrimmageId: string, orgId: string) {
    const { acceptScrimmageChallenge } = await grafbase.request(AcceptChallengeMutation, {
        scrimmage_id: scrimmageId,
        org_id: orgId,
    });
    return acceptScrimmageChallenge;
}

export async function acceptChallengeWithRosterAction(scrimmageId: string, orgId: string, team: string[]) {
    await grafbase.request(AcceptChallengeMutation, { scrimmage_id: scrimmageId, org_id: orgId });
    const { setOpponentRoster } = await grafbase.request(SetOpponentRosterM, {
        input: { scrimmage_id: scrimmageId, org_id: orgId, team },
    });
    return setOpponentRoster;
}

export async function getMatchUserBySteamId(steam_id: string) {
    const { getUserBySteamId } = await grafbase.request(GetMatchUserBySteamId, {
        steam_id
    });
    return getUserBySteamId;
}

export const getSteamUser = cache(async function (steamId: string) {
    const id = await steam.resolve(steamId)
    return JSON.parse(JSON.stringify(await steam.getUserSummary(id)));
})

const collection = db.collection<APILimit>("deadlock-api-limits");

export async function getAPILimit(match_id: string) {
    return JSON.parse(JSON.stringify(await collection.findOne({ match_id }))) as APILimit
}

export async function deleteLimit(match_id: string) {
    await collection.deleteOne({ match_id })
}

export async function updateLimit({ match_id, limit, remaining, reset_in, last_request, past_request }: APILimit) {
    const update = await collection.updateOne({ match_id }, { $set: { match_id, limit, remaining, reset_in, last_request, past_request }}, { upsert: true })
    return update.modifiedCount > 0;
}