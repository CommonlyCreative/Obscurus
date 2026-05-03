import { graphql } from "@/app/api/graphql/types";

export const RespondToScrimInviteMutation = graphql(`
  mutation ProfileRespondToScrimInvite($scrimmage_id: String!, $user_id: String!, $status: InvitationStatus!) {
    respondToInvitation(input: { scrimmage_id: $scrimmage_id, user_id: $user_id, status: $status }) {
      status
    }
  }
`);