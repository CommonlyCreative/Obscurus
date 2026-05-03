"use server";

import { db } from "@/lib/database/mongo";
import { auth } from "@/lib/database/auth";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import { Notification, Role } from "@/app/api/graphql/server";
import { revalidatePath } from "next/cache";
import { grafbase } from "@/lib/database/grafbase";
import { graphql } from "@/app/api/graphql/types";
import { NotificationType, OrgRequestStatus, SendNotificationMutation } from "@/app/api/graphql/types/graphql";
import { SendNotificationM } from "@/lib/shared-graphs";
import { getGoogleClient } from "@/lib/google";
import { google } from "googleapis";

// Duration per best-of type (mirrors CreateScrimForm ENDTIME_CONVERSION)
const BESTOF_DURATION_MS: Record<string, number> = {
    ONE:       1 * 60 * 60 * 1000,
    THREE:     2 * 60 * 60 * 1000,
    FIVE:      4 * 60 * 60 * 1000,
    UNLIMITED: 4 * 60 * 60 * 1000,
};

// ─── GraphQL mutations ─────────────────────────────────────────────────────

const ReviewOrgRequestMutation = graphql(`
  mutation AdminReviewOrgRequest($request_id: String!, $status: OrgRequestStatus!, $reviewNote: String) {
    reviewOrgRequest(request_id: $request_id, status: $status, reviewNote: $reviewNote) {
      _id
      user {
        _id
      }
      name
      slug
    }
  }
`);

const CreateOrganizationMutation = graphql(`
  mutation AdminCreateOrganization($owner_id: String!, $input: CreateOrganizationInput!) {
    createOrganization(owner_id: $owner_id, input: $input) {
      _id
      name
      slug
    }
  }
`);

// ─── DB types ──────────────────────────────────────────────────────────────

type DBOrgRequest = {
    _id: ObjectId;
    user: string;
    name: string;
    slug: string;
    reason?: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    reviewNote?: string;
    createdAt: number;
    updatedAt: number;
};

type DBDispute = {
    _id: ObjectId;
    scrimmageId: string;
    creatorId: string;
    creatorName?: string;
    reason: string;
    status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";
    resolution?: string;
    resolvedById?: string;
    createdAt: number;
    updatedAt: number;
};

type DBFeedback = {
    _id: ObjectId;
    userId?: string;
    userName?: string;
    type: "BUG" | "SUGGESTION" | "CRITICISM" | "OTHER";
    title: string;
    body: string;
    status: "OPEN" | "REVIEWED" | "CLOSED";
    adminNote?: string;
    createdAt: number;
    updatedAt: number;
};

// ─── Serialized row types ──────────────────────────────────────────────────

export type OrgRequestRow = {
    _id: string;
    userId: string;
    userName: string;
    userEmail: string;
    name: string;
    slug: string;
    reason: string | null;
    status: "PENDING" | "APPROVED" | "REJECTED";
    reviewNote: string | null;
    createdAt: number;
};

export type UserRow = {
    _id: string;
    name: string;
    email: string;
    role: string;
    banned: boolean;
    banReason: string | null;
    createdAt: number;
};

export type ScrimmageRow = {
    _id: string;
    status: string;
    wagerAmount: number;
    region: string;
    bestOf: string;
    isPrivate: boolean;
    scheduledAt: number | null;
    hostId: string;
    hostName: string;
    hostOrgName: string | null;
    opponentOrgName: string | null;
    createdAt: number;
};

export type ScrimDetailRow = {
    _id: string;
    status: string;
    region: string;
    bestOf: string;
    isPrivate: boolean;
    wagerAmount: number;
    note: string | null;
    partyCode: string | null;
    readyHost: boolean;
    readyOpponent: boolean;
    result: string | null;
    scheduledAt: number | null;
    hostId: string;
    hostName: string;
    hostOrgId: string | null;
    hostOrgName: string | null;
    hostTeamName: string | null;
    hostTeamLeaderId: string | null;
    hostTeamLeaderName: string | null;
    hostTeamMembers: { _id: string; name: string }[];
    opponentOrgId: string | null;
    opponentOrgName: string | null;
    opponentTeamName: string | null;
    opponentTeamLeaderId: string | null;
    opponentTeamLeaderName: string | null;
    opponentTeamMembers: { _id: string; name: string }[];
    invitations: {
        userId: string;
        userName: string;
        side: string;
        status: string;
        type: string;
    }[];
    matches: {
        number: number;
        match_id: string | null;
        result: string | null;
        startedAt: number;
        concludedAt: number | null;
    }[];
    createdAt: number;
    updatedAt: number;
};

