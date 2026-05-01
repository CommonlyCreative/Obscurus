"use client";

import { useEffect, useState } from "react";
import type { Scrim } from "./types";
import { Button } from "@/components/shared/Button";
import { ScrimListQuery } from "@/app/api/graphql/types/graphql";
import { ArrayElement } from "@/lib/utils";
import { convertSteam64toSteam32, getRankByMMR } from "@/lib/deadlock";

const RANK_STYLES: Record<string, { text: string; bg: string }> = {
    Bronze: { text: "text-[#cd7f32]", bg: "bg-[#cd7f32]/10" },
    Silver: { text: "text-[#c0c0c0]", bg: "bg-[#c0c0c0]/10" },
    Gold: { text: "text-primary", bg: "bg-primary/10" },
    Platinum: { text: "text-[#94d4a4]", bg: "bg-[#94d4a4]/10" },
    Diamond: { text: "text-[#b9f2ff]", bg: "bg-[#b9f2ff]/10" },
    Eternus: { text: "text-[#d8b4fe]", bg: "bg-[#d8b4fe]/10" },
};

export function ScrimCard({ scrim }: { scrim: ArrayElement<ScrimListQuery["getScrimmages"]> }) {
    const [expanded, setExpanded] = useState(false);
    // const rankStyle = RANK_STYLES[scrim.rank.name] ?? { text: "text-dimmed", bg: "bg-surface-2" };

    const [rank, setRank] = useState<ReturnType<typeof getRankByMMR> | null>(null);

    useEffect(() => {
        const accumulated = scrim.hostTeam.members.reduce((acc, stat) => {
            return acc + (stat.stats?.mmr ?? 0)
        }, 0)
        const rankAvg = accumulated / scrim.hostTeam.members.filter(m => !!m.stats).length

        setRank(getRankByMMR(rankAvg))
    }, [])

    return (
        <div className="bg-surface border border-edge rounded-lg hover:border-primary/25 transition-colors">
            <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                        <div className="font-bold text-foreground text-sm">{scrim.hostTeam.name ?? scrim.host.name + "'s Team"}</div>
                        <div className="text-xs text-muted mt-0.5">{scrim.createdAt}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {rank && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rank.rank.text} ${rank.rank.bg}`}>
                            {rank.rank.name}
                        </span>}
                        <span className="text-xs text-muted px-2 py-0.5 bg-surface-2 rounded-full border border-edge font-medium">
                            {scrim.region}
                        </span>
                    </div>
                </div>

                <p className="text-xs text-dimmed leading-relaxed mb-4 line-clamp-2">{scrim.note}</p>

                {/* Players row — click to expand */}
                <div
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => setExpanded(!expanded)}
                >
                    <div className="flex -space-x-1.5">
                        {scrim.hostTeam.members.slice(0, 6).map((p, i) => (
                            <div
                                key={i}
                                title={p.name}
                                className="w-6 h-6 rounded-full bg-secondary border-2 border-surface flex items-center justify-center text-[9px] font-bold text-foreground shrink-0"
                            >
                                {p.name.charAt(0)}
                            </div>
                        ))}
                    </div>
                    <span className="text-xs text-muted">6/6</span>
                    <div className="ml-auto text-xs text-muted group-hover:text-dimmed transition-colors">
                        {expanded ? "▲" : "▼"}
                    </div>
                </div>

                {/* Expanded player list */}
                {expanded && (
                    <div className="mt-3 pt-3 border-t border-edge grid grid-cols-2 gap-1.5">
                        {scrim.hostTeam.members.slice(0, 6).map((p, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-dimmed">
                                <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold text-foreground shrink-0">
                                    {p.name.charAt(0)}
                                </div>
                                <span className="truncate">{p.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-t border-edge bg-surface-2 rounded-b-lg">
                <span className="text-xs text-muted">Best of {scrim.bestOf}</span>
                <Button size="sm" className="text-xs" href={`/scrims/${scrim._id}`}>Join Scrim</Button>
            </div>
        </div>
    );
}
