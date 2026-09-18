"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn, formatTimeAgo } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { OrgRole } from "@/app/api/graphql/types/graphql";
import {
    AdminOrgRow,
    adminRenameOrganizationAction,
    adminRemoveOrgMemberAction,
    adminDisbandOrganizationAction,
    adminAddPlaceholderMemberAction,
    adminSetCoreTeamAction,
    adminUpdateAvailabilityBlocksAction,
} from "@/app/admin/actions";
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
import { OrgAvailabilityPanel } from "@/components/org/OrgAvailabilityPanel";

const STATUS_BADGE: Record<string, string> = {
    ACTIVE:   "text-success bg-success/10 border-success/30",
    INVITED:  "text-amber-400 bg-amber-400/10 border-amber-400/30",
    INACTIVE: "text-muted bg-surface-2 border-edge",
};

function OrgListItem({
    org,
    selected,
    onClick,
}: {
    org: AdminOrgRow;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-3",
                selected
                    ? "bg-primary/10 border border-primary/30"
                    : "border border-transparent hover:bg-surface-2 hover:border-edge",
            )}
        >
            <div
                className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0",
                    selected ? "bg-primary text-background" : "bg-secondary text-foreground",
                )}
            >
                {org.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={cn("text-sm font-semibold truncate", selected ? "text-primary" : "text-foreground")}>
                        {org.name}
                    </span>
                    <span className="text-[10px] font-mono text-muted">{org.slug}</span>
                    {org.artificial && (
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded border text-secondary bg-secondary/10 border-secondary/30 uppercase">
                            Artificial
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-muted truncate">Owner: {org.ownerName}</span>
                    <span className="text-[10px] text-edge">·</span>
                    <span className="text-[10px] text-muted">{org.memberCount} active</span>
                </div>
            </div>
        </button>
    );
}

function RenameForm({
    org,
    onDone,
}: {
    org: AdminOrgRow;
    onDone: () => void;
}) {
    const [name, setName] = useState(org.name);
    const [pending, start] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function save() {
        if (!name.trim() || name.trim() === org.name) {
            onDone();
            return;
        }
        setError(null);
        start(async () => {
            try {
                await adminRenameOrganizationAction(org._id, name);
                onDone();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to rename organization.");
            }
        });
    }

    return (
        <div className="space-y-2">
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface border border-edge rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                autoFocus
            />
            {error && <p className="text-xs text-danger">{error}</p>}
            <div className="flex gap-2">
                <Button size="sm" disabled={pending} onClick={save} className="flex-1">
                    {pending ? "Saving..." : "Save"}
                </Button>
                <Button size="sm" variant="ghost" onClick={onDone}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}

function AddPlayerForm({ orgId, onChanged }: { orgId: string; onChanged: () => void }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<OrgRole>(OrgRole.Player);
    const [pending, start] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const inp = "w-full bg-surface border border-edge rounded px-2 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors";

    function add() {
        if (!name.trim() || !email.trim()) return;
        setError(null);
        setSuccess(null);
        start(async () => {
            try {
                const created = await adminAddPlaceholderMemberAction(orgId, role, { name, email });
                setSuccess(`${created.name} added.`);
                setName("");
                setEmail("");
                onChanged();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to add player.");
            }
        });
    }

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Player name" className={inp} />
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="player@example.com" className={inp} />
            </div>
            <div className="flex items-center gap-2">
                <div className="flex gap-1 bg-surface-2 rounded-md p-1">
                    {([OrgRole.Player, OrgRole.Manager] as OrgRole[]).map((r) => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => setRole(r)}
                            className={cn(
                                "px-2.5 py-1 text-xs font-semibold rounded transition-colors",
                                role === r ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-dimmed",
                            )}
                        >
                            {r === OrgRole.Player ? "Player" : "Manager"}
                        </button>
                    ))}
                </div>
                <Button size="sm" disabled={pending || !name.trim() || !email.trim()} onClick={add} className="ml-auto">
                    {pending ? "Adding..." : "Add Player"}
                </Button>
            </div>
            {success && <p className="text-xs text-success">{success}</p>}
            {error && <p className="text-xs text-danger">{error}</p>}
        </div>
    );
}

