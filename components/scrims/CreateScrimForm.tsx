"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { RosterSelector } from "./RosterSelector";
import { LiveTeamPicker } from "./LiveTeamPicker";
import { useTeamSocket } from "@/hooks/useTeamSocket";
import { createScrimmageAction } from "@/app/scrims/create/actions";
import { BestOf, CreateScrimPageQuery, MatchSide, ScrimmageInvitationInput } from "@/app/api/graphql/types/graphql";
import { cn } from "@/lib/utils";
import type { OrgMember, Region } from "./types";
import { useLiveTeams } from "@/hooks/useLiveTeams";

const BEST_OF_OPTIONS: { value: BestOf; label: string; sub: string }[] = [
    { value: BestOf.One, label: "Bo1", sub: "Single game" },
    { value: BestOf.Three, label: "Bo3", sub: "First to 2 wins" },
    { value: BestOf.Five, label: "Bo5", sub: "First to 3 wins" },
    { value: BestOf.Unlimited, label: "Open", sub: "No series limit" },
];

export interface OrgProp {
    _id: string;
    name: string;
    coreTeam: OrgMember[];
    members: OrgMember[];
}

interface Props {
    userId: string;
    org: OrgProp | null;
    isManager: boolean;
    orgs: CreateScrimPageQuery["getOrganizations"]
}

function SectionCard({ title, subtitle, children }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="bg-surface border border-edge rounded-lg p-5 space-y-4">
            <div>
                <h2 className="text-sm font-bold text-foreground">{title}</h2>
                {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
            </div>
            {children}
        </section>
    );
}

