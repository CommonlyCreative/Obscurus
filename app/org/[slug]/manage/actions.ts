"use server";

import { grafbase } from "@/lib/database/grafbase";
import { graphql } from "@/app/api/graphql/types";
import { OrgRole } from "@/app/api/graphql/types/graphql";
import { db } from "@/lib/database/mongo";
import { ObjectId } from "mongodb";

const SetCoreTeamMutation = graphql(`
  mutation ManageSetCoreTeam($org_id: String!, $user_ids: [String!]!) {
    setCoreTeam(org_id: $org_id, user_ids: $user_ids) {
      _id
    }
  }
`);

const InviteMemberMutation = graphql(`
  mutation ManageInviteOrgMember($org_id: String!, $user_id: String!, $orgRole: OrgRole!) {
    inviteMember(org_id: $org_id, user_id: $user_id, orgRole: $orgRole) {
      user {
        _id
      }
    }
  }
`);

const CreatePlaceholderPlayerMutation = graphql(`
  mutation CreatePlaceholderPlayer($org_id: String!, $orgRole: OrgRole!, $input: CreatePlaceholderPlayerInput!) {
    createPlaceholderPlayer(org_id: $org_id, orgRole: $orgRole, input: $input) {
      user {
        _id
        name
      }
      orgRole
      isPlayer
    }
  }
`);

const DeleteOrganizationMutation = graphql(`
  mutation ManageDisbandOrganization($org_id: String!) {
    deleteOrganization(org_id: $org_id)
  }
`);

const RemoveOrgMemberMutation = graphql(`
  mutation ManageRemoveOrgMember($org_id: String!, $user_id: String!) {
    removeMember(org_id: $org_id, user_id: $user_id)
  }
`);

const UpdateOrgMemberRoleMutation = graphql(`
  mutation ManageUpdateOrgMemberRole($org_id: String!, $user_id: String!, $orgRole: OrgRole!) {
    updateMemberRole(org_id: $org_id, user_id: $user_id, orgRole: $orgRole) {
      orgRole
    }
  }
`);

const UpdateOrgMemberIsPlayerMutation = graphql(`
  mutation ManageUpdateOrgMemberIsPlayer($org_id: String!, $user_id: String!, $isPlayer: Boolean!) {
    updateMemberIsPlayer(org_id: $org_id, user_id: $user_id, isPlayer: $isPlayer) {
      isPlayer
    }
  }
`);

export async function setCoreTeamAction(orgId: string, userIds: string[]) {
    await grafbase.request(SetCoreTeamMutation, {
        org_id: orgId,
        user_ids: userIds,
    });
}

export async function inviteMemberAction(orgId: string, userId: string, orgRole: OrgRole) {
    await grafbase.request(InviteMemberMutation, {
        org_id: orgId,
        user_id: userId,
        orgRole,
    });
}

export interface CreatePlaceholderPlayerPayload {
    name: string;
    email: string;
}

export interface CreatedPlaceholderMember {
    _id: string;
    name: string;
    orgRole: OrgRole;
    isPlayer: boolean;
}

export async function createPlaceholderPlayerAction(
    orgId: string,
    orgRole: OrgRole,
    input: CreatePlaceholderPlayerPayload,
): Promise<CreatedPlaceholderMember> {
    const result = await grafbase.request(CreatePlaceholderPlayerMutation, {
        org_id: orgId,
        orgRole,
        input,
    });
    const member = result.createPlaceholderPlayer;
    if (!member) throw new Error("Failed to create player");
    return { _id: member.user._id, name: member.user.name, orgRole: member.orgRole, isPlayer: member.isPlayer };
}

export async function disbandOrganizationAction(orgId: string) {
    const result = await grafbase.request(DeleteOrganizationMutation, { org_id: orgId });
    return result.deleteOrganization;
}

export async function removeMemberAction(orgId: string, userId: string) {
    await grafbase.request(RemoveOrgMemberMutation, { org_id: orgId, user_id: userId });
}

export async function updateMemberRoleAction(orgId: string, userId: string, orgRole: OrgRole) {
    await grafbase.request(UpdateOrgMemberRoleMutation, { org_id: orgId, user_id: userId, orgRole });
}

export async function updateMemberIsPlayerAction(orgId: string, userId: string, isPlayer: boolean) {
    await grafbase.request(UpdateOrgMemberIsPlayerMutation, { org_id: orgId, user_id: userId, isPlayer });
}

export interface FillerMember {
    _id: string;
    name: string;
    mmr: number;
    orgRole: OrgRole;
    isPlayer: boolean;
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
            { $push: { members: { _id: new ObjectId(), organization: orgId, user: userId.toString(), orgRole: "PLAYER", isPlayer: true, status: "ACTIVE", joinedAt: now } } } as any
        );

        created.push({ _id: userId.toString(), name, mmr: 0, orgRole: OrgRole.Player, isPlayer: true });
    }

    const allActiveIds = [
        ...activeMembers.map((m: any) => m.user),
        ...created.map(m => m._id),
    ].slice(0, 6);
    await orgs.updateOne({ _id: new ObjectId(orgId) }, { $set: { coreTeam: allActiveIds } });

    return created;
}