function CoreTeamEditor({
    org,
    canManage,
    onChanged,
}: {
    org: AdminOrgRow;
    canManage: boolean;
    onChanged: () => void;
}) {
    const [selected, setSelected] = useState<Set<string>>(new Set(org.coreTeamIds));
    const [pending, start] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const eligible = org.members.filter((m) => m.status === "ACTIVE" && m.isPlayer);

    function toggle(id: string) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else if (next.size < 6) next.add(id);
            return next;
        });
    }

    function save() {
        setError(null);
        setSuccess(false);
        start(async () => {
            try {
                await adminSetCoreTeamAction(org._id, Array.from(selected));
                setSuccess(true);
                onChanged();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to update core team.");
            }
        });
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-muted uppercase tracking-widest">Core Team</p>
                <span className={cn("text-xs font-bold", selected.size === 6 ? "text-success" : "text-muted")}>
                    {selected.size}/6
                </span>
            </div>
            {eligible.length === 0 ? (
                <p className="text-xs text-muted italic">No eligible players — active members marked as a player.</p>
            ) : (
                <div className="space-y-1.5">
                    {eligible.map((m) => {
                        const inCore = selected.has(m._id);
                        const disabled = !canManage || (!inCore && selected.size >= 6);
                        return (
                            <button
                                key={m._id}
                                type="button"
                                onClick={() => toggle(m._id)}
                                disabled={disabled}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 rounded border text-sm transition-colors",
                                    inCore
                                        ? "border-primary/40 bg-primary/5 text-foreground"
                                        : "border-edge text-dimmed hover:text-foreground hover:border-foreground/20 disabled:opacity-40 disabled:cursor-not-allowed",
                                )}
                            >
                                <span className="font-medium">{m.name}</span>
                            </button>
                        );
                    })}
                </div>
            )}
            {canManage && (
                <div className="flex items-center gap-3 mt-2">
                    <Button size="sm" disabled={pending} onClick={save}>
                        {pending ? "Saving..." : "Save Core Team"}
                    </Button>
                    {success && <span className="text-xs text-success">Core team updated.</span>}
                    {error && <span className="text-xs text-danger">{error}</span>}
                </div>
            )}
        </div>
    );
}

