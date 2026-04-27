"use server"

import { grafbase } from "@/lib/database/grafbase";
import { graphql } from "./api/graphql/types";
import { SendNotificationInput } from "./api/graphql/server";
import { SendNotificationM } from "@/lib/shared-graphs";

const NavBarQuery = graphql(`
  query GetNavBarUser($user_id: String!) {
    getUser(user_id: $user_id) {
      scrimmages {
        status
      }
    }
  }
`);

const GetNotificationList = graphql(`
  query GetNotifications($user_id: String!) {
    getNotifications(user_id: $user_id) {
      _id
      recipient
      type
      title
      description
      link
      senderName
      createdAt
    }
  }
`);

const DismissNotification = graphql(`
  mutation DismissNotification($user_id: String!, $notification_id: String!) {
    dismissNotification(notification_id: $notification_id, user_id: $user_id)
  }
`);

export const getUserScrimmages = async (user_id: string) => {
    const { getUser: user } = await grafbase.request(NavBarQuery, {
        user_id
    });

    return user;
}

export const getAllNotifications = async (user_id: string) => {
    const { getNotifications: notifications } = await grafbase.request(GetNotificationList, {
        user_id
    });

    return notifications;
}

export const dismissNotification = async (notification_id: string, user_id: string) => {
    return await grafbase.request(DismissNotification, {
        user_id,
        notification_id
    });
}

export const addNotification = async (input: SendNotificationInput) => {
    const { addNotification: notification } = await grafbase.request(SendNotificationM, {
        input
    });

    return notification;
}