import { Collection, ObjectId, WithId } from "mongodb";
import {
    Organization, OrganizationMember,
    OrgRole, OrgMemberStatus,
    CreateOrganizationInput, UpdateOrganizationInput,
    AvailabilityBlockInput,
    ExceptionInput,
} from "../server";
import { merge } from "lodash";
import { convertNullsToUndefined } from "@/lib/utils";

// Members are embedded as sub-documents inside the Organization document.
// coreTeam stores profile ID strings (resolved to Profile[] via field resolver).
export type DBOrganizationMember = Omit<OrganizationMember, "organization" | "user" | "_id"> & {
    organization: string;   // org _id
    user: string;         // user _id
    _id: ObjectId;
}

export type DBOrganization = Omit<Organization, "owner" | "members" | "coreTeam" | "_id"> & {
    owner: string;                      // profile _id
    members: DBOrganizationMember[];    // embedded membership sub-documents
    coreTeam: string[];                 // profile _ids; max 6
    _id: ObjectId;
}

export class OrganizationDataSource {
    private collection;

    constructor(collection: Collection<DBOrganization>) {
        this.collection = collection;
    }

    // -------------------------------------------------------------------------
    // Reads
    // -------------------------------------------------------------------------

    async searchOrganizations(query: string, limit = 20): Promise<DBOrganization[]> {
        return this.collection
            .find({
                $or: [
                    { name: { $regex: query, $options: "i" } },
                    { slug: { $regex: query, $options: "i" } },
                ]
            })
            .limit(limit)
            .toArray();
    }

    getUserOrgInvitations(user_id: string) {
        return this.collection.find({
            $and: [
                { "members.user": { $in: [user_id] } },
                { "members.status": "INVITED" },
            ]
        }).toArray() as Promise<WithId<DBOrganization>[] | null>;
    }

    getOrganization(_id: ObjectId | string) {
        return this.collection.findOne({ _id: new ObjectId(_id) }) as Promise<WithId<DBOrganization> | null>;
    }

    getOrganizations() {
        return this.collection.find().toArray();
    }

    getOrganizationBySlug(slug: string) {
        return this.collection.findOne({ slug }) as Promise<WithId<DBOrganization> | null>;
    }

    async getOrganizationMembers(org_id: ObjectId | string): Promise<DBOrganizationMember[]> {
        const org = await this.getOrganization(org_id);
        return org?.members ?? [];
    }

    /** Find the org this profile currently belongs to (ACTIVE or INVITED). */
    getOrganizationByMember(user_id: string) {
        return this.collection.findOne({
            "members.user": user_id,
            "members.status": { $in: [OrgMemberStatus.Active, OrgMemberStatus.Invited] },
        }) as Promise<WithId<DBOrganization> | null>;
    }

    // -------------------------------------------------------------------------
    // Org lifecycle
    // -------------------------------------------------------------------------

