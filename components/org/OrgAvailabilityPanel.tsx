"use client";

import { useState, useTransition } from "react";
import { Pencil, Check, X, Plus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Day } from "@/app/api/graphql/types/graphql";
import { updateAvailabilityBlocksAction } from "@/app/org/[slug]/actions";

const DAY_ORDER: Day[] = [
    Day.Monday, Day.Tuesday, Day.Wednesday, Day.Thursday,
    Day.Friday, Day.Saturday, Day.Sunday,
];

const DAY_LABEL: Record<Day, string> = {
    [Day.Monday]: "Mon", [Day.Tuesday]: "Tue", [Day.Wednesday]: "Wed",
    [Day.Thursday]: "Thu", [Day.Friday]: "Fri", [Day.Saturday]: "Sat", [Day.Sunday]: "Sun",
};

const DAY_FULL: Record<Day, string> = {
    [Day.Monday]: "Monday", [Day.Tuesday]: "Tuesday", [Day.Wednesday]: "Wednesday",
    [Day.Thursday]: "Thursday", [Day.Friday]: "Friday", [Day.Saturday]: "Saturday", [Day.Sunday]: "Sunday",
};

type TimeRange = { startTime: string; endTime: string };
type BlockSlot = { enabled: boolean; ranges: TimeRange[] };

export type AvailabilityBlockProp = {
    day: Day;
    timesheets?: Array<{ startTime: number; endTime: number }> | null;
};

function msToTimeInput(ms: number): string {
    const h = Math.floor(ms / 3_600_000) % 24;
    const m = Math.floor((ms % 3_600_000) / 60_000);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function timeInputToMs(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return (h * 60 + m) * 60_000;
}

function formatTimeOfDay(ms: number): string {
    const h = Math.floor(ms / 3_600_000) % 24;
    const m = Math.floor((ms % 3_600_000) / 60_000);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function makeSlots(blocks: AvailabilityBlockProp[] | null | undefined): Record<Day, BlockSlot> {
    const blockMap = new Map((blocks ?? []).map(b => [b.day, b]));
    return Object.fromEntries(
        DAY_ORDER.map(day => {
            const ts = blockMap.get(day)?.timesheets ?? [];
            return [
                day,
                ts.length > 0
                    ? { enabled: true, ranges: ts.map(t => ({ startTime: msToTimeInput(t.startTime), endTime: msToTimeInput(t.endTime) })) }
                    : { enabled: false, ranges: [{ startTime: "18:00", endTime: "22:00" }] },
            ];
        })
    ) as Record<Day, BlockSlot>;
}

// Real-time inline warning — checks overlap within the day only (no midnight-crossover awareness)
function dayHasOverlap(ranges: TimeRange[]): boolean {
    if (ranges.length < 2) return false;
    const sorted = ranges
        .map(r => ({ s: timeInputToMs(r.startTime), e: timeInputToMs(r.endTime) }))
        .filter(r => r.s !== r.e)
        .sort((a, b) => a.s - b.s);
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].s < sorted[i - 1].e && sorted[i - 1].e <= 24 * 3_600_000) return true;
    }
    return false;
}

type SaveResult = {
    updates: Array<{ day: Day; timesheets: Array<{ startTime: number; endTime: number }> }>;
    errors: string[];
};

function buildSaveData(draft: Record<Day, BlockSlot>): SaveResult {
    // Accumulate ranges per day; handle midnight crossover by splitting
    const acc = new Map<Day, Array<{ s: number; e: number }>>(DAY_ORDER.map(d => [d, []]));

    for (let i = 0; i < DAY_ORDER.length; i++) {
        const day = DAY_ORDER[i];
        const nextDay = DAY_ORDER[(i + 1) % DAY_ORDER.length];
        const slot = draft[day];
        if (!slot.enabled) continue;

        for (const range of slot.ranges) {
            const s = timeInputToMs(range.startTime);
            let e = timeInputToMs(range.endTime);
            if (e === 0) e = 24 * 3_600_000;  // 00:00 end treated as end-of-day
            if (s === e) continue;              // zero-duration: ignore

            if (e > s) {
                acc.get(day)!.push({ s, e });
            } else {
                // Crosses midnight — split into two days
                acc.get(day)!.push({ s, e: 23 * 3_600_000 + 59 * 60_000 }); // up to 23:59
                acc.get(nextDay)!.push({ s: 0, e });                          // from 00:00
            }
        }
    }

    // Validate: check overlaps after splitting
    const errors: string[] = [];
    for (const day of DAY_ORDER) {
        const ranges = acc.get(day)!.sort((a, b) => a.s - b.s);
        for (let i = 1; i < ranges.length; i++) {
            if (ranges[i].s < ranges[i - 1].e) {
                errors.push(
                    `${DAY_FULL[day]}: ${formatTimeOfDay(ranges[i - 1].s)}–${formatTimeOfDay(ranges[i - 1].e)} overlaps with ${formatTimeOfDay(ranges[i].s)}–${formatTimeOfDay(ranges[i].e)}`
                );
                break;
            }
        }
    }

    if (errors.length > 0) return { updates: [], errors };

    const updates = DAY_ORDER.map(day => ({
        day,
        timesheets: acc.get(day)!
            .sort((a, b) => a.s - b.s)
            .map(r => ({ startTime: r.s, endTime: r.e })),
    }));

    return { updates, errors: [] };
}

