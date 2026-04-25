"use client"

import { cache, useEffect, useState } from "react";
import type { DeadlockMatch, MatchPlayer } from "@/lib/types/deadlock/match";
import { ChevronLeft, Swords, Target, Heart } from "lucide-react";
import { getMatchUserBySteamId, getSteamUser } from "@/app/scrims/[id]/actions";
import { SteamUserSummary } from "@/lib/types/steam/profile";
import { convertSteam32toSteam64 } from "@/lib/deadlock";
import { asyncMap, cn } from "@/lib/utils";
import { GiCrown } from "react-icons/gi";
import { PiCrownSimpleDuotone } from "react-icons/pi";
import { GetMatchUserBySteamIdQuery, MatchResult, Maybe } from "@/app/api/graphql/types/graphql";
import { useRouter } from "next/navigation";
import { getHero, getItem, getMatch } from "@/lib/actions/deadlockapi";


type SteamMatchUser = SteamUserSummary & Omit<MatchPlayer, "hero_id" | "items"> & {
    hero: {
        name: string,
        images: {
            minimap_image: string,
            icon_hero_card: string,
        }
    },
    items: {
        id: string,
        name: string,
        shop_image: string,
        hero?: number,
        item_tier: number,
    }[]
} & Partial<GetMatchUserBySteamIdQuery["getUserBySteamId"]>;

type TeamDisplay = {
    name: "Hidden King" | "Arch Mother"
    id: number
}

