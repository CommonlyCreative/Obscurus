"use client";

import { useState } from "react";
import Link from "next/link";
import {
    useFloating,
    autoUpdate,
    offset,
    flip,
    shift,
    useHover,
    useFocus,
    useInteractions,
    FloatingPortal,
} from "@floating-ui/react";
import { ChevronLeft, ChevronRight, MapPin, Calendar, ArrowUpRight, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

type OrgCalendarScrim = {
    _id: string;
    status: string;
    scheduledAt?: number | null;
    hostOrg?: { _id: string; name: string } | null;
    opponentOrg?: { _id: string; name: string } | null;
    hostTeam?: { name?: string | null; leader: { name: string } } | null;
    opponentTeam?: { name?: string | null; leader: { name: string } } | null;
    region: string;
    bestOf?: string | null;
    wagerAmount: number;
    note?: string | null;
};

const STATUS_CONFIG = {
    SCHEDULING: {
        label: "Scheduling",
        pill: "text-amber-400 bg-amber-400/10 border border-amber-400/30",
        dot: "bg-amber-400",
        border: "border-l-amber-400",
    },
    SCHEDULED: {
        label: "Scheduled",
        pill: "text-indigo-300 bg-indigo-300/10 border border-indigo-300/30",
        dot: "bg-indigo-300",
        border: "border-l-indigo-400",
    },
    ACTIVE: {
        label: "Live",
        pill: "text-success bg-success/10 border border-success/30",
        dot: "bg-success",
        border: "border-l-success",
    },
    COMPLETED: {
        label: "Completed",
        pill: "text-muted bg-surface-2 border border-edge",
        dot: "bg-muted",
        border: "border-l-muted",
    },
} as const;

type KnownStatus = keyof typeof STATUS_CONFIG;

const BEST_OF_LABEL: Record<string, string> = {
    ONE: "Bo1",
    THREE: "Bo3",
    FIVE: "Bo5",
    UNLIMITED: "Open",
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatTime(ms: number): string {
    return new Date(ms).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

function getStatusConfig(status: string) {
    return STATUS_CONFIG[status as KnownStatus] ?? STATUS_CONFIG.COMPLETED;
}

function ScrimEventCard({ scrim, compact = false }: { scrim: OrgCalendarScrim & { scheduledAt: number }; compact?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const cfg = getStatusConfig(scrim.status);

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        placement: "right",
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(10),
            flip({ fallbackPlacements: ["left", "bottom", "top"] }),
            shift({ padding: 12 }),
        ],
    });

    const hover = useHover(context, { delay: { open: 250, close: 80 } });
    const focus = useFocus(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus]);

    const hostName = scrim.hostOrg?.name ?? scrim.hostTeam?.name ?? "Unknown";
    const opponentName = scrim.opponentOrg?.name ?? scrim.opponentTeam?.name ?? "TBD";
    const boLabel = scrim.bestOf ? BEST_OF_LABEL[scrim.bestOf] : null;

    return (
        <>
            <div
                ref={refs.setReference}
                {...getReferenceProps()}
                className={cn(
                    "border-l-2 cursor-pointer transition-colors",
                    compact
                        ? "flex items-center gap-1.5 rounded bg-surface-2 px-1.5 py-1 hover:bg-surface"
                        : "border border-edge rounded-md bg-surface-2 px-2.5 py-2 hover:border-primary/30 hover:bg-surface",
                    cfg.border,
                )}
            >
                {compact ? (
                    <>
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
                        <span className="text-[10px] text-muted shrink-0">{formatTime(scrim.scheduledAt)}</span>
                        <span className="text-[10px] font-medium text-foreground truncate">{hostName}</span>
                    </>
                ) : (
                    <>
                        <div className="flex items-start justify-between gap-1 mb-1">
                            <p className="text-xs font-semibold text-foreground truncate leading-tight">
                                {hostName}
                            </p>
                            {boLabel && (
                                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0", cfg.pill)}>
                                    {boLabel}
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-dimmed truncate mb-1.5">vs {opponentName}</p>
                        <div className="flex items-center gap-1.5">
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
                            <span className="text-[10px] text-muted">{formatTime(scrim.scheduledAt)}</span>
                            <span className="text-[10px] text-edge">·</span>
                            <span className="text-[10px] text-muted">{scrim.region}</span>
                        </div>
                    </>
                )}
            </div>

            {isOpen && (
                <FloatingPortal>
                    <div
                        ref={refs.setFloating}
                        style={floatingStyles}
                        {...getFloatingProps()}
                        className="z-50 w-72 bg-surface border border-edge rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
                    >
                        <div className="px-4 pt-4 pb-3 border-b border-edge bg-surface-2">
                            <div className="flex items-center justify-between mb-3">
                                <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full", cfg.pill)}>
                                    {cfg.label}
                                </span>
                                <div className="flex items-center gap-1.5 text-[10px] text-muted">
                                    <MapPin className="w-3 h-3" />
                                    <span>{scrim.region}</span>
                                    {boLabel && (
                                        <>
                                            <span className="text-edge">·</span>
                                            <span>{boLabel}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm font-bold text-foreground">{hostName}</p>
                                    {scrim.hostTeam?.leader && (
                                        <p className="text-[10px] text-dimmed">
                                            Led by {scrim.hostTeam.leader.name}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-px bg-edge" />
                                    <span className="text-[10px] text-muted tracking-[0.2em] uppercase">vs</span>
                                    <div className="flex-1 h-px bg-edge" />
                                </div>
                                <div>
                                    {scrim.opponentOrg || scrim.opponentTeam ? (
                                        <>
                                            <p className="text-sm font-bold text-foreground">{opponentName}</p>
                                            {scrim.opponentTeam?.leader && (
                                                <p className="text-[10px] text-dimmed">
                                                    Led by {scrim.opponentTeam.leader.name}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted italic">Opponent TBD</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="px-4 py-3 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-dimmed">
                                <Calendar className="w-3.5 h-3.5 text-muted shrink-0" />
                                <span>
                                    {new Date(scrim.scheduledAt).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                    })}{" "}
                                    at {formatTime(scrim.scheduledAt)}
                                </span>
                            </div>

                            {scrim.wagerAmount > 0 && (
                                <div className="flex items-center gap-2 text-xs">
                                    <Gem className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span className="text-primary font-semibold">
                                        {scrim.wagerAmount.toLocaleString()} credits wagered
                                    </span>
                                </div>
                            )}

                            {scrim.note && (
                                <p className="text-xs text-dimmed leading-relaxed border-t border-edge pt-2">
                                    {scrim.note}
                                </p>
                            )}

                            <Link
                                href={`/scrims/${scrim._id}`}
                                className={cn(
                                    "mt-1 flex items-center justify-center gap-1.5 w-full py-2 rounded-md",
                                    "bg-primary/10 border border-primary/20 text-xs font-semibold text-primary",
                                    "hover:bg-primary/20 transition-colors",
                                )}
                            >
                                View Scrimmage
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </FloatingPortal>
            )}
        </>
    );
}

const MAX_VISIBLE_PER_DAY = 3;

export function OrgScrimCalendar({ scrims }: { scrims: OrgCalendarScrim[] }) {
    const [monthOffset, setMonthOffset] = useState(0);
    const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthAnchor = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const month = monthAnchor.getMonth();
    const year = monthAnchor.getFullYear();

    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    const firstDow = firstOfMonth.getDay();
    const leadingDays = firstDow === 0 ? 6 : firstDow - 1;
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(firstOfMonth.getDate() - leadingDays);

    const lastDow = lastOfMonth.getDay();
    const trailingDays = lastDow === 0 ? 0 : 7 - lastDow;
    const gridEnd = new Date(lastOfMonth);
    gridEnd.setDate(lastOfMonth.getDate() + trailingDays);

    const totalCells = Math.round((gridEnd.getTime() - gridStart.getTime()) / 86_400_000) + 1;

    const days = Array.from({ length: totalCells }, (_, i) => {
        const d = new Date(gridStart);
        d.setDate(gridStart.getDate() + i);
        return d;
    });

    const scheduledScrims = scrims.filter(
        s =>
            s.scheduledAt != null &&
            s.status !== "CANCELLED" &&
            s.status !== "OPEN" &&
            s.status !== "PENDING" &&
            s.status !== "READY",
    ) as (OrgCalendarScrim & { scheduledAt: number })[];

    const scrimsByDay = days.map(day => {
        const start = day.getTime();
        const end = start + 86_400_000;
        return scheduledScrims
            .filter(s => s.scheduledAt >= start && s.scheduledAt < end)
            .sort((a, b) => a.scheduledAt - b.scheduledAt);
    });

    const isToday = (d: Date) => d.toDateString() === new Date().toDateString();
    const isCurrentMonth = (d: Date) => d.getMonth() === month;
    const dayKey = (d: Date) => d.toDateString();

    function toggleExpanded(key: string) {
        setExpandedDays(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    }

    const totalThisMonth = scrimsByDay.reduce(
        (sum, d, i) => sum + (isCurrentMonth(days[i]) ? d.length : 0),
        0
    );
    const monthLabel = monthAnchor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    return (
        <div className="px-5 py-6">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <p className="text-sm font-semibold text-foreground">{monthLabel}</p>
                    <p className="text-xs text-muted mt-0.5">
                        {totalThisMonth} scrimmage{totalThisMonth !== 1 ? "s" : ""} this month
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {monthOffset !== 0 && (
                        <button
                            onClick={() => setMonthOffset(0)}
                            className="px-3 py-1.5 text-xs font-semibold border border-edge rounded-md text-dimmed hover:text-foreground hover:border-foreground/20 transition-colors"
                        >
                            Today
                        </button>
                    )}
                    <button
                        onClick={() => setMonthOffset(m => m - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-edge rounded-md text-muted hover:text-foreground hover:border-foreground/20 transition-colors"
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setMonthOffset(m => m + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-edge rounded-md text-muted hover:text-foreground hover:border-foreground/20 transition-colors"
                        aria-label="Next month"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Status legend */}
            <div className="flex items-center gap-4 mb-5">
                {(Object.entries(STATUS_CONFIG) as [KnownStatus, (typeof STATUS_CONFIG)[KnownStatus]][]).map(
                    ([key, cfg]) => (
                        <div key={key} className="flex items-center gap-1.5">
                            <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
                            <span className="text-xs text-muted">{cfg.label}</span>
                        </div>
                    ),
                )}
            </div>

            {/* Calendar grid */}
            <div className="overflow-x-auto">
                <div className="min-w-150">
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-2">
                        {DAY_NAMES.map((name) => (
                            <div key={name} className="text-center pb-2 border-b-2 border-b-edge">
                                <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">
                                    {name}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Month cells */}
                    <div className="grid grid-cols-7 gap-2 mt-2">
                        {days.map((day, i) => {
                            const key = dayKey(day);
                            const dayScrims = scrimsByDay[i];
                            const expanded = expandedDays.has(key);
                            const visibleScrims = expanded ? dayScrims : dayScrims.slice(0, MAX_VISIBLE_PER_DAY);
                            const hiddenCount = dayScrims.length - visibleScrims.length;

                            return (
                                <div
                                    key={key}
                                    className={cn(
                                        "min-h-28 rounded-md border border-edge p-1.5 space-y-1",
                                        isCurrentMonth(day) ? "bg-surface-2/40" : "bg-transparent opacity-40",
                                    )}
                                >
                                    <p
                                        className={cn(
                                            "text-xs font-bold leading-none px-0.5",
                                            isToday(day) ? "text-primary" : isCurrentMonth(day) ? "text-foreground" : "text-muted",
                                        )}
                                    >
                                        {day.getDate()}
                                    </p>
                                    <div className="space-y-1">
                                        {visibleScrims.map(scrim => (
                                            <ScrimEventCard key={scrim._id} scrim={scrim} compact />
                                        ))}
                                        {hiddenCount > 0 && (
                                            <button
                                                onClick={() => toggleExpanded(key)}
                                                className="w-full text-left text-[10px] text-primary hover:text-primary-dim px-1.5 transition-colors"
                                            >
                                                +{hiddenCount} more
                                            </button>
                                        )}
                                        {expanded && dayScrims.length > MAX_VISIBLE_PER_DAY && (
                                            <button
                                                onClick={() => toggleExpanded(key)}
                                                className="w-full text-left text-[10px] text-muted hover:text-dimmed px-1.5 transition-colors"
                                            >
                                                Show less
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
