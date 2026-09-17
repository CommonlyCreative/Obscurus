import { Collection, Filter, ObjectId, WithId } from "mongodb";
import { merge } from "lodash";
import { convertNullsToUndefined } from "@/lib/utils";
import { Role, Steam, UpdateUserInput, User, UserInput } from "../server";

export class UserDataSource {
    private collection;

    constructor(collection: Collection<DBUser>) {
        this.collection = collection;
    }

    getUsers(ids?: ObjectId[]) {
        return this.collection.find(ids ? { _id: { $in: ids }} : {});
    }

    getUser(_id: string | ObjectId) {
        if (!ObjectId.isValid(_id))return Promise.resolve({ ...DEFAULTS, _id, createdAt: Date.now() } as DBUser);
        return this.collection.findOne({ _id: new ObjectId(_id) });
    }

    getGraphQLUser(_id: string | ObjectId) {
        if (!ObjectId.isValid(_id))return Promise.resolve({ ...DEFAULTS, _id, createdAt: Date.now(), updatedAt: Date.now(), scrimmages: [] } as any as User);
        return this.collection.findOne({ _id: new ObjectId(_id) }) as any as Promise<WithId<User> | null>;
    }

    // In the merged model the user_id IS the _id — this is a convenience alias.
    getUserByUserId(user_id: string) {
        if (!ObjectId.isValid(user_id))return Promise.resolve({ ...DEFAULTS, _id: user_id, createdAt: Date.now() } as DBUser);
        return this.collection.findOne({ _id: new ObjectId(user_id) }) as any as Promise<WithId<User> | null>;
    }

    getUserFrom(filter: Filter<DBUser>) {
        return this.collection.findOne(filter);
    }

    getUserByEmail(email: string) {
        return this.collection.findOne({ email: email.toLowerCase() });
    }

    // Manager-created placeholder for a player who hasn't signed up yet.
    // Stored with the same shape a real Discord sign-up would produce (name, email,
    // verified: false) so that Better Auth's implicit account linking on the
    // Discord OAuth callback adopts this exact document once the real player signs in
    // with a matching, verified email — see oauth2/link-account.mjs in better-auth.
    async createManualUser(input: { name: string; email: string }) {
        const now = Date.now();
        const user: DBUser = {
            ...DEFAULTS,
            _id: new ObjectId(),
            name: input.name,
            email: input.email.toLowerCase(),
            createdAt: now,
            updatedAt: now,
        };
        await this.collection.insertOne(user);
        return user;
    }

    createUser(input: UserInput) {
        const User: DBUser = {
            ...DEFAULTS,
            ...convertNullsToUndefined(input),
            _id: new ObjectId(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        this.collection
            .insertOne(User)
            .catch(reason => console.log("Error creating User", reason));
        return User;
    }

    async updateUserById(_id: string | ObjectId, values: UpdateUserInput) {
        const User = await this.getUser(_id);
        if (!User) return;
        return this.updateUser(User, values);
    }

    updateUser(User: DBUser, values: UpdateUserInput) {
        merge(User, values);
        User.updatedAt = Date.now();
        this.collection
            .updateOne({ _id: new ObjectId(User._id) }, { $set: User })
            .catch(reason => console.log("Error updating User", reason));
        return User;
    }

    async addScrimmageToUser(_id: string | ObjectId, scrimmage_id: string) {
        const User = await this.getUser(_id);
        if (!User) return;
        User.scrimmages = [...User.scrimmages, scrimmage_id];
        User.updatedAt = Date.now();
        await this.collection.updateOne({ _id: new ObjectId(_id) }, { $set: User });
        return User;
    }

    async removeScrimmageFromUser(_id: string | ObjectId, scrimmage_id: string) {
        const user = await this.collection.findOneAndUpdate({ _id: new ObjectId(_id) }, { $pull: { scrimmages: scrimmage_id }, $set: { updatedAt: Date.now() } });
        return user;
    }

    async addOrganizationToUser(_id: string | ObjectId, organization_id: string) {
        const user = await this.collection.updateOne({ _id: new ObjectId(_id) }, { $set: { updatedAt: Date.now(), organization: organization_id} });
        return user.modifiedCount > 0;
    }

    // A "ghost" is a manager-created placeholder that no one ever claimed
    // (verified stays false until a real Discord sign-in matches its email —
    // see createManualUser) and that never actually played in a scrimmage.
    // Once it loses its only org membership it serves no purpose, so it's
    // deleted outright instead of left behind as an orphaned document.
    // Placeholders with scrimmage history are kept — deleting them would leave
    // dangling user_id references in past rosters (Team.members, etc).
    async deleteIfGhost(_id: string | ObjectId): Promise<boolean> {
        const user = await this.getUser(_id);
        if (!user || user.verified || user.scrimmages.length > 0) return false;

        await this.collection.deleteOne({ _id: new ObjectId(_id) });
        return true;
    }
}

// User IS the Better Auth user document — queried from the "user" collection.
// `organization` is NOT stored here; resolved via OrganizationDataSource.getOrganizationByMember.
// `online` is NOT stored here either; it's live presence resolved via PresenceDataSource
// (see app/api/graphql/datasources/presence.ts and socket.mts) — not something a document can go stale on.
// `verified` is Better Auth's own emailVerified field, stored under this name via
// the `user.fields` mapping in lib/database/auth.ts.
export type DBUser = Omit<User, "scrimmages" | "organization" | "_id" | "online"> & {
    _id: ObjectId | string;
    email?: string;             // Better Auth field; not exposed in GraphQL (see UserDataSource.getUserByEmail)
    scrimmages: string[];
    organization: string;
}

const DEFAULTS: Omit<DBUser, "_id" | "createdAt" | "updatedAt" | "stats"> = {
    name: "",
    region: "NA",
    verified: false,
    organization: "",
    heroes: [],
    bio: undefined,
    scrimmages: [],
    balance: {
        credits: 0,
        pending: 0,
        winnings: 0,
    },
    role: Role.Member,
}
