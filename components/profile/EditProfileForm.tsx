"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Hero, Rank, getRankByMMR, calculateMMR } from "@/lib/deadlock";
import { EditProfilePageQuery, OrgRole } from "@/app/api/graphql/types/graphql";
import { ArrayElement, cn } from "@/lib/utils";
import {
    updateProfileAction,
    setCoreTeamAction,
    inviteMemberAction,
    removeMemberAction,
    updateMemberRoleAction,
    fillWithFillers,
    disbandOrganizationAction,
    type FillerMember,
} from "@/app/profile/[id]/edit/actions";
import { DeadlockHero } from "@/lib/types/deadlock/heroes";
import { authClient } from "@/lib/database/auth-client";
import { DisconnectSteamButton } from "./DisconnectSteamButton";
import Image from "next/image";
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
} from "@/components/ui/combobox"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { InputGroupAddon } from "../ui/input-group";
import { UserRoundPlus } from "lucide-react";

const ALL_HEROES = Object.values(Hero);
const ALL_RANKS = Object.values(Rank);
const DIVISIONS = [1, 2, 3, 4, 5, 6] as const;
const DIVISION_LABELS: Record<number, string> = {
    1: "Div 1",
    2: "Div 2",
    3: "Div 3",
    4: "Div 4",
    5: "Div 5",
    6: "Div 6",
};

export type OrgUserSearch = {
    organization: NonNullable<ArrayElement<NonNullable<EditProfilePageQuery["getUsers"]>>["organization"]> | "No organization",
    items: EditProfilePageQuery["getUsers"]
}[]

interface OrgMemberEntry {
    _id: string;
    name: string;
    mmr: number;
    orgRole: OrgRole;
}

interface OrgProp {
    _id: string;
    name: string;
    ownerId: string;
    members: OrgMemberEntry[];
    coreTeamIds: string[];
}

interface Props {
    userId: string;
    steam: NonNullable<EditProfilePageQuery["getUser"]>["steam"];
    users: OrgUserSearch;
    heroes: DeadlockHero[];
    initialMmr: number;
    initialHeroes: number[];
    initialBio: string;
    org: OrgProp | null;
    isManager: boolean;
}

function SectionCard({ title, subtitle, children }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="bg-surface border border-edge rounded-lg p-5 space-y-4">
            <div>
                <h2 className="text-sm font-bold text-foreground">{title}</h2>
                {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
            </div>
            {children}
        </section>
    );
}

