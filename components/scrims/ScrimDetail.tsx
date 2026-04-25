"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { cn, formatTimeAgo } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { MatchLog } from "@/components/scrims/MatchLog";
import { ScrimmageStatus, ScrimmageResult, MatchResult, MatchSide, BestOf, InvitationStatus, OrgMemberStatus, GetScrimmageDetailQuery } from "@/app/api/graphql/types/graphql";
import { useTeamSocket } from "@/hooks/useTeamSocket";
import { useScrimSocket } from "@/hooks/useScrimSocket";
import type { ScrimPatch } from "@/lib/socket/scrims";
import type { MatchLogPatch } from "@/components/scrims/MatchLog";
import {
    readyUpAction,
    unreadyAction,
    cancelScrimmageAction,
    endScrimmageAction,
    leaveScrimmageAction,
    declineChallengeAction,
    acceptChallengeWithRosterAction,
    joinScrimmageAction,
    respondToInvitationAction,
} from "@/app/scrims/[id]/actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SlimUser {
    _id: string;
    name: string;
    mmr?: number | null;
}

interface SlimTeam {
    leader: SlimUser;
    members: SlimUser[];
}

interface SlimOrg {
    _id: string;
    name: string;
}

type Scrim = NonNullable<GetScrimmageDetailQuery["getScrimmage"]>;

interface ScrimDetailProps {
    scrim: Scrim;
    userId?: string;
    isHost: boolean;
    isHostLeader: boolean;
    isOpponentLeader: boolean;
    isHostMember: boolean;
    isOpponentMember: boolean;
    isOpponentOrgManager: boolean;
    hostOrgId: string | null;
    opponentOrg: Scrim["opponentOrg"];
    viewerOrgId: string | null;
}

type ScrimUpdate = {

}

// ─── Status metadata ──────────────────────────────────────────────────────────

const STATUS_LABEL: Record<ScrimmageStatus, string> = {
    [ScrimmageStatus.Open]: "Open",
    [ScrimmageStatus.Pending]: "Pending",
    [ScrimmageStatus.Ready]: "Ready",
    [ScrimmageStatus.Scheduling]: "Scheduling",
    [ScrimmageStatus.Scheduled]: "Scheduled",
    [ScrimmageStatus.Active]: "Live",
    [ScrimmageStatus.Completed]: "Completed",
    [ScrimmageStatus.Cancelled]: "Cancelled",
};

const STATUS_COLORS: Record<ScrimmageStatus, string> = {
    [ScrimmageStatus.Open]: "bg-success/10 text-success border-success/30",
    [ScrimmageStatus.Pending]: "bg-primary/10 text-primary border-primary/30",
    [ScrimmageStatus.Ready]: "bg-primary/10 text-primary border-primary/30",
    [ScrimmageStatus.Scheduling]: "bg-primary/10 text-primary border-primary/30",
    [ScrimmageStatus.Scheduled]: "bg-primary/10 text-primary border-primary/30",
    [ScrimmageStatus.Active]: "bg-danger/10 text-danger border-danger/30",
    [ScrimmageStatus.Completed]: "bg-edge text-dimmed border-edge",
    [ScrimmageStatus.Cancelled]: "bg-edge text-muted border-edge",
};

const SERIES_RESULT_LABEL: Record<ScrimmageResult, string> = {
    [ScrimmageResult.HostWin]: "Host Won the Series",
    [ScrimmageResult.OpponentWin]: "Opponent Won the Series",
    [ScrimmageResult.Draw]: "Series Ended in a Draw",
    [ScrimmageResult.Cancelled]: "Series Cancelled",
};

