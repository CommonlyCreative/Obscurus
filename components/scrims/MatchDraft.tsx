"use client";

import { useState } from "react";
import { MatchResult } from "@/app/api/graphql/types/graphql";
import { DraftResults } from "./DraftResults";

export interface MatchDraftInfo {
    number: number;
    result?: MatchResult | null;
    draftLink?: string | null;
    draftData?: string | null;
}

// Drafts are created per match — each game in a series gets its own Statlocker lobby
// and its own picks/bans record. Nothing creates a lobby automatically: a leader either
// presses "Create Draft Lobby" to generate one, or pastes a link if they already made
// one themselves. This wraps that control, plus DraftResults (upload + hero-image
// display), for a single match.
export function MatchDraft({
    match,
    hostName,
    opponentName,
    canManage,
    allowCreateLobby,
    creatingDraft,
    uploadingDraft,
    settingDraftLink,
    onCreateLobby,
    onUploadDraft,
    onSetDraftLink,
}: {
    match: MatchDraftInfo;
    hostName: string;
    opponentName: string;
    canManage: boolean;
    allowCreateLobby: boolean;
    creatingDraft: boolean;
    uploadingDraft: boolean;
    settingDraftLink: boolean;
    onCreateLobby: () => void;
    onUploadDraft: (draftData: string) => void;
    onSetDraftLink: (draftLink: string) => void;
}) {
    const [pastingLink, setPastingLink] = useState(false);
    const [linkInput, setLinkInput] = useState("");

    function handleSaveLink() {
        const trimmed = linkInput.trim();
        if (!trimmed) return;
        onSetDraftLink(trimmed);
        setLinkInput("");
        setPastingLink(false);
    }

    const showLobbyControls = !match.draftLink && canManage && allowCreateLobby;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Draft
                </span>
                {showLobbyControls && !pastingLink && (
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setPastingLink(true)}
                            className="text-xs text-muted hover:text-dimmed transition-colors"
                        >
                            Paste Link
                        </button>
                        <button
                            type="button"
                            onClick={onCreateLobby}
                            disabled={creatingDraft}
                            className="text-xs text-primary hover:text-primary-dim transition-colors disabled:opacity-50"
                        >
                            {creatingDraft ? "Creating…" : "Create Draft Lobby"}
                        </button>
                    </div>
                )}
            </div>

            {showLobbyControls && pastingLink && (
                <div className="flex items-center gap-2">
                    <input
                        autoFocus
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        placeholder="Paste draft lobby link…"
                        disabled={settingDraftLink}
                        className="flex-1 bg-surface-2 border border-edge rounded px-2 py-1 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary/60"
                    />
                    <button
                        type="button"
                        onClick={handleSaveLink}
                        disabled={settingDraftLink || !linkInput.trim()}
                        className="text-xs font-semibold text-primary hover:text-primary-dim transition-colors disabled:opacity-50"
                    >
                        {settingDraftLink ? "Saving…" : "Save"}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setPastingLink(false); setLinkInput(""); }}
                        className="text-xs text-muted hover:text-dimmed transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {match.draftLink && !match.result && (
                <a
                    href={match.draftLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-sm font-semibold text-primary hover:text-primary-dim transition-colors underline underline-offset-2"
                >
                    View Draft Lobby
                </a>
            )}

            <DraftResults
                draftData={match.draftData ?? null}
                hostName={hostName}
                opponentName={opponentName}
                canUpload={canManage}
                pending={uploadingDraft}
                onUpload={onUploadDraft}
            />
        </div>
    );
}
