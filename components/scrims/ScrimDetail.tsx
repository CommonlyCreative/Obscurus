"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { ArrayElement, cn, formatTimeAgo } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { MatchLog } from "@/components/scrims/MatchLog";
import { ScrimmageStatus, ScrimmageResult, MatchSide, BestOf, InvitationStatus, OrgMemberStatus, GetScrimmageDetailQuery } from "@/app/api/graphql/types/graphql";
import { findTeam, useTeamSocket } from "@/hooks/useTeamSocket";
import { useScrimSocket } from "@/hooks/useScrimSocket";
import type { ScrimPatch } from "@/lib/socket/scrims";
import type { MatchLogPatch } from "@/components/scrims/MatchLog";
import { getRankByMMR } from "@/lib/deadlock";
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
    setOpponentRoster,
} from "@/app/scrims/[id]/actions";
import { InvitationType } from "@/app/api/graphql/server";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SlimUser {
    _id: string;
    name: string;
    mmr?: number | null;
}

export type Scrim = NonNullable<GetScrimmageDetailQuery["getScrimmage"]>;

export interface ScrimDetailProps {
    scrim: Scrim;
    userId?: string;
    isHost: boolean;
    isHostLeader: boolean;
    isOpponentLeader: boolean;
    isHostMember: boolean;
    isOpponentMember: boolean;
    isOpponentOrgManager: boolean;
    hostOrgId: string | null;
    viewerOrgId: string | null;
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

function RosterRow({ member, isLeader }: { member: SlimUser; isLeader: boolean }) {
    const rankInfo = member.mmr != null ? getRankByMMR(member.mmr) : undefined;
    return (
        <div className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded transition-colors",
            isLeader ? "bg-surface-2" : "hover:bg-surface-2/40"
        )}>
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold text-foreground shrink-0">
                {member.name.charAt(0)}
            </div>
            <span className={cn("text-sm truncate flex-1 min-w-0", isLeader ? "font-semibold text-foreground" : "text-dimmed")}>
                {member.name}
            </span>
            {isLeader && (
                <span className="text-[9px] font-bold text-primary bg-primary/10 px-1 py-0.5 rounded uppercase tracking-wider shrink-0">C</span>
            )}
            {rankInfo && (
                <span className={cn("text-[10px] font-medium shrink-0", rankInfo.rank.text)}>
                    {rankInfo.rank.name}
                </span>
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
    hostOrgId: _hostOrgId,
    isOpponentOrgManager,
    viewerOrgId: _viewerOrgId,
}: ScrimDetailProps) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [confirmEnd, setConfirmEnd] = useState(false);
    const { teams: liveTeams } = useTeamSocket(userId ? [userId] : []);
    const liveTeam = userId ? findTeam(liveTeams, userId) : undefined;

    const myInvitation = userId
        ? (scrim.invitations.find(inv => inv.user._id === userId) ?? null)
        : null;

    const [inviteStatus, setInviteStatus] = useState<InvitationStatus | null>(
        myInvitation?.status ?? null
    );

    const myOrg = myInvitation?.organization;

    const activeOrgMembers = myOrg?.members.filter(m => m.status === OrgMemberStatus.Active) ?? [];
    const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(
        () => new Set((myOrg?.coreTeam ?? []).slice(0, 6).map(m => m._id))
    );

    function toggleTeamMember(memberId: string) {
        setSelectedTeamIds(prev => {
            const next = new Set(prev);
            if (next.has(memberId)) {
                next.delete(memberId);
            } else if (next.size < 6) {
                next.add(memberId);
            }
            return next;
        });
    }

    const [live, setLive] = useState({
        status: scrim.status,
        result: scrim.result ?? null as ScrimmageResult | null,
        readyHost: scrim.readyHost,
        readyOpponent: scrim.readyOpponent,
        partyCode: scrim.partyCode ?? null as string | null,
        matches: scrim.matches,
    });

    function applyPatch(update: Partial<typeof live>) {
        setLive(prev => ({ ...prev, ...update }));
    }

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
    const activeMatch = live.matches.find((m) => !m.result);
    const canEndEarly = isActive && !activeMatch && (isHostLeader || isOpponentLeader);
    const hostTeamSize = scrim.hostTeam?.members.length ?? 0;
    const oppTeamSize = scrim.opponentTeam?.members.length ?? 0;
    const liveTeamIds = liveTeam?.members.map((m) => m.userId) ?? [];
    const canJoin = status === ScrimmageStatus.Open
        && !isHost && !isHostMember && !isOpponentMember
        && liveTeamIds.length === 6;

