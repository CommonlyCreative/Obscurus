import { ArchiveListQuery } from "@/app/api/graphql/types/graphql";
import { ArrayElement } from "@/lib/utils";
import { Rank } from "@/lib/deadlock";

export type ArchivedScrim = ArrayElement<ArchiveListQuery["getScrimmages"]>;

export type MatchTypeFilter = "ANY" | "ORG" | "TEAM";
export type ResultFilter = "ANY" | "HOST_WIN" | "OPPONENT_WIN" | "DRAW";
export type Region = "NA" | "EU";

export interface ArchiveFiltersState {
  playerSearch: string;
  orgSearch: string;
  rankFilter: Rank | "Any";
  bestOfFilter: string;
  matchTypeFilter: MatchTypeFilter;
  resultFilter: ResultFilter;
  regionFilter: Region | "All";
}

export const DEFAULT_ARCHIVE_FILTERS: ArchiveFiltersState = {
  playerSearch: "",
  orgSearch: "",
  rankFilter: "Any",
  bestOfFilter: "ANY",
  matchTypeFilter: "ANY",
  resultFilter: "ANY",
  regionFilter: "All",
};

export function isOrgScrim(scrim: Pick<ArchivedScrim, "hostOrg" | "opponentOrg">) {
  return !!scrim.hostOrg && !!scrim.opponentOrg;
}

export function getScrimRankAverage(scrim: Pick<ArchivedScrim, "hostTeam" | "opponentTeam">) {
  const members = [
    ...scrim.hostTeam.members,
    ...(scrim.opponentTeam?.members ?? []),
  ];
  const withStats = members.filter((m) => m.stats);
  if (withStats.length === 0) return null;
  const total = withStats.reduce((acc, m) => acc + (m.stats?.mmr ?? 0), 0);
  return total / withStats.length;
}