export type DisputeRow = {
    _id: string;
    scrimmageId: string;
    creatorId: string;
    creatorName: string | null;
    reason: string;
    status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";
    resolution: string | null;
    createdAt: number;
};

export type FeedbackRow = {
    _id: string;
    userId: string | null;
    userName: string | null;
    type: "BUG" | "SUGGESTION" | "CRITICISM" | "OTHER";
    title: string;
    body: string;
    status: "OPEN" | "REVIEWED" | "CLOSED";
    adminNote: string | null;
    createdAt: number;
};

export type AnalyticsData = {
    totalUsers: number;
    totalScrimmages: number;
    activeScrimmages: number;
    totalOrganizations: number;
    pendingOrgRequests: number;
    openDisputes: number;
    openFeedback: number;
};

// ─── Auth helper ──────────────────────────────────────────────────────────

type AllowedRole = Role.Admin | Role.Moderator | Role.Support;
const ALL_ADMIN_ROLES: AllowedRole[] = [Role.Admin, Role.Moderator, Role.Support];

async function requireRole(allowed: AllowedRole[] = ALL_ADMIN_ROLES) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Not authenticated");
    const role = (session.user as { role: string }).role as AllowedRole;
    if (!allowed.includes(role)) throw new Error("Unauthorized");
    return { session, role };
}

// ─── Analytics ────────────────────────────────────────────────────────────

export async function getAnalyticsAction(): Promise<AnalyticsData> {
    await requireRole([Role.Admin, Role.Moderator]);
    const [
        totalUsers,
        totalScrimmages,
        activeScrimmages,
        totalOrganizations,
        pendingOrgRequests,
        openDisputes,
        openFeedback,
    ] = await Promise.all([
        db.collection("user").countDocuments(),
        db.collection("scrimmages").countDocuments(),
        db.collection("scrimmages").countDocuments({
            status: { $in: ["OPEN", "PENDING", "SCHEDULING", "SCHEDULED", "ACTIVE"] },
        }),
        db.collection("organizations").countDocuments(),
        db.collection("organization_requests").countDocuments({ status: "PENDING" }),
        db.collection("disputes").countDocuments({ status: "OPEN" }),
        db.collection("feedback").countDocuments({ status: "OPEN" }),
    ]);
    return {
        totalUsers,
        totalScrimmages,
        activeScrimmages,
        totalOrganizations,
        pendingOrgRequests,
        openDisputes,
        openFeedback,
    };
}

// ─── Org Requests ─────────────────────────────────────────────────────────

export async function getOrgRequestsAction(
    status?: "PENDING" | "APPROVED" | "REJECTED",
): Promise<OrgRequestRow[]> {
    await requireRole([Role.Admin, Role.Moderator]);
    const filter = status ? { status } : {};
    const docs = await db
        .collection<DBOrgRequest>("organization_requests")
        .find(filter)
        .sort({ createdAt: -1 })
        .toArray();

    const userIds = [...new Set(docs.map((d) => d.user))].filter((id) => ObjectId.isValid(id));
    const userDocs = userIds.length > 0
        ? await db.collection("user").find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } }).toArray()
        : [];
    const userMap = new Map(userDocs.map((u: any) => [u._id.toString(), u]));

    return docs.map((d) => {
        const u = userMap.get(d.user) as any;
        return {
            _id: d._id.toString(),
            userId: d.user,
            userName: u?.name ?? "Unknown",
            userEmail: u?.email ?? "",
            name: d.name,
            slug: d.slug,
            reason: d.reason ?? null,
            status: d.status,
            reviewNote: d.reviewNote ?? null,
            createdAt: d.createdAt,
        };
    });
}

