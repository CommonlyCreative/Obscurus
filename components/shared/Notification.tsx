"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket/socket-client";
import { useRouter } from "next/navigation";
import { ExternalToast, toast } from "sonner";
import { Notification as Noti, NotificationType } from "@/app/api/graphql/types/graphql";
import { addNotification } from "@/app/actions";
import { notifyTeamInviteResponseAction } from "@/app/profile/[id]/actions";

function Notification() {
    const router = useRouter();

    useEffect(() => {
        const handleNotification = async (data: Noti) => {
            const link = data.link
            let external: ExternalToast = {
                description: data.description,
            }
            if (data.type === NotificationType.Invitation) {
                const leaderId = data.actionId;
                async function response(accepted: boolean) {
                    if (!leaderId)return;
                    const notification = await notifyTeamInviteResponseAction(
                        leaderId,
                        accepted,
                        data.recipient,
                    );

                    if (notification) {
                        socket.emit("notify", notification);
                    }

                    socket.emit(
                        "team:invite:respond",
                        accepted,
                        data.actionId,
                    );
                }
                if (leaderId) {
                    external = {
                        ...external,
                        duration: Infinity,
                        action: {
                            label: "Accept",
                            onClick: () => response(true)
                        },
                        cancel: {
                            label: "Decline",
                            onClick: async () => response(false)
                        },
                    }
                }
            } else if (link) {
                external = {
                    ...external,
                    action: {
                        label: "View",
                        onClick: () => router.push(link)
                    },

                }
            }
            toast(data.title, external)
            router.refresh();
        };

        socket.on("notify", handleNotification);

        return () => {
            socket.off("notify", handleNotification);
        };
    }, []);
    return null;
}

export default Notification;
