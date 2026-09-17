import { ArrayElement } from "@/lib/utils";
import { OrgManagePageQuery, OrgRole } from "@/app/api/graphql/types/graphql";

export type OrgUserSearch = {
    organization: NonNullable<ArrayElement<NonNullable<OrgManagePageQuery["getUsers"]>>["organization"]> | "No organization",
    items: OrgManagePageQuery["getUsers"]
}[];

export interface OrgMemberEntry {
    _id: string;
    name: string;
    orgRole: OrgRole;
    isPlayer: boolean;
}

export interface ManagedOrg {
    _id: string;
    name: string;
    slug: string;
    ownerId: string;
    members: OrgMemberEntry[];
    coreTeamIds: string[];
}
