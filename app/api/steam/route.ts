import { auth } from "@/lib/database/auth";
import { NextRequest, NextResponse } from "next/server";
import { graphql } from "../graphql/types";
import { grafbase } from "@/lib/database/grafbase";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const UpdateUser = graphql(`
  mutation UpdateUser($user_id: String!, $input: UpdateUserInput!) {
    updateUser(user_id: $user_id, input: $input) {
        _id
    }
  }
`);

const FindUserBySteamId = graphql(`
    query FindUserBySteamId($steam_id: String!) {
        getUserBySteamId(steam_id: $steam_id) {
            _id
            steam {
                username
            }
        }
    }
`)

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const session = await auth.api.getSession({ headers: await headers() });

    const steamId = searchParams.get("steamId");
    const username = searchParams.get("username");
    const avatar = searchParams.get("avatar");

    if (!session?.user||!steamId) redirect("/");
    
    const { getUserBySteamId: found } = await grafbase.request(FindUserBySteamId, { steam_id: steamId });
    
    if (!!found) {
        console.log("Steam is already registered", found._id, found.steam?.username);
        redirect("/")
    }

    await grafbase.request(UpdateUser, { user_id: session.user.id, input: { steam: { id: steamId, username, avatar } } });

    return redirect("/profile/"+session.user.id+"/edit")
}