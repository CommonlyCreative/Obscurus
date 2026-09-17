import { getPresenceMap } from "@/lib/socket/presence";

// Batches per-request User.online lookups into a single HTTP call to the
// socket server, instead of one round trip per user in a list (e.g. getUsers).
// Mirrors the standard DataLoader pattern: calls made within the same tick
// are collected and flushed together on the next microtask.
export class PresenceDataSource {
    private pending = new Map<string, Array<(online: boolean) => void>>();
    private scheduled = false;

    load(userId: string): Promise<boolean> {
        return new Promise((resolve) => {
            const waiters = this.pending.get(userId) ?? [];
            waiters.push(resolve);
            this.pending.set(userId, waiters);
            this.schedule();
        });
    }

    private schedule() {
        if (this.scheduled) return;
        this.scheduled = true;
        queueMicrotask(() => this.flush());
    }

    private async flush() {
        const batch = this.pending;
        this.pending = new Map();
        this.scheduled = false;

        const ids = Array.from(batch.keys());
        if (ids.length === 0) return;

        const result = await getPresenceMap(ids);

        for (const [id, waiters] of batch) {
            const online = result[id] ?? false;
            waiters.forEach(resolve => resolve(online));
        }
    }
}
