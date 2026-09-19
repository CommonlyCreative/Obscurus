"use client";

import { useEffect, useMemo, useState } from "react";
import { ArchivesPageHeader } from "@/components/archives/ArchivesPageHeader";
import { ArchivesFilters } from "@/components/archives/ArchivesFilters";
import { ArchivesList } from "@/components/archives/ArchivesList";
import { DEFAULT_ARCHIVE_FILTERS, getScrimRankAverage, isOrgScrim, type ArchiveFiltersState, type ArchivedScrim } from "@/components/archives/types";
import { getRankByMMR } from "@/lib/deadlock";
import { ScrimmageResult } from "@/app/api/graphql/types/graphql";
import { getArchivedScrimmages } from "./actions";

export default function ArchivesPage() {
    const [scrimmages, setScrimmages] = useState<ArchivedScrim[] | undefined>(undefined);
    const [filters, setFilters] = useState<ArchiveFiltersState>(DEFAULT_ARCHIVE_FILTERS);

    useEffect(() => {
        getArchivedScrimmages().then(setScrimmages);
    }, []);

    const filtered = useMemo(() => {
        if (!scrimmages) return undefined;

        return scrimmages
            .filter((s) => {
                if (filters.playerSearch.trim()) {
                    const q = filters.playerSearch.trim().toLowerCase();
                    const members = [
                        ...s.hostTeam.members,
                        ...(s.opponentTeam?.members ?? []),
                    ];
                    if (!members.some((m) => m.name.toLowerCase().includes(q))) return false;
                }

                if (filters.orgSearch.trim()) {
                    const q = filters.orgSearch.trim().toLowerCase();
                    const hostMatch = s.hostOrg?.name.toLowerCase().includes(q) ?? false;
                    const oppMatch = s.opponentOrg?.name.toLowerCase().includes(q) ?? false;
                    if (!hostMatch && !oppMatch) return false;
                }

                if (filters.rankFilter !== "Any") {
                    const avg = getScrimRankAverage(s);
                    const rank = avg != null ? getRankByMMR(avg) : undefined;
                    if (rank?.rank !== filters.rankFilter) return false;
                }

                if (filters.bestOfFilter !== "ANY" && s.bestOf !== filters.bestOfFilter) return false;

                if (filters.matchTypeFilter !== "ANY") {
                    const org = isOrgScrim(s);
                    if (filters.matchTypeFilter === "ORG" && !org) return false;
                    if (filters.matchTypeFilter === "TEAM" && org) return false;
                }

                if (filters.resultFilter !== "ANY") {
                    const map: Record<string, ScrimmageResult> = {
                        HOST_WIN: ScrimmageResult.HostWin,
                        OPPONENT_WIN: ScrimmageResult.OpponentWin,
                        DRAW: ScrimmageResult.Draw,
                    };
                    if (s.result !== map[filters.resultFilter]) return false;
                }

                if (filters.regionFilter !== "All" && s.region !== filters.regionFilter) return false;

                return true;
            })
            .sort((a, b) => b.createdAt - a.createdAt);
    }, [scrimmages, filters]);

    return (
        <main className="flex-1">
            <ArchivesPageHeader />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
                    <ArchivesFilters filters={filters} onChange={setFilters} />
                    <ArchivesList scrims={filtered} totalCount={scrimmages?.length ?? 0} />
                </div>
            </div>
        </main>
    );
}
