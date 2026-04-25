"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import {
    getUserDetailAction,
    getUserFeedbackAction,
    getUserScrimsAction,
    changeUserRoleAction,
    updateUserDataAction,
    banUserAction,
    unbanUserAction,
    adminCancelScrimmageAction,
    UserDetail,
    UserFeedbackItem,
    UserScrimItem,
    UserEditableData,
} from "@/app/admin/actions";

// ─── Constants ──────────────────────────────────────────────────────────────

const ROLES = ["MEMBER", "SUPPORT", "MODERATOR", "ADMIN"] as const;
const REGIONS = ["NA", "EU", "SA", "ASIA", "OCE"] as const;

const ACTIVE_STATUSES = new Set(["OPEN", "PENDING", "READY", "SCHEDULING", "SCHEDULED", "ACTIVE"]);

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

const FB_TYPE_BADGE: Record<string, string> = {
    BUG:        "text-danger bg-danger/10 border-danger/30",
    SUGGESTION: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30",
    CRITICISM:  "text-amber-400 bg-amber-400/10 border-amber-400/30",
    OTHER:      "text-muted bg-surface-2 border-edge",
};

const FB_STATUS_BADGE: Record<string, string> = {
    OPEN:     "text-success bg-success/10 border-success/30",
    REVIEWED: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30",
    CLOSED:   "text-muted bg-surface-2 border-edge",
};

const ROLE_BADGE: Record<string, string> = {
    ADMIN:     "text-primary bg-primary/10 border-primary/30",
    MODERATOR: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30",
    SUPPORT:   "text-amber-400 bg-amber-400/10 border-amber-400/30",
    MEMBER:    "text-muted bg-surface-2 border-edge",
};

// ─── Sub-sections ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="border-t border-edge pt-4 mt-4">
            <p className="text-[10px] text-muted uppercase tracking-widest mb-3 font-semibold">{title}</p>
            {children}
        </div>
    );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <p className="text-[10px] text-muted uppercase tracking-wide mb-0.5">{label}</p>
            <p className="text-sm text-foreground font-medium">{value}</p>
        </div>
    );
}

// ─── Admin-only: Change Role ─────────────────────────────────────────────────

function RoleChanger({ userId, currentRole, onDone }: { userId: string; currentRole: string; onDone: () => void }) {
    const [role, setRole] = useState(currentRole);
    const [pending, start] = useTransition();

    function save() {
        if (role === currentRole) return;
        start(async () => {
            await changeUserRoleAction(userId, role);
            onDone();
        });
    }

    return (
        <div className="flex items-center gap-2">
            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex-1 bg-surface-2 border border-edge rounded-md px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            >
                {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                ))}
            </select>
            <Button
                size="sm"
                disabled={pending || role === currentRole}
                onClick={save}
            >
                {pending ? "Saving..." : "Apply"}
            </Button>
        </div>
    );
}

// ─── Admin-only: Edit Data ───────────────────────────────────────────────────

