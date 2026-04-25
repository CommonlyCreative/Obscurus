"use client";

import { useEffect, useState } from "react";
import type { LiveTeam } from "@/lib/socket/teams";
import { socket } from "@/lib/socket/socket-client";

export function useTeamSocket(targetUserIds: string[]) {
    const [liveTeams, setLiveTeams] = useState<Record<string, LiveTeam | null>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (targetUserIds.length === 0) {
            setLoading(false);
            return;
        }

        socket.emit("team:subscribe", targetUserIds);

        const handleMultiple = (teams: Record<string, LiveTeam | null>) => {
            if (!targetUserIds.includes("all")) return;
            setLiveTeams({ ...liveTeams, ...teams });
            setLoading(false);
        };

        const handleState = (team: LiveTeam | null, userId: string) => {
            if (!targetUserIds.includes("all") && !targetUserIds.includes(userId)) return;
            setLiveTeams({ ...liveTeams, [userId]: team });
            setLoading(false);
        };
        const handleUpdate = (team: LiveTeam | null, userId: string) => {
            if (!targetUserIds.includes("all") && !targetUserIds.includes(userId)) return;
            setLiveTeams({ ...liveTeams, [userId]: team });
        };

        socket.on("team:state", handleState);
        socket.on("team:multiple", handleMultiple);
        socket.on("team:update", handleUpdate);

        return () => {
            socket.emit("team:unsubscribe", targetUserIds);
            socket.off("team:state", handleState);
            socket.off("team:update", handleUpdate);
        };
    }, [JSON.stringify(targetUserIds)]);

    return { teams: liveTeams, loading };
}
