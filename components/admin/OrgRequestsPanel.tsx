"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import {
    OrgRequestRow,
    reviewOrgRequestAdminAction,
    updateOrgRequestDataAction,
} from "@/app/admin/actions";

type StatusFilter = "PENDING" | "APPROVED" | "REJECTED" | "ALL";

const STATUS_CFG = {
    PENDING:  { label: "Pending",  classes: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
    APPROVED: { label: "Approved", classes: "text-success bg-success/10 border-success/30" },
    REJECTED: { label: "Rejected", classes: "text-danger bg-danger/10 border-danger/30" },
};

function OrgRequestListItem({
    request,
    selected,
    onClick,
}: {
    request: OrgRequestRow;
    selected: boolean;
    onClick: () => void;
}) {
    const cfg = STATUS_CFG[request.status];
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
            <div
                className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0",
                    selected ? "bg-primary text-background" : "bg-secondary text-foreground",
                )}
            >
                {request.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={cn("text-sm font-semibold truncate", selected ? "text-primary" : "text-foreground")}>
                        {request.name}
                    </span>
                    <span className="text-[10px] font-mono text-muted">{request.slug}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn("text-[9px] font-bold px-1 py-0.5 rounded border uppercase", cfg.classes)}>
                        {cfg.label}
                    </span>
                    <span className="text-[10px] text-muted truncate">{request.userName}</span>
                </div>
            </div>
        </button>
    );
}