function EditDataForm({ user, onDone }: { user: UserDetail; onDone: () => void }) {
    const [form, setForm] = useState<UserEditableData>({
        name: user.name,
        bio: user.bio,
        region: user.region,
        mmr: user.mmr,
        credits: user.balance.credits,
        pending: user.balance.pending,
        winnings: user.balance.winnings,
    });
    const [pending, start] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function patch<K extends keyof UserEditableData>(k: K, v: UserEditableData[K]) {
        setForm((f) => ({ ...f, [k]: v }));
    }

    function save() {
        setError(null);
        start(async () => {
            try {
                await updateUserDataAction(user._id, form);
                onDone();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to save.");
            }
        });
    }

    const inp = "w-full bg-surface border border-edge rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors";
    const numInp = inp + " [appearance:textfield]";

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-[10px] text-muted uppercase tracking-wide mb-1">Name</label>
                    <input value={form.name ?? ""} onChange={(e) => patch("name", e.target.value)} className={inp} />
                </div>
                <div>
                    <label className="block text-[10px] text-muted uppercase tracking-wide mb-1">Region</label>
                    <select
                        value={form.region ?? "NA"}
                        onChange={(e) => patch("region", e.target.value)}
                        className={inp}
                    >
                        {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-[10px] text-muted uppercase tracking-wide mb-1">Bio</label>
                <textarea
                    value={form.bio ?? ""}
                    onChange={(e) => patch("bio", e.target.value)}
                    rows={2}
                    className={inp + " resize-none"}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-[10px] text-muted uppercase tracking-wide mb-1">MMR</label>
                    <input type="number" value={form.mmr ?? 0} onChange={(e) => patch("mmr", Number(e.target.value))} className={numInp} />
                </div>
                <div>
                    <label className="block text-[10px] text-muted uppercase tracking-wide mb-1">Credits</label>
                    <input type="number" value={form.credits ?? 0} onChange={(e) => patch("credits", Number(e.target.value))} className={numInp} />
                </div>
                <div>
                    <label className="block text-[10px] text-muted uppercase tracking-wide mb-1">Pending</label>
                    <input type="number" value={form.pending ?? 0} onChange={(e) => patch("pending", Number(e.target.value))} className={numInp} />
                </div>
                <div>
                    <label className="block text-[10px] text-muted uppercase tracking-wide mb-1">Winnings</label>
                    <input type="number" value={form.winnings ?? 0} onChange={(e) => patch("winnings", Number(e.target.value))} className={numInp} />
                </div>
            </div>

            {error && (
                <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded px-3 py-2">{error}</p>
            )}

            <Button size="sm" disabled={pending} onClick={save} className="w-full">
                {pending ? "Saving..." : "Save Changes"}
            </Button>
        </div>
    );
}

// ─── Ban card ────────────────────────────────────────────────────────────────

