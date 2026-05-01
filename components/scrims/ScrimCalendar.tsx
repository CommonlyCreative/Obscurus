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
import { ArrayElement, cn } from "@/lib/utils";
import { ScrimCalendarQuery, ScrimmageStatus } from "@/app/api/graphql/types/graphql";

interface CalendarOrg {
    _id: string;
    name: string;
}

type CalendarScrim = ArrayElement<ScrimCalendarQuery["getScrimmages"]> 

function thisWeek(dayOffset: number, hour: number, minute = 0): number {
    const now = new Date();
    const dow = now.getDay();
    const toMonday = dow === 0 ? -6 : 1 - dow;
    const d = new Date(now);
    d.setDate(d.getDate() + toMonday + dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d.getTime();
}

// const MOCK_SCRIMS: CalendarScrim[] = [
//     {
//         id: "scrim_001",
//         hostOrg: { _id: "org_01", name: "Void Casters" },
//         hostTeamName: "Void Casters Main",
//         hostLeader: "VoidWalker",
//         opponentOrg: { _id: "org_02", name: "Iron Circuit" },
//         opponentTeamName: "Iron Circuit A",
//         opponentLeader: "IronForge",
//         region: "NA",
//         bestOf: "THREE",
//         status: "SCHEDULED",
//         scheduledAt: thisWeek(0, 19),
//         wagerAmount: 500,
//         note: "Structured play, sessions will be recorded.",
//     },
//     {
//         id: "scrim_002",
//         hostOrg: { _id: "org_03", name: "Neon Remnants" },
//         hostTeamName: "Neon Remnants A",
//         hostLeader: "NeonHex",
//         opponentOrg: null,
//         opponentTeamName: null,
//         opponentLeader: null,
//         region: "EU",
//         bestOf: "THREE",
//         status: "SCHEDULING",
//         scheduledAt: thisWeek(1, 20, 30),
//         wagerAmount: 0,
//         note: null,
//     },
//     {
//         id: "scrim_003",
//         hostOrg: { _id: "org_04", name: "Null Directive" },
//         hostTeamName: "Null Directive",
//         hostLeader: "NullByte",
//         opponentOrg: { _id: "org_05", name: "Paradox Squad" },
//         opponentTeamName: "Paradox Squad",
//         opponentLeader: "ParaShift",
//         region: "NA",
//         bestOf: "FIVE",
//         status: "SCHEDULED",
//         scheduledAt: thisWeek(1, 18),
//         wagerAmount: 1000,
//         note: "High stakes. Eternus-rank opponents only.",
//     },
//     {
//         id: "scrim_004",
//         hostOrg: { _id: "org_07", name: "Storm Protocol" },
//         hostTeamName: "Storm Protocol",
//         hostLeader: "StormFront",
//         opponentOrg: { _id: "org_08", name: "Phantom Syndicate" },
//         opponentTeamName: "Phantom Syndicate",
//         opponentLeader: "PhantomX",
//         region: "NA",
//         bestOf: "THREE",
//         status: "ACTIVE",
//         scheduledAt: thisWeek(2, 18, 30),
//         wagerAmount: 250,
//         note: "Weekly training series.",
//     },
//     {
//         id: "scrim_005",
//         hostOrg: { _id: "org_01", name: "Void Casters" },
//         hostTeamName: "Void Casters Main",
//         hostLeader: "VoidWalker",
//         opponentOrg: { _id: "org_06", name: "Hex Collective" },
//         opponentTeamName: "Hex Collective",
//         opponentLeader: "HexMaster",
//         region: "EU",
//         bestOf: "THREE",
//         status: "COMPLETED",
//         scheduledAt: thisWeek(2, 21),
//         wagerAmount: 0,
//         note: null,
//     },
//     {
//         id: "scrim_006",
//         hostOrg: { _id: "org_02", name: "Iron Circuit" },
//         hostTeamName: "Iron Circuit A",
//         hostLeader: "IronForge",
//         opponentOrg: { _id: "org_09", name: "Data Surge" },
//         opponentTeamName: "Data Surge",
//         opponentLeader: "DataBurn",
//         region: "EU",
//         bestOf: "ONE",
//         status: "SCHEDULED",
//         scheduledAt: thisWeek(3, 20),
//         wagerAmount: 0,
//         note: "Quick Bo1 before the weekend.",
//     },
//     {
//         id: "scrim_007",
//         hostOrg: { _id: "org_05", name: "Paradox Squad" },
//         hostTeamName: "Paradox Squad",
//         hostLeader: "ParaShift",
//         opponentOrg: { _id: "org_10", name: "Core Overload" },
//         opponentTeamName: "Core Overload",
//         opponentLeader: "CoreDrive",
//         region: "NA",
//         bestOf: "THREE",
//         status: "SCHEDULED",
//         scheduledAt: thisWeek(4, 19, 30),
//         wagerAmount: 750,
//         note: "Weekend warmup.",
//     },
//     {
//         id: "scrim_008",
//         hostOrg: { _id: "org_04", name: "Null Directive" },
//         hostTeamName: "Null Directive",
//         hostLeader: "NullByte",
//         opponentOrg: { _id: "org_07", name: "Storm Protocol" },
//         opponentTeamName: "Storm Protocol",
//         opponentLeader: "StormFront",
//         region: "NA",
//         bestOf: "FIVE",
//         status: "SCHEDULING",
//         scheduledAt: thisWeek(5, 17),
//         wagerAmount: 2000,
//         note: "Championship qualifier. Full five-game series.",
//     },
//     {
//         id: "scrim_009",
//         hostOrg: { _id: "org_06", name: "Hex Collective" },
//         hostTeamName: "Hex Collective",
//         hostLeader: "HexMaster",
//         opponentOrg: { _id: "org_03", name: "Neon Remnants" },
//         opponentTeamName: "Neon Remnants A",
//         opponentLeader: "NeonHex",
//         region: "EU",
//         bestOf: "THREE",
//         status: "SCHEDULED",
//         scheduledAt: thisWeek(6, 16),
//         wagerAmount: 0,
//         note: null,
//     },
// ];

const STATUS_CONFIG = {
    PENDING: {
        label: "Pending Invitation",
        pill: "text-yellow-400 bg-yellow-400/10 border border-yellow-400/30",
        dot: "bg-yellow-400",
        border: "border-l-yellow-400",
    },
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
    CANCELLED: {
        label: "Cancelled",
        pill: "text-muted bg-surface-2 border border-edge",
        dot: "bg-muted",
        border: "border-l-muted",
    },
} as Record<ScrimmageStatus, { label: string,pill: string,dot: string,border: string,}>;

const BEST_OF_LABEL: Record<NonNullable<CalendarScrim["bestOf"]>, string> = {
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

function ScrimEventCard({ scrim }: { scrim: CalendarScrim }) {
    const [isOpen, setIsOpen] = useState(false);
    const status = STATUS_CONFIG[scrim.status];

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
    const startingTime = scrim.scheduledAt ? scrim.scheduledAt : scrim.createdAt;
    const hostTeamName = scrim.hostOrg?.name ?? scrim.host.name+"'s Team";
    const opponentTeamName = scrim.opponentOrg?.name ?? scrim.opponentTeam?.leader.name ? scrim.opponentTeam?.leader.name+"'s Team" : "TBD";

    return (
        <>
            <div
                ref={refs.setReference}
                {...getReferenceProps()}
                className={cn(
                    "border border-edge border-l-2 rounded-md bg-surface-2 px-2.5 py-2 cursor-pointer",
                    "hover:border-primary/30 hover:bg-surface transition-colors",
                    status.border,
                )}
            >
                <div className="flex items-start justify-between gap-1 mb-1">
                    <p className="text-xs font-semibold text-foreground truncate leading-tight">
                        {hostTeamName}
                    </p>
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0", status.pill)}>
                        {BEST_OF_LABEL[scrim.bestOf]}
                    </span>
                </div>
                <p className="text-[10px] text-dimmed truncate mb-1.5">
                    vs {opponentTeamName}
                </p>
                <div className="flex items-center gap-1.5">
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", status.dot)} />
                    <span className="text-[10px] text-muted">{formatTime(startingTime)}</span>
                    <span className="text-[10px] text-edge">·</span>
                    <span className="text-[10px] text-muted">{scrim.region}</span>
                </div>
            </div>

            {isOpen && (
                <FloatingPortal>
                    <div
                        ref={refs.setFloating}
                        style={floatingStyles}
                        {...getFloatingProps()}
                        className="z-50 w-72 bg-surface border border-edge rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-4 pt-4 pb-3 border-b border-edge bg-surface-2">
                            <div className="flex items-center justify-between mb-3">
                                <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full", status.pill)}>
                                    {status.label}
                                </span>
                                <div className="flex items-center gap-1.5 text-[10px] text-muted">
                                    <MapPin className="w-3 h-3" />
                                    <span>{scrim.region}</span>
                                    <span className="text-edge">·</span>
                                    <span>{BEST_OF_LABEL[scrim.bestOf]}</span>
                                </div>
                            </div>

                            {/* Teams */}
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm font-bold text-foreground">
                                        {hostTeamName}
                                    </p>
                                    <p className="text-[10px] text-dimmed">Led by {scrim.host.name}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-px bg-edge" />
                                    <span className="text-[10px] text-muted tracking-[0.2em] uppercase">vs</span>
                                    <div className="flex-1 h-px bg-edge" />
                                </div>
                                <div>
                                    {scrim.opponentOrg?.name ? (
                                        <>
                                            <p className="text-sm font-bold text-foreground">
                                                {scrim.opponentOrg?.name}
                                            </p>
                                            {scrim.opponentTeam?.leader && (
                                                <p className="text-[10px] text-dimmed">Led by {scrim.opponentTeam?.leader.name}</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted italic">Opponent TBD</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-4 py-3 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-dimmed">
                                <Calendar className="w-3.5 h-3.5 text-muted shrink-0" />
                                <span>
                                    {new Date(startingTime).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                    })}{" "}
                                    at {formatTime(startingTime)}
                                </span>
                            </div>

                            {/* {scrim.wagerAmount > 0 && (
                                <div className="flex items-center gap-2 text-xs">
                                    <Gem className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span className="text-primary font-semibold">
                                        {scrim.wagerAmount.toLocaleString()} credits wagered
                                    </span>
                                </div>
                            )} */}

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

export function ScrimCalendar({ scrims }: { scrims: ScrimCalendarQuery["getScrimmages"] }) {
    const [weekOffset, setWeekOffset] = useState(0);

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const dow = todayDate.getDay();
    const toMonday = dow === 0 ? -6 : 1 - dow;
    const weekStart = new Date(todayDate);
    weekStart.setDate(todayDate.getDate() + toMonday + weekOffset * 7);

    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
    });

    const scrimsByDay = days.map((day) => {
        const dayStart = day.getTime();
        const dayEnd = dayStart + 86_400_000;
        return scrims
            .filter((s) => {
                const scrimStart = s.scheduledAt ? s.scheduledAt : s.createdAt;
                return scrimStart >= dayStart && scrimStart < dayEnd
            })
            .sort((a, b) => {
                const aScrimStart = a.scheduledAt ? a.scheduledAt : a.createdAt;
                const bScrimStart = b.scheduledAt ? b.scheduledAt : b.createdAt;
                return aScrimStart - bScrimStart
            });
    });

    const isToday = (d: Date) => d.toDateString() === new Date().toDateString();

    const totalThisWeek = scrimsByDay.reduce((sum, day) => sum + day.length, 0);

    const weekLabel = `${days[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${days[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Week navigation */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-sm font-semibold text-foreground">{weekLabel}</p>
                    <p className="text-xs text-muted mt-0.5">
                        {totalThisWeek} scrimmage{totalThisWeek !== 1 ? "s" : ""} this week
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {weekOffset !== 0 && (
                        <button
                            onClick={() => setWeekOffset(0)}
                            className="px-3 py-1.5 text-xs font-semibold border border-edge rounded-md text-dimmed hover:text-foreground hover:border-foreground/20 transition-colors"
                        >
                            Today
                        </button>
                    )}
                    <button
                        onClick={() => setWeekOffset((w) => w - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-edge rounded-md text-muted hover:text-foreground hover:border-foreground/20 transition-colors"
                        aria-label="Previous week"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setWeekOffset((w) => w + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-edge rounded-md text-muted hover:text-foreground hover:border-foreground/20 transition-colors"
                        aria-label="Next week"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Status legend */}
            <div className="flex items-center gap-4 mb-5">
                {(Object.entries(STATUS_CONFIG) as [keyof typeof STATUS_CONFIG, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([key, cfg]) => (
                    <div key={key} className="flex items-center gap-1.5">
                        <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
                        <span className="text-xs text-muted">{cfg.label}</span>
                    </div>
                ))}
            </div>

            {/* Calendar grid — scrollable on small screens */}
            <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-2 min-w-150">
                    {/* Day headers */}
                    {days.map((day, i) => (
                        <div
                            key={i}
                            className={cn(
                                "text-center pb-3 border-b-2",
                                isToday(day) ? "border-b-primary" : "border-b-edge",
                            )}
                        >
                            <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">
                                {DAY_NAMES[i]}
                            </p>
                            <p
                                className={cn(
                                    "text-xl font-black mt-0.5 leading-none",
                                    isToday(day) ? "text-primary" : "text-foreground",
                                )}
                            >
                                {day.getDate()}
                            </p>
                        </div>
                    ))}

                    {/* Event columns */}
                    {days.map((day, i) => (
                        <div key={i} className="pt-2 space-y-1.5 min-h-48">
                            {scrimsByDay[i].length > 0 ? (
                                scrimsByDay[i].map((scrim) => (
                                    <ScrimEventCard key={scrim._id} scrim={scrim} />
                                ))
                            ) : (
                                <div className="flex items-center justify-center min-h-16">
                                    <span className="text-xs text-edge select-none">—</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
