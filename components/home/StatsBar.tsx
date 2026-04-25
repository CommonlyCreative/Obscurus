"use client"
import { useLiveTeams } from "@/hooks/useLiveTeams";
import { StatItem, type Stat } from "./StatItem";
import { useTeamSocket } from "@/hooks/useTeamSocket";

const STATS: Stat[] = [
    { value: "142", label: "Active Teams" },
    { value: "38", label: "Open Scrims" },
    { value: "3", label: "Regions" },
    { value: "1,200+", label: "Registered Players" },
];

export function StatsBar({ scrims, players, orgs }: { scrims: number, players: number, orgs: number }) {
    const { teams, loading } = useTeamSocket(["all"])
    const stats = [
        { value: loading ? orgs : Object.entries(teams).length+orgs, label: "Active Teams" },
        { value: scrims, label: "Open Scrims" },
        { value: "2", label: "Regions" },
        { value: `${players}`, label: "Registered Players" },
    ]
    return (
        <div className="relative border-t border-edge w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-edge">
                    {stats.map((stat) => (
                        <StatItem key={stat.label} stat={stat} />
                    ))}
                </div>
            </div>
        </div>
    );
}
