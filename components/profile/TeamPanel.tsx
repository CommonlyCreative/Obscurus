"use client";

import { useEffect, useState } from "react";
import { MailCheck, Pencil } from "lucide-react";
import { PlayerSlot } from "./PlayerSlot";
import { Button } from "@/components/shared/Button";
import { findTeam, getMember, isActiveMember, isMember, useTeamSocket } from "@/hooks/useTeamSocket";
import { createSocketTeam, renameSocketTeam, type LiveMember } from "@/lib/socket/teams";
import { socket } from "@/lib/socket/socket-client";
import { authClient } from "@/lib/database/auth-client";
import { NotificationType, Role, UserProfileQuery } from "@/app/api/graphql/types/graphql";
import { OrgCard, type OrgCardOrg, type OrgCardScrim } from "./OrgCard";
import {
    Combobox,
    ComboboxCollection,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxInput,
    ComboboxItem,
    ComboboxLabel,
    ComboboxList,
    ComboboxSeparator,
} from "@/components/ui/combobox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useParams, useRouter } from "next/navigation";
import { ArrayElement } from "@/lib/utils";
import { sendNotification } from "@/lib/socket/notifications";
import { toast } from "sonner";
import { getStatlockerRankAction } from "@/app/profile/[id]/actions";
import { convertSteam64toSteam32 } from "@/lib/deadlock";

type Tab = "online" | "organization";

type UserEntry = ArrayElement<UserProfileQuery["getUsers"]>;
type UserGroup = { label: string; inTeam: boolean; items: UserEntry[] };


