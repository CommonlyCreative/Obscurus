import { cache } from "react";
import { getRankByMMR } from "./deadlock";
import ranks from "@/lib/types/deadlock/ranks.json";

export const getRankImage = cache((mmr: number) => {
    const rank = getRankByMMR(mmr);
    const statRank = ranks.find(r => r.tier === rank?.rank.ranking);

    if (!statRank) return;

    switch (rank?.division) {
        case 1: return statRank.images.large_subrank1_webp;
        case 2: return statRank.images.large_subrank2_webp;
        case 3: return statRank.images.large_subrank3_webp;
        case 4: return statRank.images.large_subrank4_webp;
        case 5: return statRank.images.large_subrank5_webp;
        case 6: return statRank.images.large_subrank6_webp;
        default: return statRank.images.large_webp;
    }
});
