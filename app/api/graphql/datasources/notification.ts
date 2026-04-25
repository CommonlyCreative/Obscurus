import { Collection, ObjectId } from "mongodb";

export enum NotificationType {
    Invitation = "INVITATION",
    General    = "GENERAL",
}

export type DBNotification = {
    _id: ObjectId;
    recipient: string;   // user _id
    type: NotificationType;
    title: string;
    description: string;
    link?: string;
    actionId?: string;
    senderName: string;
    createdAt: number;
};

export class NotificationDataSource {
    private collection: Collection<DBNotification>;

    constructor(collection: Collection<DBNotification>) {
        this.collection = collection;
    }

    getNotifications(user_id: string) {
        return this.collection.find({ recipient: user_id }).sort({ createdAt: -1 }).toArray();
    }

    async sendNotification(input: {
        recipient: string;
        type: NotificationType;
        title: string;
        description: string;
        link?: string | null;
        actionId?: string | null;
        senderName: string;
    }): Promise<DBNotification> {
        const notification: DBNotification = {
            _id: new ObjectId(),
            recipient: input.recipient,
            type: input.type,
            title: input.title,
            description: input.description,
            ...(input.link     ? { link:     input.link }     : {}),
            ...(input.actionId ? { actionId: input.actionId } : {}),
            senderName: input.senderName,
            createdAt: Date.now(),
        };
        await this.collection.insertOne(notification);
        return notification;
    }

    async dismissNotification(notification_id: string, user_id: string): Promise<boolean> {
        const result = await this.collection.deleteOne({
            _id: new ObjectId(notification_id),
            recipient: user_id,
        });
        return result.deletedCount > 0;
    }
}