    async createOrganization(owner_id: string, input: CreateOrganizationInput): Promise<DBOrganization> {
        const ownerMember: DBOrganizationMember = {
            _id: new ObjectId(),
            organization: "",   // filled below after we have the org _id
            user: owner_id,
            orgRole: OrgRole.Manager,
            isPlayer: true,
            status: OrgMemberStatus.Active,
            joinedAt: Date.now(),
        };

        const org: DBOrganization = {
            ...convertNullsToUndefined(input),
            _id: new ObjectId(),
            owner: owner_id,
            members: [],
            coreTeam: [],
            blocks: [],
            artificial: input.artificial ?? false,
            disbanded: false,
            region: "NA",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        ownerMember.organization = org._id.toString();
        org.members = [ownerMember];

        await this.collection.insertOne(org);
        return org;
    }

    async updateOrganization(org_id: ObjectId | string, input: UpdateOrganizationInput): Promise<DBOrganization | null> {
        const org = await this.getOrganization(org_id);
        if (!org) return null;
        merge(org, convertNullsToUndefined(input));
        org.updatedAt = Date.now();
        await this.collection.updateOne({ _id: new ObjectId(org_id) }, { $set: org });
        return org;
    }

    // Soft-disband: the org record is kept as a tombstone (flagged, not deleted) so its
    // history stays intact. Every member is flipped to INACTIVE on the org's own side —
    // not removed from the array — which is what actually frees them from the
    // one-org-per-profile constraint (getOrganizationByMember only matches ACTIVE/INVITED).
    async disbandOrganization(org_id: ObjectId | string): Promise<boolean> {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(org_id) },
            {
                $set: {
                    disbanded: true,
                    disbandedAt: Date.now(),
                    updatedAt: Date.now(),
                    "members.$[].status": OrgMemberStatus.Inactive,
                },
            }
        );
        return result.modifiedCount > 0;
    }

    async transferOwnership(org_id: ObjectId | string, new_owner_id: string): Promise<DBOrganization | null> {
        const org = await this.getOrganization(org_id);
        if (!org) return null;

        // Ensure new owner is an active member; promote them to MANAGER if not already
        const memberIdx = org.members.findIndex(m => m.user === new_owner_id);
        if (memberIdx === -1) throw new Error("New owner must be an existing org member");
        if (org.members[memberIdx].status !== OrgMemberStatus.Active)
            throw new Error("New owner must be an active member");

        org.members[memberIdx].orgRole = OrgRole.Manager;
        org.owner = new_owner_id;
        org.updatedAt = Date.now();
        await this.collection.updateOne({ _id: new ObjectId(org_id) }, { $set: org });
        return org;
    }

    // -------------------------------------------------------------------------
    // Membership
    // -------------------------------------------------------------------------

    async inviteMember(org_id: ObjectId | string, user_id: string, orgRole: OrgRole): Promise<DBOrganizationMember | null> {
        // Enforce one-org-per-profile constraint
        const existing = await this.getOrganizationByMember(user_id);
        if (existing) throw new Error("User is already a member of an organization");

        const org = await this.getOrganization(org_id);
        if (!org) return null;

        const member: DBOrganizationMember = {
            _id: new ObjectId(),
            organization: org_id.toString(),
            user: user_id,
            orgRole,
            isPlayer: true,
            status: OrgMemberStatus.Invited,
            joinedAt: Date.now(),
        };
        await this.collection.updateOne({ _id: new ObjectId(org_id) }, { $push: { members: member } as any });
        return member;
    }

    // Adds a member as ACTIVE immediately — used for manager-created placeholder
    // players, who have no one to accept an invite on their behalf.
    async addActiveMember(org_id: ObjectId | string, user_id: string, orgRole: OrgRole): Promise<DBOrganizationMember | null> {
        const existing = await this.getOrganizationByMember(user_id);
        if (existing) throw new Error("User is already a member of an organization");

        const org = await this.getOrganization(org_id);
        if (!org) return null;

        const member: DBOrganizationMember = {
            _id: new ObjectId(),
            organization: org_id.toString(),
            user: user_id,
            orgRole,
            isPlayer: true,
            status: OrgMemberStatus.Active,
            joinedAt: Date.now(),
        };
        await this.collection.updateOne({ _id: new ObjectId(org_id) }, { $push: { members: member } as any });
        return member;
    }

    async acceptOrgInvite(org_id: ObjectId | string, user_id: string): Promise<DBOrganizationMember | null> {
        const org = await this.getOrganization(org_id);
        if (!org) return null;

        const memberIdx = org.members.findIndex(m => m.user === user_id);
        if (memberIdx === -1) throw new Error("Invitation not found");

        org.members[memberIdx].status = OrgMemberStatus.Active;
        org.updatedAt = Date.now();
        await this.collection.updateOne({ _id: new ObjectId(org_id) }, { $set: org });
        return org.members[memberIdx];
    }

    async declineOrgInvite(org_id: ObjectId | string, user_id: string): Promise<boolean> {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(org_id) },
            { $pull: { members: { user: user_id, status: OrgMemberStatus.Invited } } }
        );
        return result.modifiedCount > 0;
    }

    async removeMember(org_id: ObjectId | string, user_id: string): Promise<boolean> {
        const org = await this.getOrganization(org_id);
        if (!org) return false;
        if (org.owner === user_id) throw new Error("Cannot remove the org owner; transfer ownership first");

        const result = await this.collection.updateOne(
            { _id: new ObjectId(org_id) },
            { $pull: { members: { user: user_id } } }
        );
        // Also remove from core team if present
        await this.collection.updateOne(
            { _id: new ObjectId(org_id) },
            { $pull: { coreTeam: user_id } as any }
        );
        return result.modifiedCount > 0;
    }

    // Repoints one member's user id within a single organization — used when an admin
    // merges a duplicate account into another (see UserDataSource.mergeUsers) and the
    // deleted account's organization is the one that carries over onto the surviving
    // user. Guards against ending up with two member rows for the same person if the
    // surviving user already had their own (unrelated) row in this org.
    //
    // If the reassigned user was the org's owner and the org is artificial (admin-created
    // with a placeholder owner — see adminCreateOrganizationAction), the org stops being
    // artificial: a real, signed-in user now owns it, so it should behave like any org
    // they created themselves — manageable, eligible as a host, etc.
    async reassignUser(org_id: ObjectId | string, oldUserId: string, newUserId: string): Promise<void> {
        const org = await this.getOrganization(org_id);
        if (!org) return;

        const update: Record<string, unknown> = { updatedAt: Date.now() };
        if (org.owner === oldUserId) {
            update.owner = newUserId;
            if (org.artificial) update.artificial = false;
        }
        if (org.coreTeam.includes(oldUserId)) {
            update.coreTeam = org.coreTeam.includes(newUserId)
                ? org.coreTeam.filter(id => id !== oldUserId)
                : org.coreTeam.map(id => (id === oldUserId ? newUserId : id));
        }
        await this.collection.updateOne({ _id: new ObjectId(org_id) }, { $set: update });

        if (org.members.some(m => m.user === newUserId)) {
            await this.collection.updateOne(
                { _id: new ObjectId(org_id) },
                { $pull: { members: { user: oldUserId } } }
            );
        } else {
            await this.collection.updateOne(
                { _id: new ObjectId(org_id) },
                { $set: { "members.$[elem].user": newUserId } },
                { arrayFilters: [{ "elem.user": oldUserId }] }
            );
        }
    }

    async updateMemberRole(org_id: ObjectId | string, user_id: string, orgRole: OrgRole): Promise<DBOrganizationMember | null> {
        const org = await this.getOrganization(org_id);
        if (!org) return null;

        const memberIdx = org.members.findIndex(m => m.user === user_id);
        if (memberIdx === -1) throw new Error("Member not found");

        org.members[memberIdx].orgRole = orgRole;
        org.updatedAt = Date.now();
        await this.collection.updateOne({ _id: new ObjectId(org_id) }, { $set: org });
        return org.members[memberIdx];
    }

    // Whether a member counts as active playing personnel — independent of
    // orgRole, so a manager can opt in or out of being a player too.
    async updateMemberIsPlayer(org_id: ObjectId | string, user_id: string, isPlayer: boolean): Promise<DBOrganizationMember | null> {
        const org = await this.getOrganization(org_id);
        if (!org) return null;

        const memberIdx = org.members.findIndex(m => m.user === user_id);
        if (memberIdx === -1) throw new Error("Member not found");

        org.members[memberIdx].isPlayer = isPlayer;
        org.updatedAt = Date.now();

        // A non-player can't remain on the core team roster.
        if (!isPlayer) org.coreTeam = org.coreTeam.filter(id => id !== user_id);

        await this.collection.updateOne(
            { _id: new ObjectId(org_id) },
            { $set: { members: org.members, coreTeam: org.coreTeam, updatedAt: org.updatedAt } }
        );
        return org.members[memberIdx];
    }

    // -------------------------------------------------------------------------
    // Core team
    // -------------------------------------------------------------------------

    async setCoreTeam(org_id: ObjectId | string, user_ids: string[]): Promise<DBOrganization | null> {
        if (user_ids.length > 6) throw new Error("Core team cannot exceed 6 players");
        const org = await this.getOrganization(org_id);
        if (!org) return null;

        org.coreTeam = user_ids;
        org.updatedAt = Date.now();
        await this.collection.updateOne({ _id: new ObjectId(org_id) }, { $set: { coreTeam: user_ids, updatedAt: org.updatedAt } });
        return org;
    }

    async addCorePlayer(org_id: ObjectId | string, user_id: string): Promise<DBOrganization | null> {
        const org = await this.getOrganization(org_id);
        if (!org) return null;
        if (org.coreTeam.length >= 6) throw new Error("Core team is already full (6/6)");
        if (org.coreTeam.includes(user_id)) throw new Error("Player is already on the core team");

        org.coreTeam.push(user_id);
        org.updatedAt = Date.now();
        await this.collection.updateOne({ _id: new ObjectId(org_id) }, { $set: { coreTeam: org.coreTeam, updatedAt: org.updatedAt } });
        return org;
    }

    async removeCorePlayer(org_id: ObjectId | string, user_id: string): Promise<DBOrganization | null> {
        const org = await this.getOrganization(org_id);
        if (!org) return null;

        org.coreTeam = org.coreTeam.filter(id => id !== user_id);
        org.updatedAt = Date.now();
        await this.collection.updateOne({ _id: new ObjectId(org_id) }, { $set: { coreTeam: org.coreTeam, updatedAt: org.updatedAt } });
        return org;
    }

    async addAvailabilityBlock(org_id: ObjectId | string, block: AvailabilityBlockInput) {
        const _id = new ObjectId(org_id);
        return await this.collection.findOneAndUpdate({ _id }, { $set: { blocks: [block], updatedAt: Date.now() } });
    }

    async updateAvailabilityBlocks(org_id: ObjectId | string, blocks: AvailabilityBlockInput[]) {
        return await this.collection.findOneAndUpdate({ _id: new ObjectId(org_id) }, { $set: { blocks, updatedAt: Date.now() } });
    }

    async addException(org_id: ObjectId | string, input: ExceptionInput) {
        return await this.collection.findOneAndUpdate({ _id: new ObjectId(org_id), "blocks.day": input.day }, { $set: { "blocks.$.exception": { date: input.date, timesheets: input.timesheets }, updatedAt: Date.now() } });
    }

    async clearExceptions(org_id: ObjectId | string) {
        return await this.collection.findOneAndUpdate({ _id: new ObjectId(org_id) }, {
            $pull: {
                blocks: {
                    exception: { date: { $lt: Date.now() } }
                }
            }, $set: { updatedAt: Date.now() }
        });
    }
}
