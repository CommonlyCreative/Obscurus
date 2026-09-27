// Server-only: forwards a Statlocker draft webhook event to the socket server so it can
// broadcast it live to everyone viewing the scrim (mirrors lib/socket/presence.ts's
// Next → socket-process call pattern).
export async function broadcastDraftEvent(scrimmageId: string, matchNumber: number, event: unknown): Promise<void> {
    try {
        await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/statlocker/broadcast`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scrimmageId, matchNumber, event }),
        });
    } catch {
        // Socket server unreachable — the event is still logged by the caller; nothing
        // else depends on this broadcast succeeding.
    }
}
