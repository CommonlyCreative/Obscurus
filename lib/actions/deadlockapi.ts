import { cache } from "react"
import { DeadlockHero } from "../types/deadlock/heroes"
import { DeadlockMatch } from "../types/deadlock/match"
import { deleteLimit, getAPILimit, updateLimit } from "@/app/scrims/[id]/actions"

export type APILimit = {
    match_id: string
    reset_in: number
    remaining: number
    limit: number
    last_request: number
    past_request: number[]
}

function convertMStoTime(ms: number) {
    const hours = Math.floor(ms / (60*60*1000))
    const minutes = Math.floor(ms / (60*1000) % 60)
    const seconds = Math.floor(ms / (1000) % 60)

    const h = hours > 0 ? `${hours}h ` :""
    const m = minutes > 0 ? `${minutes}m ` :""
    return `${h}${m}${Math.floor(seconds)}s`;
}

export const getMatch = cache(async (match_id: string, now: number) => {
    const apiLimit = await getAPILimit(match_id)
    if (apiLimit) {
        const { limit, remaining, reset_in, last_request, past_request } = apiLimit;
        const nextReset = last_request + reset_in;
        const delay = nextReset - now;
        const rollingHourRequest = past_request.filter(request => request < now - (60 * 60 * 1000));
        if (remaining === 0 && delay > 0) return { errorMessage: "No more remaining attempts. Resetting in: " + convertMStoTime(delay) } as any;

        if (rollingHourRequest.length >= limit - 1) return { errorMessage: "Please wait to send another request: " + ((rollingHourRequest.at(0) ?? 0) / 1000)} as any;
    }
    await deleteLimit(match_id)
    return fetch(`https://api.deadlock-api.com/v1/matches/${match_id}/metadata`, {
        next: {
            revalidate: 3600,
        }
    }).then(async res => {
        const body = await res.json()
        if (body.error) {
            if (!body.error.quota) return { errorMessage: `An unknown error occured when retrieving match ${match_id}: ${JSON.stringify(body.error)}` } as any;
            const { quota: { limit, period }, remaining, request } = body.error as { quota: { limit: number, period: number }, remaining: number, request: number };

            const last_request = Date.now();

            const allRequest = [] as number[];

            if (apiLimit) allRequest.concat(apiLimit.past_request);

            allRequest.push(last_request)

            const past_request = allRequest.filter(request => request < last_request - (60 * 60 * 1000))

            const reset_in = ((past_request.at(0) ?? last_request) + 60*60*1000)-last_request;

            await updateLimit({ match_id, limit, remaining, reset_in, last_request, past_request })
        }
        return body;
    }) as Promise<DeadlockMatch>
})

export const testMatch = cache(async (match_id: string) => {
    return fetch(`https://api.deadlock-api.com/v1/matches/${match_id}/metadata`)
})

export const getItem = cache(async (item_id: string | number) => {
    return fetch(`https://assets.deadlock-api.com/v2/items/${item_id}`, {
        next: {
            revalidate: 3600,
        }
    }).then(res => res.json()).catch(err => console.log(err)) as Promise<any>
})

export const getHero = cache(async (hero_id: string | number) => {
    return fetch(`https://assets.deadlock-api.com/v2/heroes/${hero_id}`, {
        next: {
            revalidate: 3600,
        }
    }).then(res => res.json()).catch(err => console.log(err)) as Promise<any>
})

export const getHeroes = cache(async () => {
    return fetch(`https://assets.deadlock-api.com/v2/heroes`, {
        next: {
            revalidate: 3600,
        }
    }).then(res => res.json()).catch(err => console.log(err)) as Promise<DeadlockHero[]>
})