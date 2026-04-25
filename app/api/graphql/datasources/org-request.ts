import { Collection, ObjectId } from "mongodb";

export enum OrgRequestStatus {
    Pending  = "PENDING",
    Approved = "APPROVED",
    Rejected = "REJECTED",
}

export type DBOrgRequest = {
    _id: ObjectId;
    user: string;           // user _id
    name: string;
    slug: string;           // 5-char max, lowercase
    reason?: string;
    status: OrgRequestStatus;
    reviewNote?: string;
    createdAt: number;
    updatedAt: number;
};

export class OrgRequestDataSource {
    private collection: Collection<DBOrgRequest>;

    constructor(collection: Collection<DBOrgRequest>) {
        this.collection = collection;
    }

    getRequest(request_id: string) {
        return this.collection.findOne({ _id: new ObjectId(request_id) });
    }

    getUserRequest(user_id: string) {
        return this.collection.findOne(
            { user: user_id },
            { sort: { createdAt: -1 } },
        );
    }

    getRequests(status?: OrgRequestStatus) {
        const filter = status ? { status } : {};
        return this.collection.find(filter).sort({ createdAt: -1 }).toArray();
    }

    async submitRequest(
        user_id: string,
        input: { name: string; slug: string; reason?: string | null },
    ): Promise<DBOrgRequest> {
        const existing = await this.collection.findOne({
            user: user_id,
            status: OrgRequestStatus.Pending,
        });
        if (existing) throw new Error("You already have a pending organization request");

        const request: DBOrgRequest = {
            _id: new ObjectId(),
            user: user_id,
            name: input.name,
            slug: input.slug.toLowerCase(),
            ...(input.reason ? { reason: input.reason } : {}),
            status: OrgRequestStatus.Pending,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        await this.collection.insertOne(request);
        return request;
    }

    async cancelRequest(request_id: string, user_id: string): Promise<boolean> {
        const result = await this.collection.deleteOne({
            _id: new ObjectId(request_id),
            user: user_id,
            status: OrgRequestStatus.Pending,
        });
        return result.deletedCount > 0;
    }

    async reviewRequest(
        request_id: string,
        status: OrgRequestStatus,
        reviewNote?: string | null,
    ): Promise<DBOrgRequest | null> {
        return this.collection.findOneAndUpdate(
            { _id: new ObjectId(request_id) },
            { $set: { status, ...(reviewNote ? { reviewNote } : {}), updatedAt: Date.now() } },
            { returnDocument: "after" },
        );
    }
}
