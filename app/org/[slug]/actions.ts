"use server";

import { grafbase } from "@/lib/database/grafbase";
import { graphql } from "@/app/api/graphql/types";
import { auth } from "@/lib/database/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { Day, UpdateOrgAvailabilityBlocksMutation } from "@/app/api/graphql/types/graphql";

const AcceptOrgInviteMutation = graphql(`
  mutation OrgAcceptInvite($org_id: String!, $user_id: String!) {
    acceptOrgInvite(org_id: $org_id, user_id: $user_id) {
      status
    }
  }
`);

const DeclineOrgInviteMutation = graphql(`
  mutation OrgDeclineInvite($org_id: String!, $user_id: String!) {
    declineOrgInvite(org_id: $org_id, user_id: $user_id)
  }
`);

export async function acceptOrgInviteAction(orgId: string, slug: string): Promise<void> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Unauthorized");
    await grafbase.request(AcceptOrgInviteMutation, { org_id: orgId, user_id: session.user.id });
    revalidatePath(`/org/${slug}`);
}

export async function declineOrgInviteAction(orgId: string, slug: string): Promise<void> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Unauthorized");
    await grafbase.request(DeclineOrgInviteMutation, { org_id: orgId, user_id: session.user.id });
    revalidatePath(`/org/${slug}`);
}

const UpdateAvailabilityBlockMutation = graphql(`
  mutation UpdateOrgAvailabilityBlocks($org_id: String!, $blocks: [AvailabilityBlockInput!]!) {
    updateAvailabilityBlocks(org_id: $org_id, blocks: $blocks) {
      _id
    }
  }
`);

export async function updateAvailabilityBlocksAction(
    orgId: string,
    slug: string,
    blocks: Array<{ day: Day; timesheets: Array<{ startTime: number; endTime: number }> }>
): Promise<UpdateOrgAvailabilityBlocksMutation[]> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Unauthorized");

    const list = [] as UpdateOrgAvailabilityBlocksMutation[]

    await grafbase.request(UpdateAvailabilityBlockMutation, {
            org_id: orgId,
            blocks,
        })
    revalidatePath(`/org/${slug}`);
    return list;
}
