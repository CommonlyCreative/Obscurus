import { Collection, ObjectId, WithId } from "mongodb";
import { Customer, CustomerInput } from "../server";
import { merge } from "lodash";

export class CustomerDataSource {
    private collection;

    constructor(collection: Collection<DBCustomer>) {
        this.collection = collection;
    }

    getCustomer(_id: string) {
        return this.collection.findOne({ _id });
    }

    getGraphQLCustomer(_id: string) {
        return this.collection.findOne({ _id }) as any as Promise<WithId<Customer> | null>;
    }

    getCustomerByProfile(user_id: string) {
        return this.collection.findOne({ profile: user_id }) as any as Promise<WithId<Customer> | null>;
    }

    async createCustomer({ stripeCustomerId, user_id: user }: CustomerInput): Promise<DBCustomer> {
        const customer: DBCustomer = {
            ...DEFAULTS,
            stripeCustomerId,
            user,
            _id: new ObjectId().toString(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        await this.collection.insertOne(customer);
        return customer;
    }

    async updateCustomer(_id: string, values: Partial<DBCustomer>) {
        const customer = await this.getCustomer(_id);
        if (!customer) return;
        merge(customer, values);
        customer.updatedAt = Date.now();
        await this.collection.updateOne({ _id }, { $set: customer });
        return customer;
    }
}

export type DBCustomer = Omit<Customer, "user"> & {
    user: string;    // user _id
}

const DEFAULTS: DBCustomer = {
    _id: "",
    user: "",
    stripeCustomerId: "",
    isOnboarded: false,
    createdAt: 0,
    updatedAt: 0,
}
