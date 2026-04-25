import { MatchSide, Scrimmage, ScrimmageResult, ScrimmageStatus, Team, UserProfileQuery } from "@/app/api/graphql/types/graphql";
import { Button } from "@/components/shared/Button";
import { cn, formatTimeAgo } from "@/lib/utils";
import Link from "next/link";

type MatchEntry = Pick<Scrimmage, "_id" | "result" | "opponentTeam" | "createdAt">;

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

const MATCH_HISTORY: MatchEntry[] = [
    { _id: "1", result: ScrimmageResult.HostWin, opponentTeam: { name: "Void Casters" } as Team, createdAt: now - 1 * day },
    { _id: "2", result: ScrimmageResult.OpponentWin, opponentTeam: { name: "Null Directive" } as Team, createdAt: now - 2 * day },
    { _id: "3", result: ScrimmageResult.HostWin, opponentTeam: { name: "Iron Circuit" } as Team, createdAt: now - 3 * day },
    { _id: "4", result: ScrimmageResult.HostWin, opponentTeam: { name: "Paradox Squad" } as Team, createdAt: now - 5 * day },
    { _id: "5", result: ScrimmageResult.OpponentWin, opponentTeam: { name: "The Hex Collective" } as Team, createdAt: now - 6 * day },
];

function resultBadge(result: ScrimmageResult | null | undefined, side: MatchSide) {
    const win = { label: "W", classes: "bg-success/10 text-success" };
    const lost = { label: "L", classes: "bg-danger/10 text-danger" };
    const isHost = side === MatchSide.Host;
    switch (result) {
        case ScrimmageResult.HostWin: return isHost ? win : lost;
        case ScrimmageResult.OpponentWin: return isHost ? lost : win;
        case ScrimmageResult.Draw: return { label: "D", classes: "bg-muted/10 text-muted" };
        default: return { label: "—", classes: "bg-edge text-muted" };
    }
}

const maxMatchView = 10;

export function MatchHistoryPanel({ scrimmages, profileUserId }: { scrimmages: NonNullable<UserProfileQuery["getUser"]>["scrimmages"], profileUserId: string }) {
    return (
        <div className="bg-surface border border-edge rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-edge">
                <div className="text-sm font-bold text-foreground">Match History</div>
                <div className="text-xs text-muted">{scrimmages.length} recent scrims</div>
            </div>

            {scrimmages.length > 0 ?
                <>
                    <div className="divide-y divide-edge">
                        {scrimmages.sort((a,b) => b.createdAt - a.createdAt).slice(0, maxMatchView).map((match) => {
                            const side = match.opponentTeam?.members.some(member => member._id === profileUserId) ? MatchSide.Opponent : MatchSide.Host
                            const otherTeam = side === MatchSide.Opponent ? match.hostTeam : match.opponentTeam;
                            const org = side === MatchSide.Host ? match.hostOrg : match.opponentOrg
                            const { label, classes } = resultBadge(match.result, side);
                            if (!otherTeam) return;
                            return (
                                <Link key={match._id} href={`/scrims/${match._id}`} className={cn("flex items-center gap-4 px-5 py-3.5 transition-colors",
                                    match.status === ScrimmageStatus.Active ? "bg-success/5 border border-success/10 hover:bg-success/20" : "hover:bg-surface-2"
                                )}>
                                    {match.status === ScrimmageStatus.Active ? (
                                        <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-black shrink-0 bg-success/5`}>
                                        <span className="w-2 h-2 rounded-full bg-success animate-pulse shrink-0" />
                                    </div>
                                    ) : (
                                        <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-black shrink-0 ${classes}`}>
                                        {label}
                                    </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-foreground truncate">
                                            vs {otherTeam.name ?? otherTeam.leader.name + "'s Team"}
                                        </div>
                                        <div className="text-xs text-muted mt-0.5">{formatTimeAgo(new Date(match.createdAt))}</div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {scrimmages.length > maxMatchView && (
                        <div className="px-5 py-3 border-t border-edge">
                            <Button variant="ghost" className="text-xs">Load more matches →</Button>
                        </div>
                    )}
                </> :
                <div className="px-5 py-3 border-t border-edge text-xs font-normal text-muted">
                    Player has played no scrims.
                </div>}
        </div>
    );
}
