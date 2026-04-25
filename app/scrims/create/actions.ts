"use server";

import { grafbase } from "@/lib/database/grafbase";
import { graphql } from "../../api/graphql/types";
import { BestOf, MatchSide } from "@/app/api/graphql/types/graphql";
import { ScrimmageInvitationInput } from "@/app/api/graphql/server";

const CreateScrimMutation = graphql(`
  mutation CreateScrim($input: CreateScrimmageInput!) {
    createScrimmage(input: $input) {
      _id
    }
  }
`);

const GetTargetOrgQuery = graphql(`
  query GetTargetOrg($user_id: String!) {
    getUser(user_id: $user_id) {
      organization { _id }
    }
  }
`);

export interface CreateScrimPayload {
    note: string;
    isPrivate: boolean;
    wagerAmount: number;
    host_id: string;
    hostOrgId: string | null;
    orgAffiliated: boolean;
    roster: string[];
    targetLeaderId: string | null;
    scheduledAt: number | null;
    bestOf: BestOf;
}

export async function createScrimmageAction(payload: CreateScrimPayload) {
    let opponentOrg_id = undefined;
    if (payload.targetLeaderId&&payload.orgAffiliated) {
        const { getUser: user } = await grafbase.request(GetTargetOrgQuery, { user_id: payload.targetLeaderId});
        opponentOrg_id = user?.organization?._id;
    }
    const { createScrimmage } = await grafbase.request(CreateScrimMutation, {
        input: {
            team: payload.roster,
            note: payload.note || undefined,
            isPrivate: payload.isPrivate,
            host_id: payload.host_id,
            hostOrg_id: payload.hostOrgId ?? undefined,
            scheduledAt: payload.scheduledAt ?? undefined,
            wagerAmount: payload.wagerAmount,
            bestOf: payload.bestOf,
            opponentOrg_id,
            invitations: payload.targetLeaderId ? [{ user_id: payload.targetLeaderId, side: MatchSide.Opponent }] : [],
        },
    });

    return createScrimmage;
}
