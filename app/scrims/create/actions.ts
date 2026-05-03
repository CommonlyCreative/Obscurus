"use server";

import { grafbase } from "@/lib/database/grafbase";
import { graphql } from "../../api/graphql/types";
import { BestOf, InvitationType, MatchSide } from "@/app/api/graphql/types/graphql";
import { getGoogleClient } from "@/lib/google";
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
            invitations: payload.targetLeaderId ? [{ user_id: payload.targetLeaderId, organization_id: payload.opponentOrg_id, side: MatchSide.Opponent, type: InvitationType.LeaderInvite }] : [],
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

export async function checkGoogleAvailability({ startTime, endTime }: { startTime: string, endTime: string }) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) return;
    const calendar = await getGoogleCalendar(session.user.id);

    if (!calendar) return;

    return await calendarOverlapCheck(calendar, { startTime, endTime });
}

export async function calendarOverlapCheck(calendar: calendar_v3.Calendar, { startTime, endTime }: { startTime: string, endTime: string }) {
    const response = await calendar.events.list({
        calendarId: "primary",
        timeMin: startTime,   // only fetch events within the exact window
        timeMax: endTime,
        singleEvents: true,       // expand recurring events so none are missed
        orderBy: 'startTime',
    })

    const existingEvents = response.data.items ?? [];

    const conflictingEvents = existingEvents.filter(event => {
        const existingStart = event.start?.dateTime ?? event.start?.date;
        const existingEnd = event.end?.dateTime ?? event.end?.date;

        return doesOverlap(existingStart, existingEnd, startTime, endTime);
    });
    return {
        hasConflict: conflictingEvents.length > 0,
        conflictingEvents: conflictingEvents.map(e => ({
            id: e.id,
            title: e.summary,
            start: e.start?.dateTime ?? e.start?.date,
            end: e.end?.dateTime ?? e.end?.date,
        })),
    };
}

function doesOverlap(existingStart: string | undefined | null, existingEnd: string | undefined | null, newStart: string, newEnd: string) {
    if (!existingStart || !existingEnd) return false;
    return new Date(existingStart) < new Date(newEnd) &&
        new Date(existingEnd) > new Date(newStart);
}

async function getGoogleCalendar(user_id: string) {
    const account = await db.collection("account").findOne({ userId: new ObjectId(user_id), providerId: "google" }) as WithId<{ accessToken: string, refreshToken: string }> | null
    if (!account) return;
    const googleAuth = getGoogleClient(account.accessToken, account.refreshToken);
    return google.calendar({ version: 'v3', auth: googleAuth });
}

async function getGoogleCalendars() {
    const accounts = await db.collection("account").find({ providerId: "google" }).toArray() as (WithId<{ accessToken: string, refreshToken: string }>)[]
    return accounts.map(account => {
        const googleAuth = getGoogleClient(account.accessToken, account.refreshToken);
        return google.calendar({ version: 'v3', auth: googleAuth });
    })
}

export async function insertCalendarInfo({ id, summary, startTime, endTime, timeZone }: { id: string, summary: string, startTime: string, endTime: string, timeZone: string }): Promise<{ success: boolean, response: string } | undefined> {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) return;
    const calendar = await getGoogleCalendar(session.user.id);

    if (!calendar) return;

    const overlap = await calendarOverlapCheck(calendar, { startTime, endTime });

    if (overlap.hasConflict) {
        const errorMessage = overlap.conflictingEvents.map(event => event.title).join(", ");
        return { success: false, response: "Conflicting events: " + errorMessage }
    }

    const event = {
        id,
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
    } as calendar_v3.Schema$Event;

    const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
    });


    if (response.status !== 200) {
        return { success: false, response: "An unknown error occured" }
    }
    return { success: true, response: "Event was successfully created." };
}

export async function createGoogleScrimmageEvent(id: string, teamName: string, scheduledAt: Date, projectedEndTime: Date) {
    const response = await insertCalendarInfo({
        id,
        summary: "Scrimmage vs. " + teamName,
        startTime: scheduledAt.toISOString(),
        endTime: projectedEndTime.toISOString(),
        timeZone: "UTC",
    })

    if (response && !response.success) {
        throw Error(response.response)
    }
}

export async function deleteGoogleScrimmageEvent(scrimmage_id: string) {
    const calendars = await getGoogleCalendars()

    await Promise.allSettled(calendars.map(calendar => {
        try {
            calendar.events.delete({ eventId: scrimmage_id, calendarId: "primary" })
        } catch (err) {}
    }))
}