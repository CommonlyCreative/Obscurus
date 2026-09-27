import { CreateScrimPageQuery } from "@/app/api/graphql/types/graphql";
import { Rank, REGIONS } from "@/lib/deadlock";
import { ArrayElement } from "@/lib/utils";

export type OrgMember = ArrayElement<NonNullable<NonNullable<CreateScrimPageQuery["getUser"]>["organization"]>["members"]>

// A single occupied roster slot — either a pick from the org's own roster, or an
// "outside" pick (free agent / player from another org) added as a substitute.
// Once added, both are treated identically: just a player in the 6-person lineup.
export interface RosterPick {
  _id: string;
  name: string;
  stats?: { rank: { name: string }; division: number } | null;
  external?: boolean;
}

export type Region = typeof REGIONS[number];

export interface Scrim {
  id: number;
  team: string;
  players: { name: string; role: string }[];
  rank: Rank;
  region: typeof REGIONS[number];
  note: string;
  postedAgo: string;
  bestOf: number;
}
