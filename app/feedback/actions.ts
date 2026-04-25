"use server";

import { db } from "@/lib/database/mongo";
import { auth } from "@/lib/database/auth";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";

export type FeedbackType = "BUG" | "SUGGESTION" | "CRITICISM" | "OTHER";

export async function submitFeedbackAction(data: {
    type: FeedbackType;
    title: string;
    body: string;
}): Promise<void> {
    if (!data.title.trim() || !data.body.trim()) throw new Error("Title and body are required.");
    const session = await auth.api.getSession({ headers: await headers() });
    await db.collection("feedback").insertOne({
        _id: new ObjectId(),
        ...(session ? { userId: session.user.id, userName: session.user.name } : {}),
        type: data.type,
        title: data.title.trim(),
        body: data.body.trim(),
        status: "OPEN",
        createdAt: Date.now(),
        updatedAt: Date.now(),
    });
}
