import { CreateScrimPageQuery } from "@/app/api/graphql/types/graphql";
import { Rank } from "@/lib/deadlock";
import { ArrayElement } from "@/lib/utils";

export type Region = "NA" | "EU";

export type OrgMember = ArrayElement<NonNullable<NonNullable<CreateScrimPageQuery["getUser"]>["organization"]>["members"]>

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
