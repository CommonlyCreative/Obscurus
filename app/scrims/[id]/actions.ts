"use server";

import { grafbase } from "@/lib/database/grafbase";
import { graphql } from "../../api/graphql/types";
import { GetScrimmageDetailQuery, InvitationStatus, MatchResult, MatchSide } from "@/app/api/graphql/types/graphql";
import { LiveTeam } from "@/lib/socket/teams";
import { APILimit } from "@/lib/actions/deadlockapi";
import { db } from "@/lib/database/mongo";
import { ArrayElement } from "@/lib/utils";
import { DeadlockMatch } from "@/lib/types/deadlock/match";
import { RespondToScrimInviteMutation } from "@/lib/database/shared-graphs";
import { deleteGoogleScrimmageEvent } from "../create/actions";

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
    mutation DeclineChallenge($scrimmage_id: String!, $user_id: String!) {
        declineScrimmageChallenge(scrimmage_id: $scrimmage_id, user_id: $user_id) { _id status }
    }
`);

const JoinScrimmageM = graphql(`
    mutation JoinScrimmage($scrimmage_id: String!, $org_id: String, $team: [String!]!) {
        joinScrimmage(scrimmage_id: $scrimmage_id, org_id: $org_id, team: $team) { _id status }
    }
`);

const AcceptChallengeMutation = graphql(`
    mutation AcceptChallenge($scrimmage_id: String!, $user_id: String!) {
        acceptScrimmageChallenge(scrimmage_id: $scrimmage_id, user_id: $user_id) { _id status }
    }
`);

const SetOpponentRosterM = graphql(`
    mutation SetOpponentRoster($input: SetOpponentRosterInput!) {
        setOpponentRoster(input: $input) { _id status }
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

export async function joinScrimmageAction(scrimmageId: string, team: string[]) {
    const { joinScrimmage } = await grafbase.request(JoinScrimmageM, {
        scrimmage_id: scrimmageId,
        team,
    });
    return joinScrimmage;
}

export async function leaveScrimmageAction(scrimmageId: string) {
    const { leaveScrimmage } = await grafbase.request(LeaveScrimmageM, {
        scrimmage_id: scrimmageId,
    });
    return leaveScrimmage;
}

export async function declineChallengeAction(scrimmageId: string, user_id: string) {
    const { declineScrimmageChallenge } = await grafbase.request(DeclineChallengeMutation, {
        scrimmage_id: scrimmageId,
        user_id,
    });
    return declineScrimmageChallenge;
}

export async function respondToInvitationAction(scrimmage_id: string, user_id: string, status: InvitationStatus) {
    const { respondToInvitation } = await grafbase.request(RespondToScrimInviteMutation, {
        user_id: user_id,
        status,
        scrimmage_id
    });
    return respondToInvitation;
}

export async function acceptChallengeAction(scrimmageId: string, user_id: string) {
    const { acceptScrimmageChallenge } = await grafbase.request(AcceptChallengeMutation, {
        scrimmage_id: scrimmageId,
        user_id,
    });
    return acceptScrimmageChallenge;
}

export async function acceptChallengeWithRosterAction(scrimmageId: string, user_id: string, team: string[], teamName: string | undefined) {
    await grafbase.request(AcceptChallengeMutation, { scrimmage_id: scrimmageId, user_id });
    return await setOpponentRoster(scrimmageId, user_id, team, teamName);
}

export async function setOpponentRoster(scrimmageId: string, user_id: string, team: string[], teamName: string | undefined) {
    const { setOpponentRoster: roster } = await grafbase.request(SetOpponentRosterM, {
        input: { scrimmage_id: scrimmageId, leader_id: user_id, team, name: teamName },
    });
    return roster
}

export async function getMatchUserBySteamId(steam_id: string) {
    const { getUserBySteamId } = await grafbase.request(GetMatchUserBySteamId, {
        steam_id
    });
    return getUserBySteamId;
}

const collection = db.collection<APILimit>("deadlock-api-limits");

export async function getAPILimit(match_id: string) {
    return JSON.parse(JSON.stringify(await collection.findOne({ match_id }))) as APILimit
}

export async function deleteLimit(match_id: string) {
    await collection.deleteOne({ match_id })
}

export async function updateLimit({ match_id, limit, remaining, reset_in, last_request, past_request }: APILimit) {
    const update = await collection.updateOne({ match_id }, { $set: { match_id, limit, remaining, reset_in, last_request, past_request } }, { upsert: true })
    return update.modifiedCount > 0;
}

export async function getMatch(match_id: string): Promise<DeadlockMatch> {
    await deleteLimit(match_id);
    const res = await fetch(`https://api.deadlock-api.com/v1/matches/${match_id}/metadata`, {
        next: { revalidate: 3600 },
    });
    const body = await res.json();
    if (body.error) {
        if (!body.error.quota) return { errorMessage: `An unknown error occurred when retrieving match ${match_id}: ${JSON.stringify(body.error)}` } as any;
        const { quota: { limit }, remaining } = body.error as { quota: { limit: number; period: number }; remaining: number; request: number };
        const last_request = Date.now();
        const past_request = ([] as number[]).filter(r => r < last_request - 60 * 60 * 1000);
        const reset_in = ((past_request.at(0) ?? last_request) + 60 * 60 * 1000) - last_request;
        await updateLimit({ match_id, limit, remaining, reset_in, last_request, past_request });
    }
    return body;
}