function BanCard({ user, onDone }: { user: UserDetail; onDone: () => void }) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState(user.banReason ?? "");
    const [pending, start] = useTransition();

    function handleBan() {
        start(async () => {
            await banUserAction(user._id, reason || undefined);
            setOpen(false);
            onDone();
        });
    }

    function handleUnban() {
        start(async () => {
            await unbanUserAction(user._id);
            onDone();
        });
    }

    return (
        <div>
            {user.banned ? (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-danger/5 border border-danger/20 rounded-md">
                        <span className="text-xs text-danger font-semibold">Banned</span>
                        {user.banReason && <span className="text-xs text-muted">— {user.banReason}</span>}
                    </div>
                    <Button
                        size="sm"
                        variant="secondary"
                        disabled={pending}
                        onClick={handleUnban}
                        className="w-full"
                    >
                        {pending ? "..." : "Unban User"}
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    {open ? (
                        <>
                            <input
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Ban reason (optional)..."
                                className="w-full bg-surface-2 border border-edge rounded px-2 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                            />
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    disabled={pending}
                                    onClick={handleBan}
                                    className="flex-1 bg-danger text-foreground hover:opacity-80"
                                >
                                    {pending ? "..." : "Confirm Ban"}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </>
                    ) : (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setOpen(true)}
                            className="w-full text-danger border-danger/20 hover:border-danger/40"
                        >
                            Ban User
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Scrim cancel inline ─────────────────────────────────────────────────────

function ScrimCancelButton({ scrimId, onDone }: { scrimId: string; onDone: () => void }) {
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
            <button
                onClick={() => setOpen(true)}
                className="text-[10px] text-danger hover:underline font-semibold"
            >
                Cancel
            </button>
        );
    }

    return (
        <div className="mt-1.5 flex gap-1.5">
            <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason..."
                className="flex-1 bg-surface border border-edge rounded px-2 py-1 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50"
            />
            <button
                disabled={pending}
                onClick={cancel}
                className="text-[10px] text-danger font-semibold px-2 py-1 border border-danger/30 rounded hover:bg-danger/10 transition-colors"
            >
                {pending ? "..." : "Confirm"}
            </button>
            <button
                onClick={() => setOpen(false)}
                className="text-[10px] text-muted hover:text-foreground px-1"
            >
                ✕
            </button>
        </div>
    );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function UserDetailPanel({ userId, adminRole }: { userId: string; adminRole: string }) {
    const router = useRouter();
    const isAdmin = adminRole === "ADMIN";

    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState<UserDetail | null>(null);
    const [feedback, setFeedback] = useState<UserFeedbackItem[]>([]);
    const [scrims, setScrims] = useState<UserScrimItem[]>([]);
    const [editOpen, setEditOpen] = useState(false);

    async function loadAll(uid: string) {
        setLoading(true);
        setEditOpen(false);
        const [d, f, s] = await Promise.all([
            getUserDetailAction(uid),
            getUserFeedbackAction(uid),
            getUserScrimsAction(uid),
        ]);
        setDetail(d);
        setFeedback(f);
        setScrims(s);
        setLoading(false);
    }

    useEffect(() => {
        loadAll(userId);
    }, [userId]);

    function refresh() {
        loadAll(userId);
        router.refresh();
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48 text-muted text-sm">
                <div className="w-5 h-5 rounded-full border-2 border-edge border-t-primary animate-spin" />
            </div>
        );
    }

    if (!detail) {
        return (
            <div className="flex items-center justify-center h-48 text-muted text-sm">
                User not found.
            </div>
        );
    }

    const activeScrim = scrims.find((s) => ACTIVE_STATUSES.has(s.status));
    const recentScrims = scrims.filter((s) => !ACTIVE_STATUSES.has(s.status)).slice(0, 5);

    const bestOf = (b: string) =>
        b === "ONE" ? "Bo1" : b === "THREE" ? "Bo3" : b === "FIVE" ? "Bo5" : b;

    return (
        <div className="p-5">
            {/* ── Profile Header ── */}
            <div className="flex items-start gap-3 mb-2">
                <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-lg font-black text-foreground shrink-0">
                    {detail.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-black text-foreground">{detail.name}</h2>
                        <span
                            className={cn(
                                "text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase",
                                ROLE_BADGE[detail.role] ?? ROLE_BADGE.MEMBER,
                            )}
                        >
                            {detail.role}
                        </span>
                        {detail.banned && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border text-danger bg-danger/10 border-danger/30 uppercase">
                                Banned
                            </span>
                        )}
                        <span
                            className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                detail.online ? "bg-success" : "bg-muted",
                            )}
                            title={detail.online ? "Online" : "Offline"}
                        />
                    </div>
                    <p className="text-xs text-muted mt-0.5">{detail.email}</p>
                    <p className="text-xs text-muted">
                        Joined {formatTimeAgo(new Date(detail.createdAt))}
                    </p>
                </div>
                <Button size="sm" variant="ghost" href={`/profile/${detail._id}`} className="shrink-0 ml-auto">
                    Profile
                </Button>
            </div>

            {/* ── Quick stats ── */}
            <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="bg-surface-2 rounded-md px-3 py-2 text-center">
                    <p className="text-[10px] text-muted uppercase tracking-wide">MMR</p>
                    <p className="text-sm font-bold text-foreground">{detail.mmr.toLocaleString()}</p>
                </div>
                <div className="bg-surface-2 rounded-md px-3 py-2 text-center">
                    <p className="text-[10px] text-muted uppercase tracking-wide">Region</p>
                    <p className="text-sm font-bold text-foreground">{detail.region || "—"}</p>
                </div>
                <div className="bg-surface-2 rounded-md px-3 py-2 text-center">
                    <p className="text-[10px] text-muted uppercase tracking-wide">Credits</p>
                    <p className="text-sm font-bold text-foreground">{detail.balance.credits}</p>
                </div>
            </div>

            {detail.bio && (
                <p className="text-xs text-dimmed mt-3 leading-relaxed border-l-2 border-edge pl-3">
                    {detail.bio}
                </p>
            )}

            {detail.organization && (
                <p className="text-xs text-muted mt-2">
                    Org: <span className="text-foreground font-medium">{detail.organization}</span>
                </p>
            )}

            {/* ── Admin-only actions ── */}
            {isAdmin && (
                <Section title="Admin Actions">
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-dimmed mb-1.5 font-medium">Role</p>
                            <RoleChanger userId={detail._id} currentRole={detail.role} onDone={refresh} />
                        </div>
                        <div>
                            <p className="text-xs text-dimmed mb-1.5 font-medium">Account Status</p>
                            <BanCard user={detail} onDone={refresh} />
                        </div>
                    </div>
                </Section>
            )}

            {/* ── Admin-only: edit data ── */}
            {isAdmin && (
                <Section title="Edit Data">
                    <button
                        onClick={() => setEditOpen((o) => !o)}
                        className="text-xs text-muted hover:text-foreground transition-colors mb-3 flex items-center gap-1"
                    >
                        <span>{editOpen ? "▾" : "▸"}</span>
                        {editOpen ? "Collapse" : "Expand to edit user data"}
                    </button>
                    {editOpen && (
                        <EditDataForm user={detail} onDone={refresh} />
                    )}
                </Section>
            )}

            {/* ── Active scrim ── */}
            {activeScrim && (
                <Section title="Current Scrimmage">
                    <div className="bg-surface-2 border border-primary/20 rounded-md px-3 py-2.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span
                                    className={cn(
                                        "text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase",
                                        STATUS_BADGE[activeScrim.status] ?? "text-muted bg-surface-2 border-edge",
                                    )}
                                >
                                    {activeScrim.status}
                                </span>
                                <span className="text-xs text-muted font-mono">
                                    {activeScrim._id.slice(-8)}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button size="sm" variant="ghost" href={`/scrims/${activeScrim._id}`}>
                                    View
                                </Button>
                                <ScrimCancelButton scrimId={activeScrim._id} onDone={refresh} />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-1.5 text-xs text-muted">
                            {activeScrim.region && <span>{activeScrim.region}</span>}
                            {activeScrim.bestOf && <span>{bestOf(activeScrim.bestOf)}</span>}
                            {activeScrim.wagerAmount > 0 && (
                                <span className="text-primary font-semibold">{activeScrim.wagerAmount} cr</span>
                            )}
                        </div>
                    </div>
                </Section>
            )}

            {/* ── Recent scrims ── */}
            <Section title="Scrim History">
                {recentScrims.length === 0 && !activeScrim ? (
                    <p className="text-xs text-muted">No scrimmages found.</p>
                ) : recentScrims.length === 0 ? (
                    <p className="text-xs text-muted">No completed scrims yet.</p>
                ) : (
                    <div className="space-y-1.5">
                        {recentScrims.map((s) => (
                            <div
                                key={s._id}
                                className="flex items-center justify-between py-1.5 border-b border-edge last:border-0"
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            "text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase",
                                            STATUS_BADGE[s.status] ?? "text-muted bg-surface-2 border-edge",
                                        )}
                                    >
                                        {s.status}
                                    </span>
                                    <span className="text-xs text-muted font-mono">{s._id.slice(-8)}</span>
                                    {s.isHost && <span className="text-[10px] text-primary">host</span>}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-muted">
                                        {formatTimeAgo(new Date(s.createdAt))}
                                    </span>
                                    <Button size="sm" variant="ghost" href={`/scrims/${s._id}`}>
                                        View
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Section>

            {/* ── Feedback reports ── */}
            <Section title="Feedback Reports">
                {feedback.length === 0 ? (
                    <p className="text-xs text-muted">No feedback submitted.</p>
                ) : (
                    <div className="space-y-2">
                        {feedback.map((f) => (
                            <div key={f._id} className="bg-surface-2 rounded-md px-3 py-2">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span
                                        className={cn(
                                            "text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase",
                                            FB_TYPE_BADGE[f.type] ?? "",
                                        )}
                                    >
                                        {f.type}
                                    </span>
                                    <span
                                        className={cn(
                                            "text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase",
                                            FB_STATUS_BADGE[f.status] ?? "",
                                        )}
                                    >
                                        {f.status}
                                    </span>
                                    <span className="text-[10px] text-muted ml-auto">
                                        {formatTimeAgo(new Date(f.createdAt))}
                                    </span>
                                </div>
                                <p className="text-xs font-semibold text-foreground">{f.title}</p>
                                <p className="text-xs text-dimmed mt-0.5 line-clamp-2 leading-relaxed">
                                    {f.body}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </Section>
        </div>
    );
}
