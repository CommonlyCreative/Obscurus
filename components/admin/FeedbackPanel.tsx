"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import {
    FeedbackRow,
    FeedbackStatusFilter,
    FeedbackTypeFilter,
    updateFeedbackStatusAction,
} from "@/app/admin/actions";

const TYPE_BADGE: Record<FeedbackRow["type"], { label: string; classes: string }> = {
    BUG:        { label: "Bug",        classes: "text-danger bg-danger/10 border-danger/30" },
    SUGGESTION: { label: "Suggestion", classes: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30" },
    CRITICISM:  { label: "Criticism",  classes: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
    OTHER:      { label: "Other",      classes: "text-muted bg-surface-2 border-edge" },
};

const STATUS_BADGE: Record<FeedbackRow["status"], string> = {
    OPEN:     "text-success bg-success/10 border-success/30",
    REVIEWED: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30",
    CLOSED:   "text-muted bg-surface-2 border-edge",
};

function FeedbackCard({ item }: { item: FeedbackRow }) {
    const router = useRouter();
    const [expanded, setExpanded] = useState(false);
    const [open, setOpen] = useState(false);
    const [note, setNote] = useState(item.adminNote ?? "");
    const [pending, start] = useTransition();

    function update(status: FeedbackStatusFilter) {
        start(async () => {
            await updateFeedbackStatusAction(item._id, status, note || undefined);
            setOpen(false);
            router.refresh();
        });
    }

    const typeCfg = TYPE_BADGE[item.type];
    const canAct = item.status !== "CLOSED";

    return (
        <div className="bg-surface border border-edge rounded-lg overflow-hidden">
            <div className="px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase", typeCfg.classes)}>
                                {typeCfg.label}
                            </span>
                            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase", STATUS_BADGE[item.status])}>
                                {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                            </span>
                            {item.userName && (
                                <span className="text-xs text-dimmed">{item.userName}</span>
                            )}
                            {!item.userName && (
                                <span className="text-xs text-muted italic">Anonymous</span>
                            )}
                            <span className="text-xs text-muted">{formatTimeAgo(new Date(item.createdAt))}</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <p className={cn("text-xs text-dimmed mt-1 leading-relaxed", !expanded && "line-clamp-2")}>
                            {item.body}
                        </p>
                        {item.body.length > 120 && (
                            <button
                                onClick={() => setExpanded((e) => !e)}
                                className="text-xs text-muted hover:text-primary mt-1 transition-colors"
                            >
                                {expanded ? "Show less" : "Show more"}
                            </button>
                        )}
                        {item.adminNote && (
                            <p className="text-xs text-muted mt-2 italic border-l-2 border-edge pl-2">
                                Note: {item.adminNote}
                            </p>
                        )}
                    </div>
                    <div className="shrink-0">
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
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Admin note (optional)..."
                        rows={2}
                        className="w-full bg-surface border border-edge rounded px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    />
                    <div className="flex gap-2 flex-wrap">
                        {item.status === "OPEN" && (
                            <Button size="sm" variant="secondary" disabled={pending} onClick={() => update("REVIEWED")}>
                                {pending ? "..." : "Mark Reviewed"}
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="secondary"
                            disabled={pending}
                            onClick={() => update("CLOSED")}
                            className="text-muted"
                        >
                            {pending ? "..." : "Close"}
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

const TYPE_FILTERS: { value: FeedbackTypeFilter | "ALL"; label: string }[] = [
    { value: "ALL",        label: "All Types" },
    { value: "BUG",        label: "Bugs" },
    { value: "SUGGESTION", label: "Suggestions" },
    { value: "CRITICISM",  label: "Criticism" },
    { value: "OTHER",      label: "Other" },
];

const STATUS_FILTERS: { value: FeedbackStatusFilter | "ALL"; label: string }[] = [
    { value: "ALL",      label: "All" },
    { value: "OPEN",     label: "Open" },
    { value: "REVIEWED", label: "Reviewed" },
    { value: "CLOSED",   label: "Closed" },
];

export function FeedbackPanel({ feedback }: { feedback: FeedbackRow[] }) {
    const [typeFilter, setTypeFilter] = useState<FeedbackTypeFilter | "ALL">("ALL");
    const [statusFilter, setStatusFilter] = useState<FeedbackStatusFilter | "ALL">("OPEN");

    const openCount = feedback.filter((f) => f.status === "OPEN").length;

    const displayed = feedback.filter((f) => {
        const typeOk = typeFilter === "ALL" || f.type === typeFilter;
        const statusOk = statusFilter === "ALL" || f.status === statusFilter;
        return typeOk && statusOk;
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex gap-1 bg-surface-2 rounded-lg p-1 w-fit">
                    {STATUS_FILTERS.map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => setStatusFilter(value as FeedbackStatusFilter | "ALL")}
                            className={cn(
                                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
                                statusFilter === value ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-dimmed",
                            )}
                        >
                            {label}
                            {value === "OPEN" && openCount > 0 && (
                                <span className="ml-1.5 bg-success text-background text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                    {openCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex gap-1 bg-surface-2 rounded-lg p-1 w-fit">
                    {TYPE_FILTERS.map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => setTypeFilter(value as FeedbackTypeFilter | "ALL")}
                            className={cn(
                                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
                                typeFilter === value ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-dimmed",
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {displayed.length === 0 ? (
                <div className="bg-surface border border-edge rounded-lg p-8 text-center text-muted text-sm">
                    No feedback in this category.
                </div>
            ) : (
                <div className="space-y-2">
                    {displayed.map((f) => (
                        <FeedbackCard key={f._id} item={f} />
                    ))}
                </div>
            )}
        </div>
    );
}
