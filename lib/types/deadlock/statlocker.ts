export interface StatlockerHero {
    heroId: number;
    matches: number;
    winRate: number;
}

export interface StatlockerPlaystyleScores {
    "Damage Dealer": number;
    Tank: number;
    Farming: number;
    Support: number;
    "Early Impact": number;
    Pusher: number;
}

export interface StatlockerBatchProfile {
    accountId: number;
    name: string;
    avatarUrl: string;
    performanceRankMessage: string;
    lastUpdated: string;
    calibrationMatches: number;
    twitchUsername: string | null;
    youtubeChannelUrl: string | null;
    region: string | null;
    calibrationMatchId: number;
    calibrationResetMatchId: number | null;
    fontId: string;
    glowStyleId: string;
    glowColorId: string;
    outlineId: string;
    animationId: string;
    avatarShapeId: string;
    avatarEffectId: string;
    avatarEffectColorId: string;
    titleId: string;
    updatedWithinLast1Minutes: boolean;
    localisedLastUpdated: string;
    ppScore: number;
    selectedWidgets: unknown | null;
    estimatedRankNumber: number;
}

// One ban/pick action from a Statlocker public draft export (see
// lib/types/deadlock/example-draft-export.json for a real sample). "team1"/"team2" match
// whichever teams were passed as team1/team2 when the draft was created — host is always
// team1, opponent is always team2 (see ensureStatlockerDraft in app/api/graphql/resolvers.ts).
export interface StatlockerDraftAction {
    id: number;
    team: "team1" | "team2";
    type: "ban" | "pick";
    heroId: number;
    hero: string;
    wasRandom: boolean;
}

export type StatlockerDraftExport = StatlockerDraftAction[];

export interface StatlockerProfile {
    accountId: number;
    winRate: number;
    totalMatches: number;
    averageMatchRankNumber: number;
    averageMatchMvp: number;
    mostCommonMvpRank: number;
    avgMatchDurationMin: number;
    avgKills: number;
    avgDeaths: number;
    avgAssists: number;
    kdRatio: number;
    kdaRatio: number;
    accuracyPercentage: number;
    headshotAccuracyPercentage: number;
    killParticipationPercentage: number;
    damagePerMinute: number;
    damagePerLife: number;
    damageTakenPerMinute: number;
    avgLastHits: number;
    avgDenies: number;
    avgNetWorth: number;
    soulsPerMinute: number;
    avgTowerDamage: number;
    towerDamagePerMinute: number;
    playstyleScoresJson: string;
    rawPlaystyleScoresJson: string;
    mostPlayedHeroesJson: string;
    lastUpdated: string;
    mostPlayedHeroes: StatlockerHero[];
    playstyleScores: StatlockerPlaystyleScores;
    rawPlaystyleScores: StatlockerPlaystyleScores;
}