    const showReadyCheck = !isFinished && userId && showReadyState;
    const showJoin = status === ScrimmageStatus.Open && userId && !isHost && !isHostMember;
    const showInvitation = myInvitation && !isFinished && !isActive && myInvitation.status === InvitationStatus.Pending;
    const showAcceptChallenge = status === ScrimmageStatus.Pending && myInvitation?.type === InvitationType.LeaderInvite && !!myOrg&& !!userId; //TODO;
    const isOrgChallenge = !!myInvitation && !!myInvitation.organization;
    const showActions = !isFinished && userId && (canEndEarly || ((isHost || (isOpponentLeader && status === ScrimmageStatus.Scheduled)) && !isActive));

    function handleRespondToInvite(newStatus: InvitationStatus) {
        if (!myInvitation) return;
        setInviteStatus(newStatus);
        refresh(() => respondToInvitationAction(scrim._id, myInvitation.user._id, newStatus));
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

    function handleJoin() {
        setError(null);
        startTransition(async () => {
            try {
                const action = await joinScrimmageAction(scrim._id, liveTeamIds);
                applyAndBroadcast({ status: action?.status });
                broadcastRefresh();
                router.refresh();
            } catch (e) {
                setError(e instanceof Error ? e.message : "Action failed");
            }
        });
    }

    function handleLeave() {
        setError(null);
        startTransition(async () => {
            try {
                const action = await leaveScrimmageAction(scrim._id);
                applyAndBroadcast({ status: action?.status });
                broadcastRefresh();
                router.refresh();
            } catch (e) {
                setError(e instanceof Error ? e.message : "Action failed");
            }
        });
    }

    function handleAction(action: Promise<{ status: ScrimmageStatus } | null | undefined>) {
        setError(null);
        startTransition(async () => {
            try {
                const response = await action;
                applyAndBroadcast({ status: response?.status });
                broadcastRefresh();
                router.refresh();
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">

            {/* ── VS Match Card ── */}
            <div className="bg-surface border border-edge rounded-lg overflow-hidden">

                {/* Badges row */}
                <div className="flex items-center gap-2 px-5 py-3 border-b border-edge bg-surface-2/30">
                    <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider", STATUS_COLORS[status])}>
                        {STATUS_LABEL[status]}
                    </span>
                    {scrim.bestOf && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-2 border border-edge text-dimmed">
                            {BEST_OF_LABEL[scrim.bestOf]}
                        </span>
                    )}
                    {scrim.wagerAmount > 0 && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary">
                            {scrim.wagerAmount} cr wager
                        </span>
                    )}
                    {scrim.isPrivate && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-2 border border-edge text-muted">
                            Private
                        </span>
                    )}
                    <span className="text-xs text-muted ml-auto">{formatTimeAgo(new Date(scrim.createdAt))}</span>
                </div>

                {/* VS matchup */}
                <div className="grid grid-cols-[1fr_auto_1fr]">
                    {/* Host */}
                    <div className="px-6 py-5">
                        <div className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-1.5">Host</div>
                        <div className="text-2xl flex items-center gap-3 font-black text-foreground leading-tight">
                            {scrim.hostOrg?.name ?? scrim.host.name}
                            {scrim.hostOrg && <span className="text-[12px] font-mono text-secondary bg-secondary/10 border border-secondary/20 px-1.5 py-0.5 rounded shrink-0">
                                ORG
                            </span>}
                        </div>
                        {showReadyState && (
                            <div className={cn("text-xs font-semibold mt-2 flex items-center gap-1.5", readyHost ? "text-success" : "text-muted")}>
                                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", readyHost ? "bg-success" : "bg-muted")} />
                                {readyHost ? "Ready" : "Not Ready"}
                            </div>
                        )}
                    </div>

                    {/* VS divider */}
                    <div className="flex items-center justify-center px-6 border-x border-edge">
                        <span className="text-base font-black text-edge tracking-wider">VS</span>
                    </div>

                    {/* Opponent */}
                    <div className="px-6 py-5 text-right">
                        <div className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-1.5">
                            {scrim.opponentOrg || scrim.opponentTeam ? "Opponent" : "Awaiting"}
                        </div>
                        
                        <div className={cn("text-2xl justify-end flex items-center gap-3 font-black leading-tight", scrim.opponentOrg || scrim.opponentTeam ? "text-foreground" : "text-edge")}>
                            {scrim.opponentOrg && <span className="text-[12px] font-mono text-secondary bg-secondary/10 border border-secondary/20 px-1.5 py-0.5 rounded shrink-0">
                                ORG
                            </span>}
                            {scrim.opponentOrg?.name ?? scrim.opponentTeam?.leader.name ?? <p className="italic text-muted">TBD</p>}
                        </div>
                        {showReadyState && scrim.opponentTeam && (
                            <div className={cn("text-xs font-semibold mt-2 flex items-center justify-end gap-1.5", readyOpponent ? "text-success" : "text-muted")}>
                                {readyOpponent ? "Ready" : "Not Ready"}
                                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", readyOpponent ? "bg-success" : "bg-muted")} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Result banner */}
                {isFinished && result && (
                    <div className={cn("px-6 py-3 text-sm font-semibold text-center border-t",
                        result === ScrimmageResult.HostWin ? "bg-success/10 text-success border-success/20" :
                            result === ScrimmageResult.OpponentWin ? "bg-danger/10 text-danger border-danger/20" :
                                "bg-surface-2 text-dimmed border-edge"
                    )}>
                        {SERIES_RESULT_LABEL[result]}
                    </div>
                )}

                {/* Schedule / note footer */}
                {(scrim.scheduledAt || scrim.note) && (
                    <div className="px-5 py-3 border-t border-edge flex flex-wrap gap-x-6 gap-y-1">
                        {scrim.scheduledAt && (
                            <p className="text-xs text-dimmed">
                                <span className="text-muted">Scheduled </span>
                                <span className="text-foreground font-medium">{new Date(scrim.scheduledAt).toLocaleString()}</span>
                            </p>
                        )}
                        {scrim.note && <p className="text-xs text-dimmed">{scrim.note}</p>}
                    </div>
                )}
            </div>

            {/* ── Two-column layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 items-start">

                {/* ── Left: Rosters + Match Log ── */}
                <div className="space-y-4">

                    {/* Rosters */}
                    <div className="bg-surface border border-edge rounded-lg overflow-hidden">
                        <div className="grid grid-cols-2 divide-x divide-edge">

                            {/* Host roster */}
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-semibold text-muted uppercase tracking-widest">Host Roster</span>
                                    {scrim.hostTeam && (
                                        <span className={cn(
                                            "text-[10px] font-semibold",
                                            scrim.hostTeam.members.length === 6 ? "text-success" : "text-muted"
                                        )}>
                                            {scrim.hostTeam.members.length}/6
                                        </span>
                                    )}
                                </div>
                                {scrim.hostTeam ? (
                                    <div className="space-y-0.5">
                                        {scrim.hostTeam.members.map(m => (
                                            <RosterRow key={m._id} member={m} isLeader={m._id === scrim.hostTeam!.leader._id} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted italic">No roster yet</p>
                                )}
                            </div>

                            {/* Opponent roster */}
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-semibold text-muted uppercase tracking-widest">Opponent Roster</span>
                                    {scrim.opponentTeam && (
                                        <span className={cn(
                                            "text-[10px] font-semibold",
                                            scrim.opponentTeam.members.length === 6 ? "text-success" : "text-muted"
                                        )}>
                                            {scrim.opponentTeam.members.length}/6
                                        </span>
                                    )}
                                </div>
                                {scrim.opponentTeam ? (
                                    <div className="space-y-0.5">
                                        {scrim.opponentTeam.members.map(m => (
                                            <RosterRow key={m._id} member={m} isLeader={m._id === scrim.opponentTeam!.leader._id} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted italic">Waiting for opponent</p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* ── Right sidebar ── */}
                <div className="space-y-4">

                    {/* Join (OPEN) */}
                    {showJoin && (
                        <div className="bg-surface border border-edge rounded-lg p-4 space-y-3">
                            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Join Scrimmage</h3>
                            <p className="text-xs text-dimmed leading-relaxed">
                                {liveTeamIds.length < 6
                                    ? <><span className="text-danger font-semibold">{6 - liveTeamIds.length} more player{6 - liveTeamIds.length !== 1 ? "s" : ""}</span> needed before you can join.</>
                                    : "Your team is full and ready to challenge."}
                            </p>
                            <Button fullWidth disabled={!canJoin || pending} onClick={handleJoin}>
                                {pending ? "Joining…" : "Join Scrimmage"}
                            </Button>
                            {error && <p className="text-xs text-danger">{error}</p>}
                        </div>
                    )}

                    {/* Ready Check */}
                    {showReadyCheck && (
                        <div className="bg-surface border border-edge rounded-lg p-4 space-y-3">
                            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Ready Check</h3>

                            <div className="space-y-2">
                                {/* Host */}
                                <div className={cn(
                                    "flex items-center justify-between p-3 rounded border transition-colors",
                                    readyHost ? "border-success/30 bg-success/5" : "border-edge bg-surface-2"
                                )}>
                                    <div>
                                        <div className="text-xs font-semibold text-foreground">{scrim.hostOrg?.name ?? "Host"}</div>
                                        <div className={cn("text-xs mt-0.5", readyHost ? "text-success" : "text-muted")}>
                                            {readyHost ? "Ready" : "Not Ready"}
                                        </div>
                                    </div>
                                    {isHostLeader && (!scrim.scheduledAt || scrim.scheduledAt < Date.now()) && (
                                        <button
                                            onClick={() => handleReady(MatchSide.Host, readyHost)}
                                            disabled={pending || hostTeamSize < 6}
                                            className={cn(
                                                "px-3 py-1.5 text-xs font-semibold rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                                                readyHost
                                                    ? "border-edge text-muted hover:border-primary/30 hover:text-dimmed"
                                                    : "border-success/30 bg-success/10 text-success hover:bg-success/20"
                                            )}
                                        >
                                            {readyHost ? "Unready" : hostTeamSize < 6 ? `Need ${6 - hostTeamSize}` : "Ready Up"}
                                        </button>
                                    )}
                                </div>

                                {/* Opponent */}
                                <div className={cn(
                                    "flex items-center justify-between p-3 rounded border transition-colors",
                                    readyOpponent ? "border-success/30 bg-success/5" : "border-edge bg-surface-2"
                                )}>
                                    <div>
                                        <div className="text-xs font-semibold text-foreground">{scrim.opponentOrg?.name ?? "Opponent"}</div>
                                        <div className={cn("text-xs mt-0.5", readyOpponent ? "text-success" : "text-muted")}>
                                            {readyOpponent ? "Ready" : "Not Ready"}
                                        </div>
                                    </div>
                                    {isOpponentLeader && (!scrim.scheduledAt || scrim.scheduledAt < Date.now()) && (
                                        <button
                                            onClick={() => handleReady(MatchSide.Opponent, readyOpponent)}
                                            disabled={pending || oppTeamSize < 6}
                                            className={cn(
                                                "px-3 py-1.5 text-xs font-semibold rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                                                readyOpponent
                                                    ? "border-edge text-muted hover:border-primary/30 hover:text-dimmed"
                                                    : "border-success/30 bg-success/10 text-success hover:bg-success/20"
                                            )}
                                        >
                                            {readyOpponent ? "Unready" : oppTeamSize < 6 ? `Need ${6 - oppTeamSize}` : "Ready Up"}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Leave option for opponent */}
                            {isOpponentLeader && [ScrimmageStatus.Ready].includes(status) && (
                                <Button fullWidth variant="secondary" onClick={handleLeave} disabled={pending}>
                                    Leave Scrimmage
                                </Button>
                            )}

                            {error && <p className="text-xs text-danger">{error}</p>}
                        </div>
                    )}

                    {/* My Invitation */}
                    {showInvitation && !showAcceptChallenge && (
                        <div className="bg-surface border border-edge rounded-lg p-4 space-y-3">
                            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Your Invitation</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-[11px] font-semibold px-2 py-1 rounded bg-surface-2 border border-edge text-dimmed uppercase tracking-wide">
                                    {myInvitation!.side === MatchSide.Host ? "Host Side" : "Opponent Side"}
                                </span>
                                <span className={cn("text-[11px] font-semibold px-2 py-1 rounded border",
                                    inviteStatus === InvitationStatus.Accepted ? "bg-success/10 text-success border-success/30" :
                                        inviteStatus === InvitationStatus.Declined ? "bg-danger/10 text-danger border-danger/30" :
                                            "bg-primary/10 text-primary border-primary/30"
                                )}>
                                    {inviteStatus === InvitationStatus.Accepted ? "Accepted"
                                        : inviteStatus === InvitationStatus.Declined ? "Declined"
                                            : "Awaiting Response"}
                                </span>
                            </div>
                            {inviteStatus === InvitationStatus.Pending && (
                                <div className="flex gap-2">
                                    <Button fullWidth onClick={() => handleRespondToInvite(InvitationStatus.Accepted)} disabled={pending}>
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

                    {/* Actions — always visible */}
                    <div className="bg-surface border border-edge rounded-lg p-4 space-y-2">
                        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Actions</h3>
                        {showActions ? (
                            <>
                                {canEndEarly && !confirmEnd && (
                                    <Button fullWidth variant="secondary" onClick={() => setConfirmEnd(true)} disabled={pending}>
                                        End Scrimmage Early
                                    </Button>
                                )}
                                {canEndEarly && confirmEnd && (
                                    <div className="flex gap-2">
                                        <Button variant="secondary" onClick={() => setConfirmEnd(false)} disabled={pending} className="flex-1">
                                            Keep Playing
                                        </Button>
                                        <button
                                            onClick={handleEndEarly}
                                            disabled={pending}
                                            className="flex-1 px-4 py-2 text-xs font-semibold rounded bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
                                        >
                                            {pending ? "Ending…" : "Confirm End"}
                                        </button>
                                    </div>
                                )}
                                {(isHost || (isOpponentLeader && status === ScrimmageStatus.Scheduled)) && !isActive && (
                                    <Button fullWidth variant="secondary" onClick={handleCancel} disabled={pending} className="text-danger! hover:border-danger/30!">
                                        {pending ? "Cancelling…" : "Cancel Scrimmage"}
                                    </Button>
                                )}
                                {error && <p className="text-xs text-danger">{error}</p>}
                            </>
                        ) : (
                            <p className="text-xs text-muted italic">No actions available at this stage.</p>
                        )}
                    </div>

                    {/* Spectator CTA */}
                    {!isFinished && !userId && (
                        <div className="bg-surface border border-edge rounded-lg p-4 text-center">
                            <p className="text-xs text-muted">Sign in to interact with this scrimmage.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Match Log (full-width below grid) ── */}
            {(isActive || isCompleted) && (
                <div className="bg-surface border border-edge rounded-lg p-4">
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

            {/* ── Accept Challenge (full-width, below grid) ── */}
            {showAcceptChallenge && (
                <div className="bg-surface border border-edge rounded-lg p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Accept Challenge</h2>
                            {isOrgChallenge && <p className="text-sm text-dimmed mt-1">Select your 6-player roster to accept this scrimmage.</p>}
                        </div>
                        <span className={cn("text-sm font-bold", selectedTeamIds.size === 6 ? "text-success" : "text-muted")}>
                            {selectedTeamIds.size}/6
                        </span>
                    </div>

                    {isOrgChallenge &&
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {activeOrgMembers.length === 0 ? (
                                <p className="text-xs text-muted italic col-span-3">No active members in this organization.</p>
                            ) : activeOrgMembers.map(member => {
                                const inTeam = selectedTeamIds.has(member.user._id);
                                const disabled = !inTeam && selectedTeamIds.size >= 6;
                                const stats = getRankByMMR(member.user.stats?.mmr ?? 0)
                                return (
                                    <button
                                        key={member.user._id}
                                        type="button"
                                        onClick={() => toggleTeamMember(member.user._id)}
                                        disabled={disabled}
                                        className={cn(
                                            "flex items-center gap-2.5 px-3 py-2.5 rounded border text-left transition-colors",
                                            inTeam
                                                ? "border-primary/40 bg-primary/5 text-foreground"
                                                : "border-edge text-dimmed hover:text-foreground hover:border-foreground/20 disabled:opacity-40 disabled:cursor-not-allowed"
                                        )}
                                    >
                                        <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold text-foreground shrink-0">
                                            {member.user.name.charAt(0)}
                                        </div>
                                        <span className="font-medium flex-1 text-xs truncate">{member.user.name}</span>
                                        {stats && (
                                            <span className="text-[10px] text-muted shrink-0">{`${stats.rank.name} ${stats.division}`}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>}

                    <div className="flex items-center gap-3 pt-1 border-t border-edge">
                        <Button
                            onClick={() => handleAction(acceptChallengeWithRosterAction(scrim._id, userId, isOrgChallenge ? Array.from(selectedTeamIds) : Array.from(liveTeamIds)))}
                            disabled={pending || (isOrgChallenge && selectedTeamIds.size < 6) || (!isOrgChallenge && liveTeamIds.length < 6)}
                        >
                            Accept Challenge
                        </Button>
                        <button
                            onClick={() => handleAction(declineChallengeAction(scrim._id, userId))}
                            disabled={pending}
                            className="px-4 py-2 text-sm font-semibold rounded bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
                        >
                            {pending ? "…" : "Decline"}
                        </button>
                        {error && <p className="text-xs text-danger ml-auto self-center">{error}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}
