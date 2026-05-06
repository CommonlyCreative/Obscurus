import { Collection, ObjectId, WithId } from "mongodb";
import {
    Scrimmage, Team, ScrimmageStatus, ScrimmageResult, MatchResult, BestOf,
    CreateScrimmageInput, UpdateScrimmageInput, MatchSide,
    Match,
    InvitationStatus,
    InvitationType,
    TeamInput,
} from "../server";
import { ArrayElement, convertNullsToUndefined } from "@/lib/utils";
import { deleteGoogleScrimmageEvent } from "@/app/scrims/create/actions";

// ─── DB types ────────────────────────────────────────────────────────────────

export type DBTeam = Omit<Team, "leader" | "members"> & {
    leader: string;
    members: string[];
};

export type DBScrimmage = Omit<Scrimmage, "opponentTeam" | "opponentOrg" | "hostTeam" | "opponents" | "hostOrg" | "host" | "_id" | "invitations"> & {
    hostTeam: DBTeam,
    _id: ObjectId,
    opponentTeam?: DBTeam,
    opponentOrg?: string,
    hostOrg?: string,
    host: string,
    invitations: (Omit<ArrayElement<Scrimmage["invitations"]>, "user" | "organization" | "scrimmage"> & {
        user: string;
        organization?: string;
    })[]
}

// const DEFAULTS: Omit<DBScrimmage, "_id"> = {
//     owner: "",
//     hostTeam: { leader: "", members: [] },
//     createdAt: 0,
//     updatedAt: 0,
//     host: "",
//     invitations: [],
//     isPrivate: false,
//     status: ScrimmageStatus.Pending,
//     wagerAmount: 0,
// }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initialStatus(input: CreateScrimmageInput): ScrimmageStatus {
    if (input.isPrivate) return ScrimmageStatus.Pending;
    return ScrimmageStatus.Open;
}

function seriesWinsNeeded(bestOf: BestOf): number {
    if (bestOf === BestOf.Three) return 2;
    if (bestOf === BestOf.Five) return 3;
    if (bestOf === BestOf.Unlimited) return Infinity;
    return 1; // ONE
}

function computeSeriesResult(matches: Match[], bestOf: BestOf): ScrimmageResult | null {
    let hostWins = 0;
    let opponentWins = 0;

    for (const m of matches) {
        if (!m.result) continue;
        if (m.result === MatchResult.HostWin) hostWins++;
        else if (m.result === MatchResult.OpponentWin) opponentWins++;
        else if (m.result === MatchResult.Cancelled) return ScrimmageResult.Cancelled;
    }

    const needed = seriesWinsNeeded(bestOf);
    if (hostWins >= needed) return ScrimmageResult.HostWin;
    if (opponentWins >= needed) return ScrimmageResult.OpponentWin;

    // All matches played without a winner → draw
    const totalGames = bestOf === BestOf.Unlimited ? Infinity
        : bestOf === BestOf.One ? 1
            : bestOf === BestOf.Three ? 3
                : 5;
    const played = matches.filter(m => m.result).length;
    if (played >= totalGames) return ScrimmageResult.Draw;

    return null; // series ongoing
}

function now() { return Date.now(); }

// ─── Data source ─────────────────────────────────────────────────────────────

export class ScrimmageDataSource {

    private collection: Collection<DBScrimmage>;

    constructor(collection: Collection<DBScrimmage>) {
        this.collection = collection;
    }

    // ── Reads ─────────────────────────────────────────────────────────────────

    getScrimmages(filter?: { status?: ScrimmageStatus }, limit?: number) {
        return this.collection.find(filter ?? {}, { limit });
    }

    getPublicScrimmages(limit?: number) {
        return this.collection.find({ isPrivate: false, status: ScrimmageStatus.Open }, { limit });
    }

    async getScrimmage(id: ObjectId | string): Promise<WithId<DBScrimmage> | null> {
        return this.collection.findOne({ _id: new ObjectId(id) });
    }

