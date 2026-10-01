"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { getHeroImage } from "@/lib/heroImage";
import type { StatlockerDraftAction } from "@/lib/types/deadlock/statlocker";
import { SeparatorVertical } from "lucide-react";
import { Separator } from "../ui/separator";

function parseDraftData(raw: string | null | undefined): StatlockerDraftAction[] | null {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        return isValidDraftExport(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

function isValidDraftExport(value: unknown): value is StatlockerDraftAction[] {
    return Array.isArray(value) && value.every((a) =>
        a && typeof a === "object"
        && (a.team === "team1" || a.team === "team2")
        && (a.type === "ban" || a.type === "pick")
        && typeof a.heroId === "number"
        && typeof a.hero === "string"
    );
}

// Statlocker's team1/team2 don't always line up with our host/opponent — e.g. when the
// lobby was created outside ensureStatlockerDraft (a manually pasted link), there's no
// guarantee team1 was the host side. Flips every action's side so a leader can correct
// a reversed upload without re-uploading the file.
function swapDraftTeams(list: StatlockerDraftAction[]): StatlockerDraftAction[] {
    return list.map((a) => ({ ...a, team: a.team === "team1" ? "team2" : "team1" }));
}

function HeroTile({ action }: { action: StatlockerDraftAction }) {
    const isBan = action.type === "ban";
    const image = getHeroImage(action.heroId);

    return (
        <div className="w-16 shrink-0">
            <div className={cn(
                "relative w-16 h-18 rounded overflow-hidden border",
                isBan ? "border-danger/40" : "border-success/40"
            )}>
                {image ? (
                    <img
                        src={image}
                        alt={action.hero}
                        className={cn("w-full h-full object-cover", isBan && "grayscale opacity-50")}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-2 text-[9px] text-muted text-center px-1">
                        {action.hero}
                    </div>
                )}
                {/* Pick/ban banner */}
                <span className={cn(
                    "absolute bottom-0 inset-x-0 text-[9px] font-bold uppercase tracking-wider text-center py-0.5",
                    isBan ? "bg-danger/90 text-white" : "bg-success/90 text-black"
                )}>
                    {isBan ? "Ban" : "Pick"}
                </span>
                {isBan && (
                    <span className="absolute inset-0 flex items-center justify-center text-danger text-2xl font-black">✕</span>
                )}
            </div>
            <p className="text-[9px] text-muted text-center truncate mt-0.5">{action.hero}</p>
        </div>
    );
}

function ActionList({ list }: { list: StatlockerDraftAction[] }) {
    if (list.length === 0) return <p className="text-xs text-muted italic">No actions.</p>;
    return (
        <>
            <div className="flex flex-wrap gap-2 justify-center">
                {list.filter(a => a.type === 'ban').map((a) => <HeroTile key={a.id} action={a} />)}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
                {list.filter(a => a.type === 'pick').map((a) => <HeroTile key={a.id} action={a} />)}
            </div>
        </>
    );
}

// Statlocker doesn't reliably call the webhook back with draft results, so a leader
// uploads the draft's JSON export (downloaded from Statlocker) directly instead. This
// parses and displays it, and lets a leader replace it if they uploaded the wrong file.
export function DraftResults({
    draftData,
    hostName,
    opponentName,
    canUpload,
    pending,
    onUpload,
}: {
    draftData: string | null;
    hostName: string;
    opponentName: string;
    canUpload: boolean;
    pending: boolean;
    onUpload: (draftData: string) => void;
}) {
    const [uploadError, setUploadError] = useState<string | null>(null);
    const inputId = useId();
    const actions = parseDraftData(draftData);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        setUploadError(null);
        try {
            const parsed = JSON.parse(await file.text());
            if (!isValidDraftExport(parsed)) {
                setUploadError("That doesn't look like a Statlocker draft export.");
                return;
            }
            onUpload(JSON.stringify(parsed));
        } catch {
            setUploadError("Couldn't read that file as JSON.");
        }
    }

    function handleSwapTeams() {
        if (!actions) return;
        onUpload(JSON.stringify(swapDraftTeams(actions)));
    }

    const uploadControl = canUpload && (
        <div>
            <input
                id={inputId}
                type="file"
                accept="application/json,.json"
                onChange={handleFileChange}
                disabled={pending}
                className="hidden"
            />
            <div className="flex items-center gap-3">
                <label
                    htmlFor={inputId}
                    className={cn(
                        "inline-flex items-center gap-2 text-xs font-semibold transition-colors cursor-pointer",
                        pending ? "opacity-50 pointer-events-none text-muted" : actions ? "text-muted hover:text-dimmed" : "px-3 py-1.5 rounded border border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"
                    )}
                >
                    {pending ? "Uploading…" : actions ? "Replace with a different file" : "Upload Draft JSON"}
                </label>
                {actions && (
                    <button
                        type="button"
                        onClick={handleSwapTeams}
                        disabled={pending}
                        className="text-xs font-semibold text-muted hover:text-dimmed transition-colors disabled:opacity-50"
                        title="Flip which side each team's picks/bans are shown under"
                    >
                        Swap Teams
                    </button>
                )}
            </div>
            {uploadError && <p className="text-xs text-danger mt-1">{uploadError}</p>}
        </div>
    );

    if (!actions) {
        return (
            <div className="space-y-2">
                <p className="text-xs text-muted italic">
                    {canUpload ? "Upload the draft export (JSON) from Statlocker to record picks and bans here." : "Draft results haven't been uploaded yet."}
                </p>
                {uploadControl}
            </div>
        );
    }

    const team1Actions = actions.filter(a => a.team === "team1");
    const team2Actions = actions.filter(a => a.team === "team2");

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-widest">{hostName}</span>
                    <ActionList list={team1Actions} />
                </div>
                <Separator orientation="vertical" />
                <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-widest">{opponentName}</span>
                    <ActionList list={team2Actions} />
                </div>
            </div>
            {uploadControl}
        </div>
    );
}
