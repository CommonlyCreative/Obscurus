"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { OrgMember } from "./types";

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
    const existingIdx = next.findIndex((s) => s?._id === member._id);
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
          (m) => !slots.some((s, si) => s?._id === m._id && si !== i)
        );

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
                {player ? player.name.charAt(0) : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">
                  {player?.name ?? (
                    <span className="text-muted font-normal">Empty slot</span>
                  )}
                </div>
                {player && (
                  <div className="text-xs text-muted">{player.mmr} MMR</div>
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
                        key={m._id}
                        type="button"
                        onClick={() => swapSlot(i, m)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-2 transition-colors text-left"
                      >
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                          {m.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-foreground truncate">{m.name}</div>
                          <div className="text-xs text-muted">{m.mmr} MMR</div>
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
