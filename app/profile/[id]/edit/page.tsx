import { Suspense } from "react";
import { auth, User } from "@/lib/database/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { grafbase } from "@/lib/database/grafbase";
import { graphql } from "../../../api/graphql/types";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { getHeroes } from "@/app/scrims/[id]/cache";

const EditProfilePageQuery = graphql(`
  query EditProfilePage($user_id: String!) {
    getUser(user_id: $user_id) {
      _id
      name
      heroes
      bio
      region
      stats { mmr }
      steam {
        id
        username
        avatar
      }
    }
  }
`);

export default function EditProfilePage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ disconnect_google?: string }>;
}) {
    const headersPromise = headers();

    return (
        <main className="flex-1">
            <Suspense fallback={<EditProfileSkeleton />}>
                <EditProfileData
                    headersPromise={headersPromise}
                    paramsPromise={params}
                    searchParamsPromise={searchParams}
                />
            </Suspense>
        </main>
    );
}

async function EditProfileData({
    headersPromise,
    paramsPromise,
    searchParamsPromise,
}: {
    headersPromise: ReturnType<typeof headers>;
    paramsPromise: Promise<{ id: string }>;
    searchParamsPromise: Promise<{ disconnect_google?: string }>;
}) {
    const [h, { id: profileId }, sp] = await Promise.all([headersPromise, paramsPromise, searchParamsPromise]);
    const session = await auth.api.getSession({ headers: h });
    if (!session) redirect("/");

    const user = session.user as User;
    if (user.id !== profileId) redirect(`/profile/${profileId}`);

    const [{ getUser: profile }, heroes] = await Promise.all([
        grafbase.request(EditProfilePageQuery, { user_id: profileId }),
        getHeroes(),
    ]);

    if (!profile) redirect("/");

    const steam = profile.steam ?? null;

    return (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-3xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
                <p className="text-sm text-muted mt-1">Update your player information and preferences.</p>
            </div>
            <EditProfileForm
                userId={profileId}
                steam={steam}
                stats={profile.stats}
                initialHeroes={profile.heroes}
                initialBio={profile.bio ?? ""}
                heroes={heroes.filter(hero => !hero.in_development && !hero.disabled).sort((a, b) => a.name.localeCompare(b.name))}
                disconnectGoogleOnMount={sp.disconnect_google === "1"}
            />
        </div>
    );
}

function EditProfileSkeleton() {
    return (
        <div className="animate-pulse max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
            <div className="space-y-2">
                <div className="h-8 w-40 bg-surface-2 rounded-lg" />
                <div className="h-4 w-64 bg-surface-2 rounded-lg" />
            </div>
            <div className="h-48 bg-surface-2 rounded-xl border border-edge" />
            <div className="h-48 bg-surface-2 rounded-xl border border-edge" />
            <div className="h-64 bg-surface-2 rounded-xl border border-edge" />
            <div className="h-10 w-28 bg-surface-2 rounded-lg" />
        </div>
    );
}