export function EditProfileForm({
    userId,
    initialMmr,
    initialHeroes,
    initialBio,
    heroes,
    org,
    steam,
    users,
    isManager,
}: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [profileError, setProfileError] = useState<string | null>(null);
    const [profileSuccess, setProfileSuccess] = useState(false);

    const initialRankInfo = getRankByMMR(initialMmr) ?? { rank: Rank.INITIATE, division: 0 };
    const [selectedRank, setSelectedRank] = useState<Rank>(initialRankInfo.rank);
    const [division, setDivision] = useState<number>(initialRankInfo.division);

    const [selectedHeroes, setSelectedHeroes] = useState<Set<number>>(
        new Set(initialHeroes)
    );
    const [bio, setBio] = useState(initialBio);

    const [coreTeamIds, setCoreTeamIds] = useState<Set<string>>(
        new Set(org?.coreTeamIds ?? [])
    );
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
    const [members, setMembers] = useState<OrgMemberEntry[]>(org?.members ?? []);

    const [fillerPending, startFillerTransition] = useTransition();
    const [fillerError, setFillerError] = useState<string | null>(null);
    const [fillerSuccess, setFillerSuccess] = useState<string | null>(null);

    const [disbandPending, startDisbandTransition] = useTransition();
    const [disbandError, setDisbandError] = useState<string | null>(null);

    const [syncPending, startSyncTransition] = useTransition();
    const [syncSuccess, setSyncSuccess] = useState(false);

    function toggleHero(id: number) {
        setSelectedHeroes((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
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

    function handleDisband() {
        if (!org) return;
        setDisbandError(null);
        startDisbandTransition(async () => {
            try {
                await disbandOrganizationAction(org._id);
                router.push(`/profile/${userId}`);
            } catch (e) {
                setDisbandError(e instanceof Error ? e.message : "Failed to disband organization.");
            }
        });
    }

    function handleSaveProfile() {
        setProfileError(null);
        setProfileSuccess(false);
        const mmr = calculateMMR(selectedRank, division);
        startTransition(async () => {
            try {
                await updateProfileAction({ userId, mmr, heroes: Array.from(selectedHeroes), bio });
                await authClient.updateUser({ mmr, heroes: Array.from(selectedHeroes), bio });
                setProfileSuccess(true);
                router.refresh();
            } catch {
                setProfileError("Failed to save profile. Please try again.");
            }
        });
    }

    function handleSaveCoreTeam() {
        if (!org) return;
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
        if (!org || !inviteUser) return;
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

    function handleFillWithFillers() {
        if (!org) return;
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
        if (!org) return;
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

    function handleRemoveMember(memberId: string) {
        if (!org) return;
        setMemberActionError(null);
        setMemberActionSuccess(null);
        startMemberRemoveTransition(async () => {
            try {
                await removeMemberAction(org._id, memberId);
                setMembers(prev => prev.filter(m => m._id !== memberId));
                setMemberActionSuccess("Member removed.");
                router.refresh();
            } catch {
                setMemberActionError("Failed to remove member. Please try again.");
            }
        });
    }

    function handleSyncSession() {
        setSyncSuccess(false);
        startSyncTransition(async () => {
            router.refresh();
            setSyncSuccess(true);
        });
    }

    const profileSections = (
        <>
            {/* Connected Accounts */}
            <section className="bg-surface border border-edge rounded-lg p-5 mb-6">
                <div className="mb-4">
                    <h2 className="text-sm font-bold text-foreground">Connected Accounts</h2>
                    <p className="text-xs text-muted mt-0.5">Link external accounts to enhance your profile.</p>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-edge">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-surface-2 border border-edge flex items-center justify-center shrink-0">
                            {steam?.avatar ? <Image height={24} width={24} src={steam.avatar} alt="Steam Profile" /> :
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-steam" viewBox="0 0 16 16">
                                    <path d="M.329 10.333A8.01 8.01 0 0 0 7.99 16C12.414 16 16 12.418 16 8s-3.586-8-8.009-8A8.006 8.006 0 0 0 0 7.468l.003.006 4.304 1.769A2.2 2.2 0 0 1 5.62 8.88l1.96-2.844-.001-.04a3.046 3.046 0 0 1 3.042-3.043 3.046 3.046 0 0 1 3.042 3.043 3.047 3.047 0 0 1-3.111 3.044l-2.804 2a2.223 2.223 0 0 1-3.075 2.11 2.22 2.22 0 0 1-1.312-1.568L.33 10.333Z" />
                                    <path d="M4.868 12.683a1.715 1.715 0 0 0 1.318-3.165 1.7 1.7 0 0 0-1.263-.02l1.023.424a1.261 1.261 0 1 1-.97 2.33l-.99-.41a1.7 1.7 0 0 0 .882.84Zm3.726-6.687a2.03 2.03 0 0 0 2.027 2.029 2.03 2.03 0 0 0 2.027-2.029 2.03 2.03 0 0 0-2.027-2.027 2.03 2.03 0 0 0-2.027 2.027m2.03-1.527a1.524 1.524 0 1 1-.002 3.048 1.524 1.524 0 0 1 .002-3.048" />
                                </svg>}
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-foreground">Steam</div>
                            {steam ? (
                                <div className="text-xs text-muted">Connected · {steam.username}</div>
                            ) : (
                                <div className="text-xs text-muted">Not connected</div>
                            )}
                        </div>
                    </div>
                    {steam ? (
                        <DisconnectSteamButton userId={userId} />
                    ) : (
                        <a
                            href={"http://localhost:3001/auth/steam"}
                            className="px-3 py-1.5 text-xs font-semibold rounded border border-edge text-dimmed hover:border-primary/30 hover:text-foreground transition-colors"
                        >
                            Connect Steam
                        </a>
                    )}
                </div>
            </section>
            {/* Rank */}
            <SectionCard
                title="Rank"
                subtitle={"Select your current rank and subdivision. " +
                    "Due to ranks not being disclosed, I ask you in good faith to put your real rank until I get an API to calculate ranks."}
            >
                <div className="flex flex-wrap gap-2">
                    {ALL_RANKS.map((rank) => (
                        <button
                            key={rank.name}
                            type="button"
                            onClick={() => setSelectedRank(rank)}
                            className={cn(
                                "px-3 py-1.5 rounded text-xs font-semibold border transition-colors",
                                selectedRank === rank
                                    ? "border-primary/60 bg-primary/10 text-primary"
                                    : "border-edge text-muted hover:text-dimmed hover:border-foreground/20"
                            )}
                        >
                            {rank.name}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    {DIVISIONS.map((d) => (
                        <button
                            key={d}
                            type="button"
                            onClick={() => setDivision(d)}
                            className={cn(
                                "flex-1 py-1.5 rounded text-xs font-medium border transition-colors",
                                division === d
                                    ? "border-primary/60 bg-primary/10 text-primary"
                                    : "border-edge text-muted hover:text-dimmed"
                            )}
                        >
                            {DIVISION_LABELS[d]}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-muted">
                    Current:{" "}
                    <span className="text-foreground font-medium">
                        {selectedRank.name}
                        {division > 0 ? ` — Division ${division}` : ""}
                    </span>{" "}
                    <span className="text-dimmed">
                        (MMR {calculateMMR(selectedRank, division)})
                    </span>
                </p>
            </SectionCard>

            {/* Heroes */}
            <SectionCard
                title="Heroes"
                subtitle={`Select the heroes you play. ${selectedHeroes.size} selected.`}
            >
                <div className="flex flex-wrap gap-1.5">
                    {heroes.map((hero) => {
                        const selected = selectedHeroes.has(hero.id);
                        return (
                            <button
                                key={hero.id}
                                type="button"
                                onClick={() => toggleHero(hero.id)}
                                className={cn(
                                    "px-2.5 py-1 rounded text-xs font-medium border transition-colors",
                                    selected
                                        ? "border-primary/60 bg-primary/10 text-primary"
                                        : "border-edge text-muted hover:text-dimmed hover:border-foreground/20"
                                )}
                            >
                                {hero.name}
                            </button>
                        );
                    })}
                </div>
            </SectionCard>

            {/* Bio */}
            <SectionCard title="Bio" subtitle="Tell other players about yourself.">
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={300}
                    rows={4}
                    placeholder="Flex player focused on support/carry. Available most evenings EST."
                    className="w-full bg-surface-2 border border-edge rounded px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
                <p className="text-xs text-muted text-right">{bio.length}/300</p>
            </SectionCard>

            {/* Sync Session */}
            <SectionCard
                title="Sync Session"
                subtitle="If your profile data was changed externally (e.g. by an admin), use this to refresh your active session."
            >
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={handleSyncSession} disabled={syncPending}>
                        {syncPending ? "Syncing..." : "Sync Session"}
                    </Button>
                    {syncSuccess && (
                        <span className="text-xs text-success">Session synced.</span>
                    )}
                </div>
            </SectionCard>

            {/* Save / Cancel */}
            <div className="flex items-center gap-3">
                <Button onClick={handleSaveProfile} disabled={isPending} className="px-6">
                    {isPending ? "Saving…" : "Save Profile"}
                </Button>
                <Button variant="secondary" href={`/profile/${userId}`} className="px-6">
                    Cancel
                </Button>
                {profileSuccess && (
                    <span className="text-xs text-success">Profile saved.</span>
                )}
                {profileError && (
                    <span className="text-xs text-danger">{profileError}</span>
                )}
            </div>
        </>
    );

    const orgSections = org && isManager && (
        <>
            {/* Core Team */}
            <SectionCard
                title={`Core Team — ${org.name}`}
                subtitle={`Select up to 6 active members for the starting roster. ${coreTeamIds.size}/6 selected.`}
            >
                {org.members.length === 0 ? (
                    <p className="text-xs text-muted">No active members yet.</p>
                ) : (
                    <div className="space-y-1.5">
                        {org.members.map((member) => {
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
                                    <span className="text-xs text-muted">MMR {member.mmr}</span>
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
                            const isSelf = member._id === userId;
                            const locked = isOwner;
                            return (
                                <div
                                    key={member._id}
                                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded border border-edge bg-surface-2"
                                >
                                    <div className="min-w-0">
                                        <span className="text-sm font-medium text-foreground">{member.name}</span>
                                        {isSelf && <span className="ml-1.5 text-xs text-muted">(you)</span>}
                                        {isOwner && <span className="ml-1.5 text-[10px] font-mono text-primary">Owner</span>}
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
                subtitle="Send an invitation to a player by their user ID."
            >
                <div className="space-y-3">
                    <Combobox
                        items={users}
                    >
                        <ComboboxInput placeholder="Search users..." showClear onClear={() => setInviteUser(null)}>
                            <InputGroupAddon>
                                <UserRoundPlus />
                            </InputGroupAddon>
                        </ComboboxInput>
                        <ComboboxContent>
                            <ComboboxEmpty>No user found.</ComboboxEmpty>
                            <ComboboxList>
                                {(group: ArrayElement<OrgUserSearch>, index) => {
                                    const organiztion = group.organization === "No organization" ? group.organization : group.organization.name
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
                                    )
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
                                <Button
                                    disabled={invitePending || !inviteUser}
                                    className="px-5"
                                >
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
                        <Button
                            onClick={handleInvite}
                            disabled={invitePending || !inviteUser}
                            className="px-5"
                        >
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
            {org.ownerId === userId && (
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
                                        This will permanently delete the organization and remove all {org.members.length} member{org.members.length !== 1 ? "s" : ""}. There is no way to undo this.
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
        </>
    );

    if (org && isManager) {
        return (
            <div className="grid md:grid-cols-2 gap-6 items-start">
                <div className="space-y-5 max-md:order-2">{profileSections}</div>
                <div className="space-y-5 max-md:order-1">{orgSections}</div>
            </div>
        );
    }

    return <div className="space-y-5">{profileSections}</div>;
}