    getGraphQLScrimmage(id: ObjectId | string): Promise<WithId<Scrimmage> | null> {
        return this.collection.findOne({ _id: new ObjectId(id) }) as any;
    }

    async getOrgScrimmages(orgId: string) {
        return this.collection.find({
            $or: [{ hostOrg: orgId }, { opponentOrg: orgId }],
        }).toArray();
    }

    async getScrimmageInvitations(userId: string) {
        const docs = await this.collection.find({
            invitations: { $elemMatch: { user: userId, status: InvitationStatus.Pending } },
        }).toArray();
        return docs.flatMap(scrim =>
            scrim.invitations
                .filter(inv => inv.user === userId && inv.status === InvitationStatus.Pending)
                .map(inv => ({ ...inv, _scrimmageId: scrim._id.toString() }))
        );
    }

    async respondToInvitation(scrimmage_id: string, user_id: string, status: InvitationStatus): Promise<WithId<DBScrimmage> | null> {
        const scrim = await this.collection.findOneAndUpdate(
            { _id: new ObjectId(scrimmage_id), "invitations.user": user_id },
            { $set: { 'invitations.$.status': status, 'invitations.$.respondedAt': now(), updatedAt: now() } }
        );
        return scrim;
    }

    // ── Create ────────────────────────────────────────────────────────────────

    createScrimmage(input: CreateScrimmageInput): DBScrimmage {
        const clean = convertNullsToUndefined(input);
        const scrimmage: DBScrimmage = {
            _id: new ObjectId(),
            host: input.host_id,           // caller must set host in the resolver via context
            hostTeam: { leader: input.host_id, members: clean.team ?? [] },
            region: "NA",
            status: initialStatus(input),
            isPrivate: input.isPrivate,
            wagerAmount: input.wagerAmount ?? 0,
            bestOf: clean.bestOf ?? BestOf.One,
            note: clean.note ?? undefined,
            hostOrg: clean.hostOrg_id ?? undefined,
            opponentOrg: clean.opponentOrg_id ?? undefined,
            scheduledAt: clean.scheduledAt ?? undefined,
            partyCode: clean.partyCode ?? undefined,
            readyHost: false,
            readyOpponent: false,
            matches: [],
            invitations: clean.invitations?.map(obj => ({
                status: InvitationStatus.Pending,
                type: obj.type,
                side: obj.side,
                user: obj.user_id,
                organization: obj.organization_id,
                createdAt: now(),
            })) ?? [],
            createdAt: now(),
            updatedAt: now(),
        };
        this.collection.insertOne(scrimmage).catch(err =>
            console.error("Failed to insert scrimmage:", err)
        );
        return scrimmage;
    }

    // ── Generic update helper ─────────────────────────────────────────────────

