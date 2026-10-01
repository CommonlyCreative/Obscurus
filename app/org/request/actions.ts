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

export type OrgRequestBlockingOrg = {
    _id: string;
    name: string;
    slug: string;
    isManager: boolean;
};

type DBOrgForMembership = {
    _id: ObjectId;
    name: string;
    slug: string;
    members: { user: string; status: string; orgRole: string }[];
};

function collection() {
    return db.collection<DBOrgRequest>("organization_requests");
}

// A user can only belong to one active organization at a time — if they're already in
// one, they need to disband (or have their manager disband) it before requesting a new
// one, rather than ending up affiliated with two.
async function findActiveOrgForUser(userId: string): Promise<OrgRequestBlockingOrg | null> {
    const org = await db.collection<DBOrgForMembership>("organizations").findOne({
        "members.user": userId,
        "members.status": "ACTIVE",
    });
    if (!org) return null;

    const membership = org.members.find((m) => m.user === userId && m.status === "ACTIVE");
    return {
        _id: org._id.toString(),
        name: org.name,
        slug: org.slug,
        isManager: membership?.orgRole === "MANAGER",
    };
}

export async function getMyOrganizationAction(userId: string): Promise<OrgRequestBlockingOrg | null> {
    return findActiveOrgForUser(userId);
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
    const currentOrg = await findActiveOrgForUser(userId);
    if (currentOrg) throw new Error("You're already part of an organization. Disband it before requesting a new one.");

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
