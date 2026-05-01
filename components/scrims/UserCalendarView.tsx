"use client";

import { useEffect, useState, useTransition } from "react";
import { getCalendarInfo, type CalendarEvent, type CalendarResult } from "@/app/scrims/create/actions";
import { cn } from "@/lib/utils";
import { ExternalLink, RefreshCw } from "lucide-react";

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmtTime(iso: string, allDay: boolean): string {
    if (allDay) return "All day";
    const d = new Date(iso);
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? "p" : "a";
    const h12 = h % 12 || 12;
    return m === 0 ? `${h12}${ampm}` : `${h12}:${String(m).padStart(2, "0")}${ampm}`;
}

function dayStart(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function eventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
    const start = dayStart(day).getTime();
    const end = start + 24 * 60 * 60 * 1000;
    return events.filter(e => {
        const es = new Date(e.start).getTime();
        const ee = new Date(e.end).getTime();
        return es < end && ee > start;
    });
}

export function UserCalendarView({ userId }: { userId: string }) {
    const [result, setResult] = useState<CalendarResult | null>(null);
    const [refreshing, startRefresh] = useTransition();

    useEffect(() => {
        getCalendarInfo().then(setResult);
    }, []);

    function refresh() {
        startRefresh(async () => {
            const next = await getCalendarInfo();
            setResult(next);
        });
    }

    const today = dayStart(new Date());
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        return d;
    });

    if (result === null) {
        return (
            <div className="flex items-center gap-2 py-1">
                <div className="w-2 h-2 rounded-full bg-edge animate-pulse shrink-0" />
                <span className="text-xs text-muted">Loading your calendar…</span>
            </div>
        );
    }

    if (!result.connected) {
        return (
            <div className="py-2 space-y-2">
                <p className="text-xs text-muted">
                    {result.error ?? "Connect your Google account to see your calendar here."}
                </p>
                <a
                    href={`/profile/${userId}/edit`}
                    className="text-xs font-semibold text-primary hover:text-primary-dim transition-colors"
                >
                    Connect in Edit Profile →
                </a>
            </div>
        );
    }

    const { events } = result;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
                    Next 7 days
                </span>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={refresh}
                        disabled={refreshing}
                        className="flex items-center gap-1 text-[10px] text-muted hover:text-foreground transition-colors disabled:opacity-40"
                    >
                        <RefreshCw size={10} className={cn(refreshing && "animate-spin")} />
                        {refreshing ? "Refreshing…" : "Refresh"}
                    </button>
                    <a
                        href="https://calendar.google.com/calendar/r/week"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-muted hover:text-foreground transition-colors"
                    >
                        Open Google Calendar
                        <ExternalLink size={10} />
                    </a>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-1.5 min-w-96">
                    {/* Day headers */}
                    {days.map((day, i) => {
                        const isToday = i === 0;
                        return (
                            <div key={i} className="text-center pb-2 border-b border-edge">
                                <div className={cn(
                                    "text-[10px] font-semibold uppercase tracking-wider",
                                    isToday ? "text-primary" : "text-muted"
                                )}>
                                    {DAY_SHORT[day.getDay()]}
                                </div>
                                <div className={cn(
                                    "text-xs font-bold mt-0.5",
                                    isToday ? "text-primary" : "text-dimmed"
                                )}>
                                    {day.getDate()}
                                </div>
                            </div>
                        );
                    })}

                    {/* Day cells */}
                    {days.map((day, i) => {
                        const dayEvents = eventsForDay(events, day);
                        return (
                            <div key={i} className="pt-1.5 space-y-1 min-h-16">
                                {dayEvents.length === 0 ? (
                                    <div className="flex items-center justify-center min-h-12">
                                        <span className="text-[10px] text-edge select-none">—</span>
                                    </div>
                                ) : (
                                    dayEvents.map((ev, j) => (
                                        <a
                                            key={j}
                                            href={ev.htmlLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block border rounded px-1.5 py-1 text-[10px] font-medium leading-tight bg-primary/10 border-primary/25 text-primary hover:bg-primary/20 transition-colors"
                                        >
                                            <div className="font-semibold truncate">{ev.title}</div>
                                            <div className="opacity-75 tabular-nums">
                                                {fmtTime(ev.start, ev.allDay)}
                                            </div>
                                        </a>
                                    ))
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
