import { Rank } from "@/lib/deadlock";

export type Region = "NA" | "EU";

export interface OrgMember {
  _id: string;
  name: string;
  mmr: number;
}

export interface Scrim {
  id: number;
  team: string;
  players: { name: string; role: string }[];
  rank: Rank;
  region: Region;
  note: string;
  postedAgo: string;
  bestOf: number;
}
