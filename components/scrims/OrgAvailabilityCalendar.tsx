"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Day } from "@/app/api/graphql/types/graphql";

const DAY_ORDER: Day[] = [
    Day.Monday, Day.Tuesday, Day.Wednesday, Day.Thursday,
    Day.Friday, Day.Saturday, Day.Sunday,
];

const DAY_SHORT: Record<Day, string> = {
    [Day.Monday]: "Mon",
    [Day.Tuesday]: "Tue",
    [Day.Wednesday]: "Wed",
    [Day.Thursday]: "Thu",
    [Day.Friday]: "Fri",
    [Day.Saturday]: "Sat",
    [Day.Sunday]: "Sun",
};

type OrgColor = { bg: string; border: string; text: string };

const PALETTE: OrgColor[] = [
    { bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.45)", text: "#818cf8" }, // indigo
    { bg: "rgba(45,212,191,0.12)", border: "rgba(45,212,191,0.45)", text: "#2dd4bf" }, // teal
    { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.45)", text: "#fbbf24" }, // amber
    { bg: "rgba(251,113,133,0.12)", border: "rgba(251,113,133,0.45)", text: "#fb7185" }, // rose
    { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.45)", text: "#34d399" }, // emerald
    { bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.45)", text: "#38bdf8" }, // sky
    { bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.45)", text: "#a78bfa" }, // violet
    { bg: "rgba(251,146,60,0.12)", border: "rgba(251,146,60,0.45)", text: "#fb923c" }, // orange
];

const stringToHSL = (str: string) => {
    // TODO - add this to the list of orgs so colors can be infinite
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        // Generate a simple hash from character codes
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Use the hash to pick a hue (0-360)
    const hue = Math.abs(hash % 360);
    // Fixed saturation (70%) and lightness (50%) for nice colors
    return `hsl(${hue}, 70%, 50%)`;
};

export type OrgWithBlocks = {
    _id: string;
    name: string;
    blocks?: Array<{
        day: Day;
        timesheets?: Array<{ startTime: number; endTime: number }> | null;
    }> | null;
};

function fmtTime(ms: number): string {
    const h = Math.floor(ms / 3_600_000) % 24;
    const m = Math.floor((ms % 3_600_000) / 60_000);
    const ampm = h >= 12 ? "p" : "a";
    const h12 = h % 12 || 12;
    return m === 0 ? `${h12}${ampm}` : `${h12}:${String(m).padStart(2, "0")}${ampm}`;
}

export function OrgAvailabilityCalendar({
    orgs,
    currentOrgId,
}: {
    orgs: OrgWithBlocks[];
    currentOrgId: string;
}) {
    const eligible = orgs.filter(
        o => o._id !== currentOrgId && o.blocks?.some(b => !!b.timesheets?.[0])
    );

    const [selectedIds, setSelectedIds] = useState<Set<string>>(
        () => new Set(eligible.map(o => o._id))
    );

    function toggle(id: string) {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    const colorOf = (id: string): OrgColor =>
        PALETTE[eligible.findIndex(o => o._id === id) % PALETTE.length];

    const visibleOrgs = eligible.filter(o => selectedIds.has(o._id));

    if (eligible.length === 0) {
        return (
            <p className="text-xs text-muted italic py-1">
                No organizations have configured their availability yet.
            </p>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-5">
            {/* ── Weekly calendar ── */}
            <div className="flex-1 min-w-0 overflow-x-auto">
                <div className="grid grid-cols-7 gap-1.5 min-w-96">
                    {/* Day headers */}
                    {DAY_ORDER.map(day => (
                        <div key={`h-${day}`} className="text-center pb-2 border-b border-edge">
                            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                                {DAY_SHORT[day]}
                            </span>
                        </div>
                    ))}

                    {/* Day cells */}
                    {DAY_ORDER.map(day => {
                        const entries = visibleOrgs.flatMap(org =>
                            (org.blocks?.find(b => b.day === day)?.timesheets ?? []).map(ts => ({ org, ts }))
                        );

                        return (
                            <div key={`c-${day}`} className="pt-1.5 space-y-1 min-h-16">
                                {entries.length === 0 ? (
                                    <div className="flex items-center justify-center min-h-12">
                                        <span className="text-[10px] text-edge select-none">—</span>
                                    </div>
                                ) : (
                                    entries.map(({ org, ts }, i) => {
                                        const color = colorOf(org._id);
                                        return (
                                            <div
                                                key={`${org._id}-${i}`}
                                                style={{
                                                    background: color.bg,
                                                    borderColor: color.border,
                                                    color: color.text,
                                                }}
                                                className="border rounded px-1.5 py-1 text-[10px] font-medium leading-tight"
                                            >
                                                <div className="font-semibold truncate">
                                                    {org.name.split(" ")[0]}
                                                </div>
                                                <div className="opacity-75 tabular-nums">
                                                    {fmtTime(ts.startTime)}–{fmtTime(ts.endTime)}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Org selector sidebar ── */}
            <div className="w-full lg:w-44 shrink-0 flex flex-col gap-1.5">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
                    Toggle orgs
                </p>
                <div className="space-y-1 max-h-60 overflow-y-auto pr-0.5">
                    {eligible.map(org => {
                        const color = colorOf(org._id);
                        const isSelected = selectedIds.has(org._id);
                        const activeDays = DAY_ORDER.filter(day =>
                            org.blocks?.some(b => b.day === day && b.timesheets?.[0])
                        );

                        return (
                            <button
                                key={org._id}
                                type="button"
                                onClick={() => toggle(org._id)}
                                className={cn(
                                    "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-all",
                                    isSelected
                                        ? "border-edge bg-surface"
                                        : "border-edge/30 bg-surface-2 opacity-40"
                                )}
                            >
                                <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ background: color.text, outline: `1px solid ${color.border}`, outlineOffset: "2px" }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-foreground truncate leading-tight">
                                        {org.name}
                                    </p>
                                    {/* 7 day micro-dots */}
                                    <div className="flex gap-0.5 mt-1">
                                        {DAY_ORDER.map(day => (
                                            <span
                                                key={day}
                                                title={DAY_SHORT[day]}
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{
                                                    background: activeDays.includes(day)
                                                        ? color.text
                                                        : "#2c2c2c",
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <span className="text-[10px] text-muted shrink-0">
                                    {activeDays.length}d
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
