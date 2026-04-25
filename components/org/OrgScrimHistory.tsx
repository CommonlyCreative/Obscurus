import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/utils";
import { ScrimmageResult } from "@/app/api/graphql/types/graphql";

type ScrimEntry = {
    _id: string;
    status: string;
    result?: string | null;
    createdAt: number;
    scheduledAt?: number | null;
    hostOrg?: { _id: string; name: string } | null;
    opponentOrg?: { _id: string; name: string } | null;
    hostTeam?: { name?: string | null; leader: { name: string } } | null;
    opponentTeam?: { name?: string | null; leader: { name: string } } | null;
    region: string;
    bestOf?: string | null;
    wagerAmount: number;
};

const STATUS_PILL: Record<string, string> = {
    SCHEDULING: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    SCHEDULED: "text-indigo-300 bg-indigo-300/10 border-indigo-300/30",
    ACTIVE: "text-success bg-success/10 border-success/30",
    COMPLETED: "text-muted bg-surface-2 border-edge",
    OPEN: "text-primary bg-primary/10 border-primary/30",
    PENDING: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    CANCELLED: "text-muted bg-surface-2 border-edge",
};

const STATUS_LABEL: Record<string, string> = {
    SCHEDULING: "Scheduling",
    SCHEDULED: "Scheduled",
    ACTIVE: "Live",
    COMPLETED: "Done",
    OPEN: "Open",
    PENDING: "Pending",
    CANCELLED: "Cancelled",
};

const BEST_OF_LABEL: Record<string, string> = {
    ONE: "Bo1",
    THREE: "Bo3",
    FIVE: "Bo5",
    UNLIMITED: "Open",
};

function resultBadge(scrim: ScrimEntry, orgId: string) {
    const isHost = scrim.hostOrg?._id === orgId;
    switch (scrim.result) {
        case ScrimmageResult.HostWin:
            return isHost
                ? { label: "W", classes: "bg-success/10 text-success" }
                : { label: "L", classes: "bg-danger/10 text-danger" };
        case ScrimmageResult.OpponentWin:
            return isHost
                ? { label: "L", classes: "bg-danger/10 text-danger" }
                : { label: "W", classes: "bg-success/10 text-success" };
        case ScrimmageResult.Draw:
            return { label: "D", classes: "bg-muted/10 text-muted" };
        default:
            return { label: "—", classes: "bg-edge text-muted" };
    }
}

const MAX_VISIBLE = 15;

export function OrgScrimHistory({ orgId, scrims }: { orgId: string; scrims: ScrimEntry[] }) {
    const sorted = [...scrims].sort(
        (a, b) => (b.scheduledAt ?? b.createdAt) - (a.scheduledAt ?? a.createdAt),
    );
    const visible = sorted.slice(0, MAX_VISIBLE);

    return (
        <div className="bg-surface border border-edge rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-edge">
                <div className="text-sm font-bold text-foreground">Scrim History</div>
                <div className="text-xs text-muted">{scrims.length} total</div>
            </div>

            {visible.length === 0 ? (
                <div className="px-5 py-10 text-center">
                    <p className="text-xs text-muted">No scrims yet.</p>
                </div>
            ) : (
                <div className="divide-y divide-edge">
                    {visible.map(scrim => {
                        const isHost = scrim.hostOrg?._id === orgId;
                        const opponent = isHost
                            ? (scrim.opponentOrg?.name ??
                              scrim.opponentTeam?.name ??
                              (scrim.opponentTeam?.leader.name ? scrim.opponentTeam.leader.name + "'s Team" : "TBD"))
                            : (scrim.hostOrg?.name ??
                              scrim.hostTeam?.name ??
                              (scrim.hostTeam?.leader.name ? scrim.hostTeam.leader.name + "'s Team" : "Unknown"));
                        const { label, classes } = resultBadge(scrim, orgId);
                        const pillClasses = STATUS_PILL[scrim.status] ?? "text-muted border-edge";
                        const statusLabel = STATUS_LABEL[scrim.status] ?? scrim.status;
                        const dateMs = scrim.scheduledAt ?? scrim.createdAt;
                        const boLabel = scrim.bestOf ? BEST_OF_LABEL[scrim.bestOf] : null;

                        return (
                            <Link
                                key={scrim._id}
                                href={`/scrims/${scrim._id}`}
                                className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2 transition-colors"
                            >
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-md flex items-center justify-center text-xs font-black shrink-0",
                                        classes,
                                    )}
                                >
                                    {label}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-foreground truncate">
                                        vs {opponent}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-muted">
                                            {formatTimeAgo(new Date(dateMs))}
                                        </span>
                                        <span className="text-edge text-xs">·</span>
                                        <span className="text-xs text-muted">{scrim.region}</span>
                                        {boLabel && (
                                            <>
                                                <span className="text-edge text-xs">·</span>
                                                <span className="text-xs text-muted">{boLabel}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {scrim.wagerAmount > 0 && (
                                        <span className="text-[10px] text-primary font-semibold">
                                            {scrim.wagerAmount} cr
                                        </span>
                                    )}
                                    <span
                                        className={cn(
                                            "text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase",
                                            pillClasses,
                                        )}
                                    >
                                        {statusLabel}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
