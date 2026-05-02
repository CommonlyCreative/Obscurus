"use server"
import { cache } from "react"
import { StatlockerBatchProfile, StatlockerProfile } from "../types/deadlock/statlocker"

export type APILimit = {
    match_id: string
    reset_in: number
    remaining: number
    limit: number
    last_request: number
    past_request: number[]
}

export async function getStatlockerRank(steam_id: string): Promise<StatlockerProfile> {
    const res = await fetch(`https://statlocker.gg/api/profile/aggregate-stats/${steam_id}`, {
        headers: { "X-API-Key": process.env.NEXT_PUBLIC_STATLOCKER_API as string },
    });
    return res.json();
}

export async function getStatlockerRanks(steam_ids: string[]): Promise<StatlockerBatchProfile[]> {
    const res = await fetch(`https://statlocker.gg/api/profile/batch-profiles`, {
        method: "POST",
        headers: {
            "X-API-Key": process.env.NEXT_PUBLIC_STATLOCKER_API as string,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(steam_ids.slice(0, 100)),
    });
    return res.json();
}

export const createStatlockerDraft = cache(async () => {
    return fetch(`https://statlocker.gg/api/public-draft/draft`, {
        method: "POST",
        headers: {
            "X-API-Key": process.env.NEXT_PUBLIC_STATLOCKER_API as string,
            "Content-Type": "application/json"
        },
    }).then(res => res.json()).catch(err => console.log(err)) as Promise<any>
})
