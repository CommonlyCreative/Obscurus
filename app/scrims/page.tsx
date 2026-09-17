"use client";

import { useEffect, useState } from "react";
import { ScrimsPageHeader } from "@/components/scrims/ScrimsPageHeader";
import { ScrimsFilters } from "@/components/scrims/ScrimsFilters";
import { ScrimsList } from "@/components/scrims/ScrimsList";
import type { Region, Scrim } from "@/components/scrims/types";
import { getRankByMMR, Rank } from "@/lib/deadlock";
import { graphql } from "../api/graphql/types";
import { grafbase } from "@/lib/database/grafbase";
import { Scrimmage } from "../api/graphql/server";
import { ScrimmageStatus, type ScrimListQuery } from "../api/graphql/types/graphql";
import { getScrimmageList } from "./actions";

export default function ScrimsPage() {
    const [rankFilter, setRankFilter] = useState<Rank | "Any">("Any");
    const [regionFilter, setRegionFilter] = useState<Region | "All">("All");
    const [search, setSearch] = useState("");
    const [scrimmages, setScrimmages] = useState<ScrimListQuery["getScrimmages"] | undefined>(undefined)

    const filtered = (scrimmages ?? []).filter(s => s.status === ScrimmageStatus.Open).filter((s) => {
        const name = s.hostTeam.name ?? s.host.name +"'s Team";
        const mmrAvg = s.hostTeam.members.reduce((acc, user) => {
            acc += user.stats?.mmr ?? 0;
            return acc;
        }, 0) / s.hostTeam.members.length;
        const rank = getRankByMMR(mmrAvg)
        const matchesRank = rankFilter === "Any" || rank?.rank === rankFilter;
        const matchesRegion = regionFilter === "All" || s.region === regionFilter;
        const matchesSearch = !search
            || name.toLowerCase().includes(search.toLowerCase())
            || s.note?.toLowerCase().includes(search.toLowerCase());
        return matchesRank && matchesRegion && matchesSearch;
    });

    useEffect(() => {
        const loadScrimList = async () => {
            const scrimmages = await getScrimmageList()
            setScrimmages(scrimmages)
        }
        loadScrimList();
    }, []);

    return (
        <main className="flex-1">
            <ScrimsPageHeader totalOpen={scrimmages?.filter(scrim => scrim.status === ScrimmageStatus.Open).length ?? 0} />
            <ScrimsFilters
                search={search} setSearch={setSearch}
                rankFilter={rankFilter} setRankFilter={setRankFilter}
                regionFilter={regionFilter} setRegionFilter={setRegionFilter}
            />
            <ScrimsList
                scrims={filtered}
                rankFilter={rankFilter}
                regionFilter={regionFilter}
            />
        </main>
    );
}
