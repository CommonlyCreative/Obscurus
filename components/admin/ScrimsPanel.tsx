"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn, formatTimeAgo } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { ScrimmageRow, adminPurgeAllScrimmagesAction } from "@/app/admin/actions";
import { ScrimDetailPanel } from "./ScrimDetailPanel";

type StatusFilter = "active" | "all";

const STATUS_BADGE: Record<string, string> = {
    OPEN:       "text-success bg-success/10 border-success/30",
    PENDING:    "text-amber-400 bg-amber-400/10 border-amber-400/30",
    READY:      "text-amber-400 bg-amber-400/10 border-amber-400/30",
    SCHEDULING: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30",
    SCHEDULED:  "text-indigo-400 bg-indigo-400/10 border-indigo-400/30",
    ACTIVE:     "text-primary bg-primary/10 border-primary/30",
    COMPLETED:  "text-muted bg-surface-2 border-edge",
    CANCELLED:  "text-danger bg-danger/10 border-danger/30",
};

// ─── List item ────────────────────────────────────────────────────────────────

function ScrimListItem({
    scrim,
    selected,
    onClick,
}: {
    scrim: ScrimmageRow;
    selected: boolean;
    onClick: () => void;
}) {
    const bestOf = scrim.bestOf === "ONE" ? "Bo1" : scrim.bestOf === "THREE" ? "Bo3" : scrim.bestOf === "FIVE" ? "Bo5" : "Open";
    const badge = STATUS_BADGE[scrim.status] ?? "text-muted bg-surface-2 border-edge";
    const vsLabel = scrim.hostOrgName
        ? `${scrim.hostOrgName} vs ${scrim.opponentOrgName ?? "Open"}`
        : `${scrim.hostName} vs ${scrim.opponentOrgName ?? "Open"}`;

    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-3",
                selected
                    ? "bg-primary/10 border border-primary/30"
                    : "border border-transparent hover:bg-surface-2 hover:border-edge",
            )}
        >
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={cn("text-[9px] font-bold px-1 py-0.5 rounded border uppercase shrink-0", badge)}>
                        {scrim.status}
                    </span>
                    {scrim.isPrivate && (
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded border uppercase text-muted bg-surface-2 border-edge shrink-0">
                            PVT
                        </span>
                    )}
                    <span className={cn("text-sm font-semibold truncate", selected ? "text-primary" : "text-foreground")}>
                        {vsLabel}
                    </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted">{scrim.region}</span>
                    <span className="text-[10px] text-muted">{bestOf}</span>
                    {scrim.wagerAmount > 0 && (
                        <span className="text-[10px] text-primary font-semibold">{scrim.wagerAmount} cr</span>
                    )}
                    <span className="text-[10px] text-muted ml-auto shrink-0">
                        {scrim.scheduledAt
                            ? new Date(scrim.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                            : formatTimeAgo(new Date(scrim.createdAt))}
                    </span>
                </div>
            </div>
        </button>
    );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function ScrimsPanel({ scrims, adminRole }: { scrims: ScrimmageRow[]; adminRole: string }) {
    const router = useRouter();
    const [filter, setFilter] = useState<StatusFilter>("active");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [purgeConfirm, setPurgeConfirm] = useState(false);
    const [purging, startPurge] = useTransition();
    const isDev = process.env.NODE_ENV === "development";

    const displayed = filter === "active"
        ? scrims.filter((s) => !["COMPLETED", "CANCELLED"].includes(s.status))
        : scrims;

    const effectiveSelected = selectedId ?? displayed[0]?._id ?? null;

    function handlePurge() {
        startPurge(async () => {
            await adminPurgeAllScrimmagesAction();
            setPurgeConfirm(false);
            setSelectedId(null);
            router.refresh();
        });
    }

    return (
        <div className="grid grid-cols-2 gap-4 items-start">
            {/* ── Left: list ── */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex gap-1 bg-surface-2 rounded-lg p-1">
                        {(["active", "all"] as StatusFilter[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
                                    filter === f ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-dimmed",
                                )}
                            >
                                {f === "active" ? "Active" : "All"}
                            </button>
                        ))}
                    </div>

                    {isDev && (
                        purgeConfirm ? (
                            <div className="flex items-center gap-1.5 ml-auto">
                                <span className="text-xs text-danger font-semibold">Delete all?</span>
                                <Button
                                    size="sm"
                                    disabled={purging}
                                    onClick={handlePurge}
                                    className="bg-danger text-foreground hover:opacity-80"
                                >
                                    {purging ? "..." : "Yes"}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setPurgeConfirm(false)}>No</Button>
                            </div>
                        ) : (
                            <Button
                                size="sm"
                                variant="secondary"
                                className="text-danger border-danger/20 hover:border-danger/40 ml-auto"
                                onClick={() => setPurgeConfirm(true)}
                            >
                                Purge All
                            </Button>
                        )
                    )}
                </div>

                <div className="max-h-[70vh] overflow-y-auto space-y-1 pr-0.5">
                    {displayed.length === 0 ? (
                        <p className="text-xs text-muted text-center py-8">No scrimmages to display.</p>
                    ) : (
                        displayed.map((s) => (
                            <ScrimListItem
                                key={s._id}
                                scrim={s}
                                selected={effectiveSelected === s._id}
                                onClick={() => setSelectedId(s._id)}
                            />
                        ))
                    )}
                </div>

                <p className="text-xs text-muted">
                    {displayed.length} scrimmage{displayed.length !== 1 ? "s" : ""}
                </p>
            </div>

            {/* ── Right: detail ── */}
            <div className="bg-surface border border-edge rounded-xl overflow-hidden max-h-[70vh] overflow-y-auto no-scrollbar sticky top-4">
                {effectiveSelected ? (
                    <ScrimDetailPanel scrimId={effectiveSelected} adminRole={adminRole} />
                ) : (
                    <div className="flex items-center justify-center h-48 text-muted text-sm">
                        Select a scrimmage to view details.
                    </div>
                )}
            </div>
        </div>
    );
}
