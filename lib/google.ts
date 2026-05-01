import { calendar_v3, google } from "googleapis";
export function getGoogleClient(access_token: string, refresh_token: string) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_ID,
        process.env.GOOGLE_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    // Set the access token directly — no full OAuth flow needed
    oauth2Client.setCredentials({ access_token, refresh_token });

    return oauth2Client;
}

export async function checkForOverlap(calendar: calendar_v3.Calendar, { startTime, endTime }: { startTime: string, endTime: string }) {
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
    if (!existingStart||!existingEnd)return false;
    return new Date(existingStart) < new Date(newEnd) &&
        new Date(existingEnd) > new Date(newStart);
}