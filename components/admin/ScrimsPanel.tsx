"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { ScrimmageRow, adminCancelScrimmageAction } from "@/app/admin/actions";

type StatusFilter = "active" | "all";

const STATUS_BADGE: Record<string, string> = {
    OPEN:       "text-success bg-success/10 border-success/30",
    PENDING:    "text-amber-400 bg-amber-400/10 border-amber-400/30",
    SCHEDULING: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30",
    SCHEDULED:  "text-indigo-400 bg-indigo-400/10 border-indigo-400/30",
    ACTIVE:     "text-primary bg-primary/10 border-primary/30",
    COMPLETED:  "text-muted bg-surface-2 border-edge",
    CANCELLED:  "text-danger bg-danger/10 border-danger/30",
};

function ScrimmageCard({ scrim }: { scrim: ScrimmageRow }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [pending, start] = useTransition();

    const canCancel = !["COMPLETED", "CANCELLED"].includes(scrim.status);

    function handleCancel() {
        start(async () => {
            await adminCancelScrimmageAction(scrim._id, reason || undefined);
            setOpen(false);
            setReason("");
            router.refresh();
        });
    }

    const badgeClasses = STATUS_BADGE[scrim.status] ?? "text-muted bg-surface-2 border-edge";

    return (
        <div className="bg-surface border border-edge rounded-lg overflow-hidden">
            <div className="px-4 py-3 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span
                            className={cn(
                                "text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase",
                                badgeClasses,
                            )}
                        >
                            {scrim.status}
                        </span>
                        <span className="text-xs text-muted font-mono">{scrim._id.slice(-8)}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {scrim.region && (
                            <span className="text-xs text-dimmed">{scrim.region}</span>
                        )}
                        {scrim.bestOf && (
                            <span className="text-xs text-dimmed">Bo{scrim.bestOf === "ONE" ? "1" : scrim.bestOf === "THREE" ? "3" : scrim.bestOf === "FIVE" ? "5" : "Open"}</span>
                        )}
                        {scrim.wagerAmount > 0 && (
                            <span className="text-xs text-primary font-semibold">{scrim.wagerAmount} credits</span>
                        )}
                        <span className="text-xs text-muted">{formatTimeAgo(new Date(scrim.createdAt))}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="ghost" href={`/scrims/${scrim._id}`}>
                        View
                    </Button>
                    {canCancel && (
                        <Button
                            size="sm"
                            variant="secondary"
                            className="text-danger border-danger/20 hover:border-danger/40"
                            onClick={() => setOpen((o) => !o)}
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            </div>

            {open && canCancel && (
                <div className="border-t border-edge px-4 py-3 bg-surface-2 space-y-2">
                    <input
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Cancellation reason (optional)..."
                        className="w-full bg-surface border border-edge rounded px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            disabled={pending}
                            onClick={handleCancel}
                            className="bg-danger text-foreground hover:opacity-80"
                        >
                            {pending ? "Cancelling..." : "Confirm Cancel"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                            Back
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function ScrimsPanel({ scrims }: { scrims: ScrimmageRow[] }) {
    const [filter, setFilter] = useState<StatusFilter>("active");

    const displayed =
        filter === "active"
            ? scrims.filter((s) => !["COMPLETED", "CANCELLED"].includes(s.status))
            : scrims;

    return (
        <div className="space-y-4">
            <div className="flex gap-1 bg-surface-2 rounded-lg p-1 w-fit">
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

            {displayed.length === 0 ? (
                <div className="bg-surface border border-edge rounded-lg p-8 text-center text-muted text-sm">
                    No scrimmages to display.
                </div>
            ) : (
                <div className="space-y-2">
                    {displayed.map((s) => (
                        <ScrimmageCard key={s._id} scrim={s} />
                    ))}
                </div>
            )}
        </div>
    );
}
