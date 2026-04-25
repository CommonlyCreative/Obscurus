"use server";

import { db } from "@/lib/database/mongo";
import { ObjectId } from "mongodb";

export type OrgRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

type DBOrgRequest = {
    _id: ObjectId;
    user: string;
    name: string;
    slug: string;
    reason?: string;
    status: OrgRequestStatus;
    reviewNote?: string;
    createdAt: number;
    updatedAt: number;
};

export type OrgRequestRecord = {
    _id: string;
    name: string;
    slug: string;
    reason: string | null;
    status: OrgRequestStatus;
    reviewNote: string | null;
    createdAt: number;
    updatedAt: number;
};

function collection() {
    return db.collection<DBOrgRequest>("organization_requests");
}

function serialize(req: DBOrgRequest): OrgRequestRecord {
    return {
        _id: req._id.toString(),
        name: req.name,
        slug: req.slug,
        reason: req.reason ?? null,
        status: req.status,
        reviewNote: req.reviewNote ?? null,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
    };
}

export async function getMyOrgRequestAction(userId: string): Promise<OrgRequestRecord | null> {
    const req = await collection().findOne({ user: userId }, { sort: { createdAt: -1 } });
    return req ? serialize(req) : null;
}

export async function submitOrgRequestAction(
    userId: string,
    data: { name: string; slug: string; reason?: string },
): Promise<OrgRequestRecord> {
    const existing = await collection().findOne({ user: userId, status: "PENDING" });
    if (existing) throw new Error("You already have a pending organization request.");

    const request: DBOrgRequest = {
        _id: new ObjectId(),
        user: userId,
        name: data.name.trim(),
        slug: data.slug.trim().toUpperCase(),
        ...(data.reason?.trim() ? { reason: data.reason.trim() } : {}),
        status: "PENDING",
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    await collection().insertOne(request);
    return serialize(request);
}

export async function cancelOrgRequestAction(requestId: string, userId: string): Promise<boolean> {
    const result = await collection().deleteOne({
        _id: new ObjectId(requestId),
        user: userId,
        status: "PENDING",
    });
    return result.deletedCount > 0;
}
