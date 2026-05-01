"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { OrgMember } from "./types";
import { convertSteam64toSteam32, getRankByMMR } from "@/lib/deadlock";

export function RosterSelector({
    slots,
    members,
    onChange,
}: {
    slots: (OrgMember | undefined)[];
    members: OrgMember[];
    onChange: (slots: (OrgMember | undefined)[]) => void;
}) {
    const [openSlot, setOpenSlot] = useState<number | null>(null);

    function swapSlot(slotIdx: number, member: OrgMember) {
        const next = [...slots];
        const existingIdx = next.findIndex((s) => s?.user._id === member.user._id);
        if (existingIdx !== -1 && existingIdx !== slotIdx) {
            next[existingIdx] = next[slotIdx];
        }
        next[slotIdx] = member;
        onChange(next);
        setOpenSlot(null);
    }

    return (
        <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => {
                const player = slots[i];
                const isOpen = openSlot === i;
                const available = members.filter(
                    (m) => !slots.some((s, si) => s?.user._id === m.user._id && si !== i)
                );

                const stats = player?.user.stats

                return (
                    <div key={i} className="relative">
                        <button
                            type="button"
                            onClick={() => setOpenSlot(isOpen ? null : i)}
                            className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                                player
                                    ? "border-edge bg-surface hover:border-primary/40"
                                    : "border-dashed border-edge bg-surface-2 hover:border-primary/30"
                            )}
                        >
                            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                                {player ? player.user.name.charAt(0) : i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-foreground truncate">
                                    {player?.user.name ?? (
                                        <span className="text-muted font-normal">Empty slot</span>
                                    )}
                                </div>
                                {stats && (
                                    <div className="text-xs text-muted">{`${stats.rank.name} ${stats.division}`}</div>
                                )}
                            </div>
                            <span className="text-xs text-primary shrink-0">
                                {player ? "Swap" : "Pick"}
                            </span>
                        </button>

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
                                                onClick={() => swapSlot(i, m)}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-2 transition-colors text-left"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                                                    {m.user.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm text-foreground truncate">{m.user.name}</div>
                                                    {stats && <div className="text-xs text-muted">{`${stats.rank.name} ${stats.division}`}</div>}
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