function MatchData({ match_id, result }: { match_id: string, result: MatchResult }) {
    const router = useRouter();
    const [metadata, setMetadata] = useState<DeadlockMatch | null>(null);
    const [viewPlayer, setViewPlayer] = useState<SteamMatchUser | null>(null)
    const teams = [
        {
            name: "Hidden King",
            id: 0,
        },
        {
            name: "Arch Mother",
            id: 1,
        },
    ] as TeamDisplay[]
    const hostTeam = metadata?.match_info ? result === MatchResult.HostWin ? teams[metadata.match_info.winning_team] : teams[metadata.match_info.winning_team === 1 ? 0 : 1] : null;
    const opponentTeam = metadata?.match_info ? result === MatchResult.OpponentWin ? teams[metadata.match_info.winning_team] : teams[metadata.match_info.winning_team === 1 ? 0 : 1] : null;

    useEffect(() => {
        (async function () {
            const match = await getMatch(match_id, Date.now())
            setMetadata(match)
        })();
    }, [match_id])

    if (!metadata || !metadata.match_info) {
        if (metadata && ((metadata as any).errorMessage || (metadata as any).error)) {
            return (
                <p className="text-xs text-danger">{(metadata as any).errorMessage ?? "There was an error loading this match"}</p>
            )
        } else return <Loading />;
    }
    if (!hostTeam || !opponentTeam) {
        return (
            <p className="text-xs text-danger">There was an error collecting teams</p>
        )
    }

    const minutes = Math.floor(metadata.match_info.duration_s / 60);
    const seconds = metadata.match_info.duration_s % 60;

    if (viewPlayer) {
        const endStats = viewPlayer.stats.at(-1);
        const items = viewPlayer.items.filter(item => !item.hero).sort((a, b) => a.item_tier - b.item_tier);
        return (
            <div className="bg-surface border border-edge rounded-xl overflow-hidden shadow-sm shadow-black">
                {/* Hero banner */}
                <div className="relative h-36 bg-surface-2 border-b border-edge overflow-hidden">
                    <img
                        src={viewPlayer.hero.images.icon_hero_card}
                        className="absolute right-0 top-0 h-full w-auto object-cover opacity-20 select-none pointer-events-none"
                        alt=""
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-surface-2 via-surface-2/80 to-transparent" />
                    <div className="relative flex items-center gap-4 h-full px-6">
                        <button
                            onClick={() => setViewPlayer(null)}
                            className="text-dimmed hover:text-foreground transition-colors shrink-0"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="relative">
                            <img src={viewPlayer.avatar.large} className="w-14 h-14 rounded-full border-2 border-edge shrink-0" alt={viewPlayer.nickname} />
                            {viewPlayer.online ? <>
                                <span className="w-3 h-3 bg-green-400 absolute right-1 bottom-1 rounded-full" />
                                <span className="w-3 h-3 bg-green-400 absolute right-1 bottom-1 rounded-full animate-ping" />
                            </> : <></>}
                        </div>
                        <div>
                            <div onClick={() => viewPlayer._id && router.push(`/profile/${viewPlayer._id}`)} className={cn("text-lg font-semibold leading-tight flex gap-2 items-center", viewPlayer._id && "cursor-pointer")}>
                                <p>{viewPlayer.name ? viewPlayer.name : viewPlayer.nickname}</p>
                                {viewPlayer.name && <p className="font-light text-sm text-dimmed">{viewPlayer.nickname}</p>}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                                <img src={viewPlayer.hero.images.minimap_image} className="w-4 h-4" alt="" />
                                <span className="text-sm text-dimmed">{viewPlayer.hero.name}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-6 space-y-6">
                    {/* Stats */}
                    {endStats ? (
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-surface-2 border border-edge rounded-lg p-4 flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-muted">
                                    <Swords className="w-3.5 h-3.5" />
                                    <span className="text-xs uppercase tracking-wider">Player Dmg</span>
                                </div>
                                <span className="text-xl font-semibold text-foreground">{endStats.player_damage.toLocaleString()}</span>
                            </div>
                            <div className="bg-surface-2 border border-edge rounded-lg p-4 flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-muted">
                                    <Target className="w-3.5 h-3.5" />
                                    <span className="text-xs uppercase tracking-wider">Obj. Dmg</span>
                                </div>
                                <span className="text-xl font-semibold text-foreground">{endStats.boss_damage.toLocaleString()}</span>
                            </div>
                            <div className="bg-surface-2 border border-edge rounded-lg p-4 flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-muted">
                                    <Heart className="w-3.5 h-3.5" />
                                    <span className="text-xs uppercase tracking-wider">Healing</span>
                                </div>
                                <span className="text-xl font-semibold text-foreground">{endStats.player_healing.toLocaleString()}</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-dimmed text-sm">No stats available</p>
                    )}

                    {/* Items */}
                    {items.length > 0 && (
                        <div>
                            <p className="text-xs text-muted uppercase tracking-widest mb-3">Items</p>
                            <div className="grid grid-flow-col grid-rows-2 auto-cols-fr gap-3">
                                {items.map((item, x) => (
                                    <div key={x} className="text-center">
                                        <img src={item.shop_image} className="w-full aspect-square rounded-md border border-edge object-contain" alt={item.name} />
                                        <div className="text-xs text-dimmed mt-1 leading-tight">{item.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }


    return (
        <div className="bg-surface border border-edge rounded-xl p-4 md:p-8 relative shadow-sm shadow-black">
            <span className="absolute top-4 right-4 md:right-6 text-xs font-semibold px-2.5 py-1 rounded-full border bg-indigo-300/10 text-indigo-300 border-indigo-300/30">{minutes}:{seconds}</span>
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch md:items-start">
                <Team team_id={hostTeam.id} winningTeam={metadata.match_info.winning_team} isLeft team_name={hostTeam.name} players={metadata.match_info.players} setViewPlayer={setViewPlayer} />
                <div className="shrink-0 flex md:flex-col items-center gap-2 self-stretch md:self-center text-muted">
                    <div className="flex-1 md:flex-none h-px md:h-8 md:w-px bg-edge" />
                    <span className="text-xs tracking-[0.3em] uppercase shrink-0">vs</span>
                    <div className="flex-1 md:flex-none h-px md:h-8 md:w-px bg-edge" />
                </div>
                <Team team_id={opponentTeam.id} winningTeam={metadata.match_info.winning_team} team_name={opponentTeam.name} players={metadata.match_info.players} setViewPlayer={setViewPlayer} />
            </div>
        </div>
    )
}

function Team({ players, setViewPlayer, team_name, team_id, isLeft, winningTeam }: { winningTeam: number, isLeft?: boolean, team_name: "Arch Mother" | "Hidden King", team_id: number, players: MatchPlayer[], setViewPlayer: (x: SteamMatchUser) => void }) {
    const [team, setTeam] = useState<SteamMatchUser[] | null>(null)
    const isVictorious = team_id === winningTeam;
    useEffect(() => {
        (async function () {
            const data = await asyncMap(players.filter(player => player.team === team_id), async player => {
                const steamId = convertSteam32toSteam64(player.account_id)
                const user = await getMatchUserBySteamId(steamId);
                const steamUser: SteamUserSummary = await getSteamUser(steamId);
                const hero = await getHero(player.hero_id)
                const items = await asyncMap(player.items.filter(item => item.sold_time_s === 0), async obj => {
                    const item = await getItem(obj.item_id)
                    return { newObj: item }
                })

                return { newObj: { ...steamUser, ...player, ...user, hero, items } as SteamMatchUser }
            })
            setTeam(data)
        })();
    }, [players])

    if (!team) return <TeamSkeleton isLeft={isLeft} />;

    return (
        <div className="flex-1">
            <div className={cn("flex items-center mb-6 gap-3", isLeft ? "justify-center md:justify-end" : "justify-center md:justify-start")}>
                {isVictorious && <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border bg-success/10 text-success border-success/30",
                    !isLeft ? "order-2" : ""
                )}>
                    Victorious
                </span>}
                <h2 className={cn(
                    "text-2xl md:text-4xl",
                    isLeft ? "text-center md:text-right" : "text-center md:text-left",
                    team_name === "Arch Mother" ? "font-slimkim text-[#60a4e4]" : "font-bigfishdd text-[#f7a711]"
                )}>{team_name}</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {team.map(player => (
                    <button
                        key={player.steamID}
                        onClick={() => setViewPlayer(player)}
                        className="flex flex-col items-center gap-2 group cursor-pointer relative"
                    >
                        <div className="rounded-lg border border-edge group-hover:border-primary/50 transition-colors duration-200 overflow-hidden">
                            <img src={player.hero.images.minimap_image} className="w-16 h-16" alt={player.hero.name} />
                        </div>
                        <span className="text-xs break-all text-dimmed group-hover:text-foreground transition-colors text-center leading-tight">
                            {player.nickname}
                        </span>
                        {player.mvp_rank === 1 && <GiCrown className="absolute right-4 h-6 w-6 -top-2 text-[#f0e463]" />}
                        {player.mvp_rank && player.mvp_rank !== 1 && <PiCrownSimpleDuotone className="absolute right-4 h-6 w-6 -top-2 text-[#c7a237]" />}
                    </button>
                ))}
            </div>
        </div>
    )
}

function TeamSkeleton({ isLeft = false }: { isLeft?: boolean }) {
    return (
        <div className="flex-1 animate-pulse">
            <div className={cn("h-10 w-48 bg-surface-2 rounded mb-6 mx-auto", isLeft ? "md:ml-auto md:mr-0" : "md:mx-0")} />
            <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 bg-surface-2 rounded-lg" />
                        <div className="h-3 w-14 bg-surface-2 rounded" />
                    </div>
                ))}
            </div>
        </div>
    )
}

function Loading() {
    return (
        <div className="bg-surface border border-edge rounded-xl p-4 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch md:items-start">
                <TeamSkeleton isLeft />
                <div className="shrink-0 flex md:flex-col items-center gap-2 self-stretch md:self-center text-muted">
                    <div className="flex-1 md:flex-none h-px md:h-8 md:w-px bg-edge" />
                    <span className="text-xs tracking-[0.3em] uppercase shrink-0">vs</span>
                    <div className="flex-1 md:flex-none h-px md:h-8 md:w-px bg-edge" />
                </div>
                <TeamSkeleton />
            </div>
        </div>
    )
}


export default MatchData