    private async patch(
        id: ObjectId | string,
        update: Partial<Omit<DBScrimmage, "_id">>
    ): Promise<WithId<DBScrimmage> | null> {
        const ts = now();
        await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...update, updatedAt: ts } }
        );
        return this.getScrimmage(id);
    }

    // ── Public scrimmage: join / leave ────────────────────────────────────────

    async joinScrimmage(
        scrimmageId: string,
        orgId: string | undefined,
        team: string[]
    ): Promise<WithId<DBScrimmage> | null> {
        const scrim = await this.getScrimmage(scrimmageId);
        if (!scrim) throw new Error("Scrimmage not found");
        if (scrim.status !== ScrimmageStatus.Open) throw new Error("Scrimmage is not open");
        if (scrim.opponentTeam) throw new Error("Scrimmage already has an opponent");
        if (team.length !== 6) throw new Error("Team must have exactly 6 players");

        return this.patch(scrimmageId, {
            opponentOrg: orgId,
            opponentTeam: { leader: team[0], members: team },
            status: ScrimmageStatus.Ready,
            readyOpponent: false,
        });
    }

    async leaveScrimmage(
        scrimmageId: string
    ): Promise<{ members: string[] | undefined, scrim: WithId<DBScrimmage> | null }> {
        const scrim = await this.getScrimmage(scrimmageId);
        if (!scrim) throw new Error("Scrimmage not found");
        if (scrim.status !== ScrimmageStatus.Ready) throw new Error("Can only leave when status is READY");
        if (scrim.matches.some(m => !m.result)) throw new Error("Cannot leave while a match is in progress — forfeit instead");

        const update = await this.patch(scrimmageId, {
            opponentOrg: undefined,
            opponentTeam: undefined,
            status: scrim.isPrivate ? ScrimmageStatus.Pending : ScrimmageStatus.Open,
            readyHost: false,
            readyOpponent: false,
        });

        return { members: scrim.opponentTeam?.members, scrim: update };
    }

    // ── Private scrimmage: accept / decline ───────────────────────────────────

    async acceptScrimmageChallenge(
        scrimmageId: string,
        user_id: string
    ): Promise<WithId<DBScrimmage> | null> {
        const scrim = await this.getScrimmage(scrimmageId);
        if (!scrim) throw new Error("Scrimmage not found");
        if (scrim.status !== ScrimmageStatus.Pending) throw new Error("No pending challenge to accept");
        const invitation = scrim.invitations.find(inv => inv.user === user_id&&inv.type === InvitationType.LeaderInvite)

        if (!invitation)throw new Error("Only leaders can accept scrimmage challenges");

        invitation.status = InvitationStatus.Accepted;

        const nextStatus = scrim.scheduledAt
            ? ScrimmageStatus.Scheduling
            : ScrimmageStatus.Ready;

            //TODO

        return this.patch(scrimmageId, {
            opponentOrg: invitation.organization,
            status: nextStatus,
            invitations: scrim.invitations,
        });
    }

    async declineScrimmageChallenge(
        scrimmageId: string,
        user_id: string
    ): Promise<WithId<DBScrimmage> | null> {
        const scrim = await this.getScrimmage(scrimmageId);
        if (!scrim) throw new Error("Scrimmage not found");
        if (scrim.status !== ScrimmageStatus.Pending) throw new Error("No pending challenge to decline");
        const invitation = scrim.invitations.find(inv => inv.user === user_id&&inv.type === InvitationType.LeaderInvite)

        if (!invitation)throw new Error("Only leaders can decline scrimmage challenges");

        invitation.status = InvitationStatus.Declined

        let status = ScrimmageStatus.Cancelled;

        for (const invite of scrim.invitations){
            if (invite.type === InvitationType.LeaderInvite&&invite.status === InvitationStatus.Pending) {
                status = scrim.status;
            }
        }

        if (status === ScrimmageStatus.Cancelled)
            await deleteGoogleScrimmageEvent(scrimmageId)

        return this.patch(scrimmageId, { status, invitations: scrim.invitations });
    }

    // ── Roster management ─────────────────────────────────────────────────────

    async setOpponentRoster(
        scrimmageId: string,
        leader_id: string,
        team: string[],
        name?: string,
    ): Promise<WithId<DBScrimmage> | null> {
        const scrim = await this.getScrimmage(scrimmageId);
        if (!scrim) throw new Error("Scrimmage not found");
        if (![ScrimmageStatus.Scheduling, ScrimmageStatus.Ready].includes(scrim.status))
            throw new Error("Cannot set roster in current status");
        if (team.length !== 6) throw new Error("Team must have exactly 6 players");

        const nextStatus = scrim.status === ScrimmageStatus.Scheduling
            ? ScrimmageStatus.Scheduled
            : scrim.status;

        return this.patch(scrimmageId, {
            opponentTeam: { leader: leader_id, members: team, name },
            status: nextStatus,
        });
    }

    async updateRosterSlot(
        scrimmageId: string,
        side: MatchSide,
        removeId: string,
        replaceId: string
    ): Promise<WithId<DBScrimmage> | null> {
        const scrim = await this.getScrimmage(scrimmageId);
        if (!scrim) throw new Error("Scrimmage not found");

        const team = side === MatchSide.Host ? scrim.hostTeam : scrim.opponentTeam;
        if (!team) throw new Error("Team not yet set");

        const idx = team.members.indexOf(removeId);
        if (idx === -1) throw new Error("Player not found in team");

        const members = [...team.members];
        members[idx] = replaceId;
        const leader = team.leader === removeId ? replaceId : team.leader;
        const updatedTeam: DBTeam = { ...team, leader, members };

        const field = side === MatchSide.Host ? "hostTeam" : "opponentTeam";
        return this.patch(scrimmageId, { [field]: updatedTeam });
    }

    // ── Ready up ──────────────────────────────────────────────────────────────

    async readyUp(
        scrimmageId: string,
        side: MatchSide
    ): Promise<WithId<DBScrimmage> | null> {
        const scrim = await this.getScrimmage(scrimmageId);
        if (!scrim) throw new Error("Scrimmage not found");
        if (![ScrimmageStatus.Ready, ScrimmageStatus.Scheduled].includes(scrim.status))
            throw new Error("Cannot ready up in current status");

        const readyHost = side === MatchSide.Host ? true : scrim.readyHost;
        const readyOpponent = side === MatchSide.Opponent ? true : scrim.readyOpponent;
        const bothReady = readyHost && readyOpponent;

        return this.patch(scrimmageId, {
            readyHost,
            readyOpponent,
            ...(bothReady ? { status: ScrimmageStatus.Active } : {}),
        });
    }

    async unready(
        scrimmageId: string,
        side: MatchSide
    ): Promise<WithId<DBScrimmage> | null> {
        const scrim = await this.getScrimmage(scrimmageId);
        if (!scrim) throw new Error("Scrimmage not found");
        if (scrim.status === ScrimmageStatus.Active)
            throw new Error("Cannot unready after scrimmage has started");

        const update = side === MatchSide.Host
            ? { readyHost: false }
            : { readyOpponent: false };

        return this.patch(scrimmageId, update);
    }

    // ── Party code ────────────────────────────────────────────────────────────

    async setPartyCode(
        scrimmageId: string,
        partyCode: string
    ): Promise<WithId<DBScrimmage> | null> {
        const scrim = await this.getScrimmage(scrimmageId);
        if (!scrim) throw new Error("Scrimmage not found");
        if (scrim.status === ScrimmageStatus.Completed || scrim.status === ScrimmageStatus.Cancelled)
            throw new Error("Cannot update party code on a finished scrimmage");

        return this.patch(scrimmageId, { partyCode });
    }

    // ── Match lifecycle ───────────────────────────────────────────────────────

    async startMatch(scrimmageId: string): Promise<WithId<DBScrimmage> | null> {
        const scrim = await this.getScrimmage(scrimmageId);
        if (!scrim) throw new Error("Scrimmage not found");
        if (scrim.status !== ScrimmageStatus.Active)
            throw new Error("Scrimmage must be ACTIVE to start a match");
        if (!scrim.partyCode)
            throw new Error("Party code must be set before starting a match");
        if (scrim.matches.some(m => !m.result))
            throw new Error("A match is already in progress");

        const match: Match = {
            number: scrim.matches.length + 1,
            startedAt: now(),
        };

        await this.collection.updateOne(
            { _id: new ObjectId(scrimmageId) },
            { $push: { matches: match }, $set: { updatedAt: now() } }
        );
        return this.getScrimmage(scrimmageId);
    }

    async cancelMatch(scrimmageId: string): Promise<WithId<DBScrimmage> | null> {
        const scrim = await this.getScrimmage(scrimmageId);
        if (!scrim) throw new Error("Scrimmage not found");
        if (scrim.status !== ScrimmageStatus.Active)
            throw new Error("Scrimmage must be ACTIVE to cancel a match");
        if (!scrim.matches.length || scrim.matches.every(m => m.result))
            throw new Error("There is no match in progress");

        scrim.matches.pop();
        await this.collection.updateOne(
            { _id: new ObjectId(scrimmageId) },
            { $pull: { matches: { result: null } }, $set: { updatedAt: now() } }
        );
        return scrim;
    }

    async submitMatchResult(
        scrimmageId: string,
        matchNumber: number,
        deadlockMatchId: string,
        result: MatchResult
    ): Promise<WithId<DBScrimmage> | null> {
        const scrim = await this.getScrimmage(scrimmageId);
        if (!scrim) throw new Error("Scrimmage not found");
        if (scrim.status !== ScrimmageStatus.Active)
            throw new Error("Scrimmage is not ACTIVE");

        const matchIdx = scrim.matches.findIndex(m => m.number === matchNumber);
        if (matchIdx === -1) throw new Error(`Match ${matchNumber} not found`);
        if (scrim.matches[matchIdx].result)
            throw new Error(`Match ${matchNumber} already has a result`);

        const concludedAt = now();
        await this.collection.updateOne(
            { _id: new ObjectId(scrimmageId) },
            {
                $set: {
                    [`matches.${matchIdx}.match_id`]: deadlockMatchId,
                    [`matches.${matchIdx}.result`]: result,
                    [`matches.${matchIdx}.concludedAt`]: concludedAt,
                    updatedAt: concludedAt,
                },
            }
        );

        // Re-fetch to compute series result
        const updated = await this.getScrimmage(scrimmageId);
        if (!updated) return null;

        const seriesResult = computeSeriesResult(updated.matches, updated.bestOf ?? BestOf.One);
        if (seriesResult !== null) {
            return this.patch(scrimmageId, {
                result: seriesResult,
                status: seriesResult === ScrimmageResult.Cancelled
                    ? ScrimmageStatus.Cancelled
                    : ScrimmageStatus.Completed,
            });
        }

        return updated;
    }

    // ── End scrimmage ─────────────────────────────────────────────────────────

    async endScrimmage(scrimmageId: string): Promise<WithId<DBScrimmage> | null> {
        const scrim = await this.getScrimmage(scrimmageId);
        if (!scrim) throw new Error("Scrimmage not found");
        if ([ScrimmageStatus.Completed, ScrimmageStatus.Cancelled].includes(scrim.status))
            throw new Error("Scrimmage is already finished");
        if (scrim.matches.some(m => !m.result))
            throw new Error("Cannot end scrimmage while a match is in progress");

        const status = scrim.matches.length > 0 ? ScrimmageStatus.Completed : ScrimmageStatus.Cancelled;

        let result = undefined;
        
        if (status === ScrimmageStatus.Completed) {
            let hostWins = 0;
            let opponentWins = 0;
            result = ScrimmageResult.Draw;

            for (const m of scrim.matches) {
                if (!m.result) continue;
                if (m.result === MatchResult.HostWin) hostWins++;
                else if (m.result === MatchResult.OpponentWin) opponentWins++;
            }
            if (hostWins > opponentWins)
                result = ScrimmageResult.HostWin;
            else if (hostWins < opponentWins)
                result = ScrimmageResult.OpponentWin;
        }

        return this.patch(scrimmageId, { status, result });
    }

    async cancelScrimmage(scrimmageId: string): Promise<WithId<DBScrimmage> | null> {
        await deleteGoogleScrimmageEvent(scrimmageId)
        return this.patch(scrimmageId, { status: ScrimmageStatus.Cancelled });
    }

    async updateScrimmageById(
        id: ObjectId | string,
        values: UpdateScrimmageInput
    ): Promise<WithId<DBScrimmage> | null> {
        return this.patch(id, convertNullsToUndefined(values) as Partial<DBScrimmage>);
    }
}