export async function updateOrgRequestDataAction(
    requestId: string,
    data: { name?: string; slug?: string; reason?: string },
): Promise<void> {
    await requireRole([Role.Admin]);
    const update: Record<string, unknown> = { updatedAt: Date.now() };
    if (data.name !== undefined) update.name = data.name.trim();
    if (data.slug !== undefined) update.slug = data.slug.trim().toLowerCase();
    if (data.reason !== undefined) update.reason = data.reason.trim();
    await db.collection("organization_requests").updateOne(
        { _id: new ObjectId(requestId) },
        { $set: update },
    );
    revalidatePath("/admin/org-requests");
}

export async function reviewOrgRequestAdminAction(
    requestId: string,
    status: "APPROVED" | "REJECTED",
    reviewNote?: string,
): Promise<void> {
    await requireRole([Role.Admin, Role.Moderator]);

    const result = await grafbase.request(ReviewOrgRequestMutation, {
        request_id: requestId,
        status: status as OrgRequestStatus,
        reviewNote,
    });

    if (status === "APPROVED" && result.reviewOrgRequest) {
        const req = result.reviewOrgRequest;
        await grafbase.request(CreateOrganizationMutation, {
            owner_id: req.user._id,
            input: { name: req.name, slug: req.slug },
        });
    }

    revalidatePath("/admin/org-requests");
}

// ─── Users ────────────────────────────────────────────────────────────────

export async function getUsersAction(search?: string): Promise<UserRow[]> {
    await requireRole([Role.Admin]);
    const filter = search
        ? {
              $or: [
                  { name: { $regex: search, $options: "i" } },
                  { email: { $regex: search, $options: "i" } },
              ],
          }
        : {};
    const docs = await db.collection("user").find(filter).sort({ createdAt: -1 }).limit(50).toArray();
    return docs.map((d: any) => ({
        _id: d._id.toString(),
        name: d.name ?? "",
        email: d.email ?? "",
        role: d.role ?? "MEMBER",
        banned: d.banned ?? false,
        banReason: d.banReason ?? null,
        createdAt: d.createdAt ?? 0,
    }));
}

export async function banUserAction(userId: string, reason?: string): Promise<void> {
    await requireRole([Role.Admin]);
    await db.collection("user").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { banned: true, ...(reason ? { banReason: reason } : {}), updatedAt: Date.now() } },
    );
    revalidatePath("/admin/users");
}

export async function unbanUserAction(userId: string): Promise<void> {
    await requireRole([Role.Admin]);
    await db
        .collection("user")
        .updateOne(
            { _id: new ObjectId(userId) },
            { $set: { banned: false, banReason: null, updatedAt: Date.now() } },
        );
    revalidatePath("/admin/users");
}

// ─── Scrimmages ───────────────────────────────────────────────────────────

export async function getScrimmagesForAdminAction(statusFilter?: string): Promise<ScrimmageRow[]> {
    await requireRole();
    const filter = statusFilter ? { status: statusFilter } : {};
    const docs = await db
        .collection("scrimmages")
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();

    const hostIds = [...new Set(
        docs.map((d: any) => d.host).filter((id: any): id is string => typeof id === "string" && ObjectId.isValid(id))
    )];
    const userDocs = hostIds.length > 0
        ? await db.collection("user").find({ _id: { $in: hostIds.map((id) => new ObjectId(id)) } }).toArray()
        : [];
    const userMap = new Map<string, string>(userDocs.map((u: any) => [u._id.toString(), u.name ?? "Unknown"]));

    const rawOrgIds = docs.flatMap((d: any) => [d.hostOrg, d.opponentOrg])
        .filter((id: any): id is string => typeof id === "string" && ObjectId.isValid(id));
    const uniqueOrgIds = [...new Set(rawOrgIds)];
    const orgDocs = uniqueOrgIds.length > 0
        ? await db.collection("organizations").find({ _id: { $in: uniqueOrgIds.map((id) => new ObjectId(id)) } }).toArray()
        : [];
    const orgMap = new Map<string, string>(orgDocs.map((o: any) => [o._id.toString(), o.name ?? "Unknown"]));

    return docs.map((d: any) => ({
        _id: d._id.toString(),
        status: d.status ?? "",
        wagerAmount: d.wagerAmount ?? 0,
        region: d.region ?? "",
        bestOf: d.bestOf ?? "",
        isPrivate: d.isPrivate ?? false,
        scheduledAt: d.scheduledAt ?? null,
        hostId: d.host ?? "",
        hostName: userMap.get(d.host) ?? "Unknown",
        hostOrgName: d.hostOrg ? (orgMap.get(d.hostOrg) ?? null) : null,
        opponentOrgName: d.opponentOrg ? (orgMap.get(d.opponentOrg) ?? null) : null,
        createdAt: d.createdAt ?? 0,
    }));
}

