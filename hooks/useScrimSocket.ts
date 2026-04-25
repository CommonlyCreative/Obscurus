"use client";

import { useEffect, useRef, useCallback } from "react";
import { socket } from "@/lib/socket/socket-client";
import type { ScrimPatch } from "@/lib/socket/scrims";
import { broadcastScrimPatch, broadcastScrimRefresh } from "@/lib/socket/scrims";

export function useScrimSocket(
    scrimmageId: string,
    onPatch: (patch: ScrimPatch) => void,
    onRefresh: () => void,
) {
    // Use refs so the socket listener always calls the latest callback
    // without needing to re-subscribe when the closure updates.
    const onPatchRef = useRef(onPatch);
    onPatchRef.current = onPatch;
    const onRefreshRef = useRef(onRefresh);
    onRefreshRef.current = onRefresh;

    const handlePatch = useCallback((patch: ScrimPatch) => {
        onPatchRef.current(patch);
    }, []);

    const handleRefresh = useCallback(() => {
        onRefreshRef.current();
    }, []);

    useEffect(() => {
        socket.emit("scrim:subscribe", scrimmageId);
        socket.on("scrim:patch", handlePatch);
        socket.on("scrim:refresh", handleRefresh);

        return () => {
            socket.emit("scrim:unsubscribe", scrimmageId);
            socket.off("scrim:patch", handlePatch);
            socket.off("scrim:refresh", handleRefresh);
        };
    }, [scrimmageId, handlePatch, handleRefresh]);

    return {
        broadcastPatch: (patch: ScrimPatch) => broadcastScrimPatch(scrimmageId, patch),
        broadcastRefresh: () => broadcastScrimRefresh(scrimmageId),
    };
}
