"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrgMember, RosterPick } from "./types";

export function RosterSelector({
    slots,
    members,
    onChange,
}: {
    slots: (RosterPick | undefined)[];
    members: OrgMember[];
    onChange: (slots: (RosterPick | undefined)[]) => void;
}) {
    const [openSlot, setOpenSlot] = useState<number | null>(null);
    const usedIds = new Set(slots.filter(Boolean).map((s) => s!._id));

    function fillSlot(slotIdx: number, pick: RosterPick) {
        const next = [...slots];
        next[slotIdx] = pick;
        onChange(next);
        setOpenSlot(null);
    }

    function clearSlot(slotIdx: number) {
        const next = [...slots];
        next[slotIdx] = undefined;
        onChange(next);
        setOpenSlot(null);
    }

    return (
        <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => {
                const player = slots[i];
                const isOpen = openSlot === i;
                const available = members.filter((m) => !usedIds.has(m.user._id));

                return (
                    <div key={i} className="relative">
                        <div
                            className={cn(
                                "w-full flex items-center gap-2 p-3 rounded-lg border transition-colors",
                                player
                                    ? "border-edge bg-surface"
                                    : "border-dashed border-edge bg-surface-2"
                            )}
                        >
                            <button
                                type="button"
                                onClick={() => setOpenSlot(isOpen ? null : i)}
                                className="flex-1 min-w-0 flex items-center gap-3 text-left"
                            >
                                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                                    {player ? player.name.charAt(0) : i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-semibold text-foreground truncate">
                                            {player?.name ?? (
                                                <span className="text-muted font-normal">Empty slot</span>
                                            )}
                                        </span>
                                        {player?.external && (
                                            <span className="text-[9px] font-bold text-primary bg-primary/10 px-1 py-0.5 rounded uppercase tracking-wider shrink-0">
                                                Sub
                                            </span>
                                        )}
                                    </div>
                                    {player?.stats && (
                                        <div className="text-xs text-muted">{`${player.stats.rank.name} ${player.stats.division}`}</div>
                                    )}
                                </div>
                                <span className="text-xs text-primary shrink-0">
                                    {player ? "Swap" : "Pick"}
                                </span>
                            </button>
                            {player && (
                                <button
                                    type="button"
                                    onClick={() => clearSlot(i)}
                                    className="text-muted hover:text-danger transition-colors shrink-0"
                                >
                                    <X className="size-3.5" />
                                </button>
                            )}
                        </div>

                        {isOpen && (
                            <div className="absolute z-10 top-full mt-1 w-full bg-surface border border-edge rounded-lg shadow-xl overflow-hidden">
                                <div className="max-h-52 overflow-y-auto">
                                    {available.length === 0 ? (
                                        <div className="p-4 text-xs text-muted text-center">
                                            No members available
                                        </div>
                                    ) : (
                                        available.map((m) => (
                                            <button
                                                key={m.user._id}
                                                type="button"
                                                onClick={() => fillSlot(i, { _id: m.user._id, name: m.user.name, stats: m.user.stats })}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-2 transition-colors text-left"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                                                    {m.user.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm text-foreground truncate">{m.user.name}</div>
                                                    {m.user.stats && (
                                                        <div className="text-xs text-muted">{`${m.user.stats.rank.name} ${m.user.stats.division}`}</div>
                                                    )}
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