function OrgRequestDetail({
    request,
    adminRole,
}: {
    request: OrgRequestRow;
    adminRole: string;
}) {
    const router = useRouter();
    const [note, setNote] = useState(request.reviewNote ?? "");
    const [pending, start] = useTransition();

    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState(request.name);
    const [editSlug, setEditSlug] = useState(request.slug);
    const [editReason, setEditReason] = useState(request.reason ?? "");
    const [editPending, startEdit] = useTransition();

    const canReview = adminRole === "ADMIN" || adminRole === "MODERATOR";
    const canEdit = adminRole === "ADMIN";
    const cfg = STATUS_CFG[request.status];

    function review(status: "APPROVED" | "REJECTED") {
        start(async () => {
            await reviewOrgRequestAdminAction(request._id, status, note || undefined);
            router.refresh();
        });
    }

    function saveEdit() {
        startEdit(async () => {
            await updateOrgRequestDataAction(request._id, {
                name: editName,
                slug: editSlug,
                reason: editReason || undefined,
            });
            setEditing(false);
            router.refresh();
        });
    }

    return (
        <div className="p-4 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-black text-foreground">{request.name}</h2>
                        <span className="text-xs font-mono text-muted">[{request.slug}]</span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">{formatTimeAgo(new Date(request.createdAt))}</p>
                </div>
                <span className={cn("text-xs font-bold px-2 py-1 rounded-full border shrink-0", cfg.classes)}>
                    {cfg.label}
                </span>
            </div>

            {/* Submitter */}
            <div className="border-t border-edge pt-4">
                <p className="text-[10px] text-muted uppercase tracking-widest mb-2">Submitted By</p>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-black text-foreground shrink-0">
                        {request.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{request.userName}</p>
                        <p className="text-xs text-muted truncate">{request.userEmail}</p>
                    </div>
                </div>
            </div>

            {/* Request details */}
            <div className="border-t border-edge pt-4 space-y-3">
                <p className="text-[10px] text-muted uppercase tracking-widest">Request Details</p>
                <div>
                    <p className="text-[10px] text-muted uppercase mb-0.5">Org Name</p>
                    <p className="text-sm text-foreground">{request.name}</p>
                </div>
                <div>
                    <p className="text-[10px] text-muted uppercase mb-0.5">Slug</p>
                    <p className="text-sm font-mono text-foreground">{request.slug}</p>
                </div>
                {request.reason ? (
                    <div>
                        <p className="text-[10px] text-muted uppercase mb-0.5">Reason</p>
                        <p className="text-sm text-dimmed">{request.reason}</p>
                    </div>
                ) : (
                    <div>
                        <p className="text-[10px] text-muted uppercase mb-0.5">Reason</p>
                        <p className="text-sm text-muted italic">None provided</p>
                    </div>
                )}
            </div>

            {/* Existing review note */}
            {request.reviewNote && request.status !== "PENDING" && (
                <div className="border-t border-edge pt-4">
                    <p className="text-[10px] text-muted uppercase tracking-widest mb-1">Review Note</p>
                    <p className="text-sm text-dimmed italic">{request.reviewNote}</p>
                </div>
            )}

            {/* Review actions — moderator+ only, pending only */}
            {canReview && request.status === "PENDING" && (
                <div className="border-t border-edge pt-4 space-y-2">
                    <p className="text-[10px] text-muted uppercase tracking-widest">Review</p>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Review note (optional)..."
                        rows={2}
                        className="w-full bg-surface border border-edge rounded px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    />
                    <div className="flex gap-2">
                        <Button size="sm" disabled={pending} onClick={() => review("APPROVED")} className="flex-1">
                            {pending ? "Saving..." : "Approve"}
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            disabled={pending}
                            onClick={() => review("REJECTED")}
                            className="flex-1 text-danger border-danger/20 hover:border-danger/40"
                        >
                            {pending ? "Saving..." : "Reject"}
                        </Button>
                    </div>
                </div>
            )}

            {/* Edit data — admin only */}
            {canEdit && (
                <div className="border-t border-edge pt-4">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] text-muted uppercase tracking-widest">Edit Request Data</p>
                        {!editing && (
                            <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                                Edit
                            </Button>
                        )}
                    </div>

                    {editing && (
                        <div className="space-y-2">
                            <div>
                                <label className="text-[10px] text-muted uppercase block mb-1">Org Name</label>
                                <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full bg-surface border border-edge rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-muted uppercase block mb-1">Slug</label>
                                <input
                                    value={editSlug}
                                    onChange={(e) => setEditSlug(e.target.value)}
                                    className="w-full bg-surface border border-edge rounded px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-muted uppercase block mb-1">Reason</label>
                                <textarea
                                    value={editReason}
                                    onChange={(e) => setEditReason(e.target.value)}
                                    rows={3}
                                    className="w-full bg-surface border border-edge rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" disabled={editPending} onClick={saveEdit} className="flex-1">
                                    {editPending ? "Saving..." : "Save Changes"}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function OrgRequestsPanel({
    requests,
    adminRole,
}: {
    requests: OrgRequestRow[];
    adminRole: string;
}) {
    const [filter, setFilter] = useState<StatusFilter>("PENDING");
    const [selectedId, setSelectedId] = useState<string | null>(requests[0]?._id ?? null);

    const filtered = filter === "ALL" ? requests : requests.filter((r) => r.status === filter);
    const pendingCount = requests.filter((r) => r.status === "PENDING").length;
    const selectedRequest = requests.find((r) => r._id === selectedId) ?? null;

    return (
        <div className="grid grid-cols-2 gap-4 items-start">
            {/* Left: request list */}
            <div className="flex flex-col gap-3">
                {/* Filter tabs */}
                <div className="flex gap-1 bg-surface-2 rounded-lg p-1 w-fit">
                    {(["PENDING", "APPROVED", "REJECTED", "ALL"] as StatusFilter[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={cn(
                                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors relative",
                                filter === s ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-dimmed",
                            )}
                        >
                            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                            {s === "PENDING" && pendingCount > 0 && (
                                <span className="ml-1.5 bg-amber-400 text-background text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="max-h-[70vh] overflow-y-auto space-y-1 pr-0.5">
                    {filtered.length === 0 ? (
                        <p className="text-xs text-muted text-center py-8">No requests found.</p>
                    ) : (
                        filtered.map((req) => (
                            <OrgRequestListItem
                                key={req._id}
                                request={req}
                                selected={selectedId === req._id}
                                onClick={() => setSelectedId(req._id)}
                            />
                        ))
                    )}
                </div>

                <p className="text-xs text-muted">
                    {filtered.length} request{filtered.length !== 1 ? "s" : ""}
                </p>
            </div>

            {/* Right: detail panel */}
            <div className="bg-surface border border-edge rounded-xl overflow-hidden max-h-[70vh] overflow-y-auto sticky top-4">
                {selectedRequest ? (
                    <OrgRequestDetail
                        key={selectedRequest._id}
                        request={selectedRequest}
                        adminRole={adminRole}
                    />
                ) : (
                    <div className="flex items-center justify-center h-48 text-muted text-sm">
                        Select a request to view details.
                    </div>
                )}
            </div>
        </div>
    );
}
