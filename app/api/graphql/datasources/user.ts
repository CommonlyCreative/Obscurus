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

    async setOnlineStatus(_id: string | ObjectId, online: boolean) {
        const User = await this.getUser(_id);
        if (!User) return null;
        const updatedAt = Date.now();
        await this.collection.updateOne({ _id: new ObjectId(_id) }, { $set: { online, updatedAt } });
        return { ...User, online, updatedAt } as DBUser;
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

    async removeOrganizationFromAllMembers(org_id: string) {
        await this.collection.updateMany(
            { organization: org_id },
            { $set: { organization: "", updatedAt: Date.now() } }
        );
    }
}

// User IS the Better Auth user document — queried from the "user" collection.
// `organization` is NOT stored here; resolved via OrganizationDataSource.getOrganizationByMember.
// `verified` maps to Better Auth's `emailVerified` field on the user document.
export type DBUser = Omit<User, "scrimmages" | "organization" | "_id"> & {
    _id: ObjectId | string;
    emailVerified?: boolean;    // Better Auth field; exposed in GraphQL as `verified`
    scrimmages: string[];
    organization: string;
}

const DEFAULTS: Omit<DBUser, "_id" | "createdAt" | "updatedAt"> = {
    online: false,
    name: "",
    verified: false,
    mmr: 0,
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
