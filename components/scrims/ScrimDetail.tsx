"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { X } from "lucide-react";
import { ArrayElement, cn, formatTimeAgo } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { MatchLog } from "@/components/scrims/MatchLog";
import { ScrimmageStatus, ScrimmageResult, MatchResult, MatchSide, BestOf, InvitationStatus, OrgMemberStatus, GetScrimmageDetailQuery } from "@/app/api/graphql/types/graphql";
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
import { getRankImage } from "@/lib/rankImage";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { SubstitutePicker, type SubstituteCandidate } from "./SubstitutePicker";

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
    isHostOrgManager: boolean;
    isViewerOrgManager: boolean;
    hostOrgId: string | null;
    viewerOrgId: string | null;
    allUsers: SubstituteCandidate[];
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

const BEST_OF_LABEL: Record<BestOf, string> = {
    [BestOf.One]: "Bo1",
    [BestOf.Three]: "Bo3",
    [BestOf.Five]: "Bo5",
    [BestOf.Unlimited]: "Unlimited",
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
    isHostOrgManager,
    isViewerOrgManager,
    viewerOrgId,
    allUsers,
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
    const [manualCaptainId, setManualCaptainId] = useState<string | null>(null);
    // Outside picks (free agents / players from other orgs) added straight into the
    // roster — kept separately from `selectedTeamIds` only so their names are available
    // to render, since they don't appear in `activeOrgMembers`.
    const [externalPicks, setExternalPicks] = useState<SubstituteCandidate[]>([]);

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

    function addSubstitute(candidate: SubstituteCandidate) {
        if (selectedTeamIds.size >= 6) return;
        setSelectedTeamIds(prev => new Set(prev).add(candidate._id));
        setExternalPicks(prev => [...prev, candidate]);
    }

    function removeSubstitute(id: string) {
        setSelectedTeamIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
        setExternalPicks(prev => prev.filter(p => p._id !== id));
    }

    const [live, setLive] = useState({
        status: scrim.status,
        result: scrim.result ?? null as ScrimmageResult | null,
        readyHost: scrim.readyHost,
        readyOpponent: scrim.readyOpponent,
        partyCode: scrim.partyCode ?? null as string | null,
        matches: scrim.matches,
    });
    const [lastDraftEvent, setLastDraftEvent] = useState<unknown>(null);

    // `scrim` is a new object every server render. Socket patches only cover a subset of
    // fields (status/ready/matches/partyCode) — rosters, org info, and invitations are read
    // straight from `scrim` and only change when a fresh copy arrives via router.refresh().
    // Resync the locally-tracked state here (during render, not an effect) whenever that
    // happens, so a stale `live`/`inviteStatus` snapshot from before a refresh never lingers
    // on other viewers' screens after someone accepts/declines a challenge.
    const [prevScrim, setPrevScrim] = useState(scrim);
    if (prevScrim !== scrim) {
        setPrevScrim(scrim);
        setLive({
            status: scrim.status,
            result: scrim.result ?? null,
            readyHost: scrim.readyHost,
            readyOpponent: scrim.readyOpponent,
            partyCode: scrim.partyCode ?? null,
            matches: scrim.matches,
        });
        setInviteStatus(myInvitation?.status ?? null);
    }

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
                draftLink: m.draftLink ?? null,
                draftData: m.draftData ?? null,
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
        (event) => setLastDraftEvent(event),
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
    const canJoin = status === ScrimmageStatus.Open && !scrim.scheduledAt
        && !isHost && !isHostMember && !isOpponentMember
        && liveTeamIds.length === 6;

    const showReadyCheck = !isFinished && userId && showReadyState;
    // Ad-hoc live-team join — ASAP public scrims only. Scheduled public scrims are
    // org-only and use JoinScheduledScrim instead (see below).
    const showJoin = status === ScrimmageStatus.Open && !scrim.scheduledAt && userId && !isHost && !isHostMember;
    // Scheduled public scrim: any org manager can claim the open slot, then finalize
    // their roster once it's SCHEDULING and opponentOrg is their own org. Visible to
    // any eligible non-host visitor (mirrors showJoin) — the button itself is gated to
    // org managers inside the panel, same "always show, sometimes disable" pattern.
    const showJoinScheduled = status === ScrimmageStatus.Open && !!scrim.scheduledAt
        && !!userId && !isHost && !isHostMember;
    const showFinalizeOpponentRoster = status === ScrimmageStatus.Scheduling
        && !!scrim.opponentOrg && scrim.opponentOrg._id === viewerOrgId
        && !scrim.opponentTeam && isOpponentOrgManager;
    const canViewMatch = isHostMember || isOpponentMember || isHostLeader || isOpponentLeader || isOpponentOrgManager || isHostOrgManager;
    const canManageDraft = isHostLeader || isOpponentLeader || isHostOrgManager || isOpponentOrgManager;
    const showInvitation = myInvitation && !isFinished && !isActive && myInvitation.status === InvitationStatus.Pending;
    const showAcceptChallenge = status === ScrimmageStatus.Pending && myInvitation?.type === InvitationType.LeaderInvite && !!userId && myInvitation.status === InvitationStatus.Pending; //TODO;
    const isOrgChallenge = !!myInvitation && !!myInvitation.organization;
    // Finalizing a publicly-joined scheduled scrim has no invitation to source org data
    // from — pull the joining org's roster straight from scrim.opponentOrg instead
    // (already set to this org once the join/claim step ran).
    const isOrgRosterFlow = isOrgChallenge || showFinalizeOpponentRoster;
    const activeRosterOrgMembers = isOrgChallenge
        ? activeOrgMembers
        : (showFinalizeOpponentRoster ? (scrim.opponentOrg?.members.filter(m => m.status === OrgMemberStatus.Active) ?? []) : []);
    const rosterOrgId = isOrgChallenge ? myOrg?._id : (showFinalizeOpponentRoster ? scrim.opponentOrg?._id : undefined);
    const rosterOrgName = isOrgChallenge ? myOrg?.name : (showFinalizeOpponentRoster ? scrim.opponentOrg?.name : undefined);
    const showActions = !isFinished && userId && (canEndEarly || ((isHost || (isOpponentLeader && status === ScrimmageStatus.Scheduled)) && !isActive));
    const roster = isOrgRosterFlow ? Array.from(selectedTeamIds) : Array.from(liveTeamIds);

    // Captain doesn't have to be one of the 6 players actually scheduled to play — the
    // accepter might be a manager handling logistics for someone else. Any active,
    // verified org member is eligible; unverified (admin-created stub) accounts are not.
    const captainCandidates = isOrgRosterFlow
        ? activeRosterOrgMembers.filter(m => m.user.verified).map(m => ({ id: m.user._id, name: m.user.name }))
        : (liveTeam?.members ?? []).map(m => ({ id: m.userId, name: m.name }));
    const captainId = manualCaptainId && captainCandidates.some(c => c.id === manualCaptainId)
        ? manualCaptainId
        : (userId && captainCandidates.some(c => c.id === userId) ? userId : null);

    // Substitutes — org roster flows only. Free agents or players from other orgs the
    // accepting/joining org can add straight into an open roster slot; own-org members
    // are picked from the roster grid above instead.
    const substituteCandidates = allUsers.filter(u => !roster.includes(u._id) && u.organization?._id !== rosterOrgId && !scrim.hostTeam.members.some(m => m._id === u._id));
    const activeExternalPicks = externalPicks.filter(p => roster.includes(p._id));

    const rankAverageMMR = getRankAverages();
    const rankAverage = getRankByMMR(rankAverageMMR)
    const hostName = scrim.hostOrg?.name ?? scrim.hostTeam.name ?? "";
    const opponentName = scrim.opponentOrg?.name ?? scrim.opponentTeam?.name;

    const completedMatches = live.matches.filter((m) => m.result);
    const hostMatchWins = completedMatches.filter((m) => m.result === MatchResult.HostWin).length;
    const oppMatchWins = completedMatches.filter((m) => m.result === MatchResult.OpponentWin).length;
    const showSeriesScore = live.matches.length > 0;
    const hostWonSeries = isFinished && result === ScrimmageResult.HostWin;
    const oppWonSeries = isFinished && result === ScrimmageResult.OpponentWin;

    function getRankAverages() {
        const hostRankReduce = scrim.hostTeam.members.reduce((acc, memb) => {
            if (!memb.stats) return acc;
            acc[1]++;
            acc[0] += memb.stats.mmr;
            return acc;
        }, [0, 0])
        const hostRankAvg = hostRankReduce[0] / hostRankReduce[1];
        const opponentRankReduce = scrim.opponentTeam?.members.reduce((acc, memb) => {
            if (!memb.stats) return acc;
            acc[1]++;
            acc[0] += memb.stats.mmr;
            return acc;
        }, [0, 0])

        const opponentRankAvg = opponentRankReduce && opponentRankReduce[1] !== 0 ? opponentRankReduce[0] / opponentRankReduce[1] : 0;
        if (hostRankAvg === 0) return opponentRankAvg;
        if (opponentRankAvg === 0) return hostRankAvg;
        return (hostRankAvg + opponentRankAvg) / 2
    }

    function handleRespondToInvite(newStatus: InvitationStatus) {
        if (!myInvitation) return;
        setInviteStatus(newStatus);
        refresh(() => respondToInvitationAction(scrim._id, myInvitation.user._id, newStatus));
    }

    function handleReady(side: MatchSide, isReady: boolean) {
        setError(null);
        startTransition(async () => {
            try {
                if (isReady) {
                    const data = await unreadyAction(scrim._id, side);
                    if (data) {
                        applyAndBroadcast({
                            status: data.status as ScrimmageStatus,
                            readyHost: data.readyHost,
                            readyOpponent: data.readyOpponent,
                        });
                    }
                } else {
                    const data = await readyUpAction(scrim._id, side);
                    if (data) {
                        applyAndBroadcast({
                            status: data.status as ScrimmageStatus,
                            readyHost: data.readyHost,
                            readyOpponent: data.readyOpponent,
                        });
                    }
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

    function handleAcceptChallenge() {
        if (!userId || !captainId) return;
        setInviteStatus(InvitationStatus.Accepted);
        handleAction(acceptChallengeWithRosterAction(scrim._id, userId, roster, isOrgChallenge ? myOrg?.name : liveTeam?.name, captainId));
    }

    function handleDeclineChallenge() {
        if (!userId) return;
        setInviteStatus(InvitationStatus.Declined);
        handleAction(declineChallengeAction(scrim._id, userId));
    }

    // Claims an open slot on a scheduled public scrim for the viewer's org — no
    // roster yet, just reserves it (status → SCHEDULING). The roster is finalized
    // afterward via handleFinalizeRoster, once showFinalizeOpponentRoster is true.
    function handleJoinAsOrg() {
        if (!viewerOrgId) return;
        handleAction(joinScrimmageAction(scrim._id, undefined, viewerOrgId));
    }

    function handleFinalizeRoster() {
        if (!userId || !captainId) return;
        handleAction(setOpponentRoster(scrim._id, captainId, roster, rosterOrgName ?? undefined));
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
            <div className="bg-surface border border-edge rounded-lg overflow-hidden z-0">

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
                    {rankAverage && <Tooltip>
                        <TooltipTrigger>
                            <div className="w-10">
                                <img
                                    src={getRankImage(rankAverageMMR)}
                                    alt={rankAverage.rank.name}
                                    loading="lazy"
                                    className="object-cover"
                                />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{`${rankAverage.rank.name} ${rankAverage.division}`}</p>
                        </TooltipContent>
                    </Tooltip>}
                    <span className="text-xs text-muted ml-auto">{formatTimeAgo(new Date(scrim.createdAt))}</span>
                </div>

                {/* VS matchup */}
                <div className="relative grid grid-cols-2">
                    {/* Host */}
                    <div className="pl-6 pr-12 py-5 self-center flex min-w-0">
                        <div className="flex-1 min-w-0 relative">
                            <div className="flex gap-2">
                                <div className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-1.5">Host</div>
                            </div>
                            <div className="text-2xl flex items-center gap-3 font-black text-foreground leading-tight min-w-0">
                                <span className="truncate ">{hostName}</span>
                                {scrim.hostOrg && <span className="text-[12px] font-mono text-secondary bg-secondary/10 border border-secondary/20 px-1.5 py-0.5 rounded shrink-0">
                                    ORG
                                </span>}
                                {showSeriesScore && (
                                    <span className={cn(
                                        "text-5xl font-black shrink-0 absolute right-2 top-1/2 -translate-y-1/2",
                                        hostWonSeries ? "text-success" : oppWonSeries ? "text-muted" : "text-foreground"
                                    )}>
                                        {hostMatchWins}
                                    </span>
                                )}
                            </div>
                            {showReadyState && (
                                <div className={cn("text-xs font-semibold mt-2 flex items-center gap-1.5", readyHost ? "text-success" : "text-muted")}>
                                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", readyHost ? "bg-success" : "bg-muted")} />
                                    {readyHost ? "Ready" : "Not Ready"}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Opponent */}
                    <div className="pl-12 pr-6 py-5 text-right self-center flex min-w-0">
                        <div className="flex-1 min-w-0 relative">
                            <div className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-1.5">
                                {scrim.opponentOrg || scrim.opponentTeam ? "Opponent" : "Awaiting"}
                            </div>

                            <div className={cn("text-2xl justify-end flex items-center gap-3 font-black leading-tight min-w-0", scrim.opponentOrg || scrim.opponentTeam ? "text-foreground" : "text-edge")}>
                                {showSeriesScore && (
                                    <span className={cn(
                                        "text-5xl font-black shrink-0 absolute left-2 top-1/2 -translate-y-1/2",
                                        oppWonSeries ? "text-success" : hostWonSeries ? "text-muted" : "text-foreground"
                                    )}>
                                        {oppMatchWins}
                                    </span>
                                )}
                                {scrim.opponentOrg && <span className="text-[12px] font-mono text-secondary bg-secondary/10 border border-secondary/20 px-1.5 py-0.5 rounded shrink-0">
                                    ORG
                                </span>}
                                <span className="truncate">{opponentName ?? <p className="italic text-muted">TBD</p>}</span>
                            </div>
                            {showReadyState && scrim.opponentTeam && (
                                <div className={cn("text-xs font-semibold mt-2 flex items-center justify-end gap-1.5", readyOpponent ? "text-success" : "text-muted")}>
                                    {readyOpponent ? "Ready" : "Not Ready"}
                                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", readyOpponent ? "bg-success" : "bg-muted")} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* VS divider — absolutely pinned to the true center */}
                    <div className="absolute inset-y-0 left-1/2 z-0 -translate-x-1/2 flex items-center justify-center px-6 border-x border-edge bg-surface">
                        <span className="text-base font-black text-edge tracking-wider">VS</span>
                    </div>
                </div>

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
                                        {scrim.hostTeam.members.sort((a, b) => a._id === scrim.hostTeam!.leader._id ? -1 : 1).map(m => (
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
                                        {scrim.opponentTeam.members.sort((a, b) => a._id === scrim.opponentTeam!.leader._id ? -1 : 1).map(m => (
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

                    {/* Join as Org (scheduled public scrim) */}
                    {showJoinScheduled && (
                        <div className="bg-surface border border-edge rounded-lg p-4 space-y-3">
                            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Join Scrimmage</h3>
                            <p className="text-xs text-dimmed leading-relaxed">
                                This is a scheduled match — only organizations can join.{" "}
                                {viewerOrgId && isViewerOrgManager
                                    ? "Joining reserves this slot for your organization; you'll pick your 6-player roster next."
                                    : viewerOrgId
                                        ? "Only your organization's manager can join on its behalf."
                                        : "You need to be a manager of an organization to join."}
                            </p>
                            {viewerOrgId && isViewerOrgManager && (
                                <Button fullWidth disabled={pending} onClick={handleJoinAsOrg}>
                                    {pending ? "Joining…" : "Join as Your Organization"}
                                </Button>
                            )}
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

                    {/* User's Invitation */}
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
                <div className="bg-surface border border-edge rounded-lg p-4 space-y-3">
                    <MatchLog
                        scrimmageId={scrim._id}
                        canViewPartyCode={!isCompleted && canViewMatch}
                        matches={live.matches}
                        partyCode={live.partyCode}
                        isHostLeader={isHostLeader}
                        isOpponentLeader={isOpponentLeader}
                        hostName={hostName}
                        opponentName={opponentName ?? "Opponent"}
                        isActive={isActive}
                        onPatch={handleMatchLogPatch}
                    />

                    {/* Debug: raw Statlocker webhook payloads, visible only to whoever's
                        actually running the match, so we can see what Statlocker sends
                        without digging through server logs while its event shapes are
                        still unknown. Draft results normally come from the manual upload
                        in the match draft section above instead. */}
                    {canManageDraft && lastDraftEvent != null && (
                        <details className="text-xs text-muted">
                            <summary className="cursor-pointer hover:text-dimmed transition-colors">Last Draft Event (debug)</summary>
                            <pre className="mt-2 p-2 bg-surface-2 border border-edge rounded overflow-x-auto text-[11px] text-dimmed whitespace-pre-wrap break-all">
                                {JSON.stringify(lastDraftEvent, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>
            )}

            {/* ── Accept Challenge / Finalize Roster (full-width, below grid) ── */}
            {(showAcceptChallenge || showFinalizeOpponentRoster) && (
                <div className="bg-surface border border-edge rounded-lg p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">
                                {showFinalizeOpponentRoster ? "Finalize Roster" : "Accept Challenge"}
                            </h2>
                            {isOrgRosterFlow && (
                                <p className="text-sm text-dimmed mt-1">
                                    {showFinalizeOpponentRoster
                                        ? "You've claimed this scheduled scrimmage — select your organization's 6-player roster to confirm."
                                        : "Select your 6-player roster to accept this scrimmage."}
                                </p>
                            )}
                        </div>
                        <span className={cn("text-sm font-bold", roster.length === 6 ? "text-success" : "text-muted")}>
                            {roster.length}/6
                        </span>
                    </div>

                    {isOrgRosterFlow ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {activeRosterOrgMembers.length === 0 ? (
                                    <p className="text-xs text-muted italic col-span-3">No active members in this organization.</p>
                                ) : activeRosterOrgMembers.map(member => {
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
                            </div>

                            {activeExternalPicks.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {activeExternalPicks.map(p => (
                                        <span
                                            key={p._id}
                                            className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full border border-primary/40 bg-primary/5 text-xs text-foreground"
                                        >
                                            {p.name}
                                            <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Sub</span>
                                            <button
                                                type="button"
                                                onClick={() => removeSubstitute(p._id)}
                                                className="text-muted hover:text-danger transition-colors"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div>
                                <p className="text-xs font-semibold text-foreground mb-1.5">Add a substitute</p>
                                <p className="text-[11px] text-dimmed mb-1.5">
                                    Fill an open slot with a free agent or a player from another team.
                                </p>
                                <SubstitutePicker
                                    candidates={substituteCandidates}
                                    disabled={selectedTeamIds.size >= 6}
                                    onAdd={addSubstitute}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {!liveTeam || liveTeam.members.length === 0 ? (
                                <p className="text-xs text-muted italic col-span-3">No active team members found.</p>
                            ) : liveTeam.members.map(member => {
                                const stats = getRankByMMR(member.mmr);
                                return (
                                    <div
                                        key={member.userId}
                                        className="flex items-center gap-2.5 px-3 py-2.5 rounded border border-edge text-foreground"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold text-foreground shrink-0">
                                            {member.name.charAt(0)}
                                        </div>
                                        <span className="font-medium flex-1 text-xs truncate">{member.name}</span>
                                        {stats && (
                                            <span className="text-[10px] text-muted shrink-0">{`${stats.rank.name} ${stats.division}`}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {roster.length === 6 && (
                        <div className="space-y-2 pt-2 border-t border-edge">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Scrimmage Captain</h3>
                                {!captainId && <span className="text-[11px] text-danger font-medium">Select a captain</span>}
                            </div>
                            <p className="text-[11px] text-dimmed leading-relaxed">
                                The captain runs the scrimmage on your side — readying up, submitting match IDs, and setting the party code.
                                They don&apos;t need to be one of the 6 playing — pick whoever will actually be around for it, even if that isn&apos;t you.
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {captainCandidates.map(member => {
                                    const selected = captainId === member.id;
                                    return (
                                        <button
                                            key={member.id}
                                            type="button"
                                            onClick={() => setManualCaptainId(member.id)}
                                            className={cn(
                                                "flex items-center gap-2.5 px-3 py-2.5 rounded border text-left transition-colors",
                                                selected
                                                    ? "border-primary/40 bg-primary/5 text-foreground"
                                                    : "border-edge text-dimmed hover:text-foreground hover:border-foreground/20"
                                            )}
                                        >
                                            <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold text-foreground shrink-0">
                                                {member.name.charAt(0)}
                                            </div>
                                            <span className="font-medium flex-1 text-xs truncate">{member.name}</span>
                                            {selected && (
                                                <span className="text-[9px] font-bold text-primary bg-primary/10 px-1 py-0.5 rounded uppercase tracking-wider shrink-0">C</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}


                    <div className="flex items-center gap-3">
                        {showFinalizeOpponentRoster ? (
                            <Button
                                onClick={handleFinalizeRoster}
                                disabled={pending || roster.length !== 6 || !captainId}
                            >
                                {pending ? "Confirming…" : "Confirm Roster"}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={handleAcceptChallenge}
                                    disabled={pending || roster.length < 6 || !captainId}
                                >
                                    Accept Challenge
                                </Button>
                                <button
                                    onClick={handleDeclineChallenge}
                                    disabled={pending}
                                    className="px-4 py-2 text-sm font-semibold rounded bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
                                >
                                    {pending ? "…" : "Decline"}
                                </button>
                            </>
                        )}
                        {error && <p className="text-xs text-danger ml-auto self-center">{error}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}
