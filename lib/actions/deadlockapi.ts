"use server"
import { cache } from "react"
import { StatlockerBatchProfile, StatlockerProfile } from "../types/deadlock/statlocker"
import { constructURL } from "../utils";

// export async function getStatlockerRank(steam_id: string): Promise<StatlockerProfile> {
// const res = await fetch(`https://statlocker.gg/api/profile/aggregate-stats/${steam_id}`, {
//     headers: { "X-API-Key": process.env.NEXT_PUBLIC_STATLOCKER_API as string },
// });
// return res.json();
// }

// export async function createStatlockerDraft(steam_ids: string[]): Promise<StatlockerBatchProfile[]> {
//     const res = await fetch(`https://statlocker.gg/api/profile/batch-profiles`, {
//         method: "POST",
//         headers: {
//             "X-API-Key": process.env.NEXT_PUBLIC_STATLOCKER_API as string,
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify(steam_ids.slice(0, 100)),
//     });
//     return res.json();
// }

export async function getDeadlockRankImage(steam_id: string) {
    const res = await fetch(`https://api.deadlock-api.com/v1/players/${steam_id}/rank/image`);
    return res.json();
}

export async function getDeadlockRank(steam_id: string) {
    const res = await fetch(`https://api.deadlock-api.com/v1/players/${steam_id}/rank`);
    return res.json() as Promise<{ badge: number, rank: number, subrank: number }>;
}

export async function getDeadlockRanks(steam_ids: string[]) {
    return await Promise.all(steam_ids.map(id => getDeadlockRank(id)))
}

type DraftTeam = { name: string, accountIds: number[] }
export async function createStatlockerDraft({ team1, team2, draftName, scrimmageId, matchNumber }: { team1: DraftTeam, team2: DraftTeam, draftName: string, scrimmageId: string, matchNumber: number }) {
    return fetch(`https://statlocker.gg/api/public-draft/draft`, {
        method: "POST",
        headers: {
            "X-API-Key": process.env.NEXT_PUBLIC_STATLOCKER_API as string,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            team1,
            team2,
            draftSettings: {
                draftName,
                timerType: "HYBRID",
                stepTimeSeconds: 30,
                reserveTimeSeconds: 120,
                preset: "COMPETITIVE",
                lobbyType: "COMP",
            },
            // Scrimmage id + match number are baked into the callback path so the webhook
            // handler knows which scrim room (and which match within it) to broadcast the
            // event to without having to look up the draft by code first — drafts are
            // created per match, not per scrimmage.
            callbackUrl: constructURL(`/api/statlocker/draft-events/${scrimmageId}/${matchNumber}`)
        })
    }).then(res => res.json()).catch(err => console.log(err)) as Promise<{ draftCode: string, draftUrl: string }>
}