// Convert saved updates back to display slots (reflects midnight splits)
function slotsFromUpdates(
    updates: Array<{ day: Day; timesheets: Array<{ startTime: number; endTime: number }> }>
): Record<Day, BlockSlot> {
    const map = new Map(updates.map(u => [u.day, u.timesheets]));
    return Object.fromEntries(
        DAY_ORDER.map(day => {
            const ts = map.get(day) ?? [];
            return [
                day,
                ts.length > 0
                    ? { enabled: true, ranges: ts.map(t => ({ startTime: msToTimeInput(t.startTime), endTime: msToTimeInput(t.endTime) })) }
                    : { enabled: false, ranges: [{ startTime: "18:00", endTime: "22:00" }] },
            ];
        })
    ) as Record<Day, BlockSlot>;
}

interface Props {
    orgId: string;
    slug: string;
    isManager: boolean;
    blocks: AvailabilityBlockProp[] | null | undefined;
}

export function OrgAvailabilityPanel({ orgId, slug, isManager, blocks }: Props) {
    const [saved, setSaved] = useState<Record<Day, BlockSlot>>(() => makeSlots(blocks));
    const [draft, setDraft] = useState<Record<Day, BlockSlot>>(saved);
    const [isEditing, setIsEditing] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [errors, setErrors] = useState<string[]>([]);

    function startEdit() {
        setDraft(JSON.parse(JSON.stringify(saved)));
        setErrors([]);
        setIsEditing(true);
    }

    function cancelEdit() {
        setIsEditing(false);
        setErrors([]);
    }

    function toggleDay(day: Day) {
        setDraft(prev => ({ ...prev, [day]: { ...prev[day], enabled: !prev[day].enabled } }));
    }

    function addRange(day: Day) {
        setDraft(prev => ({
            ...prev,
            [day]: { ...prev[day], ranges: [...prev[day].ranges, { startTime: "18:00", endTime: "22:00" }] },
        }));
    }

    function removeRange(day: Day, index: number) {
        setDraft(prev => ({
            ...prev,
            [day]: { ...prev[day], ranges: prev[day].ranges.filter((_, i) => i !== index) },
        }));
    }

    function patchRange(day: Day, index: number, patch: Partial<TimeRange>) {
        setDraft(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                ranges: prev[day].ranges.map((r, i) => (i === index ? { ...r, ...patch } : r)),
            },
        }));
    }

    function handleSave() {
        const { updates, errors: validationErrors } = buildSaveData(draft);
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors([]);
        startTransition(async () => {
            try {
                await updateAvailabilityBlocksAction(orgId, slug, updates);
                setSaved(slotsFromUpdates(updates));
                setIsEditing(false);
            } catch {
                setErrors(["Failed to save availability. Please try again."]);
            }
        });
    }

    const display = isEditing ? draft : saved;

    return (
        <div className="bg-surface border border-edge rounded-lg overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-edge flex items-center justify-between">
                <div>
                    <div className="text-sm font-bold text-foreground">Weekly Availability</div>
                    <div className="text-xs text-muted mt-0.5">
                        Hours this team is open to receive scrim invitations
                    </div>
                </div>
                {isManager && !isEditing && (
                    <button
                        onClick={startEdit}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-edge rounded-md text-dimmed hover:text-foreground hover:border-foreground/20 transition-colors"
                    >
                        <Pencil className="w-3 h-3" />
                        Edit
                    </button>
                )}
                {isManager && isEditing && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={cancelEdit}
                            disabled={isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-edge rounded-md text-muted hover:text-foreground transition-colors disabled:opacity-50"
                        >
                            <X className="w-3 h-3" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary/10 border border-primary/30 rounded-md text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                        >
                            <Check className="w-3 h-3" />
                            {isPending ? "Saving…" : "Save"}
                        </button>
                    </div>
                )}
            </div>

            {/* ── Read-only: 7-column grid ── */}
            {!isEditing && (
                <div className="px-5 py-5">
                    <div className="grid grid-cols-7 gap-2">
                        {DAY_ORDER.map(day => {
                            const slot = display[day];
                            return (
                                <div key={day} className="flex flex-col items-center gap-1.5">
                                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                                        {DAY_LABEL[day]}
                                    </span>
                                    {slot.enabled && slot.ranges.length > 0 ? (
                                        <div className="w-full space-y-1">
                                            {slot.ranges.map((range, i) => (
                                                <div
                                                    key={i}
                                                    className="w-full rounded-md border border-success/30 bg-success/5 px-2 py-1.5 flex flex-col items-center gap-0.5"
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                                                    <span className="text-[10px] text-dimmed leading-tight text-center">
                                                        {formatTimeOfDay(timeInputToMs(range.startTime))}
                                                    </span>
                                                    <span className="text-[10px] text-edge leading-none">–</span>
                                                    <span className="text-[10px] text-dimmed leading-tight text-center">
                                                        {formatTimeOfDay(timeInputToMs(range.endTime))}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="w-full rounded-md border border-dashed border-edge px-2 py-2.5 flex flex-col items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-edge shrink-0" />
                                            <span className="text-[10px] text-edge leading-tight text-center">
                                                Unavail.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Edit mode ── */}
            {isEditing && (
                <div className="px-5 py-4 divide-y divide-edge/50">
                    {DAY_ORDER.map(day => {
                        const slot = draft[day];
                        const hasOverlap = slot.enabled && dayHasOverlap(slot.ranges);
                        return (
                            <div key={day} className="py-3 first:pt-0 last:pb-0 space-y-2">
                                {/* Day header row */}
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => toggleDay(day)}
                                        aria-pressed={slot.enabled}
                                        aria-label={`Toggle ${DAY_FULL[day]}`}
                                        className={cn(
                                            "relative w-9 h-5 rounded-full border transition-colors shrink-0",
                                            slot.enabled ? "bg-success/20 border-success/50" : "bg-surface-2 border-edge"
                                        )}
                                    >
                                        <span className={cn(
                                            "absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform",
                                            slot.enabled ? "bg-success translate-x-4" : "bg-muted"
                                        )} />
                                    </button>
                                    <span className="text-sm font-bold text-foreground w-7 shrink-0">
                                        {DAY_LABEL[day]}
                                    </span>
                                    <span className="text-xs text-muted hidden sm:block flex-1">
                                        {DAY_FULL[day]}
                                    </span>
                                    {hasOverlap && (
                                        <div className="flex items-center gap-1 text-amber-400 shrink-0">
                                            <AlertTriangle className="w-3 h-3" />
                                            <span className="text-[10px] font-medium">Overlap</span>
                                        </div>
                                    )}
                                </div>

                                {/* Time ranges */}
                                {slot.enabled ? (
                                    <div className="pl-12 space-y-1.5">
                                        {slot.ranges.map((range, i) => (
                                            <div key={i} className="flex items-center gap-2 flex-wrap">
                                                <input
                                                    type="time"
                                                    value={range.startTime}
                                                    onChange={e => patchRange(day, i, { startTime: e.target.value })}
                                                    className="bg-surface-2 border border-edge rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                                />
                                                <span className="text-xs text-muted">–</span>
                                                <input
                                                    type="time"
                                                    value={range.endTime}
                                                    onChange={e => patchRange(day, i, { endTime: e.target.value })}
                                                    className="bg-surface-2 border border-edge rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                                                />
                                                {slot.ranges.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRange(day, i)}
                                                        aria-label="Remove range"
                                                        className="text-muted hover:text-danger transition-colors shrink-0"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {slot.ranges.length < 4 && (
                                            <button
                                                type="button"
                                                onClick={() => addRange(day)}
                                                className="flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary-dim transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                                Add range
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="pl-12 text-xs text-edge italic">Unavailable</p>
                                )}
                            </div>
                        );
                    })}

                    {errors.length > 0 && (
                        <div className="pt-3 space-y-1.5">
                            {errors.map((err, i) => (
                                <p key={i} className="text-xs text-danger flex items-start gap-1.5">
                                    <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                                    {err}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
