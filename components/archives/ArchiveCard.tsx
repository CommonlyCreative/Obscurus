import Link from "next/link";
import { cn, formatTimeAgo } from "@/lib/utils";
import { getRankByMMR } from "@/lib/deadlock";
import { BestOf, MatchResult, ScrimmageResult } from "@/app/api/graphql/types/graphql";
import type { ArchivedScrim } from "./types";
import { getScrimRankAverage, isOrgScrim } from "./types";

const BEST_OF_LABEL: Record<BestOf, string> = {
    [BestOf.One]: "Bo1",
    [BestOf.Three]: "Bo3",
    [BestOf.Five]: "Bo5",
    [BestOf.Unlimited]: "Unlimited",
};

const RESULT_LABEL: Record<ScrimmageResult, string> = {
    [ScrimmageResult.HostWin]: "Host Win",
    [ScrimmageResult.OpponentWin]: "Opponent Win",
    [ScrimmageResult.Draw]: "Draw",
    [ScrimmageResult.Cancelled]: "Cancelled",
};

const RESULT_COLOR: Record<ScrimmageResult, string> = {
    [ScrimmageResult.HostWin]: "text-success bg-success/10 border-success/30",
    [ScrimmageResult.OpponentWin]: "text-danger bg-danger/10 border-danger/30",
    [ScrimmageResult.Draw]: "text-dimmed bg-surface-2 border-edge",
    [ScrimmageResult.Cancelled]: "text-muted bg-surface-2 border-edge",
};

export function ArchiveCard({ scrim }: { scrim: ArchivedScrim }) {
    const hostName = scrim.hostOrg?.name ?? scrim.hostTeam.name ?? scrim.host.name + "'s Team";
    const opponentName = scrim.opponentOrg?.name ?? scrim.opponentTeam?.name ?? "Unknown";
    const orgScrim = isOrgScrim(scrim);
    const rankAvg = getScrimRankAverage(scrim);
    const rank = rankAvg != null ? getRankByMMR(rankAvg) : null;

    const hostWins = scrim.matches.filter((m) => m.result === MatchResult.HostWin).length;
    const oppWins = scrim.matches.filter((m) => m.result === MatchResult.OpponentWin).length;

    return (
        <Link
            href={`/scrims/${scrim._id}`}
            className="block bg-surface border border-edge rounded-lg p-4 hover:border-primary/25 transition-colors"
        >
            <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {scrim.result && (
                        <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border", RESULT_COLOR[scrim.result])}>
                            {RESULT_LABEL[scrim.result]}
                        </span>
                    )}
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-2 border border-edge text-dimmed">
                        {BEST_OF_LABEL[scrim.bestOf]}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-2 border border-edge text-dimmed">
                        {orgScrim ? "Org vs Org" : "Team"}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-2 border border-edge text-muted">
                        {scrim.region}
                    </span>
                </div>
                <span className="text-xs text-muted shrink-0">{formatTimeAgo(new Date(scrim.createdAt))}</span>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                    <div className={cn("font-bold text-sm truncate", scrim.result === ScrimmageResult.HostWin ? "text-success" : "text-foreground")}>
                        {hostName}
                    </div>
                    {scrim.hostOrg && <div className="text-[10px] text-muted mt-0.5">Organization</div>}
                </div>
                <div className="shrink-0 text-center">
                    <div className="text-sm font-black text-dimmed tabular-nums">
                        {hostWins}<span className="mx-1 text-muted">–</span>{oppWins}
                    </div>
                </div>
                <div className="flex-1 min-w-0 text-right">
                    <div className={cn("font-bold text-sm truncate", scrim.result === ScrimmageResult.OpponentWin ? "text-success" : "text-foreground")}>
                        {opponentName}
                    </div>
                    {scrim.opponentOrg && <div className="text-[10px] text-muted mt-0.5">Organization</div>}
                </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-edge">
                {rank ? (
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", rank.rank.text, rank.rank.bg)}>
                        {rank.rank.name} avg
                    </span>
                ) : (
                    <span className="text-xs text-muted italic">No rank data</span>
                )}
                {scrim.wagerAmount > 0 && (
                    <span className="text-xs font-semibold text-primary">{scrim.wagerAmount} cr wager</span>
                )}
            </div>
        </Link>
    );
}
