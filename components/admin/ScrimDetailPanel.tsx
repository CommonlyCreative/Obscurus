"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn, formatTimeAgo } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import {
    getScrimDetailAction,
    adminUpdateScrimmageAction,
    adminCancelScrimmageAction,
    ScrimDetailRow,
} from "@/app/admin/actions";

// ─── Constants ───────────────────────────────────────────────────────────────

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

const INV_STATUS_BADGE: Record<string, string> = {
    PENDING:  "text-amber-400 bg-amber-400/10 border-amber-400/30",
    ACCEPTED: "text-success bg-success/10 border-success/30",
    DECLINED: "text-danger bg-danger/10 border-danger/30",
};

const RESULT_BADGE: Record<string, string> = {
    HOST_WIN:     "text-primary bg-primary/10 border-primary/30",
    OPPONENT_WIN: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30",
    DRAW:         "text-muted bg-surface-2 border-edge",
    CANCELLED:    "text-danger bg-danger/10 border-danger/30",
};

const ALL_STATUSES = ["OPEN", "PENDING", "READY", "SCHEDULING", "SCHEDULED", "ACTIVE", "COMPLETED", "CANCELLED"];

// ─── Layout helpers ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="border-t border-edge pt-4 mt-4">
            <p className="text-[10px] text-muted uppercase tracking-widest mb-3 font-semibold">{title}</p>
            {children}
        </div>
    );
}

// ─── Team column ─────────────────────────────────────────────────────────────

function TeamColumn({
    label,
    teamName,
    leaderId,
    leaderName,
    members,
}: {
    label: string;
    teamName: string | null;
    leaderId: string | null;
    leaderName: string | null;
    members: { _id: string; name: string }[];
}) {
    return (
        <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted uppercase tracking-widest mb-2 font-semibold">{label}</p>
            {teamName && <p className="text-xs font-bold text-foreground mb-1">{teamName}</p>}
            <div className="space-y-0.5">
                {members.map((m) => (
                    <p key={m._id} className="text-xs text-dimmed flex items-center gap-1">
                        <span>{m.name}</span>
                        {m._id === leaderId && (
                            <span className="text-[9px] text-primary font-semibold">captain</span>
                        )}
                    </p>
                ))}
                {members.length === 0 && !leaderName && (
                    <p className="text-xs text-muted italic">No roster set</p>
                )}
            </div>
        </div>
    );
}

// ─── Admin/Mod: reschedule ───────────────────────────────────────────────────

function RescheduleForm({ scrim, onDone }: { scrim: ScrimDetailRow; onDone: () => void }) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(() => {
        if (!scrim.scheduledAt) return "";
        return new Date(scrim.scheduledAt - new Date().getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
    });
    const [pending, start] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function save() {
        setError(null);
        const ts = value ? new Date(value).getTime() : null;
        if (value && isNaN(ts!)) { setError("Invalid date."); return; }
        start(async () => {
            try {
                await adminUpdateScrimmageAction(scrim._id, { scheduledAt: ts });
                setOpen(false);
                onDone();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to update.");
            }
        });
    }

    const inp = "w-full bg-surface border border-edge rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors";

    if (!open) {
        return (
            <button onClick={() => setOpen(true)} className="text-xs text-muted hover:text-foreground transition-colors flex items-center gap-1">
                <span>▸</span> Set / change time
            </button>
        );
    }

    return (
        <div className="space-y-2">
            <button onClick={() => { setOpen(false); setError(null); }} className="text-xs text-muted hover:text-foreground transition-colors flex items-center gap-1">
                <span>▾</span> Set / change time
            </button>
            <input type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} className={inp} />
            {error && <p className="text-xs text-danger">{error}</p>}
            <p className="text-[10px] text-muted">Saving will notify all team members and update their Google Calendars.</p>
            <div className="flex gap-2">
                <Button size="sm" disabled={pending} onClick={save}>{pending ? "Saving..." : "Save"}</Button>
                <Button size="sm" variant="ghost" onClick={() => { setOpen(false); setError(null); }}>Cancel</Button>
            </div>
        </div>
    );
}

// ─── Admin/Mod: change status ────────────────────────────────────────────────