export function TeamPanel({
    profileUserId,
    isOwner,
    org,
    orgScrims,
    allUsers,
}: {
    profileUserId: string;
    isOwner: boolean;
    org?: NonNullable<UserProfileQuery["getUser"]>["organization"];
    orgScrims?: OrgCardScrim[];
    allUsers: UserEntry[];
}) {
    const router = useRouter();
    const { teams, loading } = useTeamSocket([profileUserId]);
    const { teams: allLiveTeams } = useTeamSocket("all");
    const team = findTeam(teams, profileUserId);
    const [tab, setTab] = useState<Tab>("online");
    const [inviteOpen, setInviteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserEntry | null>(null);
    const [blockedUser, setBlockedUser] = useState<string | null>(null);
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState("");
    const { data: session } = authClient.useSession();

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

    const myMembership = user && team ? getMember(team, user.id) : undefined;
    const isJoinedMember = !isOwner && myMembership?.status === "JOINED";
    const isInvitedMember = !isOwner && myMembership?.status === "INVITED";

    const currentMemberIds = new Set(members.map(m => m.userId));
    const isInAnyLiveTeam = (userId: string) =>
        !!findTeam(allLiveTeams, userId);

    const eligible = allUsers.filter(u => u._id !== profileUserId && !currentMemberIds.has(u._id));
    const noTeamUsers = eligible.filter(u => !isInAnyLiveTeam(u._id));
    const inTeamUsers = eligible.filter(u => isInAnyLiveTeam(u._id));
    const userGroups: UserGroup[] = [
        ...(noTeamUsers.length > 0 ? [{ label: "No active team", inTeam: false, items: noTeamUsers }] : []),
        ...(inTeamUsers.length > 0 ? [{ label: "In a team", inTeam: true, items: inTeamUsers }] : []),
    ];

    function handleSaveName() {
        const trimmed = nameInput.trim();
        if (trimmed && trimmed !== team?.name) renameSocketTeam(trimmed);
        setEditingName(false);
    }

    async function handleCreateTeam() {
        if (!user) return;
        if (!user.steam?.id) {
            return toast.error("Steam Required", {
                description: "Please connect your steam to create a team",
                action: {
                    label: "Connect",
                    onClick: () => router.push(`${process.env.NEXT_PUBLIC_SOCKET_URL}/auth/steam`)
                }
            })
        }
        const statlocker = await getStatlockerRankAction(convertSteam64toSteam32(user.steam.id))
        createSocketTeam({ name: user.name, mmr: statlocker.averageMatchRankNumber, status: "JOINED" }, user.name + "'s Team");
    }

    function handleDisband() {
        socket.emit("team:leave");
        setInviteOpen(false);
    }

    function handleFill() {
        socket.emit("team:fill");
    }

    async function handleSendInvite() {
        if (!selectedUser || !user) return;
        if (!!selectedUser.blockInvites) {
            toast.error(`${selectedUser.name} has their invites disabled.`);
            setSelectedUser(null)
            return;
        }

        socket.emit("team:invite", {
            userId: selectedUser._id,
            mmr: selectedUser.stats?.mmr,
            name: selectedUser.name,
            status: "INVITED",
        } as LiveMember);

        sendNotification({
            recipientId: selectedUser._id,
            type: NotificationType.Invitation,
            title: `${user.name} invited you to their team!`,
            description: "",
            senderName: team?.name ?? user.name,
            actionId: team?.leaderId
        })
        setInviteOpen(false);
        setSelectedUser(null);
    }

    useEffect(() => {
        // This runs on mount (i.e., after a refresh)
        if (window.location.hash) {
            // Replaces the URL with the current pathname, stripping the hash
            router.replace(window.location.pathname);
        }
    }, [router]);

    return (
        <>
            <Dialog open={blockedUser !== null} onOpenChange={open => { if (!open) setBlockedUser(null); }}>
                <DialogContent showCloseButton>
                    <DialogHeader>
                        <DialogTitle>Cannot Invite Player</DialogTitle>
                        <DialogDescription>
                            <span className="font-semibold text-foreground">{blockedUser}</span> is already part of an active team and cannot be invited.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter showCloseButton />
                </DialogContent>
            </Dialog>

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
                                        {slots.sort((a, b) => {
                                            if (!a) return 1;
                                            if (!b) return -1;
                                            if (a.status === b.status) return 0;
                                            if (a.status === "JOINED") return -1;
                                            if (b.status === "JOINED") return 1;
                                            return 0;
                                        }).map((player, i) => (
                                            <PlayerSlot
                                                key={i}
                                                isOwner={isOwner}
                                                isTeammateViewer={!!user && isActiveMember(team, user.id)}
                                                player={player}
                                                onEmptySlotClick={() => {
                                                    setInviteOpen(true)
                                                    router.push("#invite-player")
                                                }}
                                                index={i}
                                                onRemove={isOwner && player && player.userId !== team.leaderId
                                                    ? () => socket.emit("team:kick", player.userId)
                                                    : undefined}
                                            />
                                        ))}
                                    </div>

                                    {isOwner && (
                                        <div className="border-t border-edge p-3 space-y-2">
                                            {emptySlots > 0 ? (
                                                inviteOpen ? (
                                                    <div className="flex gap-2" id="invite-player">
                                                        <Combobox items={userGroups}>
                                                            <ComboboxInput
                                                                placeholder="Search players..."
                                                                showClear
                                                                className="flex-1"
                                                                onClear={() => setSelectedUser(null)}
                                                            />
                                                            <ComboboxContent>
                                                                <ComboboxEmpty>No players found.</ComboboxEmpty>
                                                                <ComboboxList>
                                                                    {(group: UserGroup, index: number) => (
                                                                        <ComboboxGroup key={group.label} items={group.items}>
                                                                            <ComboboxLabel>{group.label}</ComboboxLabel>
                                                                            <ComboboxCollection>
                                                                                {(item: UserEntry) => (
                                                                                    <ComboboxItem
                                                                                        key={item._id}
                                                                                        value={item.name}
                                                                                        className="data-highlighted:bg-accent/10"
                                                                                        onClick={() => {
                                                                                            if (group.inTeam) {
                                                                                                setBlockedUser(item.name);
                                                                                                setSelectedUser(null);
                                                                                            } else {
                                                                                                setSelectedUser(item);
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        {item.name}
                                                                                    </ComboboxItem>
                                                                                )}
                                                                            </ComboboxCollection>
                                                                            {index < userGroups.length - 1 && <ComboboxSeparator />}
                                                                        </ComboboxGroup>
                                                                    )}
                                                                </ComboboxList>
                                                            </ComboboxContent>
                                                        </Combobox>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="primary"
                                                                className="flex-1"
                                                                disabled={!selectedUser}
                                                                onClick={handleSendInvite}
                                                            >
                                                                <MailCheck className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="secondary"
                                                                className="px-3 text-muted"
                                                                onClick={() => { setInviteOpen(false); setSelectedUser(null); }}
                                                            >
                                                                ✕
                                                            </Button>
                                                        </div>
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

                                    {(isJoinedMember || isInvitedMember) && (
                                        <div className="border-t border-edge p-3 space-y-2">
                                            {isInvitedMember && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        fullWidth
                                                        className="px-0 py-1.5 text-xs text-danger border-danger/20 hover:border-danger/40"
                                                        onClick={() => socket.emit("team:invite:respond", false, team.leaderId)}
                                                    >
                                                        Decline
                                                    </Button>
                                                    <Button
                                                        fullWidth
                                                        className="px-0 py-1.5 text-xs"
                                                        onClick={() => socket.emit("team:invite:respond", true, team.leaderId)}
                                                    >
                                                        Accept
                                                    </Button>
                                                </div>
                                            )}
                                            {isJoinedMember && (
                                                <Button
                                                    variant="secondary"
                                                    fullWidth
                                                    className="px-0 py-1.5 text-xs text-danger border-danger/20 hover:border-danger/40"
                                                    onClick={() => socket.emit("team:leave")}
                                                >
                                                    Leave Team
                                                </Button>
                                            )}
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
        </>
    );
}
