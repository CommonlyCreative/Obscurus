"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { DisputeRow, DisputeStatusFilter, updateDisputeStatusAction } from "@/app/admin/actions";

const STATUS_CFG: Record<DisputeRow["status"], { label: string; classes: string }> = {
    OPEN:         { label: "Open",         classes: "text-danger bg-danger/10 border-danger/30" },
    UNDER_REVIEW: { label: "Under Review", classes: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
    RESOLVED:     { label: "Resolved",     classes: "text-success bg-success/10 border-success/30" },
    DISMISSED:    { label: "Dismissed",    classes: "text-muted bg-surface-2 border-edge" },
};

const FILTER_OPTIONS: { value: DisputeStatusFilter | "ALL"; label: string }[] = [
    { value: "OPEN",         label: "Open" },
    { value: "UNDER_REVIEW", label: "Under Review" },
    { value: "RESOLVED",     label: "Resolved" },
    { value: "DISMISSED",    label: "Dismissed" },
    { value: "ALL",          label: "All" },
];

function DisputeCard({ dispute }: { dispute: DisputeRow }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [resolution, setResolution] = useState("");
    const [pending, start] = useTransition();

    function update(status: "UNDER_REVIEW" | "RESOLVED" | "DISMISSED") {
        start(async () => {
            await updateDisputeStatusAction(dispute._id, status, resolution || undefined);
            setOpen(false);
            setResolution("");
            router.refresh();
        });
    }

    const cfg = STATUS_CFG[dispute.status];
    const canAct = dispute.status !== "RESOLVED" && dispute.status !== "DISMISSED";

    return (
        <div className="bg-surface border border-edge rounded-lg overflow-hidden">
            <div className="px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase", cfg.classes)}>
                                {cfg.label}
                            </span>
                            {dispute.creatorName && (
                                <span className="text-xs font-semibold text-foreground">{dispute.creatorName}</span>
                            )}
                            <span className="text-xs text-muted">{formatTimeAgo(new Date(dispute.createdAt))}</span>
                        </div>
                        <p className="text-sm text-dimmed leading-relaxed">{dispute.reason}</p>
                        {dispute.resolution && (
                            <p className="text-xs text-muted mt-2 italic">Resolution: {dispute.resolution}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button size="sm" variant="ghost" href={`/scrims/${dispute.scrimmageId}`}>
                            Scrim
                        </Button>
                        {canAct && (
                            <Button size="sm" variant="secondary" onClick={() => setOpen((o) => !o)}>
                                Manage
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {open && canAct && (
                <div className="border-t border-edge px-4 py-3 bg-surface-2 space-y-2">
                    <textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        placeholder="Resolution note (optional)..."
                        rows={2}
                        className="w-full bg-surface border border-edge rounded px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    />
                    <div className="flex gap-2 flex-wrap">
                        {dispute.status === "OPEN" && (
                            <Button size="sm" variant="secondary" disabled={pending} onClick={() => update("UNDER_REVIEW")}>
                                {pending ? "..." : "Mark Under Review"}
                            </Button>
                        )}
                        <Button size="sm" disabled={pending} onClick={() => update("RESOLVED")}>
                            {pending ? "..." : "Resolve"}
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            disabled={pending}
                            onClick={() => update("DISMISSED")}
                            className="text-muted"
                        >
                            {pending ? "..." : "Dismiss"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function DisputesPanel({ disputes }: { disputes: DisputeRow[] }) {
    const [filter, setFilter] = useState<DisputeStatusFilter | "ALL">("OPEN");

    const openCount = disputes.filter((d) => d.status === "OPEN").length;
    const displayed = filter === "ALL" ? disputes : disputes.filter((d) => d.status === filter);

    return (
        <div className="space-y-4">
            <div className="flex gap-1 bg-surface-2 rounded-lg p-1 w-fit flex-wrap">
                {FILTER_OPTIONS.map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => setFilter(value as DisputeStatusFilter | "ALL")}
                        className={cn(
                            "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
                            filter === value ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-dimmed",
                        )}
                    >
                        {label}
                        {value === "OPEN" && openCount > 0 && (
                            <span className="ml-1.5 bg-danger text-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                {openCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {displayed.length === 0 ? (
                <div className="bg-surface border border-edge rounded-lg p-8 text-center text-muted text-sm">
                    No disputes in this category.
                </div>
            ) : (
                <div className="space-y-2">
                    {displayed.map((d) => (
                        <DisputeCard key={d._id} dispute={d} />
                    ))}
                </div>
            )}
        </div>
    );
}
