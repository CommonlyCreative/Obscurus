"use server";

import { grafbase } from "@/lib/database/grafbase";
import { graphql } from "../../api/graphql/types";
import { BestOf, InvitationType, MatchSide } from "@/app/api/graphql/types/graphql";
import { checkForOverlap, getGoogleClient } from "@/lib/google";
import { calendar_v3, google } from "googleapis";
import { db } from "@/lib/database/mongo";
import { auth } from "@/lib/database/auth";
import { headers } from "next/headers";
import { ObjectId, WithId } from "mongodb";
import { ENDTIME_CONVERSION } from "@/components/scrims/CreateScrimForm";


const CreateScrimMutation = graphql(`
  mutation CreateScrim($input: CreateScrimmageInput!) {
    createScrimmage(input: $input) {
      _id
    }
  }
`);

const GetTargetOrgQuery = graphql(`
  query GetTargetOrg($user_id: String!) {
    getUser(user_id: $user_id) {
      organization { _id name }
    }
  }
`);

export interface CreateScrimPayload {
    note: string;
    isPrivate: boolean;
    wagerAmount: number;
    host_id: string;
    hostOrgId: string | null;
    orgAffiliated: boolean;
    roster: string[];
    targetLeaderId: string | null;
    opponentOrg_id: string | null;
    scheduledAt: number | null;
    bestOf: BestOf;
}

export async function getOrganization(user_id: string | undefined) {
    let org = undefined;
    if (user_id) {
        const { getUser: user } = await grafbase.request(GetTargetOrgQuery, { user_id });
        org = user?.organization;
    }
    return org
}

export async function createScrimmageAction(payload: CreateScrimPayload) {

    const { createScrimmage } = await grafbase.request(CreateScrimMutation, {
        input: {
            team: payload.roster,
            note: payload.note || undefined,
            isPrivate: payload.isPrivate,
            host_id: payload.host_id,
            hostOrg_id: payload.hostOrgId ?? undefined,
            scheduledAt: payload.scheduledAt ?? undefined,
            wagerAmount: payload.wagerAmount,
            bestOf: payload.bestOf,
            opponentOrg_id: payload.opponentOrg_id,
            invitations: payload.targetLeaderId ? [{ user_id: payload.targetLeaderId, side: MatchSide.Opponent, type: InvitationType.LeaderInvite }] : [],
        },
    });

    return createScrimmage;
}

export type CalendarEvent = {
    id: string;
    title: string;
    start: string;
    end: string;
    allDay: boolean;
    htmlLink: string;
};

export type CalendarResult =
    | { connected: false; error?: string }
    | { connected: true; events: CalendarEvent[] };

export async function getCalendarInfo(): Promise<CalendarResult> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { connected: false };

    const account = await db.collection("account").findOne(
        { userId: new ObjectId(session.user.id), providerId: "google" }
    ) as WithId<{ accessToken: string, refreshToken: string }> | null;
    if (!account) return { connected: false };

    try {
        const googleAuth = getGoogleClient(account.accessToken, account.refreshToken);
        const calendar = google.calendar({ version: "v3", auth: googleAuth });

        const response = await calendar.events.list({
            calendarId: "primary",
            timeMin: new Date().toISOString(),
            timeMax: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            maxResults: 50,
            singleEvents: true,
            orderBy: "startTime",
        });

        const items = response.data.items ?? [];
        return {
            connected: true,
            events: items.map(e => ({
                id: e.id ?? "",
                title: e.summary ?? "Untitled event",
                start: e.start?.dateTime ?? e.start?.date ?? "",
                end: e.end?.dateTime ?? e.end?.date ?? "",
                allDay: !e.start?.dateTime,
                htmlLink: e.htmlLink ?? "https://calendar.google.com",
            })),
        };
    } catch {
        return { connected: false, error: "Failed to load calendar. Your Google token may have expired — try reconnecting." };
    }
}


export async function insertCalendarInfo({ summary, startTime, endTime, timeZone }: { summary: string, startTime: string, endTime: string, timeZone: string }): Promise<{ success: boolean, response: string } | undefined> {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) return;
    const account = await db.collection("account").findOne({ userId: new ObjectId(session.user.id), providerId: "google" }) as WithId<{ accessToken: string, refreshToken: string }> | null
    if (!account) return;
    const googleAuth = getGoogleClient(account.accessToken, account.refreshToken);
    const calendar = google.calendar({ version: 'v3', auth: googleAuth });

    const overlap = await checkForOverlap(calendar, { startTime, endTime });

    if (overlap.hasConflict) {
        const errorMessage = overlap.conflictingEvents.map(event => event.title).join(", ");
        return { success: false, response: "Conflicting events: " + errorMessage }
    }

    const event = {
        summary,               // Event title
        start: {
            dateTime: startTime,    // e.g. "2026-05-01T10:00:00-05:00"
            timeZone,         // e.g. "America/Chicago"
        },
        end: {
            dateTime: endTime,
            timeZone,
        },
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 10 },
            ],
        },
    };

    const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
    });

    if (response.status !== 200) {
        return { success: false, response: "An unknown error occured" }
    }
    return { success: true, response: "Event was successfully created." };
}

export async function createGoogleScrimmageEvent(scheduledAt: Date, teamName: string, bestOf: BestOf) {
    const endTime = new Date(scheduledAt.getTime() + ENDTIME_CONVERSION[bestOf])
    const response = await insertCalendarInfo({
        summary: "Scrimmage vs. " + teamName,
        startTime: scheduledAt.toISOString(),
        endTime: endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })

    if (response && !response.success) {
        throw Error(response.response)
    }
}