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

const SCRIMS: Scrim[] = [
    {
        id: 1,
        team: "Void Casters",
        players: [
            { name: "VoidWalker", role: "Carry" },
            { name: "EchoSurge", role: "Support" },
            { name: "PhaseRift", role: "Flex" },
            { name: "NullFrame", role: "Tank" },
            { name: "ArcStrike", role: "Support" },
            { name: "GlitchMode", role: "Carry" },
        ],
        rank: Rank.ARCHANIST, region: "NA",
        note: "Looking for scrim partners this weekend. Any rank welcome, we play for fun and improvement.",
        postedAgo: "8m ago", bestOf: 3,
    },
    {
        id: 2,
        team: "Iron Circuit",
        players: [
            { name: "IronForge", role: "Tank" },
            { name: "WireFrame", role: "Carry" },
            { name: "CircuitX", role: "Support" },
            { name: "VoltPulse", role: "Flex" },
            { name: "CoreDrive", role: "Tank" },
            { name: "DataBurn", role: "Carry" },
        ],
        rank: Rank.EMISSARY, region: "EU",
        note: "Serious team looking for even matches. Prefer Diamond–Eternus opponents. Best of 3.",
        postedAgo: "21m ago", bestOf: 3,
    },
    {
        id: 3,
        team: "Neon Remnants",
        players: [
            { name: "NeonHex", role: "Flex" },
            { name: "LumaShard", role: "Support" },
            { name: "RadiantFX", role: "Carry" },
            { name: "GlowTrace", role: "Tank" },
            { name: "NeonDrift", role: "Support" },
            { name: "PhotonArc", role: "Carry" },
        ],
        rank: Rank.ALCHEMIST, region: "NA",
        note: "Casual-to-serious team. Best of 3 preferred. Send a DM before joining.",
        postedAgo: "45m ago", bestOf: 3,
    },
    {
        id: 4,
        team: "Null Directive",
        players: [
            { name: "NullByte", role: "Carry" },
            { name: "VoidCall", role: "Tank" },
            { name: "SilentEXE", role: "Support" },
            { name: "RootKit", role: "Flex" },
            { name: "ZeroTrace", role: "Carry" },
            { name: "HexBreach", role: "Support" },
        ],
        rank: Rank.ETERNUS, region: "NA",
        note: "Top-tier team. Looking for practice vs Eternus only. Competitive atmosphere.",
        postedAgo: "1h ago", bestOf: 5,
    },
    {
        id: 5,
        team: "Paradox Squad",
        players: [
            { name: "ParaShift", role: "Tank" },
            { name: "DoxBreaker", role: "Carry" },
            { name: "FluxCore", role: "Support" },
            { name: "BendCurve", role: "Flex" },
            { name: "WarpSync", role: "Carry" },
            { name: "TwistPulse", role: "Support" },
        ],
        rank: Rank.ALCHEMIST, region: "EU",
        note: "Weekend warriors. Open to all skill levels, we focus on team play and communication.",
        postedAgo: "2h ago", bestOf: 1,
    },
    {
        id: 6,
        team: "Hex Collective",
        players: [
            { name: "HexMaster", role: "Carry" },
            { name: "SpellBind", role: "Support" },
            { name: "RuneCast", role: "Flex" },
            { name: "CurseEdge", role: "Tank" },
            { name: "GrimHex", role: "Carry" },
            { name: "VoidChant", role: "Support" },
        ],
        rank: Rank.SEEKER, region: "EU",
        note: "Newer team improving fast. Looking for Gold or below opponents.",
        postedAgo: "3h ago", bestOf: 1,
    },
    {
        id: 7,
        team: "Phantom Syndicate",
        players: [
            { name: "PhantomX", role: "Carry" },
            { name: "ShadowNet", role: "Tank" },
            { name: "GhostLine", role: "Support" },
            { name: "SpecterOps", role: "Flex" },
            { name: "WrenchFX", role: "Support" },
            { name: "BoltPhase", role: "Carry" },
        ],
        rank: Rank.EMISSARY, region: "EU",
        note: "Competitive SA team. Only APAC/SA preferred due to ping. All serious scrims.",
        postedAgo: "4h ago", bestOf: 3,
    },
    {
        id: 8,
        team: "Storm Protocol",
        players: [
            { name: "StormFront", role: "Carry" },
            { name: "ThunderCap", role: "Tank" },
            { name: "LightningX", role: "Support" },
            { name: "CycloneX", role: "Flex" },
            { name: "GaleForce", role: "Carry" },
            { name: "TempestRun", role: "Support" },
        ],
        rank: Rank.ARCHANIST, region: "NA",
        note: "Diamond team looking for weekly scrim partners. Structured play, recorded sessions.",
        postedAgo: "5h ago", bestOf: 3,
    },
];

export default function ScrimsPage() {
    const [rankFilter, setRankFilter] = useState<Rank | "Any">("Any");
    const [regionFilter, setRegionFilter] = useState<Region | "All">("All");
    const [search, setSearch] = useState("");
    const [scrimmages, setScrimmages] = useState<ScrimListQuery["getScrimmages"] | undefined>(undefined)

    const filtered = (scrimmages ?? []).filter(s => s.status === ScrimmageStatus.Open).filter((s) => {
        const name = s.hostTeam.name ?? s.host.name +"'s Team";
        const mmrAvg = s.hostTeam.members.reduce((acc, user) => {
            acc += user.mmr;
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
