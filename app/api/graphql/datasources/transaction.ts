import { Collection, ObjectId, WithId } from "mongodb";
import {
    Transaction, TransactionInput, TransactionStatus, TransactionType,
    UpdateTransactionInput,
} from "../server";
import { merge } from "lodash";
import { convertNullsToUndefined } from "@/lib/utils";

export class TransactionDataSource {
    private collection;

    constructor(collection: Collection<DBTransaction>) {
        this.collection = collection;
    }

    getTransaction(_id: ObjectId | string) {
        return this.collection.findOne({ _id: new ObjectId(_id) });
    }

    getTransactions() {
        return this.collection.find();
    }

    getCustomerTransactions(customer_id: string): Promise<WithId<DBTransaction>[]> {
        return this.collection.find({ customer: customer_id }).sort({ createdAt: -1 }).toArray();
    }

    createGraphQLTransaction(input: TransactionInput) {
        return this.createTransaction(input) as any as Transaction;
    }

    createTransaction(input: TransactionInput): DBTransaction {
        let transaction: DBTransaction = {
            ...DEFAULTS,
            ...convertNullsToUndefined(input),
            _id: new ObjectId(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        this.collection
            .insertOne(transaction)
            .catch(reason => console.log("Error creating transaction", reason));
        return transaction;
    }

    async updateGraphQLTransaction(transaction_id: ObjectId | string, values: UpdateTransactionInput) {
        return await this.updateTransaction(transaction_id, values) as any as Promise<WithId<Transaction> | undefined>;
    }

    async updateTransaction(transaction_id: ObjectId | string, values: UpdateTransactionInput) {
        const transaction = await this.getTransaction(transaction_id);
        if (!transaction) return;
        merge(transaction, values);
        transaction.updatedAt = Date.now();
        // Fixed: was `{ transaction_id }` which matched nothing — must use `{ _id: ... }`
        await this.collection.updateOne({ _id: new ObjectId(transaction_id) }, { $set: transaction });
        return transaction;
    }
}

export type DBTransaction = Omit<Transaction, "customer" | "_id"> & {
    customer?: string;  // customer _id; null for unlinked transactions
    _id: ObjectId;
}

const DEFAULTS: Omit<DBTransaction, "_id"> = {
    type: TransactionType.Deposit,
    status: TransactionStatus.Pending,
    livemode: false,
    refunded: false,
    createdAt: 0,
    updatedAt: 0,
}