function OrgDetail({
    org,
    canManage,
    onChanged,
}: {
    org: AdminOrgRow;
    canManage: boolean;
    onChanged: () => void;
}) {
    const router = useRouter();
    const [renaming, setRenaming] = useState(false);
    const [removePending, startRemove] = useTransition();
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [removeError, setRemoveError] = useState<string | null>(null);
    const [disbandPending, startDisband] = useTransition();
    const [disbandError, setDisbandError] = useState<string | null>(null);

    function removeMember(userId: string) {
        setRemoveError(null);
        setRemovingId(userId);
        startRemove(async () => {
            try {
                await adminRemoveOrgMemberAction(org._id, userId);
                onChanged();
            } catch (err) {
                setRemoveError(err instanceof Error ? err.message : "Failed to remove member.");
            } finally {
                setRemovingId(null);
            }
        });
    }

    function disband() {
        setDisbandError(null);
        startDisband(async () => {
            try {
                await adminDisbandOrganizationAction(org._id);
                router.refresh();
            } catch (err) {
                setDisbandError(err instanceof Error ? err.message : "Failed to disband organization.");
            }
        });
    }

    return (
        <div className="p-4 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    {renaming ? (
                        <RenameForm org={org} onDone={() => { setRenaming(false); onChanged(); }} />
                    ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-lg font-black text-foreground">{org.name}</h2>
                            <span className="text-xs font-mono text-muted">[{org.slug}]</span>
                            {org.artificial && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border text-secondary bg-secondary/10 border-secondary/30 uppercase">
                                    Artificial
                                </span>
                            )}
                            {canManage && (
                                <Button size="sm" variant="ghost" onClick={() => setRenaming(true)}>
                                    Rename
                                </Button>
                            )}
                        </div>
                    )}
                    {!renaming && (
                        <p className="text-xs text-muted mt-0.5">
                            Created {formatTimeAgo(new Date(org.createdAt))}
                        </p>
                    )}
                </div>
            </div>

            {/* Owner */}
            <div className="border-t border-edge pt-4">
                <p className="text-[10px] text-muted uppercase tracking-widest mb-2">Owner</p>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-black text-foreground shrink-0">
                        {org.ownerName.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm font-semibold text-foreground">{org.ownerName}</p>
                </div>
            </div>

            {/* Members */}
            <div className="border-t border-edge pt-4">
                <p className="text-[10px] text-muted uppercase tracking-widest mb-2">
                    Members ({org.members.length})
                </p>
                {org.members.length === 0 ? (
                    <p className="text-xs text-muted">No members.</p>
                ) : (
                    <div className="space-y-1.5">
                        {org.members.map((m) => {
                            const isOwner = m._id === org.ownerId;
                            return (
                                <div
                                    key={m._id}
                                    className="flex items-center justify-between gap-2 px-3 py-2 bg-surface-2 rounded-md"
                                >
                                    <div className="min-w-0 flex items-center gap-2 flex-wrap">
                                        <span className="text-sm text-foreground font-medium truncate">{m.name}</span>
                                        {isOwner && (
                                            <span className="text-[9px] font-bold text-primary uppercase">Owner</span>
                                        )}
                                        <span className="text-[10px] text-muted">
                                            {m.orgRole === "MANAGER" ? "Manager" : "Player"}
                                        </span>
                                        <span
                                            className={cn(
                                                "text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase",
                                                STATUS_BADGE[m.status] ?? "text-muted bg-surface-2 border-edge",
                                            )}
                                        >
                                            {m.status}
                                        </span>
                                    </div>
                                    {canManage && !isOwner && (
                                        <button
                                            onClick={() => removeMember(m._id)}
                                            disabled={removePending && removingId === m._id}
                                            className="text-[10px] text-danger hover:underline font-semibold shrink-0 disabled:opacity-40"
                                        >
                                            {removePending && removingId === m._id ? "Removing..." : "Remove"}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                {removeError && <p className="text-xs text-danger mt-2">{removeError}</p>}
                {org.members.some((m) => m._id === org.ownerId) && canManage && (
                    <p className="text-[10px] text-muted mt-2 italic">
                        The owner can&apos;t be removed directly — disband the organization instead.
                    </p>
                )}
            </div>

            {/* Add player — admin only */}
            {canManage && (
                <div className="border-t border-edge pt-4">
                    <p className="text-[10px] text-muted uppercase tracking-widest mb-2">Add Player</p>
                    <AddPlayerForm orgId={org._id} onChanged={onChanged} />
                </div>
            )}

            {/* Core team */}
            <div className="border-t border-edge pt-4">
                <CoreTeamEditor org={org} canManage={canManage} onChanged={onChanged} />
            </div>

            {/* Weekly availability */}
            <div className="border-t border-edge pt-4">
                <OrgAvailabilityPanel
                    orgId={org._id}
                    slug={org.slug}
                    isManager={canManage}
                    blocks={org.blocks}
                    onSave={adminUpdateAvailabilityBlocksAction}
                />
            </div>

            {/* Danger zone — admin only */}
            {canManage && (
                <div className="border-t border-edge pt-4">
                    <p className="text-[10px] text-muted uppercase tracking-widest mb-2">Danger Zone</p>
                    <p className="text-xs text-muted mb-2">
                        Permanently disbands <span className="text-foreground font-medium">{org.name}</span> and
                        removes all members. This cannot be undone.
                    </p>
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
                                    This will permanently delete the organization and remove all {org.members.length}{" "}
                                    member{org.members.length !== 1 ? "s" : ""}. There is no way to undo this.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="sm:justify-start">
                                <DialogClose asChild>
                                    <button
                                        type="button"
                                        onClick={disband}
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
                    {disbandError && <p className="text-xs text-danger mt-2">{disbandError}</p>}
                </div>
            )}
        </div>
    );
}

export function OrganizationsPanel({
    organizations,
    adminRole,
}: {
    organizations: AdminOrgRow[];
    adminRole: string;
}) {
    const router = useRouter();
    const canManage = adminRole === "ADMIN";
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(organizations[0]?._id ?? null);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return organizations;
        return organizations.filter(
            (o) => o.name.toLowerCase().includes(q) || o.slug.toLowerCase().includes(q) || o.ownerName.toLowerCase().includes(q),
        );
    }, [organizations, search]);

    const selected = organizations.find((o) => o._id === selectedId) ?? null;

    return (
        <div className="grid grid-cols-2 gap-4 items-start">
            {/* Left: org list */}
            <div className="flex flex-col gap-3">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, slug, or owner..."
                    className="w-full bg-surface border border-edge rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />

                <div className="max-h-[70vh] overflow-y-auto space-y-1 pr-0.5">
                    {filtered.length === 0 ? (
                        <p className="text-xs text-muted text-center py-8">No organizations found.</p>
                    ) : (
                        filtered.map((org) => (
                            <OrgListItem
                                key={org._id}
                                org={org}
                                selected={selectedId === org._id}
                                onClick={() => setSelectedId(org._id)}
                            />
                        ))
                    )}
                </div>

                <p className="text-xs text-muted">
                    {filtered.length} organization{filtered.length !== 1 ? "s" : ""}
                </p>
            </div>

            {/* Right: detail panel */}
            <div className="bg-surface border border-edge rounded-xl overflow-hidden max-h-[70vh] overflow-y-auto sticky top-4">
                {selected ? (
                    <OrgDetail
                        key={selected._id}
                        org={selected}
                        canManage={canManage}
                        onChanged={() => router.refresh()}
                    />
                ) : (
                    <div className="flex items-center justify-center h-48 text-muted text-sm">
                        Select an organization to view details.
                    </div>
                )}
            </div>
        </div>
    );
}
