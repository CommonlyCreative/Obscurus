"use server";

import { grafbase } from "@/lib/database/grafbase";
import { graphql } from "../../../api/graphql/types";
import { OrgRole } from "@/app/api/graphql/types/graphql";
import { db } from "@/lib/database/mongo";
import { ObjectId } from "mongodb";

const UpdateUserMutation = graphql(`
  mutation UpdateProfile($user_id: String!, $input: UpdateUserInput!) {
    updateUser(user_id: $user_id, input: $input) {
      _id
    }
  }
`);

const SetCoreTeamMutation = graphql(`
  mutation SetCoreTeam($org_id: String!, $user_ids: [String!]!) {
    setCoreTeam(org_id: $org_id, user_ids: $user_ids) {
      _id
    }
  }
`);

const InviteMemberMutation = graphql(`
  mutation InviteOrgMember($org_id: String!, $user_id: String!, $orgRole: OrgRole!) {
    inviteMember(org_id: $org_id, user_id: $user_id, orgRole: $orgRole) {
      user {
        _id
      }
    }
  }
`);

const GetUserQuery = graphql(`
  query GetUser($user_id: String!) {
    getUser(user_id: $user_id) {
      _id
      steam {
        id
      }
      updatedAt
    }
  }
`);

export interface UpdateProfilePayload {
    userId: string;
    heroes: number[];
    bio: string;
}

export async function updateProfileAction(payload: UpdateProfilePayload) {
    await grafbase.request(UpdateUserMutation, {
        user_id: payload.userId,
        input: {
            heroes: payload.heroes,
            bio: payload.bio,
        },
    });
}

export async function setCoreTeamAction(orgId: string, userIds: string[]) {
    await grafbase.request(SetCoreTeamMutation, {
        org_id: orgId,
        user_ids: userIds,
    });
}

const DeleteOrganizationMutation = graphql(`
  mutation DisbandOrganization($org_id: String!) {
    deleteOrganization(org_id: $org_id)
  }
`);

export async function disbandOrganizationAction(orgId: string) {
    const result = await grafbase.request(DeleteOrganizationMutation, { org_id: orgId });
    return result.deleteOrganization;
}

const RemoveOrgMemberMutation = graphql(`
  mutation RemoveOrgMember($org_id: String!, $user_id: String!) {
    removeMember(org_id: $org_id, user_id: $user_id)
  }
`);

const UpdateOrgMemberRoleMutation = graphql(`
  mutation UpdateOrgMemberRole($org_id: String!, $user_id: String!, $orgRole: OrgRole!) {
    updateMemberRole(org_id: $org_id, user_id: $user_id, orgRole: $orgRole) {
      orgRole
    }
  }
`);

export async function removeMemberAction(orgId: string, userId: string) {
    await grafbase.request(RemoveOrgMemberMutation, { org_id: orgId, user_id: userId });
}

export async function updateMemberRoleAction(orgId: string, userId: string, orgRole: OrgRole) {
    await grafbase.request(UpdateOrgMemberRoleMutation, { org_id: orgId, user_id: userId, orgRole });
}

export async function inviteMemberAction(orgId: string, userId: string, orgRole: OrgRole) {
    await grafbase.request(InviteMemberMutation, {
        org_id: orgId,
        user_id: userId,
        orgRole,
    });
}

export async function disconnectSteamAction(userId: string) {
    await grafbase.request(UpdateUserMutation, {
        user_id: userId,
        input: { steam: null },
    });
}

export async function getNewData(userId: string) {
    return await grafbase.request(GetUserQuery, {
        user_id: userId,
    });
}

export interface FillerMember {
    _id: string;
    name: string;
    mmr: number;
    orgRole: OrgRole;
}

export async function fillWithFillers(orgId: string): Promise<FillerMember[]> {
    const orgs = db.collection("organizations");
    const users = db.collection("user");

    const org = await orgs.findOne({ _id: new ObjectId(orgId) });
    if (!org) throw new Error("Org not found");

    const activeMembers = (org.members as any[]).filter((m: any) => m.status === "ACTIVE");
    const slotsNeeded = Math.max(0, 6 - activeMembers.length);
    if (slotsNeeded === 0) return [];

    const now = Date.now();
    const created: FillerMember[] = [];

    for (let i = 1; i <= slotsNeeded; i++) {
        const userId = new ObjectId();
        const name = `[FILLER] Player ${activeMembers.length + i}`;

        await users.insertOne({
            _id: userId,
            name,
            online: false,
            verified: false,
            mmr: 0,
            organization: orgId,
            heroes: [],
            scrimmages: [],
            balance: { credits: 0, pending: 0, winnings: 0 },
            role: "MEMBER",
            createdAt: now,
            updatedAt: now,
        } as any);

        await orgs.updateOne(
            { _id: new ObjectId(orgId) },
            { $push: { members: { _id: new ObjectId(), organization: orgId, user: userId.toString(), orgRole: "PLAYER", status: "ACTIVE", joinedAt: now } } } as any
        );

        created.push({ _id: userId.toString(), name, mmr: 0, orgRole: OrgRole.Player });
    }

    const allActiveIds = [
        ...activeMembers.map((m: any) => m.user),
        ...created.map(m => m._id),
    ].slice(0, 6);
    await orgs.updateOne({ _id: new ObjectId(orgId) }, { $set: { coreTeam: allActiveIds } });

    return created;
}

