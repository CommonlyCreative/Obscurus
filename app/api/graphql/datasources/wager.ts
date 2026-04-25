import { Collection, ObjectId, WithId } from "mongodb";
import {
    Wager, WagerStatus, MatchSide,
    CreditTransaction, CreditTxType,
    CreditPurchase,
    PlaceWagerInput, PurchaseCreditsInput,
} from "../server";

export type DBWager = Omit<Wager, "scrimmage" | "leader" | "_id"> & {
    scrimmage: string;  // scrimmage _id
    leader: string;     // profile _id of the team leader
    _id: ObjectId;
}

export type DBCreditTransaction = Omit<CreditTransaction, "user" | "wager" | "stripeTransaction" | "_id"> & {
    user: string;            // profile _id
    wager?: string;             // wager _id, if wager-related
    stripeTransaction?: string; // transaction _id, if purchase-related
    _id: ObjectId;
}

export type DBCreditPurchase = Omit<CreditPurchase, "user" | "stripeTransaction" | "creditTransaction" | "_id"> & {
    user: string;
    stripeTransaction: string;  // transaction _id
    creditTransaction: string;  // credit_transaction _id
    _id: ObjectId;
}

export class WagerDataSource {
    private wagers;
    private creditTxs;
    private creditPurchases;

    constructor(
        wagersCollection: Collection<DBWager>,
        creditTxCollection: Collection<DBCreditTransaction>,
        creditPurchasesCollection: Collection<DBCreditPurchase>,
    ) {
        this.wagers = wagersCollection;
        this.creditTxs = creditTxCollection;
        this.creditPurchases = creditPurchasesCollection;
    }

    // -------------------------------------------------------------------------
    // Wagers
    // -------------------------------------------------------------------------

    getWager(_id: ObjectId | string) {
        return this.wagers.findOne({ _id: new ObjectId(_id) }) as Promise<WithId<DBWager> | null>;
    }

    getScrimmageWagers(scrimmage_id: string): Promise<WithId<DBWager>[]> {
        return this.wagers.find({ scrimmage: scrimmage_id }).toArray();
    }

    getProfileWagers(profile_id: string): Promise<WithId<DBWager>[]> {
        return this.wagers.find({ leader: profile_id }).toArray();
    }

    async createWager(scrimmage_id: string, leader_id: string, side: MatchSide, amount: number): Promise<DBWager> {
        const wager: DBWager = {
            _id: new ObjectId(),
            scrimmage: scrimmage_id,
            leader: leader_id,
            side,
            amount,
            status: WagerStatus.Locked,
            createdAt: Date.now(),
        };
        await this.wagers.insertOne(wager);
        return wager;
    }

    async updateWagerStatus(_id: ObjectId, status: WagerStatus, settledAt?: number): Promise<DBWager | null> {
        const wager = await this.getWager(_id);
        if (!wager) return null;

        const update: Partial<DBWager> = { status };
        if (settledAt) update.settledAt = settledAt;

        await this.wagers.updateOne({ _id: new ObjectId(_id) }, { $set: update });
        return { ...wager, ...update };
    }

    // -------------------------------------------------------------------------
    // Credit transactions
    // -------------------------------------------------------------------------

    getCreditTransaction(_id: ObjectId | string) {
        return this.creditTxs.findOne({ _id: new ObjectId(_id) }) as Promise<WithId<DBCreditTransaction> | null>;
    }

    getCreditTransactions(profile_id: string, limit = 50): Promise<WithId<DBCreditTransaction>[]> {
        return this.creditTxs
            .find({ user: profile_id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .toArray();
    }

    async createCreditTransaction(
        user_id: string,
        type: CreditTxType,
        amount: number,
        balanceAfter: number,
        opts: { wager_id?: string; stripeTransaction_id?: string; note?: string } = {},
    ): Promise<DBCreditTransaction> {
        const tx: DBCreditTransaction = {
            _id: new ObjectId(),
            user: user_id,
            type,
            amount,
            balanceAfter,
            wager: opts.wager_id,
            stripeTransaction: opts.stripeTransaction_id,
            note: opts.note,
            createdAt: Date.now(),
        };
        await this.creditTxs.insertOne(tx);
        return tx;
    }

    // -------------------------------------------------------------------------
    // Credit purchases
    // -------------------------------------------------------------------------

    getCreditPurchase(_id: ObjectId | string) {
        return this.creditPurchases.findOne({ _id: new ObjectId(_id) }) as Promise<WithId<DBCreditPurchase> | null>;
    }

    getCreditPurchases(user_id: string): Promise<WithId<DBCreditPurchase>[]> {
        return this.creditPurchases.find({ user: user_id }).sort({ createdAt: -1 }).toArray();
    }

    async createCreditPurchase(
        user_id: string,
        credits: number,
        amountPaidCents: number,
        stripeTransaction_id: string,
        creditTransaction_id: string,
    ): Promise<DBCreditPurchase> {
        const purchase: DBCreditPurchase = {
            _id: new ObjectId(),
            user: user_id,
            credits,
            amountPaidCents,
            stripeTransaction: stripeTransaction_id,
            creditTransaction: creditTransaction_id,
            createdAt: Date.now(),
        };
        await this.creditPurchases.insertOne(purchase);
        return purchase;
    }
}
