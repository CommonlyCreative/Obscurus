"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket/socket-client";

function Notification({ userId: _ }: { userId: string | undefined }) {
    useEffect(() => {
        const handleNotification = (payload: unknown) => {
            console.log("Notification received:", payload);
        };
        socket.on("notification", handleNotification);
        return () => {
            socket.off("notification", handleNotification);
        };
    }, []);

    return null;
}

export default Notification;
