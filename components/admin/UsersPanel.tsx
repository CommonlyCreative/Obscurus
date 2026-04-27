"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { UserRow } from "@/app/admin/actions";
import { UserDetailPanel } from "./UserDetailPanel";

const ROLE_BADGE: Record<string, string> = {
    ADMIN:     "text-primary bg-primary/10 border-primary/30",
    MODERATOR: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30",
    SUPPORT:   "text-amber-400 bg-amber-400/10 border-amber-400/30",
    MEMBER:    "text-muted bg-surface-2 border-edge",
};

function UserListItem({
    user,
    selected,
    onClick,
}: {
    user: UserRow;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-3 group",
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
                {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={cn("text-sm font-semibold truncate", selected ? "text-primary" : "text-foreground")}>
                        {user.name}
                    </span>
                    {user.banned && (
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded border text-danger bg-danger/10 border-danger/30 uppercase shrink-0">
                            Banned
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                        className={cn(
                            "text-[9px] font-bold px-1 py-0.5 rounded border uppercase",
                            ROLE_BADGE[user.role] ?? ROLE_BADGE.MEMBER,
                        )}
                    >
                        {user.role}
                    </span>
                    <span className="text-[10px] text-muted truncate">{user.email}</span>
                </div>
            </div>
        </button>
    );
}

export function UsersPanel({
    initialUsers,
    initialSearch,
    adminRole,
}: {
    initialUsers: UserRow[];
    initialSearch: string;
    adminRole: string;
}) {
    const router = useRouter();
    const [search, setSearch] = useState(initialSearch);
    const [selectedId, setSelectedId] = useState<string | null>(
        initialUsers[0]?._id ?? null,
    );

    function handleSearch(e: React.SyntheticEvent) {
        e.preventDefault();
        const params = new URLSearchParams();
        if (search.trim()) params.set("q", search.trim());
        router.push(`/admin/users${params.toString() ? `?${params}` : ""}`);
    }

    return (
        <div className="grid grid-cols-2 gap-4 items-start">
            {/* ── Left: user list ── */}
            <div className="flex flex-col gap-3">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users..."
                        className="flex-1 min-w-0 bg-surface border border-edge rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <Button type="submit" size="md" className="shrink-0">Go</Button>
                </form>

                {initialSearch && (
                    <button
                        onClick={() => { setSearch(""); router.push("/admin/users"); }}
                        className="text-xs text-muted hover:text-foreground transition-colors text-left"
                    >
                        Clear search
                    </button>
                )}

                {/* List */}
                <div className="max-h-[70vh] overflow-y-auto space-y-1 pr-0.5">
                    {initialUsers.length === 0 ? (
                        <p className="text-xs text-muted text-center py-8">No users found.</p>
                    ) : (
                        initialUsers.map((u) => (
                            <UserListItem
                                key={u._id}
                                user={u}
                                selected={selectedId === u._id}
                                onClick={() => setSelectedId(u._id)}
                            />
                        ))
                    )}
                </div>

                <p className="text-xs text-muted">
                    {initialUsers.length} user{initialUsers.length !== 1 ? "s" : ""}
                    {initialSearch ? ` matching "${initialSearch}"` : ""}
                </p>
            </div>

            {/* ── Right: detail panel ── */}
            <div className="bg-surface border border-edge rounded-xl overflow-hidden max-h-[70vh] overflow-y-auto no-scrollbar sticky top-4">
                {selectedId ? (
                    <UserDetailPanel userId={selectedId} adminRole={adminRole} />
                ) : (
                    <div className="flex items-center justify-center h-48 text-muted text-sm">
                        Select a user to view details.
                    </div>
                )}
            </div>
        </div>
    );
}
