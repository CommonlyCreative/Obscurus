"use client"

import { useEffect, useMemo, useState } from "react";
import type { MatchLookupResult } from "@/lib/actions/deadlockMatchCache";
import { ChevronLeft, Swords, Target, Heart, Coins } from "lucide-react";
import { getMatch } from "@/app/scrims/[id]/actions";
import { cn } from "@/lib/utils";
import { MatchResult } from "@/app/api/graphql/types/graphql";
import { useRouter } from "next/navigation";
import { EnrichedPlayer, getMatchPlayersData } from "@/app/scrims/[id]/cache";

type TeamDisplay = {
    name: "Hidden King" | "Arch Mother"
    id: number
}

const MVP_RANK_STYLE: Record<number, { label: string; text: string; badge: string; ring: string }> = {
    1: { label: "MVP", text: "text-[#f0e463]", badge: "bg-[#f0e463] text-black", ring: "border-[#f0e463]/50" },
    2: { label: "2nd", text: "text-[#cbd5e1]", badge: "bg-[#cbd5e1] text-black", ring: "border-[#cbd5e1]/50" },
    3: { label: "3rd", text: "text-[#c7893f]", badge: "bg-[#c7893f] text-black", ring: "border-[#c7893f]/50" },
};

function MatchData({ match_id, result }: { match_id: string, result: MatchResult }) {
    const router = useRouter();
    const [metadata, setMetadata] = useState<MatchLookupResult | null>(null);
    const [enrichedPlayers, setEnrichedPlayers] = useState<EnrichedPlayer[] | null>(null);
    const [viewPlayer, setViewPlayer] = useState<EnrichedPlayer | null>(null);

    const teams = [
        { name: "Hidden King", id: 0 },
        { name: "Arch Mother", id: 1 },
    ] as TeamDisplay[];

    useEffect(() => {
        getMatch(match_id).then(async match => {
            setMetadata(match);
            if ("match_info" in match && match.match_info.players) {
                const players = await getMatchPlayersData(match_id, match.match_info.players);
                setEnrichedPlayers(players);
            }
        });
    }, [match_id]);

    const topPlayers = useMemo(() => {
        if (!enrichedPlayers) return [];
        return enrichedPlayers
            .filter((p): p is EnrichedPlayer & { mvp_rank: number } => p.mvp_rank != null && p.mvp_rank <= 3)
            .sort((a, b) => a.mvp_rank - b.mvp_rank);
    }, [enrichedPlayers]);

    if (!metadata) return <Loading />;

    if ("errorMessage" in metadata) {
        return <p className="text-xs text-danger">{metadata.errorMessage}</p>;
    }

    const hostTeam = result === MatchResult.HostWin
        ? teams[metadata.match_info.winning_team]
        : teams[metadata.match_info.winning_team === 1 ? 0 : 1];
    const opponentTeam = result === MatchResult.OpponentWin
        ? teams[metadata.match_info.winning_team]
        : teams[metadata.match_info.winning_team === 1 ? 0 : 1];

    if (!hostTeam || !opponentTeam) {
        return <p className="text-xs text-danger">There was an error collecting teams</p>;
    }

    const minutes = Math.floor(metadata.match_info.duration_s / 60);
    const seconds = metadata.match_info.duration_s % 60;


    if (viewPlayer) {
        const endStats = viewPlayer.stats.at(-1);
        const items = viewPlayer.items.filter(item => !item.hero).sort((a, b) => a.item_tier - b.item_tier);
        return (
            <div className="bg-surface border border-edge rounded-xl overflow-hidden shadow-sm shadow-black">
                <div className="relative h-36 bg-surface-2 border-b border-edge overflow-hidden">
                    <img
                        src={viewPlayer.hero.images.icon_hero_card}
                        className="absolute right-0 top-0 h-full w-auto object-cover opacity-10 select-none pointer-events-none"
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
                            <img src={viewPlayer.avatarfull} className="w-14 h-14 rounded-full border-2 border-edge shrink-0" alt={viewPlayer.personaname} />
                            {viewPlayer.online ? <>
                                <span className="w-3 h-3 bg-green-400 absolute right-1 bottom-1 rounded-full" />
                                <span className="w-3 h-3 bg-green-400 absolute right-1 bottom-1 rounded-full animate-ping" />
                            </> : <></>}
                        </div>
                        <div>
                            <div
                                onClick={() => viewPlayer._id && router.push(`/profile/${viewPlayer._id}`)}
                                className={cn("text-lg font-semibold leading-tight flex gap-2 items-center", viewPlayer._id && "cursor-pointer")}
                            >
                                <p>{viewPlayer.name ? viewPlayer.name : viewPlayer.personaname}</p>
                                {viewPlayer.name && <p className="font-light text-sm text-dimmed">{viewPlayer.personaname}</p>}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                                <img src={viewPlayer.hero.images.minimap_image} className="w-4 h-4" alt="" />
                                <span className="text-sm text-dimmed">{viewPlayer.hero.name}</span>
                            </div>
                        </div>
                        <div className="ml-auto text-right shrink-0 text-shadow-lg/40">
                            <div className="text-2xl font-bold text-foreground tabular-nums leading-tight">
                                {viewPlayer.kills}
                                <span className="text-dimmed font-normal mx-0.5">/</span>
                                {viewPlayer.deaths}
                                <span className="text-dimmed font-normal mx-0.5">/</span>
                                {viewPlayer.assists}
                            </div>
                            <div className="text-[10px] text-muted uppercase tracking-widest">Kills / Deaths / Assists</div>
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-6 space-y-6">
                    {endStats ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                            <div className="bg-surface-2 border border-edge rounded-lg p-4 flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-muted">
                                    <Coins className="w-3.5 h-3.5" />
                                    <span className="text-xs uppercase tracking-wider">Net Worth</span>
                                </div>
                                <span className="text-xl font-semibold text-foreground">{viewPlayer.net_worth.toLocaleString()}</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-dimmed text-sm">No stats available</p>
                    )}

                    <div>
                        <p className="text-xs text-muted uppercase tracking-widest mb-3">Items</p>
                        <div className="grid grid-flow-col grid-rows-2 grid-cols-6 gap-3">
                            {Array.from({ length: 12 }, (_, i) => {
                                const item = items[i];
                                return item ? (
                                    <div key={i} className="text-center">
                                        <img src={item.shop_image} className="w-full aspect-square rounded-md border border-edge object-contain" alt={item.name} />
                                        <div className="text-xs text-dimmed mt-1 leading-tight truncate">{item.name}</div>
                                    </div>
                                ) : (
                                    <div key={i}>
                                        <div className="w-full aspect-square rounded-md border border-dashed border-edge bg-surface-2/50" />
                                        <div className="mt-1 h-4" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-surface border border-edge rounded-xl p-4 md:p-8 relative shadow-sm shadow-black">
            <span className="absolute top-4 right-4 md:right-6 text-xs font-semibold px-2.5 py-1 rounded-full border bg-indigo-300/10 text-indigo-300 border-indigo-300/30">
                {minutes}:{seconds.toString().padStart(2, "0")}
            </span>

            {topPlayers.length > 0 && (
                <>
                <div className="">
                    <p className="text-xs text-muted uppercase tracking-widest mb-3">Top Performers</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {topPlayers.map(player => {
                            const style = MVP_RANK_STYLE[player.mvp_rank];
                            return (
                                <button
                                    key={player.account_id}
                                    onClick={() => setViewPlayer(player)}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-lg border bg-surface-2 hover:bg-surface-2/70 transition-colors text-left",
                                        style.ring,
                                    )}
                                >
                                    <div className="relative shrink-0">
                                        <img
                                            src={player.hero.images.minimap_image}
                                            className="w-12 h-12 rounded-md border border-edge"
                                            alt={player.hero.name}
                                        />
                                        <span className={cn(
                                            "absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm shadow-black/40",
                                            style.badge,
                                        )}>
                                            {player.mvp_rank}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className={cn("text-[10px] font-bold uppercase tracking-wider", style.text)}>
                                            {style.label}
                                        </p>
                                        <p className="text-sm font-semibold text-foreground truncate">{player.personaname}</p>
                                        <p className="text-xs text-dimmed truncate">{player.hero.name}</p>
                                        <p className="text-xs text-muted tabular-nums mt-0.5">
                                            {player.kills}/{player.deaths}/{player.assists}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            <hr className="my-4 bg-edge/40 mx-10" />
            </>
            )}


            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch md:items-start">
                <Team
                    team_id={hostTeam.id}
                    winningTeam={metadata.match_info.winning_team}
                    isLeft
                    team_name={hostTeam.name}
                    players={enrichedPlayers?.filter(p => p.team === hostTeam.id) ?? null}
                    setViewPlayer={setViewPlayer}
                />
                <div className="shrink-0 flex md:flex-col items-center gap-2 self-stretch md:self-center text-muted">
                    <div className="flex-1 md:flex-none h-px md:h-8 md:w-px bg-edge" />
                    <span className="text-xs tracking-[0.3em] uppercase shrink-0">vs</span>
                    <div className="flex-1 md:flex-none h-px md:h-8 md:w-px bg-edge" />
                </div>
                <Team
                    team_id={opponentTeam.id}
                    winningTeam={metadata.match_info.winning_team}
                    team_name={opponentTeam.name}
                    players={enrichedPlayers?.filter(p => p.team === opponentTeam.id) ?? null}
                    setViewPlayer={setViewPlayer}
                />
            </div>
        </div>
    );
}

function Team({
    players,
    setViewPlayer,
    team_name,
    team_id,
    isLeft,
    winningTeam,
}: {
    winningTeam: number;
    isLeft?: boolean;
    team_name: "Arch Mother" | "Hidden King";
    team_id: number;
    players: EnrichedPlayer[] | null;
    setViewPlayer: (x: EnrichedPlayer) => void;
}) {
    const isVictorious = team_id === winningTeam;

    if (!players) return <TeamSkeleton isLeft={isLeft} />;

    return (
        <div className="flex-1">
            <div className={cn("flex items-center mb-6 gap-3", isLeft ? "justify-center md:justify-end" : "justify-center md:justify-start")}>
                {isVictorious && (
                    <span className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-full border bg-success/10 text-success border-success/30",
                        !isLeft ? "order-2" : ""
                    )}>
                        Victorious
                    </span>
                )}
                <h2 className={cn(
                    "text-2xl md:text-4xl",
                    isLeft ? "text-center md:text-right" : "text-center md:text-left",
                    team_name === "Arch Mother" ? "font-slimkim text-[#60a4e4]" : "font-bigfishdd text-[#f7a711]"
                )}>
                    {team_name}
                </h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {players.map(player => (
                    <button
                        key={player.account_id}
                        onClick={() => setViewPlayer(player)}
                        className="flex flex-col items-center gap-2 group cursor-pointer relative"
                    >
                        <div className={cn(
                            "rounded-lg border group-hover:border-primary/50 transition-colors duration-200 overflow-hidden",
                            player.mvp_rank != null && player.mvp_rank <= 3 ? MVP_RANK_STYLE[player.mvp_rank].ring : "border-edge",
                        )}>
                            <img src={player.hero.images.minimap_image} className="w-16 h-16" alt={player.hero.name} />
                        </div>
                        <span className="text-xs break-all text-dimmed group-hover:text-foreground transition-colors text-center leading-tight">
                            {player.personaname}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
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
    );
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
    );
}

export default MatchData;
