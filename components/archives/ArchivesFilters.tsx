"use client";

import { Rank } from "@/lib/deadlock";
import { cn } from "@/lib/utils";
import { BestOf } from "@/app/api/graphql/types/graphql";
import type { ArchiveFiltersState, MatchTypeFilter, Region, ResultFilter } from "./types";
import { DEFAULT_ARCHIVE_FILTERS } from "./types";

const RANKS: (Rank | "Any")[] = ["Any", ...Object.values(Rank)];
const REGIONS: (Region | "All")[] = ["All", "NA", "EU"];

const BEST_OF_OPTIONS: { value: string; label: string }[] = [
    { value: "ANY", label: "Any" },
    { value: BestOf.One, label: "Bo1" },
    { value: BestOf.Three, label: "Bo3" },
    { value: BestOf.Five, label: "Bo5" },
    { value: BestOf.Unlimited, label: "Unlimited" },
];

const MATCH_TYPE_OPTIONS: { value: MatchTypeFilter; label: string }[] = [
    { value: "ANY", label: "Any" },
    { value: "ORG", label: "Organization" },
    { value: "TEAM", label: "Team" },
];

const RESULT_OPTIONS: { value: ResultFilter; label: string }[] = [
    { value: "ANY", label: "Any" },
    { value: "HOST_WIN", label: "Host Win" },
    { value: "OPPONENT_WIN", label: "Opponent Win" },
    { value: "DRAW", label: "Draw" },
];

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <span className="block text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">{label}</span>
            {children}
        </div>
    );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors",
                active
                    ? "bg-primary text-background border-primary"
                    : "border-edge text-muted hover:text-foreground hover:border-foreground/20"
            )}
        >
            {children}
        </button>
    );
}

interface ArchivesFiltersProps {
    filters: ArchiveFiltersState;
    onChange: (filters: ArchiveFiltersState) => void;
}

export function ArchivesFilters({ filters, onChange }: ArchivesFiltersProps) {
    function set<K extends keyof ArchiveFiltersState>(key: K, value: ArchiveFiltersState[K]) {
        onChange({ ...filters, [key]: value });
    }

    const hasActiveFilters = JSON.stringify(filters) !== JSON.stringify(DEFAULT_ARCHIVE_FILTERS);

    return (
        <div className="bg-surface border border-edge rounded-lg p-4 space-y-5 lg:sticky lg:top-20">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-widest">Filters</h2>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={() => onChange(DEFAULT_ARCHIVE_FILTERS)}
                        className="text-[11px] text-muted hover:text-danger transition-colors"
                    >
                        Clear all
                    </button>
                )}
            </div>

            <FilterSection label="Player Name">
                <input
                    value={filters.playerSearch}
                    onChange={(e) => set("playerSearch", e.target.value)}
                    placeholder="Search by player…"
                    className="w-full bg-surface-2 border border-edge rounded px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
            </FilterSection>

            <FilterSection label="Organization">
                <input
                    value={filters.orgSearch}
                    onChange={(e) => set("orgSearch", e.target.value)}
                    placeholder="Search by org…"
                    className="w-full bg-surface-2 border border-edge rounded px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
            </FilterSection>

            <FilterSection label="Match Type">
                <div className="flex flex-wrap gap-1.5">
                    {MATCH_TYPE_OPTIONS.map((opt) => (
                        <Pill key={opt.value} active={filters.matchTypeFilter === opt.value} onClick={() => set("matchTypeFilter", opt.value)}>
                            {opt.label}
                        </Pill>
                    ))}
                </div>
            </FilterSection>

            <FilterSection label="Result">
                <div className="flex flex-wrap gap-1.5">
                    {RESULT_OPTIONS.map((opt) => (
                        <Pill key={opt.value} active={filters.resultFilter === opt.value} onClick={() => set("resultFilter", opt.value)}>
                            {opt.label}
                        </Pill>
                    ))}
                </div>
            </FilterSection>

            <FilterSection label="Best Of">
                <div className="flex flex-wrap gap-1.5">
                    {BEST_OF_OPTIONS.map((opt) => (
                        <Pill key={opt.value} active={filters.bestOfFilter === opt.value} onClick={() => set("bestOfFilter", opt.value)}>
                            {opt.label}
                        </Pill>
                    ))}
                </div>
            </FilterSection>

            <FilterSection label="Region">
                <div className="flex flex-wrap gap-1.5">
                    {REGIONS.map((r) => (
                        <Pill key={r} active={filters.regionFilter === r} onClick={() => set("regionFilter", r)}>
                            {r}
                        </Pill>
                    ))}
                </div>
            </FilterSection>

            <FilterSection label="Rank Average">
                <div className="flex flex-wrap gap-1.5">
                    {RANKS.map((r) => {
                        const name = r === "Any" ? "Any" : r.name;
                        return (
                            <Pill key={name} active={filters.rankFilter === r} onClick={() => set("rankFilter", r)}>
                                {name}
                            </Pill>
                        );
                    })}
                </div>
            </FilterSection>
        </div>
    );
}
