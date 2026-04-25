"use server"

import { grafbase } from "@/lib/database/grafbase";
import { graphql } from "./api/graphql/types";

const NavBarQuery = graphql(`
  query GetNavBarUser($user_id: String!) {
    getUser(user_id: $user_id) {
      scrimmages {
        status
      }
    }
  }
`);

export const getUserScrimmages = async (user_id: string) => {
    const { getUser: user } = await grafbase.request(NavBarQuery, {
        user_id
    });

    return user;
}