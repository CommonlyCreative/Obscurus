import { google } from "googleapis";

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

