"use server";

import { grafbase } from "@/lib/database/grafbase";
import { graphql } from "../../../api/graphql/types";

const UpdateUserMutation = graphql(`
  mutation UpdateProfile($user_id: String!, $input: UpdateUserInput!) {
    updateUser(user_id: $user_id, input: $input) {
      _id
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

