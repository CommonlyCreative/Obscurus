"use client";

import { Suspense, useState, useTransition } from "react";
import { cn, formatTimeAgo } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { MatchResult } from "@/app/api/graphql/types/graphql";
import {
    startMatchAction,
    submitMatchResultAction,
    setPartyCodeAction,
    cancelMatchAction,
} from "@/app/scrims/[id]/actions";
import MatchData from "./MatchData";
import { toast } from "sonner";
import { getMatch } from "@/lib/actions/deadlockapi";

interface Match {
    number: number;
    match_id?: string | null;
    result?: MatchResult | null;
    startedAt: number;
    concludedAt?: number | null;
}

export interface MatchLogPatch {
    status?: string;
    result?: string | null;
    matches?: Match[];
    partyCode?: string | null;
}

interface MatchLogProps {
    scrimmageId: string;
    matches: Match[];
    partyCode?: string | null;
    isHostLeader: boolean;
    canViewParyCode: boolean;
    isActive: boolean;
    onPatch: (patch: MatchLogPatch) => void;
}

const RESULT_LABEL: Record<MatchResult, string> = {
    [MatchResult.HostWin]: "Host Win",
    [MatchResult.OpponentWin]: "Opp Win",
    [MatchResult.Draw]: "Draw",
    [MatchResult.Cancelled]: "Cancelled",
};

const RESULT_COLOR: Record<MatchResult, string> = {
    [MatchResult.HostWin]: "text-success",
    [MatchResult.OpponentWin]: "text-danger",
    [MatchResult.Draw]: "text-dimmed",
    [MatchResult.Cancelled]: "text-muted",
};

