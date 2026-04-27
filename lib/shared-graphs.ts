import { graphql } from "@/app/api/graphql/types";

export const SendNotificationM = graphql(`
  mutation SendNotification($input: SendNotificationInput!) {
    addNotification(input: $input) {
      _id
      recipient
      type
      title
      description
      senderName
      createdAt
      link
      actionId
    }
  }
`);