export function CreateScrimForm({ userId, org, isManager, orgs }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // Visibility
    const [isPrivate, setIsPrivate] = useState(false);

    // Note
    const [note, setNote] = useState("");

    // Region
    const [region, setRegion] = useState<Region>("NA");

    // Best of
    const [bestOf, setBestOf] = useState<BestOf>(BestOf.One);

    // Private: target + wager
    const [targetLeaderId, setTargetLeaderId] = useState<string | null>(null);
    const [wagerAmount, setWagerAmount] = useState(0);

    // Org manager options
    const [orgAffiliated, setOrgAffiliated] = useState(false);
    const [scheduled, setScheduled] = useState(false);
    const [scheduledDate, setScheduledDate] = useState("");

    // Roster (org manager only): starts from coreTeam, padded to 6 slots
    const initialRoster: (OrgMember | undefined)[] = [
        ...(org?.coreTeam.slice(0, 6) ?? []),
        ...Array(Math.max(0, 6 - (org?.coreTeam.length ?? 0))).fill(undefined),
    ];
    const [roster, setRoster] = useState<(OrgMember | undefined)[]>(initialRoster);

    // Live team for non-org-roster path
    const { teams: liveTeams } = useTeamSocket([userId]);
    const liveTeam = liveTeams[userId];

    const useOrgRoster = isManager && orgAffiliated;
    const rosterIds = useOrgRoster
        ? roster.filter(Boolean).map((m) => m!._id)
        : (liveTeam?.members.map((m) => m.userId) ?? []);

    const rosterFull = rosterIds.length === 6;
    const canSubmit = rosterFull && (!isPrivate || targetLeaderId !== null) &&
        !(scheduled && !scheduledDate);

    function handleSubmit() {
        if (!canSubmit || isPending) return;
        setError(null);
        
        startTransition(async () => {
            try {
                const scheduledAt = scheduled && scheduledDate
                    ? new Date(scheduledDate).getTime()
                    : null;

                const result = await createScrimmageAction({
                    note,
                    isPrivate,
                    host_id: userId,
                    wagerAmount,
                    hostOrgId: orgAffiliated && org ? org._id : null,
                    roster: rosterIds,
                    orgAffiliated,
                    targetLeaderId,
                    scheduledAt,
                    bestOf,
                });

                if (result) {
                    router.push(`/scrims`);
                } else {
                    setError("Failed to create scrimmage. Please try again.");
                }
            } catch {
                setError("Something went wrong. Please try again.");
            }
        });
    }

    return (
        <div className="space-y-5">

            {/* ── Visibility ── */}
            <SectionCard title="Match Type">
                <div className="grid grid-cols-2 gap-3">
                    {([false, true] as const).map((priv) => (
                        <button
                            key={String(priv)}
                            type="button"
                            onClick={() => { setIsPrivate(priv); setTargetLeaderId(null); }}
                            className={cn(
                                "py-3 px-4 rounded-lg border text-left transition-colors",
                                isPrivate === priv
                                    ? "border-primary/50 bg-primary/5"
                                    : "border-edge hover:border-primary/30 cursor-pointer"
                            )}
                        >
                            <div className={cn(
                                "text-sm font-bold",
                                isPrivate === priv ? "text-primary" : "text-foreground"
                            )}>
                                {priv ? "Private" : "Public"}
                            </div>
                            <div className="text-xs text-muted mt-0.5">
                                {priv ? "Challenge a specific team · wagers allowed" : "Open to any team · no wagers"}
                            </div>
                        </button>
                    ))}
                </div>
            </SectionCard>

            {/* ── Best Of ── */}
            <SectionCard title="Best Of" subtitle="How many games will this scrimmage consist of?">
                <div className="grid grid-cols-4 gap-3">
                    {BEST_OF_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setBestOf(opt.value)}
                            className={cn(
                                "py-3 rounded-lg border text-center transition-colors",
                                bestOf === opt.value
                                    ? "border-primary/50 bg-primary/5"
                                    : "border-edge hover:border-primary/30 cursor-pointer"
                            )}
                        >
                            <div className={cn(
                                "text-sm font-bold",
                                bestOf === opt.value ? "text-primary" : "text-foreground"
                            )}>
                                {opt.label}
                            </div>
                            <div className="text-xs text-muted mt-0.5">{opt.sub}</div>
                        </button>
                    ))}
                </div>
            </SectionCard>

            {/* ── Region ── */}
            <SectionCard title="Region">
                <div className="flex gap-3">
                    {(["NA", "EU"] as const).map((r) => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => setRegion(r)}
                            className={cn(
                                "flex-1 py-3 rounded-lg border text-sm font-bold transition-colors",
                                region === r
                                    ? "border-primary/50 bg-primary/5 text-primary"
                                    : "border-edge text-foreground hover:border-primary/30 cursor-pointer"
                            )}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </SectionCard>

            {/* ── Note ── */}
            <SectionCard title="Note" subtitle="Optional — any requirements or context for opponents.">
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. 6v6, Diamond+, no smurfs…"
                    rows={3}
                    className="w-full bg-surface-2 border border-edge rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted resize-none focus:outline-none focus:border-primary/50 transition-colors"
                />
            </SectionCard>

            {/* ── Private: wager ── */}
            {isPrivate && (
                <SectionCard title="Wager">
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            min={0}
                            value={wagerAmount}
                            disabled
                            onChange={(e) => setWagerAmount(Math.max(0, Number(e.target.value)))}
                            className="w-36 bg-surface-2 border border-edge rounded px-3 py-2 text-sm text-muted focus:outline-none focus:border-primary/50 transition-colors"
                        />
                        <span className="text-xs text-muted">credits per team · 0 = no wager</span>
                    </div>
                </SectionCard>
            )}

            {/* ── Org manager options ── */}
            {isManager && org && (
                <SectionCard title="Organization">
                    <label
                        className="flex items-center gap-3 cursor-pointer w-fit"
                        onClick={() => setOrgAffiliated((v) => !v)}
                    >
                        <div
                            role="checkbox"
                            aria-checked={orgAffiliated}
                            className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                                orgAffiliated ? "bg-primary border-primary" : "border-edge"
                            )}
                        >
                            {orgAffiliated && (
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                    <path d="M1 4l3 3 5-6" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <span className="text-sm text-foreground">
                            Represent <span className="font-semibold">{org.name}</span> in this match
                        </span>
                    </label>

                    {orgAffiliated && (
                        <div className="space-y-5 pt-2 border-t border-edge">

                            {/* Roster */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-foreground">Roster</h3>
                                    <span className={cn(
                                        "text-xs font-semibold",
                                        rosterFull && useOrgRoster ? "text-success" : "text-muted"
                                    )}>
                                        {roster.filter(Boolean).length} / 6
                                    </span>
                                </div>
                                <RosterSelector
                                    slots={roster}
                                    members={org.members}
                                    onChange={setRoster}
                                />
                            </div>

                            {/* Schedule */}
                            <div className="space-y-3 pt-2 border-t border-edge">
                                <h3 className="text-sm font-semibold text-foreground">Schedule</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {([false, true] as const).map((sched) => (
                                        <button
                                            key={String(sched)}
                                            type="button"
                                            onClick={() => setScheduled(sched)}
                                            className={cn(
                                                "py-2 rounded-lg border text-xs font-semibold transition-colors",
                                                scheduled === sched
                                                    ? "border-primary/50 bg-primary/5 text-primary"
                                                    : "border-edge text-muted hover:border-primary/30"
                                            )}
                                        >
                                            {sched ? "Scheduled Time" : "ASAP"}
                                        </button>
                                    ))}
                                </div>
                                {scheduled && (
                                    <input
                                        type="datetime-local"
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
                                        className="bg-surface-2 border border-edge rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                )}
                            </div>

                        </div>
                    )}
                </SectionCard>
            )}

            {/* ── Private: target team ── */}
            {isPrivate && (
                <SectionCard
                    title="Target Team"
                    subtitle="Select the online team you want to challenge."
                >
                    <LiveTeamPicker orgAffiliated={orgAffiliated} org={org} orgs={orgs} isManager={isManager} userId={userId} selected={targetLeaderId} onSelect={setTargetLeaderId} />
                </SectionCard>
            )}

            {/* ── Live team (non-org-roster path) ── */}
            {!useOrgRoster && (
                <SectionCard
                    title="Your Team"
                    subtitle="Your current online team will be used as the roster."
                >
                    {liveTeam ? (
                        <div className="space-y-1.5">
                            {liveTeam.members.map((m, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-2 border border-edge"
                                >
                                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                                        {m.name.charAt(0)}
                                    </div>
                                    <span className="text-sm text-foreground flex-1 truncate">{m.name}</span>
                                    <span className="text-xs text-muted">{m.mmr} MMR</span>
                                </div>
                            ))}
                            {liveTeam.members.length < 6 && (
                                <p className="text-xs text-danger pt-1">
                                    Need {6 - liveTeam.members.length} more player
                                    {6 - liveTeam.members.length !== 1 ? "s" : ""} to create a scrimmage.
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-muted">
                            You don't have an active online team.{" "}
                            <Button variant="ghost" href={`/profile/${userId}`} className="text-xs inline p-0">
                                Go to your profile
                            </Button>{" "}
                            to start one.
                        </p>
                    )}
                </SectionCard>
            )}

            {/* ── Error ── */}
            {error && (
                <p className="text-xs text-danger px-1">{error}</p>
            )}

            {/* ── Submit ── */}
            <div className="flex items-center gap-3 pt-1">
                <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isPending}
                    className="px-8"
                >
                    {isPending ? "Creating…" : "Create Scrimmage"}
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => router.back()}
                    disabled={isPending}
                    className="px-4"
                >
                    Cancel
                </Button>
                {!canSubmit && !isPending && (
                    <span className="text-xs text-muted">
                        {!rosterFull
                            ? "Roster needs 6 players"
                            : isPrivate && !targetLeaderId
                                ? "Select a target team"
                                : "Set a scheduled time"}
                    </span>
                )}
            </div>

        </div>
    );
}