export async function getScrimDetailAction(scrimmageId: string): Promise<ScrimDetailRow | null> {
    await requireRole();
    if (!ObjectId.isValid(scrimmageId)) return null;
    const doc = await db.collection("scrimmages").findOne({ _id: new ObjectId(scrimmageId) });
    if (!doc) return null;
    const d = doc as any;

    const rawUserIds = [
        d.host,
        d.hostTeam?.leader,
        ...(d.hostTeam?.members ?? []),
        d.opponentTeam?.leader,
        ...(d.opponentTeam?.members ?? []),
        ...(d.invitations ?? []).map((i: any) => i.user),
    ].filter((id): id is string => typeof id === "string" && ObjectId.isValid(id));
    const uniqueUserIds = [...new Set(rawUserIds)];
    const userDocs = uniqueUserIds.length > 0
        ? await db.collection("user").find({ _id: { $in: uniqueUserIds.map((id) => new ObjectId(id)) } }).toArray()
        : [];
    const userMap = new Map<string, string>(userDocs.map((u: any) => [u._id.toString(), u.name ?? u._id.toString()]));

    const rawOrgIds = [d.hostOrg, d.opponentOrg].filter(
        (id): id is string => typeof id === "string" && ObjectId.isValid(id)
    );
    const orgDocs = rawOrgIds.length > 0
        ? await db.collection("organizations").find({ _id: { $in: [...new Set(rawOrgIds)].map((id) => new ObjectId(id)) } }).toArray()
        : [];
    const orgMap = new Map<string, string>(orgDocs.map((o: any) => [o._id.toString(), o.name ?? o._id.toString()]));

    const resolveUser = (id?: string | null) => (id ? (userMap.get(id) ?? null) : null);
    const resolveOrg  = (id?: string | null) => (id ? (orgMap.get(id) ?? null) : null);
    const mapMembers  = (ids: string[]) => ids.map((id) => ({ _id: id, name: userMap.get(id) ?? id.slice(-8) }));

    return {
        _id: d._id.toString(),
        status: d.status ?? "",
        region: d.region ?? "",
        bestOf: d.bestOf ?? "ONE",
        isPrivate: d.isPrivate ?? false,
        wagerAmount: d.wagerAmount ?? 0,
        note: d.note ?? null,
        partyCode: d.partyCode ?? null,
        readyHost: d.readyHost ?? false,
        readyOpponent: d.readyOpponent ?? false,
        result: d.result ?? null,
        scheduledAt: d.scheduledAt ?? null,
        hostId: d.host ?? "",
        hostName: resolveUser(d.host) ?? "Unknown",
        hostOrgId: d.hostOrg ?? null,
        hostOrgName: resolveOrg(d.hostOrg),
        hostTeamName: d.hostTeam?.name ?? null,
        hostTeamLeaderId: d.hostTeam?.leader ?? null,
        hostTeamLeaderName: resolveUser(d.hostTeam?.leader),
        hostTeamMembers: mapMembers(d.hostTeam?.members ?? []),
        opponentOrgId: d.opponentOrg ?? null,
        opponentOrgName: resolveOrg(d.opponentOrg),
        opponentTeamName: d.opponentTeam?.name ?? null,
        opponentTeamLeaderId: d.opponentTeam?.leader ?? null,
        opponentTeamLeaderName: resolveUser(d.opponentTeam?.leader),
        opponentTeamMembers: mapMembers(d.opponentTeam?.members ?? []),
        invitations: (d.invitations ?? []).map((inv: any) => ({
            userId: inv.user ?? "",
            userName: resolveUser(inv.user) ?? "Unknown",
            side: inv.side ?? "",
            status: inv.status ?? "PENDING",
            type: inv.type ?? "",
        })),
        matches: (d.matches ?? []).map((m: any) => ({
            number: m.number ?? 0,
            match_id: m.match_id ?? null,
            result: m.result ?? null,
            startedAt: m.startedAt ?? 0,
            concludedAt: m.concludedAt ?? null,
        })),
        createdAt: d.createdAt ?? 0,
        updatedAt: d.updatedAt ?? 0,
    };
}