export function MatchLog({
    scrimmageId,
    matches,
    partyCode,
    isHostLeader,
    isActive,
    canViewParyCode,
    onPatch,
}: MatchLogProps) {
    const [pendingStart, startTransition] = useTransition();
    const [pendingSubmit, submitTransition] = useTransition();
    const [pendingCancel, submitCancelTransition] = useTransition();
    const [pendingCode, codeTransition] = useTransition();

    const [matchId, setMatchId] = useState("");
    const [hostTeamSide, setHostTeamSide] = useState<0 | 1 | null>(null);
    const [codeInput, setCodeInput] = useState(partyCode ?? "");
    const [codeEditing, setCodeEditing] = useState(!partyCode);
    const [error, setError] = useState<string | null>(null);
    const [matchInputError, setMatchInputError] = useState<string | null>(null);

    const activeMatch = matches.find((m) => !m.result);
    const completedMatches = matches.filter((m) => m.result);

    const hostWins = completedMatches.filter((m) => m.result === MatchResult.HostWin).length;
    const oppWins = completedMatches.filter((m) => m.result === MatchResult.OpponentWin).length;

    // Test later: 77989671, 77990585

    async function handlePasteMatchId() {
        try {
            const text = await navigator.clipboard.readText();
            const trimmed = text.trim();
            setMatchInputError(null);
            if (!trimmed || isNaN(Number(trimmed)) || !isFinite(Number(trimmed))) {
                setMatchInputError("Invalid Match ID. Copy a valid numeric match ID from Deadlock and try again.");
                return;
            }
            setMatchId(trimmed);
            setHostTeamSide(null);
        } catch {
            setMatchInputError("Could not read clipboard. Grant clipboard access and try again.");
        }
    }

    async function handleSelectTeam(team: 0 | 1) {
        if (hostTeamSide === team) {
            setHostTeamSide(null);
            return;
        }
        setHostTeamSide(team);
    }

    function handleStartMatch() {
        setError(null);
        startTransition(async () => {
            try {
                const data = await startMatchAction(scrimmageId);
                if (data) onPatch({ status: data.status, matches: data.matches });
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to start match");
            }
        });
    }

    function handleCancelMatch() {
        setError(null);
        startTransition(async () => {
            try {
                const data = await cancelMatchAction(scrimmageId);
                if (data) {
                    onPatch({ status: data.status, matches: data.matches });
                    toast.success("Cancelled match.");
                    setMatchId("");
                    setMatchInputError(null);
                    setHostTeamSide(null);
                }
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to cancel match");
            }
        });
    }

    function handleSubmitResult() {
        if (!activeMatch || !matchId.trim()) return;
        setError(null);
        submitTransition(async () => {
            try {
                let result = MatchResult.Draw;
                const metadata = await getMatch(matchId, Date.now());
                if (metadata && typeof metadata.match_info.winning_team === "number") {
                    const wt = metadata.match_info.winning_team;
                    result =
                        wt !== 0 && wt !== 1 ? MatchResult.Draw
                            : wt === hostTeamSide ? MatchResult.HostWin
                                : MatchResult.OpponentWin;
                }

                const data = await submitMatchResultAction(scrimmageId, activeMatch.number, matchId.trim(), result as MatchResult);
                setMatchId("");
                setHostTeamSide(null);
                if (data) onPatch({ status: data.status, result: data.result, matches: data.matches });
            } catch (e) {
                setError(e instanceof Error && typeof e.message === "string" ? e.message : "Failed to submit result");
            }
        });
    }

    function handleSaveCode() {
        if (!codeInput.trim()) return;
        setError(null);
        codeTransition(async () => {
            try {
                const data = await setPartyCodeAction(scrimmageId, codeInput.trim());
                setCodeEditing(false);
                if (data) onPatch({ partyCode: data.partyCode });
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to set party code");
            }
        });
    }

    return (
        <div className="space-y-4">
            {canViewParyCode ?
                /* Party code */
                <div className="bg-surface border border-edge rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">Party Code</span>
                        {isHostLeader && !codeEditing && (
                            <button
                                onClick={() => setCodeEditing(true)}
                                className="text-xs text-muted hover:text-dimmed transition-colors"
                            >
                                Change
                            </button>
                        )}
                    </div>

                    {codeEditing && isHostLeader ? (
                        <div className="flex gap-2">
                            <input
                                value={codeInput}
                                onChange={(e) => setCodeInput(e.target.value)}
                                placeholder="Enter party code"
                                className="flex-1 bg-surface-2 border border-edge rounded px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/60"
                            />
                            <Button size="sm" onClick={handleSaveCode} disabled={pendingCode || !codeInput.trim()}>
                                {pendingCode ? "Saving…" : "Save"}
                            </Button>
                        </div>
                    ) : partyCode ? (
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-lg font-bold text-primary tracking-widest">{partyCode}</span>
                            <button
                                onClick={() => navigator.clipboard.writeText(partyCode)}
                                className="text-xs text-muted hover:text-dimmed transition-colors"
                            >
                                Copy
                            </button>
                        </div>
                    ) : (
                        <p className="text-xs text-muted italic">
                            {isHostLeader ? "Set a party code so players can join the lobby." : "Waiting for host to set party code."}
                        </p>
                    )}
                </div>
                : <></>}

            {/* Series score */}
            {(hostWins > 0 || oppWins > 0) && (
                <div className="flex items-center justify-center gap-6 py-3 bg-surface border border-edge rounded-lg">
                    <div className="text-center">
                        <div className="text-2xl font-black text-foreground">{hostWins}</div>
                        <div className="text-xs text-muted">Host</div>
                    </div>
                    <div className="text-muted text-lg font-bold">—</div>
                    <div className="text-center">
                        <div className="text-2xl font-black text-foreground">{oppWins}</div>
                        <div className="text-xs text-muted">Opponent</div>
                    </div>
                </div>
            )}

            {/* Active match — in progress */}
            {activeMatch && (
                <div className="bg-surface border border-primary/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                            Match {activeMatch.number} — Live
                        </span>
                        <span className="text-xs text-muted ml-auto">
                            Started {formatTimeAgo(new Date(activeMatch.startedAt))}
                        </span>
                    </div>

                    {isHostLeader && (
                        <div className="space-y-3 pt-1">
                            {/* Match ID */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">Match ID</span>
                                    {matchId && (
                                        <button
                                            type="button"
                                            onClick={() => { setMatchId(""); setMatchInputError(null); setHostTeamSide(null); }}
                                            className="text-xs text-muted hover:text-danger transition-colors"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                {matchId ? (
                                    <div className="flex items-center gap-2.5 px-3 py-2 bg-success/5 border border-success/25 rounded">
                                        <svg className="w-3.5 h-3.5 text-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="font-mono text-sm text-foreground flex-1 truncate">{matchId}</span>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handlePasteMatchId}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-surface-2 border border-dashed border-edge rounded text-sm text-muted hover:text-dimmed hover:border-foreground/20 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        Paste Match ID from clipboard
                                    </button>
                                )}
                                {matchInputError && <p className="text-xs text-danger">{matchInputError}</p>}
                            </div>

                            {/* Team picker */}
                            <div className="space-y-1.5">
                                <span className="text-xs font-semibold text-muted uppercase tracking-wider">Which team were you?</span>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleSelectTeam(0)}
                                        className={cn(
                                            "flex-1 relative py-3 rounded border transition-all font-bigfishdd text-2xl",
                                            hostTeamSide === 0
                                                ? "bg-[#f7a711] border-[#9c6808] text-black shadow-[0_0_14px_#f7a71133]"
                                                : "bg-[#f7a711]/10 border-[#f7a711]/25 text-[#f7a711] hover:bg-[#f7a711]/20 hover:border-[#f7a711]/50",
                                            hostTeamSide === 1 && "opacity-35 pointer-events-none"
                                        )}
                                    >
                                        {hostTeamSide === 0 && (
                                            <span className="absolute top-1.5 right-2 text-[10px] font-sans font-bold text-black/50 tracking-normal">✓</span>
                                        )}
                                        Hidden King
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectTeam(1)}
                                        className={cn(
                                            "flex-1 relative py-3 rounded border transition-all font-slimkim text-2xl",
                                            hostTeamSide === 1
                                                ? "bg-[#60a4e4] border-[#215a8f] text-black shadow-[0_0_14px_#60a4e433]"
                                                : "bg-[#60a4e4]/10 border-[#60a4e4]/25 text-[#60a4e4] hover:bg-[#60a4e4]/20 hover:border-[#60a4e4]/50",
                                            hostTeamSide === 0 && "opacity-35 pointer-events-none"
                                        )}
                                    >
                                        {hostTeamSide === 1 && (
                                            <span className="absolute top-1.5 right-2 text-[10px] font-sans font-bold text-black/50 tracking-normal">✓</span>
                                        )}
                                        Arch Mother
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs text-muted italic">Submit result only <strong>after</strong> game has ended.</p>
                            <div className="flex gap-2">
                                <Button
                                    fullWidth
                                    size="sm"
                                    onClick={handleSubmitResult}
                                    disabled={pendingSubmit || !matchId.trim() || hostTeamSide === null}
                                >
                                    {pendingSubmit ? "Submitting…" : "Submit Result"}
                                </Button>
                                <button
                                    onClick={handleCancelMatch}
                                    disabled={pendingCancel}
                                    className="shrink-0 px-4 py-1.5 text-sm font-semibold rounded border border-danger/40 text-danger bg-danger/5 hover:bg-danger/15 hover:border-danger/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {pendingCancel ? "Canceling..." : "Cancel match"}
                                </button>
                            </div>
                        </div>
                    )}

                    {!isHostLeader && (
                        <p className="text-xs text-muted italic">Waiting for host to submit the match result.</p>
                    )}
                </div>
            )}

            {/* Start next match */}
            {isActive && !activeMatch && isHostLeader && partyCode && (
                <Button
                    fullWidth
                    size="md"
                    onClick={handleStartMatch}
                    disabled={pendingStart}
                >
                    {pendingStart ? "Starting…" : matches.length === 0 ? "Start Match" : "Start Next Match"}
                </Button>
            )}

            {/* No party code yet — can't start */}
            {isActive && !activeMatch && isHostLeader && !partyCode && (
                <p className="text-xs text-muted text-center italic">Set a party code above before starting a match.</p>
            )}

            {/* Completed match history */}
            {completedMatches.length > 0 && (
                <div>
                    <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Match History</div>
                    <div className="space-y-1.5">
                        {completedMatches.map((m) => (
                            <div key={m.number} className="bg-surface border border-edge rounded px-3 py-2">
                                <div className="flex items-center gap-3 p-4">
                                    <span className="text-xs text-muted w-14 flex-1">Match {m.number}</span>
                                    {/* <span className={cn("text-xs font-semibold flex-1", m.result ? RESULT_COLOR[m.result] : "text-muted")}>
                                        {m.result ? RESULT_LABEL[m.result] : "—"}
                                    </span> */}
                                    {m.match_id && (
                                        <span className={cn("px-2.5 py-1 rounded-full text-xs transition cursor-pointer",
                                            "text-muted border-muted/30 hover:text-mauve-500 hover:bg-mauve-500/10",
                                            "font-mono truncate max-w-28 bg-muted/10"
                                        )} title={m.match_id} onClick={() => {
                                            if (!m.match_id) return;
                                            toast.success("Copied Match Id")
                                            navigator.clipboard.writeText(m.match_id)
                                        }}>
                                            {m.match_id}
                                        </span>
                                    )}
                                    {m.concludedAt && (
                                        <span className="text-xs text-muted shrink-0">
                                            {formatTimeAgo(new Date(m.concludedAt))}
                                        </span>
                                    )}
                                </div>
                                {m.match_id ?
                                    <MatchData match_id={m.match_id} result={m.result!} /> : <></>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {error && (
                <p className="text-xs text-danger">{error}</p>
            )}
        </div>
    );
}

