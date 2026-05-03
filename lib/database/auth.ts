import { betterAuth, BetterAuthOptions } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin, customSession } from "better-auth/plugins";
import { Role } from "@/app/api/graphql/server";
import { client, db } from "./mongo";

const options = {
    plugins: [admin()],
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: mongodbAdapter(db, { client }),

    socialProviders: {
        discord: {
            prompt: "consent",
            clientId: process.env.DISCORD_ID!,
            clientSecret: process.env.DISCORD_SECRET!,
        },
        google: {
            prompt: "consent",
            accessType: "offline",
            clientId: process.env.GOOGLE_ID as string,
            clientSecret: process.env.GOOGLE_SECRET as string,
            scope: ["https://www.googleapis.com/auth/calendar.readonly","https://www.googleapis.com/auth/calendar.events"],
        },
    },

    databaseHooks: {
        user: {
            create: {
                before: async (user, ctx) => {
                    return {
                        data: {
                            ...user,
                            online: true,
                            heroes: [],
                            region: "NA",
                            bio: "I'm new here! Excited to start scrimming.",
                            scrimmages: [],
                            organization: "",
                            balance: {
                                credits: 0,
                                pending: 0,
                                winnings: 0,
                            },
                            role: Role.Member,
                        }
                    }
                }
            },
        },
    },

    user: {
        additionalFields: {
            online: {
                type: "boolean",
                required: true,
                defaultValue: false,
            },
            heroes: {
                type: "number[]",
                required: true,
                defaultValue: [],
            },
            organization: {
                type: "string",
                required: true,
                defaultValue: "",
            },
            region: {
                type: "string",
                required: true,
                defaultValue: "NA",
            },
            steam: {
                type: "json",
                required: false,
            },
            bio: {
                type: "string",
                required: true,
                defaultValue: "",
            },
            scrimmages: {
                type: "string[]",
                required: true,
                defaultValue: [],
            },
            balance: {
                type: "json",
                required: true,
                defaultValue: {},
            },
            role: {
                type: "string",
                defaultValue: Role.Member,
            },
        }
    },
} satisfies BetterAuthOptions

export const auth = betterAuth({
    ...options,
    plugins: [
        ...(options.plugins ?? []),
        customSession(async ({ user, session }) => {
            return { user, session };
        }, options),
        // nextCookies() disabled: incompatible with cacheComponents — dynamic import of next/headers
        // bypasses Next.js static analysis for Suspense boundary tracking
    ],
});

export type User = typeof auth.$Infer.Session.user;