export async function adminUpdateScrimmageAction(
    scrimmageId: string,
    changes: { status?: string; scheduledAt?: number | null },
): Promise<void> {
    await requireRole([Role.Admin, Role.Moderator]);
    if (!ObjectId.isValid(scrimmageId)) throw new Error("Invalid scrimmage ID");

    const existing = await db.collection("scrimmages").findOne({ _id: new ObjectId(scrimmageId) });
    if (!existing) throw new Error("Scrimmage not found");
    const d = existing as any;

    const update: Record<string, unknown> = { updatedAt: Date.now() };
    if (changes.status !== undefined) update.status = changes.status;
    if ("scheduledAt" in changes) update.scheduledAt = changes.scheduledAt ?? null;

    await db.collection("scrimmages").updateOne({ _id: new ObjectId(scrimmageId) }, { $set: update });

    const timeChanged = "scheduledAt" in changes && changes.scheduledAt !== (d.scheduledAt ?? null);
    if (timeChanged && changes.scheduledAt) {
        const allMemberIds = [
            d.host,
            d.hostTeam?.leader,
            ...(d.hostTeam?.members ?? []),
            d.opponentTeam?.leader,
            ...(d.opponentTeam?.members ?? []),
        ].filter((id): id is string => typeof id === "string" && id.length > 0);
        const uniqueIds = [...new Set(allMemberIds)];

        const newTimeStr = new Date(changes.scheduledAt).toLocaleString("en-US", {
            month: "short", day: "numeric", year: "numeric",
            hour: "numeric", minute: "2-digit", timeZoneName: "short",
        });

        await Promise.allSettled(
            uniqueIds.map((recipientId) =>
                sendNotificationAction({
                    recipientId,
                    type: NotificationType.General,
                    title: "Scrimmage Rescheduled",
                    description: `Your scrimmage has been rescheduled to ${newTimeStr} by an admin.`,
                    senderName: "Admin",
                    link: `/scrims/${scrimmageId}`,
                })
            )
        );

        const durationMs = BESTOF_DURATION_MS[d.bestOf ?? "ONE"] ?? BESTOF_DURATION_MS.ONE;
        const startTime = new Date(changes.scheduledAt);
        const endTime = new Date(changes.scheduledAt + durationMs);
        await Promise.allSettled(uniqueIds.map((uid) => updateGoogleCalendarEvent(uid, scrimmageId, startTime, endTime)));
    }

    revalidatePath("/admin/scrimmages");
}

async function updateGoogleCalendarEvent(
    userId: string,
    scrimmageId: string,
    startTime: Date,
    endTime: Date,
): Promise<void> {
    if (!ObjectId.isValid(userId)) return;
    const account = (await db.collection("account").findOne({
        userId: new ObjectId(userId),
        providerId: "google",
    })) as { accessToken: string; refreshToken: string } | null;
    if (!account) return;
    try {
        const oauth = getGoogleClient(account.accessToken, account.refreshToken);
        const cal = google.calendar({ version: "v3", auth: oauth });
        await cal.events.patch({
            calendarId: "primary",
            eventId: scrimmageId,
            requestBody: {
                start: { dateTime: startTime.toISOString(), timeZone: "UTC" },
                end: { dateTime: endTime.toISOString(), timeZone: "UTC" },
            },
        });
    } catch {
        // Event may not exist for this user (no Google connected, or not a scheduled scrim)
    }
}

export async function adminPurgeAllScrimmagesAction(): Promise<void> {
    if (process.env.NODE_ENV !== "development") throw new Error("Only available in development mode");
    await requireRole([Role.Admin]);
    await db.collection("scrimmages").deleteMany({});
    await db.collection("user").updateMany({}, { $set: { scrimmages: [] } });
    revalidatePath("/admin/scrimmages");
}