const BEST_OF_LABEL: Record<BestOf, string> = {
    [BestOf.One]: "Bo1",
    [BestOf.Three]: "Bo3",
    [BestOf.Five]: "Bo5",
    [BestOf.Unlimited]: "Open",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function RosterSide({
    label,
    org,
    team,
    isReady,
    showReady,
}: {
    label: string;
    org?: SlimOrg | null;
    team?: SlimTeam | null;
    isReady: boolean;
    showReady: boolean;
}) {
    return (
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">{label}</span>
                {showReady && (
                    <span className={cn(
                        "text-xs font-semibold px-1.5 py-0.5 rounded",
                        isReady ? "bg-success/10 text-success" : "bg-edge text-muted"
                    )}>
                        {isReady ? "Ready" : "Not Ready"}
                    </span>
                )}
            </div>

            {org && (
                <div className="text-sm font-bold text-foreground mb-2">{org.name}</div>
            )}

            {team ? (
                <div className="space-y-1.5">
                    {team.members.map((m) => (
                        <div key={m._id} className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold text-foreground shrink-0">
                                {m.name.charAt(0)}
                            </div>
                            <span className={cn("text-sm truncate", m._id === team.leader._id ? "text-foreground font-semibold" : "text-dimmed")}>
                                {m.name}
                                {m._id === team.leader._id && <span className="text-xs text-muted font-normal ml-1">(leader)</span>}
                            </span>
                            {m.mmr != null && (
                                <span className="text-xs text-muted ml-auto shrink-0">{m.mmr} MMR</span>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-muted italic">No team yet</p>
            )}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ScrimDetail({
    scrim,
    userId,
    isHost,
    isHostLeader,
    isOpponentLeader,
    isHostMember,
    isOpponentMember,
    hostOrgId,
    opponentOrg,
    isOpponentOrgManager,
    viewerOrgId,
}: ScrimDetailProps) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [confirmEnd, setConfirmEnd] = useState(false);
    const { teams: liveTeams } = useTeamSocket(userId ? [userId] : []);
    const liveTeam = userId ? liveTeams[userId] : undefined;

    const myInvitation = userId
        ? (scrim.invitations.find(inv => inv.user._id === userId) ?? null)
        : null;
    const [inviteStatus, setInviteStatus] = useState<InvitationStatus | null>(
        myInvitation?.status ?? null
    );

    const activeOrgMembers = opponentOrg?.members.filter(m => m.status === OrgMemberStatus.Active) ?? [];
    const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(
        () => new Set((opponentOrg?.coreTeam ?? []).slice(0, 6).map(m => m._id))
    );

    function toggleTeamMember(userId: string) {
        setSelectedTeamIds(prev => {
            const next = new Set(prev);
            if (next.has(userId)) {
                next.delete(userId);
            } else if (next.size < 6) {
                next.add(userId);
            }
            return next;
        });
    }

    // Optimistic state for all mutable scrim fields — avoids waiting for router.refresh()
    const [live, setLive] = useState({
        status: scrim.status,
        result: scrim.result ?? null as ScrimmageResult | null,
        readyHost: scrim.readyHost,
        readyOpponent: scrim.readyOpponent,
        partyCode: scrim.partyCode ?? null as string | null,
        matches: scrim.matches,
    });

    // Apply a patch from the socket (incoming from another client — no broadcast)
    function applyPatch(update: Partial<typeof live>) {
        setLive(prev => ({ ...prev, ...update }));
    }

    // Apply a patch locally AND broadcast to other clients
    function applyAndBroadcast(overrides: Partial<typeof live>) {
        const next = { ...live, ...overrides };
        setLive(next);
        broadcastPatch({
            status: next.status,
            result: next.result,
            readyHost: next.readyHost,
            readyOpponent: next.readyOpponent,
            partyCode: next.partyCode,
            matches: next.matches.map(m => ({
                number: m.number,
                match_id: m.match_id ?? null,
                result: (m.result as string | null) ?? null,
                startedAt: m.startedAt,
                concludedAt: m.concludedAt ?? null,
            })),
        });
    }

    const { broadcastPatch, broadcastRefresh } = useScrimSocket(
        scrim._id,
        (socketPatch: ScrimPatch) => applyPatch({
            status: socketPatch.status as ScrimmageStatus,
            result: socketPatch.result as ScrimmageResult | null,
            readyHost: socketPatch.readyHost,
            readyOpponent: socketPatch.readyOpponent,
            partyCode: socketPatch.partyCode,
            matches: socketPatch.matches as NonNullable<GetScrimmageDetailQuery["getScrimmage"]>["matches"],
        }),
        () => router.refresh(),
    );

    // For actions that change team composition (opponentTeam/opponentOrg) — need full server re-fetch
    function refresh(fn: () => Promise<unknown>) {
        setError(null);
        startTransition(async () => {
            try {
                await fn();
                router.refresh();
                broadcastRefresh();
            } catch (e) {
                setError(e instanceof Error ? e.message : "Action failed");
            }
        });
    }

    const { status, result, readyHost, readyOpponent } = live;
    const isActive = status === ScrimmageStatus.Active;
    const isCompleted = status === ScrimmageStatus.Completed;
    const isCancelled = status === ScrimmageStatus.Cancelled;
    const isFinished = isCompleted || isCancelled;
    const showReadyState = [ScrimmageStatus.Ready, ScrimmageStatus.Scheduling, ScrimmageStatus.Scheduled].includes(status);
    const showReadySection = [ScrimmageStatus.Pending, ScrimmageStatus.Ready, ScrimmageStatus.Scheduling, ScrimmageStatus.Scheduled].includes(status);
    const activeMatch = live.matches.find((m) => !m.result);
    const canEndEarly = isActive && !activeMatch && (isHostLeader || isOpponentLeader);
    const hostTeamSize = scrim.hostTeam?.members.length ?? 0;
    const oppTeamSize = scrim.opponentTeam?.members.length ?? 0;
    const liveTeamIds = liveTeam?.members.map((m) => m.userId) ?? [];
    const isOrgAffiliated = scrim.hostOrg && scrim.opponentOrg;
    const canJoin = status === ScrimmageStatus.Open
        && !isHost && !isHostMember && !isOpponentMember
        && liveTeamIds.length === 6;

    function handleRespondToInvite(newStatus: InvitationStatus) {
        if (!myInvitation) return;
        setInviteStatus(newStatus);
        refresh(() => respondToInvitationAction(myInvitation._id, newStatus, !isOrgAffiliated ? liveTeam : null));
    }

    function handleReady(side: MatchSide, isReady: boolean) {
        setError(null);
        startTransition(async () => {
            try {
                const data = await (isReady
                    ? unreadyAction(scrim._id, side)
                    : readyUpAction(scrim._id, side));
                if (data) {
                    applyAndBroadcast({
                        status: data.status as ScrimmageStatus,
                        readyHost: data.readyHost,
                        readyOpponent: data.readyOpponent,
                    });
                }
            } catch (e) {
                setError(e instanceof Error ? e.message : "Action failed");
            }
        });
    }

    function handleEndEarly() {
        setError(null);
        startTransition(async () => {
            try {
                const data = await endScrimmageAction(scrim._id);
                if (data) applyAndBroadcast({ status: data.status as ScrimmageStatus });
                setConfirmEnd(false);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Action failed");
            }
        });
    }

    function handleCancel() {
        setError(null);
        startTransition(async () => {
            try {
                const data = await cancelScrimmageAction(scrim._id);
                if (data) applyAndBroadcast({ status: data.status as ScrimmageStatus });
            } catch (e) {
                setError(e instanceof Error ? e.message : "Action failed");
            }
        });
    }

    function handleMatchLogPatch(patch: MatchLogPatch) {
        const overrides: Partial<typeof live> = {};
        if (patch.status !== undefined) overrides.status = patch.status as ScrimmageStatus;
        if (patch.result !== undefined) overrides.result = patch.result as ScrimmageResult | null;
        if (patch.matches !== undefined) overrides.matches = patch.matches as NonNullable<GetScrimmageDetailQuery["getScrimmage"]>["matches"];
        if (patch.partyCode !== undefined) overrides.partyCode = patch.partyCode ?? null;
        applyAndBroadcast(overrides);
        router.refresh();
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

            {/* ── Header ── */}
            <div className="bg-surface border border-edge rounded-lg p-5">
                <div className="flex flex-wrap items-start gap-3 mb-4">
                    <span className={cn(
                        "text-xs font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider",
                        STATUS_COLORS[status]
                    )}>
                        {STATUS_LABEL[status]}
                    </span>

                    {scrim.bestOf && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-2 border border-edge text-dimmed">
                            {BEST_OF_LABEL[scrim.bestOf]}
                        </span>
                    )}

                    {scrim.wagerAmount > 0 && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary">
                            {scrim.wagerAmount} cr wager
                        </span>
                    )}

                    {scrim.isPrivate && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-2 border border-edge text-muted">
                            Private
                        </span>
                    )}

                    <span className="text-xs text-muted ml-auto">
                        Posted {formatTimeAgo(new Date(scrim.createdAt))}
                    </span>
                </div>

                {scrim.scheduledAt && (
                    <div className="text-sm text-dimmed mb-2">
                        Scheduled for{" "}
                        <span className="font-semibold text-foreground">
                            {new Date(scrim.scheduledAt).toLocaleString()}
                        </span>
                    </div>
                )}

                {scrim.note && (
                    <p className="text-sm text-dimmed leading-relaxed">{scrim.note}</p>
                )}

                {/* Series result banner */}
                {isFinished && result && (
                    <div className={cn(
                        "mt-4 px-4 py-3 rounded-lg text-sm font-semibold text-center border",
                        result === ScrimmageResult.HostWin ? "bg-success/10 text-success border-success/30" :
                            result === ScrimmageResult.OpponentWin ? "bg-danger/10 text-danger border-danger/30" :
                                "bg-edge text-dimmed border-edge"
                    )}>
                        {SERIES_RESULT_LABEL[result]}
                    </div>
                )}
            </div>

            {/* ── Roster grid ── */}
            <div className="bg-surface border border-edge rounded-lg p-5">
                <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Rosters</h2>
                <div className="flex gap-8">
                    <RosterSide
                        label="Host"
                        org={scrim.hostOrg}
                        team={scrim.hostTeam}
                        isReady={readyHost}
                        showReady={showReadyState}
                    />
                    <div className="w-px bg-edge self-stretch" />
                    <RosterSide
                        label="Opponent"
                        org={scrim.opponentOrg}
                        team={scrim.opponentTeam}
                        isReady={readyOpponent}
                        showReady={showReadyState}
                    />
                </div>
            </div>

            {/* ── Join (OPEN scrimmages) ── */}
            {status === ScrimmageStatus.Open && userId && !isHost && !isHostMember && (
                <div className="bg-surface border border-edge rounded-lg p-5 space-y-3">
                    <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Join Scrimmage</h2>
                    {liveTeamIds.length < 6 ? (
                        <p className="text-sm text-dimmed">
                            Your live team needs{" "}
                            <span className="text-danger font-semibold">{6 - liveTeamIds.length} more player{6 - liveTeamIds.length !== 1 ? "s" : ""}</span>{" "}
                            before you can join.
                        </p>
                    ) : (
                        <p className="text-sm text-dimmed">Your team is full and ready to challenge.</p>
                    )}
                    <Button
                        fullWidth
                        disabled={!canJoin || pending}
                        onClick={async () => {
                            setError(null);
                            startTransition(async () => {
                                try {
                                    const action = await joinScrimmageAction(scrim._id, viewerOrgId!, liveTeamIds)
                                    applyAndBroadcast({ status: action?.status });
                                    broadcastRefresh();
                                    router.refresh();
                                } catch (e) {
                                    setError(e instanceof Error ? e.message : "Action failed");
                                }
                            });
                        }}
                    >
                        {pending ? "Joining…" : "Join Scrimmage"}
                    </Button>
                    {error && <p className="text-xs text-danger">{error}</p>}
                </div>
            )}

            {/* ── Ready Check ── */}
            {!isFinished && userId && showReadySection && (
                <div className="bg-surface border border-edge rounded-lg p-5 space-y-4">
                    <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Ready Check</h2>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Host */}
                        <div className={cn(
                            "p-4 rounded-lg border space-y-3 text-center",
                            readyHost ? "border-success/30 bg-success/5" : "border-edge bg-surface-2"
                        )}>
                            <div>
                                <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                                    {scrim.hostOrg?.name ?? "Host"}
                                </div>
                                <div className={cn("text-sm font-bold", readyHost ? "text-success" : "text-dimmed")}>
                                    {readyHost ? "Ready" : "Not Ready"}
                                </div>
                            </div>
                            {showReadyState && isHostLeader && (
                                <button
                                    onClick={() => handleReady(MatchSide.Host, readyHost)}
                                    disabled={pending || hostTeamSize < 6}
                                    className={cn(
                                        "w-full px-3 py-1.5 text-xs font-semibold rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                                        readyHost
                                            ? "border-edge text-muted hover:border-primary/30 hover:text-dimmed"
                                            : "border-success/30 bg-success/10 text-success hover:bg-success/20"
                                    )}
                                >
                                    {readyHost ? "Unready" : hostTeamSize < 6 ? `Need ${6 - hostTeamSize} more` : "Ready Up"}
                                </button>
                            )}
                        </div>

                        {/* Opponent */}
                        <div className={cn(
                            "p-4 rounded-lg border space-y-3 text-center",
                            readyOpponent ? "border-success/30 bg-success/5" : "border-edge bg-surface-2"
                        )}>
                            <div>
                                <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                                    {scrim.opponentOrg?.name ?? "Opponent"}
                                </div>
                                <div className={cn("text-sm font-bold", readyOpponent ? "text-success" : "text-dimmed")}>
                                    {readyOpponent ? "Ready" : "Not Ready"}
                                </div>
                            </div>
                            {showReadyState && isOpponentLeader && (
                                <button
                                    onClick={() => handleReady(MatchSide.Opponent, readyOpponent)}
                                    disabled={pending || oppTeamSize < 6}
                                    className={cn(
                                        "w-full px-3 py-1.5 text-xs font-semibold rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                                        readyOpponent
                                            ? "border-edge text-muted hover:border-primary/30 hover:text-dimmed"
                                            : "border-success/30 bg-success/10 text-success hover:bg-success/20"
                                    )}
                                >
                                    {readyOpponent ? "Unready" : oppTeamSize < 6 ? `Need ${6 - oppTeamSize} more` : "Ready Up"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* PENDING: accept / decline a private challenge — with roster picker */}
                    {status === ScrimmageStatus.Pending && opponentOrg && isOpponentOrgManager && (
                        <div className="pt-4 border-t border-edge space-y-4">
                            <p className="text-sm text-dimmed">
                                You've been challenged to a scrimmage. Select your 6-player roster to accept.
                            </p>

                            {/* Member picker */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                                        Select Roster — {selectedTeamIds.size}/6
                                    </span>
                                    {selectedTeamIds.size < 6 && (
                                        <span className="text-xs text-danger">
                                            Need {6 - selectedTeamIds.size} more
                                        </span>
                                    )}
                                </div>
                                {activeOrgMembers.length === 0 ? (
                                    <p className="text-xs text-muted italic">No active members in this organization.</p>
                                ) : activeOrgMembers.map(member => {
                                    const inTeam = selectedTeamIds.has(member.user._id);
                                    const disabled = !inTeam && selectedTeamIds.size >= 6;
                                    return (
                                        <button
                                            key={member.user._id}
                                            type="button"
                                            onClick={() => toggleTeamMember(member.user._id)}
                                            disabled={disabled}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2.5 rounded border text-sm transition-colors",
                                                inTeam
                                                    ? "border-primary/40 bg-primary/5 text-foreground"
                                                    : "border-edge text-dimmed hover:text-foreground hover:border-foreground/20 disabled:opacity-40 disabled:cursor-not-allowed"
                                            )}
                                        >
                                            <span className="font-medium">{member.user.name}</span>
                                            <span className="text-xs text-muted">{member.user.mmr} MMR</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Accept / Decline */}
                            <div className="flex gap-2">
                                <Button
                                    fullWidth
                                    onClick={() => refresh(() => acceptChallengeWithRosterAction(scrim._id, opponentOrg._id, Array.from(selectedTeamIds)))}
                                    disabled={pending || selectedTeamIds.size < 6}
                                >
                                    Accept Challenge
                                </Button>
                                <button
                                    onClick={() => refresh(() => declineChallengeAction(scrim._id, opponentOrg._id))}
                                    disabled={pending}
                                    className="flex-1 px-4 py-2 text-sm font-semibold rounded bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
                                >
                                    {pending ? "…" : "Decline"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Opponent leave — available once joined, before match goes ACTIVE */}
                    {isOpponentLeader && [ScrimmageStatus.Ready, ScrimmageStatus.Scheduling, ScrimmageStatus.Scheduled].includes(status) && (
                        <div className="pt-4 border-t border-edge">
                            <Button
                                fullWidth
                                variant="secondary"
                                onClick={async () => {
                                    setError(null);
                                    startTransition(async () => {
                                        try {
                                            const action = await leaveScrimmageAction(scrim._id, opponentOrg?._id ?? "")
                                            applyAndBroadcast({ status: action?.status });
                                            broadcastRefresh();
                                            router.refresh();
                                        } catch (e) {
                                            setError(e instanceof Error ? e.message : "Action failed");
                                        }
                                    });
                                }}
                                disabled={pending}
                            >
                                Leave Scrimmage
                            </Button>
                        </div>
                    )}

                    {error && <p className="text-xs text-danger">{error}</p>}
                </div>
            )}

            {/* ── My Invitation ── */}
            {myInvitation && !isFinished && !isActive && (
                <div className="bg-surface border border-edge rounded-lg p-5 space-y-4">
                    <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Your Invitation</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-surface-2 border border-edge text-dimmed uppercase tracking-wide">
                            {myInvitation.side === MatchSide.Host ? "Host Side" : "Opponent Side"}
                        </span>
                        <span className={cn(
                            "text-xs font-semibold px-2 py-1 rounded border",
                            inviteStatus === InvitationStatus.Accepted
                                ? "bg-success/10 text-success border-success/30"
                                : inviteStatus === InvitationStatus.Declined
                                    ? "bg-danger/10 text-danger border-danger/30"
                                    : "bg-primary/10 text-primary border-primary/30"
                        )}>
                            {inviteStatus === InvitationStatus.Accepted ? "Accepted"
                                : inviteStatus === InvitationStatus.Declined ? "Declined"
                                    : "Awaiting Response"}
                        </span>
                    </div>
                    {inviteStatus === InvitationStatus.Pending && (
                        <div className="flex gap-2">
                            <Button
                                fullWidth
                                onClick={() => handleRespondToInvite(InvitationStatus.Accepted)}
                                disabled={pending}
                            >
                                {pending ? "…" : "Accept"}
                            </Button>
                            <button
                                onClick={() => handleRespondToInvite(InvitationStatus.Declined)}
                                disabled={pending}
                                className="flex-1 px-4 py-2 text-sm font-semibold rounded bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
                            >
                                {pending ? "…" : "Decline"}
                            </button>
                        </div>
                    )}
                    {error && <p className="text-xs text-danger">{error}</p>}
                </div>
            )}

            {/* ── Match log (ACTIVE or COMPLETED) ── */}
            {(isActive || isCompleted) && (
                <div className="bg-surface border border-edge rounded-lg p-5">
                    <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Matches</h2>
                    <MatchLog
                        scrimmageId={scrim._id}
                        canViewParyCode={!isCompleted && (isHostMember || isOpponentMember)}
                        matches={live.matches}
                        partyCode={live.partyCode}
                        isHostLeader={isHostLeader}
                        isActive={isActive}
                        onPatch={handleMatchLogPatch}
                    />
                </div>
            )}

            {/* ── Actions panel ── */}
            {!isFinished && userId && (canEndEarly || (isHost && !isActive)) && (
                <div className="bg-surface border border-edge rounded-lg p-5 space-y-3">
                    <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Actions</h2>

                    {/* End scrimmage early */}
                    {canEndEarly && !confirmEnd && (
                        <Button
                            fullWidth
                            variant="secondary"
                            onClick={() => setConfirmEnd(true)}
                            disabled={pending}
                        >
                            End Scrimmage Early
                        </Button>
                    )}
                    {canEndEarly && confirmEnd && (
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => setConfirmEnd(false)}
                                disabled={pending}
                                className="flex-1"
                            >
                                Keep Playing
                            </Button>
                            <button
                                onClick={handleEndEarly}
                                disabled={pending}
                                className="flex-1 shrink-0 px-4 py-2 text-sm font-semibold rounded bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
                            >
                                {pending ? "Ending…" : "Confirm End"}
                            </button>
                        </div>
                    )}

                    {/* Host can cancel while not yet ACTIVE */}
                    {isHost && !isActive && (
                        <Button
                            fullWidth
                            variant="secondary"
                            onClick={handleCancel}
                            disabled={pending}
                            className="text-danger! hover:border-danger/30!"
                        >
                            {pending ? "Cancelling…" : "Cancel Scrimmage"}
                        </Button>
                    )}

                </div>
            )}

            {/* Spectator / non-participant view */}
            {!isFinished && !userId && (
                <div className="text-center py-4 text-sm text-muted">
                    Sign in to interact with this scrimmage.
                </div>
            )}
        </div>
    );
}
