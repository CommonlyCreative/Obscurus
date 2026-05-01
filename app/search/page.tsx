import { getSearchData } from "./actions";
import { SearchResults } from "@/components/shared/SearchResults";
import { getHeroes } from "@/lib/actions/deadlockapi";
import type { SearchOrgData, SearchPlayerData } from "@/components/shared/SearchResults";
import { SearchPageQuery } from "../api/graphql/types/graphql";

export default async function SearchPage() {
    const [data, allHeroes] = await Promise.all([
        getSearchData(),
        getHeroes(),
    ]);

    const users: SearchPageQuery["getUsers"] = data.getUsers ?? [];
    const orgs: SearchPageQuery["getOrganizations"] = data.getOrganizations ?? [];
    const scrimmages: SearchPageQuery["getScrimmages"] = data.getScrimmages ?? [];

    // Build win rate stats per org from completed scrimmages
    const statsMap = new Map<string, { wins: number; total: number }>();
    for (const scrim of scrimmages) {
        const { result, hostOrg, opponentOrg } = scrim;
        if (!result || result === "CANCELLED") continue;
        const addStat = (orgId: string, won: boolean) => {
            const s = statsMap.get(orgId) ?? { wins: 0, total: 0 };
            statsMap.set(orgId, { wins: s.wins + (won ? 1 : 0), total: s.total + 1 });
        };
        if (hostOrg) addStat(hostOrg._id, result === "HOST_WIN");
        if (opponentOrg) addStat(opponentOrg._id, result === "OPPONENT_WIN");
    }

    const organizations: SearchOrgData[] = orgs.map(org => {
        const stats = statsMap.get(org._id);
        const activeMembers = (org.members as any[]).filter(m => m.status === "ACTIVE").length;
        return {
            _id: org._id,
            name: org.name,
            slug: org.slug,
            memberCount: activeMembers,
            winRate: stats ? stats.wins / stats.total : null,
            totalMatches: stats?.total ?? 0,
        };
    });

    const heroMap = new Map(allHeroes.map(h => [
        h.id,
        { id: h.id, name: h.name, minimap_image_webp: h.images.minimap_image_webp },
    ]));

    const players: SearchPlayerData[] = users.map(user => ({
        _id: user._id,
        name: user.name,
        stats: user.stats,
        role: user.role as string,
        online: user.online as boolean,
        heroes: ((user.heroes as number[]) ?? [])
            .map((id: number) => heroMap.get(id))
            .filter((h): h is NonNullable<ReturnType<typeof heroMap.get>> => h != null),
        orgName: user.organization?.name ?? undefined,
        orgSlug: user.organization?.slug ?? undefined,
    }));

    return (
        <main className="flex-1 flex flex-col items-center pt-24 pb-16 px-4">
            <div className="w-full max-w-4xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Find Players & Organizations</h1>
                    <p className="text-sm text-muted mt-1">Search across all Deadlock players and organizations.</p>
                </div>
                <SearchResults players={players} organizations={organizations} />
            </div>
        </main>
    );
}
