// Server-only: reads live online status from the socket server's in-memory presence map
// (see socket.mts) instead of a stored DB field — presence is a heartbeat +
// expiry, not something that can go stale in the database.
export async function getPresenceMap(userIds: string[]): Promise<Record<string, boolean>> {
    if (userIds.length === 0) return {};

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/presence`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userIds }),
        });
        if (!res.ok) return Object.fromEntries(userIds.map(id => [id, false]));
        return await res.json();
    } catch {
        // Socket server unreachable — fail safe rather than break the page.
        return Object.fromEntries(userIds.map(id => [id, false]));
    }
}

export async function getPresence(userId: string): Promise<boolean> {
    const result = await getPresenceMap([userId]);
    return result[userId] ?? false;
}
