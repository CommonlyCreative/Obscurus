"use server"
import { cacheLife, cacheTag } from "next/cache";
import { SteamPlayer, SteamPlayerSummaryResponse } from "@/lib/types/steam/profile";
import { MatchPlayer } from "@/lib/types/deadlock/match";
import { convertSteam32toSteam64 } from "@/lib/deadlock";
import { GetMatchUserBySteamIdQuery } from "@/app/api/graphql/types/graphql";
import { getMatchUserBySteamId } from "./actions";
import { DeadlockHero } from "@/lib/types/deadlock/heroes";

export type EnrichedPlayer = SteamPlayer
    & Omit<MatchPlayer, "hero_id" | "items">
    & { hero: { id: number; name: string; images: { minimap_image: string; icon_hero_card: string } } }
    & { items: { id: string; name: string; shop_image: string; hero?: number; item_tier: number }[] }
    & Partial<NonNullable<GetMatchUserBySteamIdQuery["getUserBySteamId"]>>;

export async function getItem(item_id: string | number) {
    "use cache";
    cacheLife("days");
    const res = await fetch(`https://assets.deadlock-api.com/v2/items/${item_id}`);
    return res.json() as Promise<any>;
}

export async function getHero(hero_id: string | number) {
    "use cache";
    cacheLife("days");
    const res = await fetch(`https://assets.deadlock-api.com/v2/heroes/${hero_id}`);
    return res.json() as Promise<any>;
}

export async function getHeroes(): Promise<DeadlockHero[]> {
    "use cache";
    cacheLife("days");
    const res = await fetch(`https://assets.deadlock-api.com/v2/heroes`);
    return res.json();
}

export async function getSteamUsers(steamIds: string[]): Promise<SteamPlayer[]> {
    "use cache";
    cacheLife("hours");
    const res = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.NEXT_PUBLIC_STEAM_API_KEY}&steamids=${encodeURIComponent(steamIds.join(','))}`);
    const body = await res.json() as SteamPlayerSummaryResponse;
    return body.response.players;
}

export async function getMatchPlayersData(match_id: string, players: MatchPlayer[]): Promise<EnrichedPlayer[]> {
    "use cache";
    cacheLife("hours");
    cacheTag(`match-players-${match_id}`);

    const steamIds = players.map(p => convertSteam32toSteam64(p.account_id));

    const uniqueItemIds = [...new Set(
        players.flatMap(p => p.items.filter(i => i.sold_time_s === 0).map(i => i.item_id))
    )];

    const [steamPlayers, allHeroes, allItems, dbUsers] = await Promise.all([
        getSteamUsers(steamIds),
        getHeroes(),
        Promise.all(uniqueItemIds.map(id => getItem(id))),
        Promise.all(steamIds.map(id => getMatchUserBySteamId(id))),
    ]);

    const steamMap = new Map(steamPlayers.map(p => [p.steamid, p]));
    const heroMap = new Map(allHeroes.map(h => [h.id, h]));
    const itemMap = new Map(allItems.map(i => [String(i.id), i]));
    const userMap = new Map(dbUsers.map((u, idx) => [steamIds[idx], u]));

    return players.map(player => {
        const steamId = convertSteam32toSteam64(player.account_id);
        const { hero_id, items, ...rest } = player;
        return {
            ...rest,
            ...(steamMap.get(steamId) ?? {}),
            ...(userMap.get(steamId) ?? {}),
            hero: heroMap.get(hero_id),
            items: items
                .filter(i => i.sold_time_s === 0)
                .map(i => itemMap.get(String(i.item_id)))
                .filter(Boolean),
        } as EnrichedPlayer;
    });
}
