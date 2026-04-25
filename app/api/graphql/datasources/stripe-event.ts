import { Collection, ObjectId, WithId } from "mongodb";
import { StripeEvent, LogStripeEventInput, EventProcessingStatus } from "../server";

// relatedTransaction is stored as a string ID; resolved to Transaction via field resolver.
export type DBStripeEvent = Omit<StripeEvent, "relatedTransaction" | "_id"> & {
    _id: ObjectId;
    relatedTransaction?: string;
}

export class StripeEventDataSource {
    private collection;

    constructor(collection: Collection<DBStripeEvent>) {
        this.collection = collection;
    }

    /** Look up by Stripe's event ID (e.g. "evt_1ABC…"), not our internal _id. */
    getStripeEvent(stripeEventId: string) {
        return this.collection.findOne({ stripeEventId }) as Promise<WithId<DBStripeEvent> | null>;
    }

    getStripeEventById(_id: ObjectId) {
        return this.collection.findOne({ _id }) as Promise<WithId<DBStripeEvent> | null>;
    }

    async createStripeEvent(input: LogStripeEventInput): Promise<DBStripeEvent> {
        // Idempotency: reject duplicates — same stripeEventId must not be logged twice
        const existing = await this.getStripeEvent(input.stripeEventId);
        if (existing) throw new Error(`Stripe event ${input.stripeEventId} already logged`);

        const event: DBStripeEvent = {
            _id: new ObjectId(),
            stripeEventId: input.stripeEventId,
            eventType: input.eventType,
            apiVersion: input.apiVersion,
            livemode: input.livemode,
            payloadHash: input.payloadHash,
            processingStatus: EventProcessingStatus.Received,
            retryCount: 0,
            receivedAt: Date.now(),
        };

        await this.collection.insertOne(event);
        return event;
    }

    async updateStripeEvent(
        stripeEventId: string,
        status: EventProcessingStatus,
        related_transaction_id?: string | null,
        errorMessage?: string | null,
    ): Promise<DBStripeEvent | null> {
        const event = await this.getStripeEvent(stripeEventId);
        if (!event) return null;

        const update: Partial<DBStripeEvent> = {
            processingStatus: status,
            processedAt: status === EventProcessingStatus.Processed ? Date.now() : event.processedAt,
            errorMessage: errorMessage ?? event.errorMessage,
        };

        if (related_transaction_id) {
            update.relatedTransaction = related_transaction_id;
        }

        if (status === EventProcessingStatus.Failed) {
            update.retryCount = (event.retryCount ?? 0) + 1;
        }

        await this.collection.updateOne({ stripeEventId }, { $set: update });
        return { ...event, ...update };
    }
}
