import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/database/mongo";
import { DeadlockMatch } from "@/lib/types/deadlock/match";

export type MatchLookupResult = DeadlockMatch | { errorMessage: string };

// Deadlock API rate limits are shared across the whole API key, not per-match —
// tracked as a single global document so a burst against many different match
// ids still gets gated by one shared quota state.
type GlobalAPILimit = {
    _id: "deadlock-matches";
    limit: number;
    remaining: number;
    resetAt: number; // epoch ms
};

const limits = db.collection<GlobalAPILimit>("deadlock-api-limits");

function getGlobalLimit() {
    return limits.findOne({ _id: "deadlock-matches" });
}

async function recordLimit(limit: number, remaining: number, resetAt: number) {
    await limits.updateOne(
        { _id: "deadlock-matches" },
        { $set: { limit, remaining, resetAt } },
        { upsert: true },
    );
}

export async function fetchMatchMetadata(match_id: string): Promise<MatchLookupResult> {
    "use cache";
    cacheTag(`deadlock-match-${match_id}`);

    // Proactively skip the network call entirely while we know we're rate limited —
    // this runs before the fetch, so it protects every match_id, not just this one.
    const limit = await getGlobalLimit();
    if (limit && limit.remaining <= 0 && Date.now() < limit.resetAt) {
        const retryInSeconds = Math.ceil((limit.resetAt - Date.now()) / 1000);
        cacheLife({ revalidate: Math.max(30, retryInSeconds) });
        return { errorMessage: `Deadlock API rate limit reached. Try again in ${retryInSeconds}s.` };
    }

    const res = await fetch(`https://api.deadlock-api.com/v1/matches/${match_id}/metadata`);
    const body = await res.json();

    if (body.error) {
        if (body.error.quota) {
            const { quota, remaining } = body.error as { quota: { limit: number; period: number }; remaining: number };
            const resetAt = Date.now() + quota.period * 1000;
            await recordLimit(quota.limit, remaining, resetAt);
            cacheLife({ revalidate: Math.max(30, quota.period) });
            return { errorMessage: `Deadlock API rate limit reached. Try again in ${quota.period}s.` };
        }

        // Most likely a match that hasn't concluded yet — recheck again soon
        // rather than caching a "not found" response for a long time.
        cacheLife("minutes");
        return { errorMessage: `Match ${match_id} isn't available yet — it may still be in progress.` };
    }

    // A concluded match's data is immutable — cache effectively forever.
    cacheLife("max");
    return body as DeadlockMatch;
}
