"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { BestOf } from "@/app/api/graphql/types/graphql";
import { AdminOrgRow, adminCreateArtificialScrimAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const BEST_OF_OPTIONS: BestOf[] = [BestOf.One, BestOf.Three, BestOf.Five, BestOf.Unlimited];
const BEST_OF_LABEL: Record<BestOf, string> = {
    [BestOf.One]: "Bo1",
    [BestOf.Three]: "Bo3",
    [BestOf.Five]: "Bo5",
    [BestOf.Unlimited]: "Open",
};

function minDateTimeLocal(): string {
    return new Date(Date.now()).toISOString().slice(0, 16);
}

export function AdminScheduleMatchPanel({ organizations }: { organizations: AdminOrgRow[] }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const realOrgs = useMemo(() => organizations.filter((o) => !o.artificial), [organizations]);
    const artificialOrgs = useMemo(() => organizations.filter((o) => o.artificial), [organizations]);

    const [hostOrgId, setHostOrgId] = useState("");
    const [hostLeaderId, setHostLeaderId] = useState("");
    const [hostTeamIds, setHostTeamIds] = useState<Set<string>>(new Set());
    const [opponentTeamIds, setOpponentTeamIds] = useState<Set<string>>(new Set());
    const [opponentOrgId, setOpponentOrgId] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");
    const [bestOf, setBestOf] = useState<BestOf>(BestOf.One);
    const [note, setNote] = useState("");

    const [pending, start] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [created, setCreated] = useState<{ _id: string } | null>(null);

    const hostOrg = realOrgs.find((o) => o._id === hostOrgId) ?? null;
    const opponentOrg = artificialOrgs.find((o) => o._id === opponentOrgId) ?? null;
    const hostActiveMembers = hostOrg?.members.filter((m) => m.status === "ACTIVE") ?? [];
    const opponentActiveMembers = opponentOrg?.members.filter((m) => m.status === "ACTIVE" && m.isPlayer) ?? [];
    const opponentActiveCount = opponentActiveMembers.length;

    function selectHostOrg(id: string) {
        setHostOrgId(id);
        setHostTeamIds(new Set());
        const org = realOrgs.find((o) => o._id === id);
        setHostLeaderId(org?.ownerId ?? "");
    }

    function toggleHostMember(id: string) {
        setHostTeamIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else if (next.size < 6) next.add(id);
            return next;
        });
    }

    function toggleOpponentMember(id: string) {
        setOpponentTeamIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else if (next.size < 6) next.add(id);
            return next;
        });
    }

    function reset() {
        setHostOrgId("");
        setHostLeaderId("");
        setHostTeamIds(new Set());
        setOpponentTeamIds(new Set());
        setOpponentOrgId("");
        setScheduledAt("");
        setBestOf(BestOf.One);
        setNote("");
        setError(null);
        setCreated(null);
    }

    const canSubmit = !!hostOrgId && !!hostLeaderId && hostTeamIds.size === 6 && opponentTeamIds.size === 6 && !!opponentOrgId && !!scheduledAt;

    function handleSchedule() {
        if (!canSubmit) return;
        setError(null);
        start(async () => {
            try {
                const result = await adminCreateArtificialScrimAction({
                    hostOrgId,
                    hostId: hostLeaderId,
                    hostTeam: Array.from(hostTeamIds),
                    opponentOrgId,
                    opponentTeam: Array.from(opponentTeamIds),
                    scheduledAt: new Date(scheduledAt).getTime(),
                    bestOf,
                    note: note.trim() || undefined,
                });
                setCreated(result);
                router.refresh();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to schedule scrimmage.");
            }
        });
    }

    const inp = "w-full bg-surface border border-edge rounded px-2 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors";

    if (!open) {
        return (
            <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
                + Schedule Match vs. Artificial Team
            </Button>
        );
    }

    return (
        <div className="bg-surface border border-edge rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-foreground">Schedule Match vs. Artificial Team</p>
                    <p className="text-xs text-muted mt-0.5">
                        The real org is always the host; the opponent must be an artificial org. The artificial
                        side auto-readies once the scheduled time arrives — the host still readies up manually.
                    </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => { setOpen(false); reset(); }}>
                    Close
                </Button>
            </div>

            {created ? (
                <div className="space-y-3">
                    <div className="px-3 py-2 bg-success/5 border border-success/20 rounded-md">
                        <p className="text-sm text-success font-semibold">Scrimmage scheduled.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="secondary" href={`/scrims/${created._id}`} className="flex-1">
                            View Scrimmage
                        </Button>
                        <Button size="sm" variant="ghost" onClick={reset}>
                            Schedule Another
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Host org + leader + roster */}
                    <div>
                        <label className="block text-[10px] text-muted uppercase tracking-wide mb-1">Host Org (real)</label>
                        <select value={hostOrgId} onChange={(e) => selectHostOrg(e.target.value)} className={inp}>
                            <option value="">Select a real organization...</option>
                            {realOrgs.map((o) => (
                                <option key={o._id} value={o._id}>{o.name} ({o.memberCount} active)</option>
                            ))}
                        </select>
                    </div>

                    {hostOrg && (
                        <>
                            <div>
                                <label className="block text-[10px] text-muted uppercase tracking-wide mb-1">Host Leader</label>
                                <select value={hostLeaderId} onChange={(e) => setHostLeaderId(e.target.value)} className={inp}>
                                    {hostActiveMembers.map((m) => (
                                        <option key={m._id} value={m._id}>
                                            {m.name}{m._id === hostOrg.ownerId ? " (Owner)" : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-[10px] text-muted uppercase tracking-wide">Host Roster</label>
                                    <span className={cn("text-xs font-bold", hostTeamIds.size === 6 ? "text-success" : "text-muted")}>
                                        {hostTeamIds.size}/6
                                    </span>
                                </div>
                                {hostActiveMembers.length === 0 ? (
                                    <p className="text-xs text-muted italic">No active members in this org.</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {hostActiveMembers.map((m) => {
                                            const selected = hostTeamIds.has(m._id);
                                            const disabled = !selected && hostTeamIds.size >= 6;
                                            return (
                                                <button
                                                    key={m._id}
                                                    type="button"
                                                    onClick={() => toggleHostMember(m._id)}
                                                    disabled={disabled}
                                                    className={cn(
                                                        "px-2.5 py-1.5 rounded text-xs font-medium border text-left transition-colors",
                                                        selected
                                                            ? "border-primary/40 bg-primary/5 text-foreground"
                                                            : "border-edge text-dimmed hover:text-foreground hover:border-foreground/20 disabled:opacity-40 disabled:cursor-not-allowed"
                                                    )}
                                                >
                                                    {m.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Opponent org */}
                    <div>
                        <label className="block text-[10px] text-muted uppercase tracking-wide mb-1">Opponent Org (artificial)</label>
                        <select value={opponentOrgId} onChange={(e) => setOpponentOrgId(e.target.value)} className={inp}>
                            <option value="">Select an artificial organization...</option>
                            {artificialOrgs.map((o) => (
                                <option key={o._id} value={o._id}>{o.name} ({o.memberCount} active)</option>
                            ))}
                        </select>
                        {artificialOrgs.length === 0 && (
                            <p className="text-[11px] text-muted mt-1">
                                No artificial organizations yet — create one above first.
                            </p>
                        )}
                        {opponentOrg && opponentActiveCount < 6 && (
                            <p className="text-[11px] text-danger mt-1">
                                This org only has {opponentActiveCount} active player{opponentActiveCount !== 1 ? "s" : ""} — needs 6 to be scheduled as an opponent.
                            </p>
                        )}
                    </div>
                    {opponentOrg && (
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[10px] text-muted uppercase tracking-wide">Opponent Roster</label>
                                <span className={cn("text-xs font-bold", hostTeamIds.size === 6 ? "text-success" : "text-muted")}>
                                    {opponentTeamIds.size}/6
                                </span>
                            </div>
                            {opponentActiveCount === 0 ? (
                                <p className="text-xs text-muted italic">No active members in this org.</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-1.5">
                                    {opponentActiveMembers.map((m) => {
                                        const selected = opponentTeamIds.has(m._id);
                                        const disabled = !selected && opponentTeamIds.size >= 6;
                                        return (
                                            <button
                                                key={m._id}
                                                type="button"
                                                onClick={() => toggleOpponentMember(m._id)}
                                                disabled={disabled}
                                                className={cn(
                                                    "px-2.5 py-1.5 rounded text-xs font-medium border text-left transition-colors",
                                                    selected
                                                        ? "border-primary/40 bg-primary/5 text-foreground"
                                                        : "border-edge text-dimmed hover:text-foreground hover:border-foreground/20 disabled:opacity-40 disabled:cursor-not-allowed"
                                                )}
                                            >
                                                {m.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] text-muted uppercase tracking-wide mb-1">Scheduled At</label>
                            <input
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                                className={inp}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-muted uppercase tracking-wide mb-1">Best Of</label>
                            <select value={bestOf} onChange={(e) => setBestOf(e.target.value as BestOf)} className={inp}>
                                {BEST_OF_OPTIONS.map((b) => (
                                    <option key={b} value={b}>{BEST_OF_LABEL[b]}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] text-muted uppercase tracking-wide mb-1">Note (optional)</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                            className={inp + " resize-none"}
                        />
                    </div>

                    {error && <p className="text-xs text-danger">{error}</p>}
                    <Button size="sm" disabled={pending || !canSubmit} onClick={handleSchedule}>
                        {pending ? "Scheduling..." : "Schedule Match"}
                    </Button>
                </div>
            )}
        </div>
    );
}