function StatusChanger({ scrim, onDone }: { scrim: ScrimDetailRow; onDone: () => void }) {
    const [status, setStatus] = useState(scrim.status);
    const [pending, start] = useTransition();

    function apply() {
        if (status === scrim.status) return;
        start(async () => {
            await adminUpdateScrimmageAction(scrim._id, { status });
            onDone();
        });
    }

    return (
        <div className="flex items-center gap-2">
            <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex-1 bg-surface-2 border border-edge rounded-md px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            >
                {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <Button size="sm" disabled={pending || status === scrim.status} onClick={apply}>
                {pending ? "..." : "Apply"}
            </Button>
        </div>
    );
}

// ─── Admin/Mod: cancel ───────────────────────────────────────────────────────

function CancelScrimButton({ scrimId, onDone }: { scrimId: string; onDone: () => void }) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [pending, start] = useTransition();

    function cancel() {
        start(async () => {
            await adminCancelScrimmageAction(scrimId, reason || undefined);
            setOpen(false);
            onDone();
        });
    }

    if (!open) {
        return (
            <Button size="sm" variant="secondary" onClick={() => setOpen(true)} className="w-full text-danger border-danger/20 hover:border-danger/40">
                Cancel Scrimmage
            </Button>
        );
    }

    return (
        <div className="space-y-2">
            <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (optional)..."
                className="w-full bg-surface-2 border border-edge rounded px-2 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
            />
            <div className="flex gap-2">
                <Button size="sm" disabled={pending} onClick={cancel} className="bg-danger text-foreground hover:opacity-80">
                    {pending ? "..." : "Confirm Cancel"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Back</Button>
            </div>
        </div>
    );
}

// ─── Main panel ──────────────────────────────────────────────────────────────

export function ScrimDetailPanel({ scrimId, adminRole }: { scrimId: string; adminRole: string }) {
    const router = useRouter();
    const canModify = adminRole === "ADMIN" || adminRole === "MODERATOR";

    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState<ScrimDetailRow | null>(null);

    async function load(id: string) {
        setLoading(true);
        const d = await getScrimDetailAction(id);
        setDetail(d);
        setLoading(false);
    }

    useEffect(() => { load(scrimId); }, [scrimId]);

    function refresh() {
        load(scrimId);
        router.refresh();
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="w-5 h-5 rounded-full border-2 border-edge border-t-primary animate-spin" />
            </div>
        );
    }

    if (!detail) {
        return (
            <div className="flex items-center justify-center h-48 text-muted text-sm">
                Scrimmage not found.
            </div>
        );
    }

    const canCancel = !["COMPLETED", "CANCELLED"].includes(detail.status);
    const bestOfLabel = detail.bestOf === "ONE" ? "Bo1" : detail.bestOf === "THREE" ? "Bo3" : detail.bestOf === "FIVE" ? "Bo5" : "Open";

    return (
        <div className="p-5">
            {/* ── Header ── */}
            <div className="flex items-start gap-3 mb-2">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase", STATUS_BADGE[detail.status] ?? "text-muted bg-surface-2 border-edge")}>
                            {detail.status}
                        </span>
                        {detail.isPrivate && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase text-muted bg-surface-2 border-edge">
                                Private
                            </span>
                        )}
                        <span className="text-xs text-muted font-mono">#{detail._id.slice(-10)}</span>
                    </div>
                    <p className="text-[11px] text-muted mt-1">
                        Created {formatTimeAgo(new Date(detail.createdAt))}
                        {detail.updatedAt !== detail.createdAt && ` · Updated ${formatTimeAgo(new Date(detail.updatedAt))}`}
                    </p>
                </div>
                <Button size="sm" variant="ghost" href={`/scrims/${detail._id}`} className="shrink-0">
                    View
                </Button>
            </div>

            {/* ── Quick stats ── */}
            <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="bg-surface-2 rounded-md px-3 py-2 text-center">
                    <p className="text-[10px] text-muted uppercase tracking-wide">Region</p>
                    <p className="text-sm font-bold text-foreground">{detail.region || "—"}</p>
                </div>
                <div className="bg-surface-2 rounded-md px-3 py-2 text-center">
                    <p className="text-[10px] text-muted uppercase tracking-wide">Best Of</p>
                    <p className="text-sm font-bold text-foreground">{bestOfLabel}</p>
                </div>
                <div className="bg-surface-2 rounded-md px-3 py-2 text-center">
                    <p className="text-[10px] text-muted uppercase tracking-wide">Wager</p>
                    <p className={cn("text-sm font-bold", detail.wagerAmount > 0 ? "text-primary" : "text-muted")}>
                        {detail.wagerAmount > 0 ? `${detail.wagerAmount} cr` : "—"}
                    </p>
                </div>
            </div>

            {/* ── Ready state ── */}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                <span>Ready:</span>
                <span className={cn("font-medium", detail.readyHost ? "text-success" : "text-muted")}>
                    Host {detail.readyHost ? "✓" : "✗"}
                </span>
                <span className={cn("font-medium", detail.readyOpponent ? "text-success" : "text-muted")}>
                    Opponent {detail.readyOpponent ? "✓" : "✗"}
                </span>
            </div>

            {/* ── Note ── */}
            {detail.note && (
                <p className="text-xs text-dimmed mt-3 leading-relaxed border-l-2 border-edge pl-3">
                    {detail.note}
                </p>
            )}

            {/* ── Party code ── */}
            {detail.partyCode && (
                <p className="text-xs text-muted mt-2">
                    Party code: <span className="text-foreground font-mono font-bold">{detail.partyCode}</span>
                </p>
            )}

            {/* ── Result ── */}
            {detail.result && (
                <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-muted">Result:</span>
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase", RESULT_BADGE[detail.result] ?? "text-muted bg-surface-2 border-edge")}>
                        {detail.result.replace("_", " ")}
                    </span>
                </div>
            )}

            {/* ── Schedule ── */}
            {detail.scheduledAt && (
                <Section title="Schedule">
                    <p className="text-sm font-semibold text-foreground">
                        {new Date(detail.scheduledAt).toLocaleString("en-US", {
                            weekday: "short", month: "short", day: "numeric",
                            year: "numeric", hour: "numeric", minute: "2-digit",
                        })}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                        {new Date(detail.scheduledAt) > new Date()
                            ? `Upcoming — ${formatTimeAgo(new Date(detail.scheduledAt))} from now`
                            : `Was ${formatTimeAgo(new Date(detail.scheduledAt))} ago`}
                    </p>
                </Section>
            )}

            {/* ── Teams ── */}
            <Section title="Teams">
                <div className="flex gap-4">
                    <TeamColumn
                        label={detail.hostOrgName ? `Host · ${detail.hostOrgName}` : "Host"}
                        teamName={detail.hostTeamName}
                        leaderId={detail.hostTeamLeaderId}
                        leaderName={detail.hostTeamLeaderName}
                        members={detail.hostTeamMembers}
                    />
                    <div className="w-px bg-edge shrink-0" />
                    {detail.opponentTeamMembers.length > 0 ? (
                        <TeamColumn
                            label={detail.opponentOrgName ? `Opponent · ${detail.opponentOrgName}` : "Opponent"}
                            teamName={detail.opponentTeamName}
                            leaderId={detail.opponentTeamLeaderId}
                            leaderName={detail.opponentTeamLeaderName}
                            members={detail.opponentTeamMembers}
                        />
                    ) : (
                        <div className="flex-1">
                            <p className="text-[10px] text-muted uppercase tracking-widest mb-2 font-semibold">
                                {detail.opponentOrgName ? `Opponent · ${detail.opponentOrgName}` : "Opponent"}
                            </p>
                            <p className="text-xs text-muted italic">Awaiting opponent</p>
                        </div>
                    )}
                </div>
            </Section>

            {/* ── Invitations ── */}
            {detail.invitations.length > 0 && (
                <Section title={`Invitations (${detail.invitations.length})`}>
                    <div className="space-y-1">
                        {detail.invitations.map((inv, i) => (
                            <div key={i} className="flex items-center gap-2 py-1.5 border-b border-edge last:border-0">
                                <span className={cn(
                                    "text-[9px] font-bold px-1 py-0.5 rounded border uppercase shrink-0 w-14 text-center",
                                    INV_STATUS_BADGE[inv.status] ?? "text-muted bg-surface-2 border-edge",
                                )}>
                                    {inv.status}
                                </span>
                                <span className="text-xs text-foreground font-medium truncate min-w-0 flex-1">
                                    {inv.userName}
                                </span>
                                <span className="text-[10px] text-dimmed shrink-0">{inv.side}</span>
                                <span className="text-[9px] text-muted shrink-0">{inv.type.replace(/_/g, " ")}</span>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* ── Match history ── */}
            {detail.matches.length > 0 && (
                <Section title={`Matches (${detail.matches.length})`}>
                    <div className="space-y-1.5">
                        {detail.matches.map((m) => (
                            <div key={m.number} className="flex items-center gap-2 py-1 border-b border-edge last:border-0">
                                <span className="text-[10px] text-muted font-mono w-14 shrink-0">Game {m.number}</span>
                                {m.result ? (
                                    <span className={cn("text-[9px] font-bold px-1 py-0.5 rounded border uppercase shrink-0", RESULT_BADGE[m.result] ?? "text-muted bg-surface-2 border-edge")}>
                                        {m.result.replace(/_/g, " ")}
                                    </span>
                                ) : (
                                    <span className="text-[9px] text-muted italic">In progress</span>
                                )}
                                {m.match_id && (
                                    <span className="text-[10px] text-muted font-mono ml-auto truncate">#{m.match_id}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* ── Admin/Mod actions ── */}
            {canModify && (
                <Section title="Admin Actions">
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-dimmed mb-1.5 font-medium">Status</p>
                            <StatusChanger scrim={detail} onDone={refresh} />
                        </div>
                        <div>
                            <p className="text-xs text-dimmed mb-1.5 font-medium">Scheduled Time</p>
                            <RescheduleForm scrim={detail} onDone={refresh} />
                        </div>
                        {canCancel && (
                            <div>
                                <p className="text-xs text-dimmed mb-1.5 font-medium">Cancel</p>
                                <CancelScrimButton scrimId={detail._id} onDone={refresh} />
                            </div>
                        )}
                    </div>
                </Section>
            )}
        </div>
    );
}
