"use server";

import { grafbase } from "@/lib/database/grafbase";
import { graphql } from "@/app/api/graphql/types";
import { InvitationStatus, NotificationType, SendNotificationMutation } from "@/app/api/graphql/types/graphql";
import { SendNotificationM } from "@/lib/shared-graphs";
import { auth } from "@/lib/database/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const AcceptOrgInviteMutation = graphql(`
  mutation ProfileAcceptOrgInvite($org_id: String!, $user_id: String!) {
    acceptOrgInvite(org_id: $org_id, user_id: $user_id) {
      status
    }
  }
`);

const DeclineOrgInviteMutation = graphql(`
  mutation ProfileDeclineOrgInvite($org_id: String!, $user_id: String!) {
    declineOrgInvite(org_id: $org_id, user_id: $user_id)
  }
`);

export async function acceptProfileOrgInviteAction(orgId: string, profileId: string): Promise<void> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Unauthorized");
    await grafbase.request(AcceptOrgInviteMutation, { org_id: orgId, user_id: session.user.id });
    revalidatePath(`/profile/${profileId}`);
}

export async function declineProfileOrgInviteAction(orgId: string, profileId: string): Promise<void> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Unauthorized");
    await grafbase.request(DeclineOrgInviteMutation, { org_id: orgId, user_id: session.user.id });
    revalidatePath(`/profile/${profileId}`);
}

const RespondToScrimInviteMutation = graphql(`
  mutation ProfileRespondToScrimInvite($invitation_id: String!, $status: InvitationStatus!) {
    respondToInvitation(input: { invitation_id: $invitation_id, status: $status }) {
      status
    }
  }
`);

export async function acceptScrimInviteAction(invitationId: string, profileId: string): Promise<void> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Unauthorized");
    await grafbase.request(RespondToScrimInviteMutation, { invitation_id: invitationId, status: InvitationStatus.Accepted });
    revalidatePath(`/profile/${profileId}`);
}

export async function declineScrimInviteAction(invitationId: string, profileId: string): Promise<void> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Unauthorized");
    await grafbase.request(RespondToScrimInviteMutation, { invitation_id: invitationId, status: InvitationStatus.Declined });
    revalidatePath(`/profile/${profileId}`);
}

// ─── Team invite notification ──────────────────────────────────────────────

export type TeamInviteNotificationResult = SendNotificationMutation["addNotification"];

export async function notifyTeamInviteResponseAction(
    leaderId: string,
    accepted: boolean,
    profileId: string,
): Promise<TeamInviteNotificationResult | null> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Unauthorized");

    const responderName = session.user.name;
    const result = await grafbase.request(SendNotificationM, {
        input: {
            recipient: leaderId,
            type: NotificationType.General,
            title: accepted ? "Team Invite Accepted" : "Team Invite Declined",
            description: accepted
                ? `${responderName} accepted your team invite and joined your team.`
                : `${responderName} declined your team invite.`,
            senderName: responderName,
        },
    });

    revalidatePath(`/profile/${profileId}`);
    return result.addNotification ?? null;
}

export async function notifyScrimmageInvitation(user_id: string, teamName: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Unauthorized");

    const responderName = session.user.name;
    const result = await grafbase.request(SendNotificationM, {
        input: {
            recipient: user_id,
            type: NotificationType.General,
            title: "You have a scrimmage invitation",
            description: `${teamName} challenged you to a scrimmage.`,
            senderName: responderName,
        },
    });

    return result.addNotification ?? null;
}

const GetAllTeamUsers = graphql(`
  query GetAllTeamUsers {
    getUsers {
      _id
      name
    }
  }
`);

export async function getAllTeamUsers() {
    return await grafbase.request(GetAllTeamUsers);
}
