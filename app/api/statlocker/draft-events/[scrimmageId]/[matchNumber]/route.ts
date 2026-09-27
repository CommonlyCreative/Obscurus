import { NextRequest, NextResponse } from "next/server";
import { broadcastDraftEvent } from "@/lib/socket/draft";

// Statlocker calls this back with draft update events. The exact event shapes aren't
// documented yet, so for now this just logs and relays whatever it receives — the
// scrim room's UI shows the raw payload (see ScrimDetail.tsx's "Last Draft Event"
// debug panel) so we can figure out the real shape before wiring up persistence.
// Drafts are created per match, so the match number is part of the callback path.
export async function POST(request: NextRequest, { params }: { params: Promise<{ scrimmageId: string; matchNumber: string }> }) {
    const { scrimmageId, matchNumber } = await params;
    const body = await request.json();
    console.log("Statlocker draft event", scrimmageId, matchNumber, body);

    await broadcastDraftEvent(scrimmageId, Number(matchNumber), body);

    return NextResponse.json({ ok: true });
}
