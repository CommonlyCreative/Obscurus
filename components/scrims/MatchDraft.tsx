"use client";

import { MatchResult } from "@/app/api/graphql/types/graphql";
import { DraftResults } from "./DraftResults";

export interface MatchDraftInfo {
    number: number;
    result?: MatchResult | null;
    draftLink?: string | null;
    draftData?: string | null;
}

// Drafts are created per match — each game in a series gets its own Statlocker lobby
// and its own picks/bans record. This wraps the lobby link/create-lobby control around
// DraftResults (which handles the upload + hero-image display) for a single match.
export function MatchDraft({
    match,
    hostName,
    opponentName,
    canManage,
    allowCreateLobby,
    creatingDraft,
    uploadingDraft,
    onCreateLobby,
    onUploadDraft,
}: {
    match: MatchDraftInfo;
    hostName: string;
    opponentName: string;
    canManage: boolean;
    allowCreateLobby: boolean;
    creatingDraft: boolean;
    uploadingDraft: boolean;
    onCreateLobby: () => void;
    onUploadDraft: (draftData: string) => void;
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Draft
                </span>
                {!match.draftLink && canManage && allowCreateLobby && (
                    <button
                        type="button"
                        onClick={onCreateLobby}
                        disabled={creatingDraft}
                        className="text-xs text-primary hover:text-primary-dim transition-colors disabled:opacity-50"
                    >
                        {creatingDraft ? "Creating…" : "Create Draft Lobby"}
                    </button>
                )}
            </div>

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
