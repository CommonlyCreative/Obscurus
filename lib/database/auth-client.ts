import { createAuthClient } from "better-auth/react";
import { cache } from "react";
import { graphql } from "@/app/api/graphql/types";
import { grafbase } from "./grafbase";
import { auth } from "./auth";
import { customSessionClient, inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    plugins: [
        // adminClient(),
        inferAdditionalFields<typeof auth>(),
        customSessionClient<typeof auth>(),
        // usernameClient(),
        // twoFactorClient(),
    ]
})

const getFullProfileQuery = graphql(`
    query getFullProfileQuery($id: String!) {
        getUser(user_id: $id) {
            _id
        }
    }
    `)

export const getFullProfile = cache(async (userId: string) => {
    return await grafbase.request(getFullProfileQuery, { id: userId })
});

export type Session = typeof authClient.$Infer.Session