export async function adminCancelScrimmageAction(
    scrimmageId: string,
    reason?: string,
): Promise<void> {
    await requireRole();
    await db.collection("scrimmages").updateOne(
        { _id: new ObjectId(scrimmageId) },
        {
            $set: {
                status: "CANCELLED",
                ...(reason ? { cancelReason: reason } : {}),
                updatedAt: Date.now(),
            },
        },
    );
    revalidatePath("/admin/scrimmages");
}

// ─── Disputes ─────────────────────────────────────────────────────────────

export type DisputeStatusFilter = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";

export async function getDisputesAction(status?: DisputeStatusFilter): Promise<DisputeRow[]> {
    await requireRole();
    const filter = status ? { status } : {};
    const docs = await db
        .collection<DBDispute>("disputes")
        .find(filter)
        .sort({ createdAt: -1 })
        .toArray();
    return docs.map((d) => ({
        _id: d._id.toString(),
        scrimmageId: d.scrimmageId,
        creatorId: d.creatorId,
        creatorName: d.creatorName ?? null,
        reason: d.reason,
        status: d.status,
        resolution: d.resolution ?? null,
        createdAt: d.createdAt,
    }));
}

export async function updateDisputeStatusAction(
    disputeId: string,
    status: "UNDER_REVIEW" | "RESOLVED" | "DISMISSED",
    resolution?: string,
): Promise<void> {
    const { session } = await requireRole();
    await db.collection("disputes").updateOne(
        { _id: new ObjectId(disputeId) },
        {
            $set: {
                status,
                ...(resolution ? { resolution } : {}),
                resolvedById: session.user.id,
                updatedAt: Date.now(),
            },
        },
    );
    revalidatePath("/admin/disputes");
}

// ─── Feedback ─────────────────────────────────────────────────────────────

// ─── User detail ──────────────────────────────────────────────────────────

export type UserDetail = {
    _id: string;
    name: string;
    email: string;
    role: string;
    banned: boolean;
    banReason: string | null;
    mmr: number;
    region: string;
    bio: string;
    heroes: number[];
    balance: { credits: number; pending: number; winnings: number };
    online: boolean;
    organization: string;
    createdAt: number;
};

export async function getUserDetailAction(userId: string): Promise<UserDetail | null> {
    await requireRole();
    if (!ObjectId.isValid(userId)) return null;
    const doc = await db.collection("user").findOne({ _id: new ObjectId(userId) });
    if (!doc) return null;
    const d = doc as any;
    return {
        _id: d._id.toString(),
        name: d.name ?? "",
        email: d.email ?? "",
        role: d.role ?? "MEMBER",
        banned: d.banned ?? false,
        banReason: d.banReason ?? null,
        mmr: d.mmr ?? 0,
        region: d.region ?? "NA",
        bio: d.bio ?? "",
        heroes: d.heroes ?? [],
        balance: d.balance ?? { credits: 0, pending: 0, winnings: 0 },
        online: d.online ?? false,
        organization: d.organization ?? "",
        createdAt: d.createdAt ?? 0,
    };
}

export type UserFeedbackItem = {
    _id: string;
    type: "BUG" | "SUGGESTION" | "CRITICISM" | "OTHER";
    title: string;
    body: string;
    status: "OPEN" | "REVIEWED" | "CLOSED";
    createdAt: number;
};

export async function getUserFeedbackAction(userId: string): Promise<UserFeedbackItem[]> {
    await requireRole();
    const docs = await db
        .collection("feedback")
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();
    return docs.map((d: any) => ({
        _id: d._id.toString(),
        type: d.type,
        title: d.title,
        body: d.body,
        status: d.status,
        createdAt: d.createdAt,
    }));
}

export type UserScrimItem = {
    _id: string;
    status: string;
    wagerAmount: number;
    region: string;
    bestOf: string;
    isHost: boolean;
    createdAt: number;
};

export async function getUserScrimsAction(userId: string): Promise<UserScrimItem[]> {
    await requireRole();
    const docs = await db
        .collection("scrimmages")
        .find({
            $or: [
                { host: userId },
                { "hostTeam.members": userId },
                { "opponentTeam.members": userId },
            ],
        })
        .sort({ createdAt: -1 })
        .limit(15)
        .toArray();
    return docs.map((d: any) => ({
        _id: d._id.toString(),
        status: d.status ?? "",
        wagerAmount: d.wagerAmount ?? 0,
        region: d.region ?? "",
        bestOf: d.bestOf ?? "",
        isHost: d.host === userId,
        createdAt: d.createdAt ?? 0,
    }));
}

