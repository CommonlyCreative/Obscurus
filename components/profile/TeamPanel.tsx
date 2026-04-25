"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { PlayerSlot } from "./PlayerSlot";
import { Button } from "@/components/shared/Button";
import { useTeamSocket } from "@/hooks/useTeamSocket";
import { createSocketTeam, renameSocketTeam, type LiveMember } from "@/lib/socket/teams";
import { socket } from "@/lib/socket/socket-client";
import { authClient } from "@/lib/database/auth-client";
import { Role } from "@/app/api/graphql/types/graphql";
import { OrgCard, type OrgCardOrg, type OrgCardScrim } from "./OrgCard";

type Tab = "online" | "organization";


export function TeamPanel({
    profileUserId,
    isOwner,
    org,
    orgScrims,
}: {
    profileUserId: string;
    isOwner: boolean;
    org?: OrgCardOrg | null;
    orgScrims?: OrgCardScrim[];
}) {
    const { teams, loading } = useTeamSocket([profileUserId]);
    const team = teams[profileUserId]
    const [tab, setTab] = useState<Tab>("online");
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteInput, setInviteInput] = useState("");
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState("");
    const { data: session } = authClient.useSession();

    console.log("TEAMS", teams)

    const user = session?.user;
    const maxSize = team?.maxSize ?? 6;
    const members = team?.members ?? [];
    const emptySlots = maxSize - members.length;
    const slots: (LiveMember | undefined)[] = team
        ? [
            ...members,
            ...Array.from({ length: emptySlots }).map(() => undefined),
        ]
        : [];

    function handleSaveName() {
        const trimmed = nameInput.trim();
        if (trimmed && trimmed !== team?.name) renameSocketTeam(trimmed);
        setEditingName(false);
    }

    function handleCreateTeam() {
        if (!user)return;
        createSocketTeam({ name: user.name, mmr: user.mmr, role: "" }, user.name +"'s Team")
    }

    function handleDisband() {
        socket.emit("team:leave");
        setInviteOpen(false);
    }

    function handleFill() {
        socket.emit("team:fill");
    }

    return (
        <div className="space-y-3">
            {/* Tab strip */}
            <div className="flex gap-1 bg-surface-2 rounded-lg p-1">
                {(["online", "organization"] as Tab[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${tab === t
                                ? "bg-surface text-foreground shadow-sm"
                                : "text-muted hover:text-dimmed"
                            }`}
                    >
                        {t === "online" ? "Online Team" : "Organization"}
                    </button>
                ))}
            </div>

            {tab === "online" && (
                <>
                    <div className="bg-surface border border-edge rounded-lg overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-edge">
                            <div>
                                <div className="flex items-center gap-1.5">
                                    {editingName ? (
                                        <input
                                            autoFocus
                                            value={nameInput}
                                            onChange={e => setNameInput(e.target.value)}
                                            onBlur={handleSaveName}
                                            onKeyDown={e => {
                                                if (e.key === "Enter") handleSaveName();
                                                if (e.key === "Escape") setEditingName(false);
                                            }}
                                            className="bg-transparent border-b border-primary/50 text-sm font-bold text-foreground focus:outline-none w-40"
                                        />
                                    ) : (
                                        <>
                                            <span className="text-sm font-bold text-foreground">
                                                {team ? team.name : "Online Team"}
                                            </span>
                                            {team && isOwner && (
                                                <button
                                                    onClick={() => { setNameInput(team.name); setEditingName(true); }}
                                                    className="text-muted hover:text-dimmed transition-colors"
                                                >
                                                    <Pencil className="w-3 h-3" />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="text-xs text-muted mt-0.5">
                                    {team
                                        ? `${members.length} / ${maxSize} players`
                                        : "No active team"}
                                </div>
                            </div>
                            {team && (
                                <div className="flex gap-1.5">
                                    {Array.from({ length: maxSize }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-2.5 h-2.5 rounded-full transition-colors ${i < members.length ? "bg-primary" : "bg-edge"
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Body */}
                        {loading ? (
                            <div className="p-8 flex justify-center">
                                <div className="w-5 h-5 rounded-full border-2 border-edge border-t-primary animate-spin" />
                            </div>
                        ) : team ? (
                            <>
                                <div className="p-3 space-y-2">
                                    {slots.map((player, i) => (
                                        <PlayerSlot key={i} player={player} index={i} />
                                    ))}
                                </div>

                                {isOwner && (
                                    <div className="border-t border-edge p-3 space-y-2">
                                        {emptySlots > 0 ? (
                                            inviteOpen ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        value={inviteInput}
                                                        onChange={(e) => setInviteInput(e.target.value)}
                                                        placeholder="Enter username or Discord tag"
                                                        className="flex-1 bg-surface-2 border border-edge rounded px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                                                    />
                                                    <Button
                                                        className="px-3 shrink-0"
                                                        onClick={() => {
                                                            setInviteOpen(false);
                                                            setInviteInput("");
                                                        }}
                                                    >
                                                        Send
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        className="px-3 text-muted"
                                                        onClick={() => setInviteOpen(false)}
                                                    >
                                                        ✕
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="secondary"
                                                    fullWidth
                                                    className="border-dashed text-muted hover:text-primary hover:border-primary/40 px-0 py-2"
                                                    onClick={() => setInviteOpen(true)}
                                                >
                                                    + Invite a Player
                                                </Button>
                                            )
                                        ) : (
                                            <div className="text-center py-1">
                                                <span className="text-xs font-semibold text-success">
                                                    ✓ Team is full — ready to create a match
                                                </span>
                                            </div>
                                        )}
                                        <Button
                                            variant="secondary"
                                            fullWidth
                                            className="px-0 py-1.5 text-xs text-danger border-danger/20 hover:border-danger/40"
                                            onClick={handleDisband}
                                        >
                                            Disband Team
                                        </Button>
                                        {user && isOwner && user.role === Role.Admin ? 
                                        <Button
                                            variant="primary"
                                            fullWidth
                                            className="px-0 py-1.5 text-xs text-black border-primary/20 hover:border-primary/40"
                                            onClick={handleFill}
                                        >
                                            Create Filler Team
                                        </Button>
                                        : <></>}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="p-8 flex flex-col items-center gap-3 text-center">
                                {isOwner ? (
                                    <>
                                        <p className="text-xs text-muted max-w-48">
                                            You don't have an active team. Start one to invite players.
                                        </p>
                                        <Button onClick={handleCreateTeam} className="px-5">
                                            Start a Team
                                        </Button>
                                    </>
                                ) : (
                                    <p className="text-xs text-muted">
                                        This player isn't currently forming a team.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Create Match callout */}
                    {team && isOwner && emptySlots > 0 && (
                        <div className="px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg">
                            <p className="text-xs text-dimmed leading-relaxed">
                                <span className="text-primary font-semibold">
                                    {emptySlots} slot{emptySlots !== 1 ? "s" : ""} remaining.
                                </span>{" "}
                                Invite {emptySlots} more player{emptySlots !== 1 ? "s" : ""} to unlock{" "}
                                <span className="text-foreground font-medium">Create Match</span>.
                            </p>
                        </div>
                    )}
                </>
            )}

            {tab === "organization" && (
                <div className="bg-surface border border-edge rounded-lg overflow-hidden">
                    {org ? (
                        <OrgCard org={org} scrims={orgScrims ?? []} />
                    ) : (
                        <>
                            <div className="px-5 py-4 border-b border-edge">
                                <div className="text-sm font-bold text-foreground">Organization</div>
                                <div className="text-xs text-muted mt-0.5">Persistent team membership</div>
                            </div>
                            <div className="p-8 flex flex-col items-center gap-3 text-center">
                                {isOwner ? (
                                    <>
                                        <p className="text-xs text-muted max-w-48">
                                            You're not part of an organization yet. Request one to get started.
                                        </p>
                                        <Button href="/org/request" className="px-5">
                                            Request Organization
                                        </Button>
                                    </>
                                ) : (
                                    <p className="text-xs text-muted">
                                        This player isn't currently part of an organization.
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
