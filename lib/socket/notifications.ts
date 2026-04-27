import { NotificationType } from "@/app/api/graphql/types/graphql";
import { socket } from "./socket-client";
import { sendNotificationAction } from "@/app/admin/actions";

export async function sendNotification(input :{
    recipientId: string,
    type: NotificationType,
    senderName: string,
    title: string,
    description?: string,
    actionId?: string,
    link?: string,
}) {
    const notification = await sendNotificationAction(input)
    socket.emit("notify", notification);
}