export async function changeUserRoleAction(userId: string, role: string): Promise<void> {
    await requireRole([Role.Admin]);
    await db
        .collection("user")
        .updateOne({ _id: new ObjectId(userId) }, { $set: { role, updatedAt: Date.now() } });
    revalidatePath("/admin/users");
}

export type UserEditableData = {
    name?: string;
    bio?: string;
    region?: string;
    mmr?: number;
    credits?: number;
    pending?: number;
    winnings?: number;
};

export async function updateUserDataAction(
    userId: string,
    data: UserEditableData,
): Promise<void> {
    await requireRole([Role.Admin]);
    const update: Record<string, unknown> = { updatedAt: Date.now() };
    if (data.name !== undefined) update.name = data.name.trim();
    if (data.bio !== undefined) update.bio = data.bio.trim();
    if (data.region !== undefined) update.region = data.region;
    if (data.mmr !== undefined) update.mmr = Number(data.mmr);
    if (data.credits !== undefined) update["balance.credits"] = Number(data.credits);
    if (data.pending !== undefined) update["balance.pending"] = Number(data.pending);
    if (data.winnings !== undefined) update["balance.winnings"] = Number(data.winnings);
    await db
        .collection("user")
        .updateOne({ _id: new ObjectId(userId) }, { $set: update });
    revalidatePath("/admin/users");
}

export async function sendNotificationAdminAction(
    recipientId: string,
    title: string,
    description: string,
    link?: string,
): Promise<SendNotificationMutation["addNotification"]> {
    const { session } = await requireRole([Role.Admin, Role.Moderator, Role.Support]);
    const { addNotification: notification } = await grafbase.request(SendNotificationM, {
        input: {
            recipient: recipientId,
            type: NotificationType.General,
            title: title.trim(),
            description: description.trim(),
            senderName: session.user.name,
            ...(link?.trim() ? { link: link.trim() } : {}),
        },
    });
    return notification;
}

export async function sendNotificationAction({recipientId, type, title, senderName, description, actionId, link} :{
    recipientId: string,
    type: NotificationType,
    senderName: string,
    title: string,
    description?: string,
    actionId?: string,
    link?: string,
}): Promise<SendNotificationMutation["addNotification"]> {
    const { addNotification: notification } = await grafbase.request(SendNotificationM, {
        input: {
            recipient: recipientId,
            type,
            title: title.trim(),
            description: description?.trim(),
            senderName,
            actionId,
            ...(link?.trim() ? { link: link.trim() } : {}),
        },
    });
    return notification;
}


// ─── Feedback (continued) ─────────────────────────────────────────────────

export type FeedbackStatusFilter = "OPEN" | "REVIEWED" | "CLOSED";
export type FeedbackTypeFilter = "BUG" | "SUGGESTION" | "CRITICISM" | "OTHER";

export async function getFeedbacksAction(
    status?: FeedbackStatusFilter,
    type?: FeedbackTypeFilter,
): Promise<FeedbackRow[]> {
    await requireRole();
    const filter: Record<string, string> = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    const docs = await db
        .collection<DBFeedback>("feedback")
        .find(filter)
        .sort({ createdAt: -1 })
        .toArray();
    return docs.map((d) => ({
        _id: d._id.toString(),
        userId: d.userId ?? null,
        userName: d.userName ?? null,
        type: d.type,
        title: d.title,
        body: d.body,
        status: d.status,
        adminNote: d.adminNote ?? null,
        createdAt: d.createdAt,
    }));
}

export async function updateFeedbackStatusAction(
    feedbackId: string,
    status: FeedbackStatusFilter,
    adminNote?: string,
): Promise<void> {
    await requireRole();
    await db.collection("feedback").updateOne(
        { _id: new ObjectId(feedbackId) },
        { $set: { status, ...(adminNote ? { adminNote } : {}), updatedAt: Date.now() } },
    );
    revalidatePath("/admin/feedback");
}
