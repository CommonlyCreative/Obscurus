"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { SectionCard } from "@/components/shared/SectionCard";
import { OrgRole } from "@/app/api/graphql/types/graphql";
import { ArrayElement, cn } from "@/lib/utils";
import {
    setCoreTeamAction,
    inviteMemberAction,
    removeMemberAction,
    updateMemberRoleAction,
    updateMemberIsPlayerAction,
    fillWithFillers,
    disbandOrganizationAction,
    createPlaceholderPlayerAction,
    type FillerMember,
} from "@/app/org/[slug]/manage/actions";
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
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { InputGroupAddon } from "@/components/ui/input-group";
import { UserPlus, UserRoundPlus } from "lucide-react";
import type { ManagedOrg, OrgMemberEntry, OrgUserSearch } from "./types";

export function OrgManagePanel({
    org,
    users,
    currentUserId,
}: {
    org: ManagedOrg;
    users: OrgUserSearch;
    currentUserId: string;
}) {
    const router = useRouter();

    const [coreTeamIds, setCoreTeamIds] = useState<Set<string>>(new Set(org.coreTeamIds));
    const [coreTeamPending, startCoreTeamTransition] = useTransition();
    const [coreTeamError, setCoreTeamError] = useState<string | null>(null);
    const [coreTeamSuccess, setCoreTeamSuccess] = useState(false);

    const [inviteUser, setInviteUser] = useState<ArrayElement<ArrayElement<OrgUserSearch>["items"]> | null>(null);
    const [inviteRole, setInviteRole] = useState<OrgRole>(OrgRole.Player);
    const [invitePending, startInviteTransition] = useTransition();
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [inviteSuccess, setInviteSuccess] = useState(false);

    const [memberRolePending, startMemberRoleTransition] = useTransition();
    const [memberRemovePending, startMemberRemoveTransition] = useTransition();
    const [memberActionError, setMemberActionError] = useState<string | null>(null);
    const [memberActionSuccess, setMemberActionSuccess] = useState<string | null>(null);
    const [members, setMembers] = useState<OrgMemberEntry[]>(org.members);

    const [playerName, setPlayerName] = useState("");
    const [playerEmail, setPlayerEmail] = useState("");
    const [playerRole, setPlayerRole] = useState<OrgRole>(OrgRole.Player);
    const [createPending, startCreateTransition] = useTransition();
    const [createError, setCreateError] = useState<string | null>(null);
    const [createSuccess, setCreateSuccess] = useState<string | null>(null);

    const [fillerPending, startFillerTransition] = useTransition();
    const [fillerError, setFillerError] = useState<string | null>(null);
    const [fillerSuccess, setFillerSuccess] = useState<string | null>(null);

    const [disbandPending, startDisbandTransition] = useTransition();
    const [disbandError, setDisbandError] = useState<string | null>(null);

    // Force a fresh server fetch on load — under Cache Components, navigating back to
    // this route can otherwise show a client-cached (stale) version instead of the
    // latest DB state.
    useEffect(() => {
        router.refresh();
    }, [router]);

    // Local editable state is only seeded from props once via useState. `org` is a new
    // object every server render, so use it as the signal that fresh data arrived (e.g.
    // from the refresh above) and resync state during render rather than in an effect —
    // this also clears any leftover success/error messages from a prior visit.
    const [prevOrgMembers, setPrevOrgMembers] = useState(org.members);
    if (prevOrgMembers !== org.members) {
        setPrevOrgMembers(org.members);
        setCoreTeamIds(new Set(org.coreTeamIds));
        setMembers(org.members);
        setCoreTeamError(null);
        setCoreTeamSuccess(false);
        setInviteError(null);
        setInviteSuccess(false);
        setMemberActionError(null);
        setMemberActionSuccess(null);
        setCreateError(null);
        setCreateSuccess(null);
        setFillerError(null);
        setFillerSuccess(null);
        setDisbandError(null);
    }

    function toggleCoreTeam(memberId: string) {
        setCoreTeamIds((prev) => {
            const next = new Set(prev);
            if (next.has(memberId)) {
                next.delete(memberId);
            } else if (next.size < 6) {
                next.add(memberId);
            }
            return next;
        });
    }

    function handleSaveCoreTeam() {
        setCoreTeamError(null);
        setCoreTeamSuccess(false);
        startCoreTeamTransition(async () => {
            try {
                await setCoreTeamAction(org._id, Array.from(coreTeamIds));
                setCoreTeamSuccess(true);
            } catch {
                setCoreTeamError("Failed to update core team. Please try again.");
            }
        });
    }

    function handleInvite() {
        if (!inviteUser) return;
        setInviteError(null);
        setInviteSuccess(false);
        startInviteTransition(async () => {
            try {
                await inviteMemberAction(org._id, inviteUser._id, inviteRole);
                setInviteSuccess(true);
                setInviteUser(null);
            } catch {
                setInviteError("Failed to send invite. Check the user and try again.");
            }
        });
    }

    function handleCreatePlayer() {
        setCreateError(null);
        setCreateSuccess(null);
        if (!playerName.trim() || !playerEmail.trim()) {
            setCreateError("Enter a name and email.");
            return;
        }
        startCreateTransition(async () => {
            try {
                const created = await createPlaceholderPlayerAction(org._id, playerRole, {
                    name: playerName.trim(),
                    email: playerEmail.trim(),
                });
                setMembers(prev => [...prev, created]);
                setPlayerName("");
                setPlayerEmail("");
                setPlayerRole(OrgRole.Player);
                setCreateSuccess(`${created.name} added to the roster. They can claim this profile later by signing in with Discord using ${playerEmail.trim()}.`);
            } catch (e) {
                setCreateError(e instanceof Error ? e.message : "Failed to create player.");
            }
        });
    }

    function handleFillWithFillers() {
        setFillerError(null);
        setFillerSuccess(null);
        startFillerTransition(async () => {
            try {
                const added: FillerMember[] = await fillWithFillers(org._id);
                if (added.length === 0) {
                    setFillerSuccess("Team already has 6 active members.");
                } else {
                    setMembers(prev => [...prev, ...added]);
                    setCoreTeamIds(new Set([...Array.from(coreTeamIds), ...added.map(m => m._id)].slice(0, 6)));
                    setFillerSuccess(`Added ${added.length} filler${added.length !== 1 ? "s" : ""}.`);
                }
            } catch {
                setFillerError("Failed to fill with fillers.");
            }
        });
    }

    function handleUpdateMemberRole(memberId: string, newRole: OrgRole) {
        setMemberActionError(null);
        setMemberActionSuccess(null);
        startMemberRoleTransition(async () => {
            try {
                await updateMemberRoleAction(org._id, memberId, newRole);
                setMembers(prev => prev.map(m => m._id === memberId ? { ...m, orgRole: newRole } : m));
                setMemberActionSuccess("Role updated.");
            } catch {
                setMemberActionError("Failed to update role. Please try again.");
            }
        });
    }

    function handleUpdateIsPlayer(memberId: string, isPlayer: boolean) {
        setMemberActionError(null);
        setMemberActionSuccess(null);
        startMemberRoleTransition(async () => {
            try {
                await updateMemberIsPlayerAction(org._id, memberId, isPlayer);
                setMembers(prev => prev.map(m => m._id === memberId ? { ...m, isPlayer } : m));
                // A non-player can't stay on the core team — mirrors the server.
                if (!isPlayer) {
                    setCoreTeamIds(prev => {
                        const next = new Set(prev);
                        next.delete(memberId);
                        return next;
                    });
                }
                setMemberActionSuccess(isPlayer ? "Marked as a player." : "Marked as not a player.");
            } catch {
                setMemberActionError("Failed to update player status. Please try again.");
            }
        });
    }

    function handleRemoveMember(memberId: string) {
        setMemberActionError(null);
        setMemberActionSuccess(null);
        startMemberRemoveTransition(async () => {
            try {
                await removeMemberAction(org._id, memberId);
                setMembers(prev => prev.filter(m => m._id !== memberId));
                setCoreTeamIds(prev => {
                    const next = new Set(prev);
                    next.delete(memberId);
                    return next;
                });
                setMemberActionSuccess("Member removed.");
                router.refresh();
            } catch {
                setMemberActionError("Failed to remove member. Please try again.");
            }
        });
    }

    function handleDisband() {
        setDisbandError(null);
        startDisbandTransition(async () => {
            try {
                await disbandOrganizationAction(org._id);
                router.push(`/profile/${org.ownerId}`);
            } catch (e) {
                setDisbandError(e instanceof Error ? e.message : "Failed to disband organization.");
            }
        });
    }

    return (
        <div className="space-y-5">
            {/* Create Player Manually */}
            <SectionCard
                title="Create Player Manually"
                subtitle="Fill an open roster slot with a player who isn't signed up yet."
            >
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-muted block mb-1">Name</label>
                        <input
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Player display name"
                            className="w-full bg-surface-2 border border-edge rounded px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted block mb-1">Email</label>
                        <input
                            type="email"
                            value={playerEmail}
                            onChange={(e) => setPlayerEmail(e.target.value)}
                            placeholder="player@example.com"
                            className="w-full bg-surface-2 border border-edge rounded px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                        />
                        <p className="text-[11px] text-muted mt-1">
                            Must match the email on the player&apos;s Discord account exactly. When they sign in with
                            Discord using this email, they&apos;ll automatically take over this exact profile —
                            nothing needs to be re-entered.
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted mb-1.5">Role</p>
                        <div className="flex gap-2">
                            {([OrgRole.Player, OrgRole.Manager] as OrgRole[]).map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setPlayerRole(role)}
                                    className={cn(
                                        "flex-1 py-1.5 rounded text-xs font-medium border transition-colors",
                                        playerRole === role
                                            ? "border-primary/60 bg-primary/10 text-primary"
                                            : "border-edge text-muted hover:text-dimmed"
                                    )}
                                >
                                    {role === OrgRole.Player ? "Player" : "Manager"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={handleCreatePlayer} disabled={createPending} className="px-5">
                        <UserPlus className="size-4" />
                        {createPending ? "Creating…" : "Create Player"}
                    </Button>
                </div>
                {createSuccess && (
                    <p className="text-xs text-success">{createSuccess}</p>
                )}
                {createError && (
                    <p className="text-xs text-danger">{createError}</p>
                )}
            </SectionCard>

            {/* Core Team */}
            <SectionCard
                title={`Core Team — ${org.name}`}
                subtitle={`Select up to 6 players for the starting roster. ${coreTeamIds.size}/6 selected.`}
            >
                {members.filter(m => m.isPlayer).length === 0 ? (
                    <p className="text-xs text-muted">No players yet — mark members as players below to make them eligible.</p>
                ) : (
                    <div className="space-y-1.5">
                        {members.filter(m => m.isPlayer).map((member) => {
                            const inCore = coreTeamIds.has(member._id);
                            const disabled = !inCore && coreTeamIds.size >= 6;
                            return (
                                <button
                                    key={member._id}
                                    type="button"
                                    onClick={() => toggleCoreTeam(member._id)}
                                    disabled={disabled}
                                    className={cn(
                                        "w-full flex items-center justify-between px-3 py-2.5 rounded border text-sm transition-colors",
                                        inCore
                                            ? "border-primary/40 bg-primary/5 text-foreground"
                                            : "border-edge text-dimmed hover:text-foreground hover:border-foreground/20 disabled:opacity-40 disabled:cursor-not-allowed"
                                    )}
                                >
                                    <span className="font-medium">{member.name}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
                <div className="flex items-center gap-3 pt-1">
                    <Button onClick={handleSaveCoreTeam} disabled={coreTeamPending} className="px-5">
                        {coreTeamPending ? "Saving…" : "Save Core Team"}
                    </Button>
                    {coreTeamSuccess && (
                        <span className="text-xs text-success">Core team updated.</span>
                    )}
                    {coreTeamError && (
                        <span className="text-xs text-danger">{coreTeamError}</span>
                    )}
                </div>
            </SectionCard>

            {/* Manage Members */}
            <SectionCard
                title={`Manage Members — ${org.name}`}
                subtitle="Change a member's role or remove them from the organization."
            >
                {members.length === 0 ? (
                    <p className="text-xs text-muted">No active members.</p>
                ) : (
                    <div className="space-y-2">
                        {members.map((member) => {
                            const isOwner = member._id === org.ownerId;
                            const locked = isOwner;
                            return (
                                <div
                                    key={member._id}
                                    className="flex flex-col gap-2 px-3 py-2.5 rounded border border-edge bg-surface-2"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0 flex items-center gap-1.5">
                                            <span className="text-sm font-medium text-foreground">{member.name}</span>
                                            {isOwner && <span className="ml-1 text-[10px] font-mono text-primary">Owner</span>}
                                        </div>
                                        <label className="flex items-center gap-1.5 text-xs text-muted shrink-0 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={member.isPlayer}
                                                onChange={(e) => handleUpdateIsPlayer(member._id, e.target.checked)}
                                                disabled={memberRolePending || memberRemovePending}
                                                className="accent-primary"
                                            />
                                            Plays for this team
                                        </label>
                                    </div>
                                    {!locked && (
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleUpdateMemberRole(member._id, OrgRole.Player)}
                                                disabled={memberRolePending || memberRemovePending || member.orgRole === OrgRole.Player}
                                                className={cn(
                                                    "px-2.5 py-1 rounded text-xs font-medium border transition-colors",
                                                    member.orgRole === OrgRole.Player
                                                        ? "border-primary/40 bg-primary/5 text-primary"
                                                        : "border-edge text-muted hover:text-dimmed disabled:opacity-40 disabled:cursor-not-allowed"
                                                )}
                                            >
                                                Player
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleUpdateMemberRole(member._id, OrgRole.Manager)}
                                                disabled={memberRolePending || memberRemovePending || member.orgRole === OrgRole.Manager}
                                                className={cn(
                                                    "px-2.5 py-1 rounded text-xs font-medium border transition-colors",
                                                    member.orgRole === OrgRole.Manager
                                                        ? "border-primary/40 bg-primary/5 text-primary"
                                                        : "border-edge text-muted hover:text-dimmed disabled:opacity-40 disabled:cursor-not-allowed"
                                                )}
                                            >
                                                Manager
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMember(member._id)}
                                                disabled={memberRolePending || memberRemovePending}
                                                className="px-2.5 py-1 rounded text-xs font-medium border border-danger/20 text-danger hover:border-danger/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className="flex items-center gap-3 pt-1">
                    {memberActionSuccess && <span className="text-xs text-success">{memberActionSuccess}</span>}
                    {memberActionError && <span className="text-xs text-danger">{memberActionError}</span>}
                </div>
            </SectionCard>

            {/* Invite Member */}
            <SectionCard
                title="Invite Member"
                subtitle="Send an invitation to an already-signed-up player."
            >
                <div className="space-y-3">
                    <Combobox items={users}>
                        <ComboboxInput placeholder="Search users..." showClear onClear={() => setInviteUser(null)}>
                            <InputGroupAddon>
                                <UserRoundPlus />
                            </InputGroupAddon>
                        </ComboboxInput>
                        <ComboboxContent>
                            <ComboboxEmpty>No user found.</ComboboxEmpty>
                            <ComboboxList>
                                {(group: ArrayElement<OrgUserSearch>, index) => {
                                    const organiztion = group.organization === "No organization" ? group.organization : group.organization.name;
                                    return (
                                        <ComboboxGroup key={organiztion} items={group.items}>
                                            <ComboboxLabel>{organiztion}</ComboboxLabel>
                                            <ComboboxCollection>
                                                {(item: ArrayElement<ArrayElement<OrgUserSearch>["items"]>) => (
                                                    <ComboboxItem className="data-highlighted:bg-accent/10" key={item._id} value={item.name} onClick={() => setInviteUser(item)}>
                                                        {item.name}
                                                    </ComboboxItem>
                                                )}
                                            </ComboboxCollection>
                                            {index < users.length - 1 && <ComboboxSeparator />}
                                        </ComboboxGroup>
                                    );
                                }}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                    <div className="space-y-3 mt-5">
                        <p className="text-xs text-muted mt-0.5">Role of invited user.</p>
                        <div className="flex gap-2">
                            {([OrgRole.Player, OrgRole.Manager] as OrgRole[]).map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setInviteRole(role)}
                                    className={cn(
                                        "flex-1 py-1.5 rounded text-xs font-medium border transition-colors",
                                        inviteRole === role
                                            ? "border-primary/60 bg-primary/10 text-primary"
                                            : "border-edge text-muted hover:text-dimmed"
                                    )}
                                >
                                    {role === OrgRole.Player ? "Player" : "Manager"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {inviteUser?.organization ? (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button disabled={invitePending || !inviteUser} className="px-5">
                                    {invitePending ? "Sending…" : "Send Invite"}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md" showCloseButton={false}>
                                <DialogHeader>
                                    <DialogTitle>Invite Different Organization Member?</DialogTitle>
                                    <DialogDescription>
                                        {inviteUser.name} is already apart of an organization. Do you still wish to conitue?
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="sm:justify-start">
                                    <DialogClose asChild>
                                        <Button onClick={handleInvite} type="button">Send Invite</Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <Button type="button" variant="ghost" className="text-red-400 hover:text-red-700 px-6">Cancel</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <Button onClick={handleInvite} disabled={invitePending || !inviteUser} className="px-5">
                            {invitePending ? "Sending…" : "Send Invite"}
                        </Button>
                    )}
                    {inviteSuccess && (
                        <span className="text-xs text-success">Invite sent.</span>
                    )}
                    {inviteError && (
                        <span className="text-xs text-danger">{inviteError}</span>
                    )}
                </div>
            </SectionCard>

            {/* Dev Tools */}
            <SectionCard
                title="Developer Tools"
                subtitle="Shortcuts for local development only. Do not use in production."
            >
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        onClick={handleFillWithFillers}
                        disabled={fillerPending}
                        className="px-4 border-dashed"
                    >
                        {fillerPending ? "Filling…" : "Fill with Fillers"}
                    </Button>
                    {fillerSuccess && <span className="text-xs text-success">{fillerSuccess}</span>}
                    {fillerError && <span className="text-xs text-danger">{fillerError}</span>}
                </div>
                <p className="text-xs text-muted">
                    Adds fake members to reach 6 active players and fills the core team. Fillers are named <span className="font-mono">[FILLER] Player N</span> and can be removed individually.
                </p>
            </SectionCard>

            {/* Danger Zone — owner only */}
            {org.ownerId === currentUserId && (
                <SectionCard title="Danger Zone">
                    <p className="text-xs text-muted">
                        Permanently disbands <span className="text-foreground font-medium">{org.name}</span> and removes all members. This cannot be undone.
                    </p>
                    <div className="flex items-center gap-3">
                        <Dialog>
                            <DialogTrigger asChild>
                                <button
                                    type="button"
                                    disabled={disbandPending}
                                    className="px-4 py-2 text-sm font-semibold rounded border border-danger/40 text-danger bg-danger/5 hover:bg-danger/15 hover:border-danger/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {disbandPending ? "Disbanding…" : "Disband Organization"}
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md" showCloseButton={false}>
                                <DialogHeader>
                                    <DialogTitle>Disband {org.name}?</DialogTitle>
                                    <DialogDescription>
                                        This will permanently delete the organization and remove all {members.length} member{members.length !== 1 ? "s" : ""}. There is no way to undo this.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="sm:justify-start">
                                    <DialogClose asChild>
                                        <button
                                            type="button"
                                            onClick={handleDisband}
                                            className="px-4 py-2 text-sm font-semibold rounded border border-danger/40 text-danger bg-danger/5 hover:bg-danger/15 hover:border-danger/60 transition-colors"
                                        >
                                            Yes, disband
                                        </button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary" className="px-6">Cancel</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        {disbandError && <span className="text-xs text-danger">{disbandError}</span>}
                    </div>
                </SectionCard>
            )}
        </div>
    );
}
