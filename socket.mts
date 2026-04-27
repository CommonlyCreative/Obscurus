import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { LiveMember, LiveTeam } from "./lib/socket/teams.js";
import { Notification, SendNotificationInput } from "./app/api/graphql/types/graphql.js";
import 'dotenv/config'
import SteamAuth from "node-steam-openid";
import cors from 'cors';

const HOST = process.env.HOSTNAME
const PORT = process.env.SOCKET_PORT;
const CLIENT_PORT = process.env.PORT;
const dev = process.env.NODE_ENV !== 'production'

const url = HOST + (dev ? `:${CLIENT_PORT}` : '');

const steam = new SteamAuth({
    realm: url, // Site name displayed to users on logon
    returnUrl: `${url}/auth/steam/authenticate`, // Your return route
    apiKey: String(process.env.STEAM_API_KEY), // Steam API key
});



const app = express();
app.use(express.json());
app.use(cors({ origin: url }))

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: url,
        methods: ["GET", "POST"],
    },
});

app.get("/auth/steam", async (req, res) => {
    const redirectUrl = await steam.getRedirectUrl();
    return res.redirect(redirectUrl);
});

app.get("/auth/steam/authenticate", async (req, res) => {
    try {
        const user = await steam.authenticate(req);

        const avatar = user.avatar.large ? user.avatar.large : user.avatar.medium ? user.avatar.medium : user.avatar.small;

        const queryString = new URLSearchParams({ steamId: user.steamid, username: user.username, avatar }).toString();

        return res.redirect(process.env.BETTER_AUTH_URL + "/api/steam?" + queryString);
    } catch (error) {
        console.error("Error", error);
    }
});

const connectedUsers: Record<string, string> = {}; // userId → socketId
const socketUsers = new Map<string, string>();      // socketId → userId
const disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>(); // userId → cleanup timer

const TEAM_GRACE_PERIOD_MS = 30_000;

io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);

    socket.on("login", (userId: string) => {
        if (!userId) return;

        if (socket.id === connectedUsers[userId]) return;

        if (connectedUsers[userId]) {
            console.log(`User ${userId} already connected, disconnecting old socket`);
            io.sockets.sockets.get(connectedUsers[userId])?.disconnect();
            delete connectedUsers[userId];
        }

        console.log(`User ${userId} joining room`);
        connectedUsers[userId] = socket.id;
        socketUsers.set(socket.id, userId);
        socket.join(`profile:${userId}`);

        const pending = disconnectTimers.get(userId);
        if (pending) {
            clearTimeout(pending);
            disconnectTimers.delete(userId);
        }
    });

    setupTeamSocket(io, socket);
    setupScrimSocket(io, socket);

    socket.on("notify", (notification: Notification) => {
        if (!notification) return;
        const socketId = connectedUsers[notification.recipient];
        io.in(socketId).emit("notify", notification)
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        const userId = socketUsers.get(socket.id);
        if (userId) delete connectedUsers[userId];
        socketUsers.delete(socket.id);
    });
});

const liveTeams = new Map<string, LiveTeam>();

function broadcastTeamUpdateById(io: Server, memberId: string) {
    const team = getTeam(memberId);
    broadcastTeamUpdate(io, team?.members.map(member => member.userId) ?? [memberId], team)
}

function broadcastTeamUpdateByTeam(io: Server, team: LiveTeam) {
    broadcastTeamUpdate(io, team.members.map(member => member.userId), team)
}

function broadcastTeamUpdate(io: Server, members: string[], update: LiveTeam | null) {
    const rooms = new Set([] as string[]);
    for (const member of members) {
        rooms.add(`profile:${member}`);

        io.to(`profile:${member}`).emit("team:update", update, member);
    }
    io.to(AllTeams).emit("team:update", update, "all");
}

function removeFromAllTeams(io: Server, userId: string, silent?: boolean) {
    if (liveTeams.has(userId)) {
        const team = liveTeams.get(userId)!
        liveTeams.delete(userId);
       if (!silent)  broadcastTeamUpdate(io, team.members.map(member => member.userId), null);
        return;
    }
    for (const [leaderId, team] of liveTeams.entries()) {
        const idx = team.members.findIndex((m) => m.userId === userId);
        if (idx !== -1) {
            const removed = team.members.splice(idx, 1);
            if (!silent) broadcastTeamUpdate(io, team.members.concat(removed).map(member => member.userId), team);
            return;
        }
    }
}

const AllTeams = `teams:all`;

function getTeam(user_id: string) {
    return liveTeams.get(user_id) ??
        Array.from(liveTeams.values()).find(t => t.members.some(m => m.userId === user_id)) ??
        null;
}

export function setupTeamSocket(
    io: Server,
    socket: Socket
) {
    socket.on(
        "team:create",
        (info: Omit<LiveMember, "userId">, teamName: string) => {
            const userId = socketUsers.get(socket.id);
            if (!userId) return;

            removeFromAllTeams(io, userId);
            liveTeams.set(userId, {
                name: teamName,
                leaderId: userId,
                members: [{ ...info, userId }],
                maxSize: 6,
            });
            broadcastTeamUpdateById(io, userId);
        }
    );

    socket.on("team:subscribe", (targetUserIds: string[] | "all") => {
        if (targetUserIds === "all") {
            socket.join(AllTeams);
            io.to(AllTeams).emit("team:multiple", Object.fromEntries(liveTeams))
            return;
        }
        for (const userId of targetUserIds) {
            socket.join(`profile:${userId}`)
            const team = getTeam(userId)
            io.to(`profile:${userId}`).to(AllTeams).emit("team:state", team, userId, team?.leaderId);
        }
    });

    socket.on("team:unsubscribe", (targetUserIds: string[] | "all") => {
        if (targetUserIds === "all")
            return socket.leave(AllTeams);
        for (const userId of targetUserIds)
            socket.leave(`profile:${userId}`);
    });

    socket.on("team:rename", (newName: string) => {
        const userId = socketUsers.get(socket.id);
        if (!userId) return;
        const team = liveTeams.get(userId);
        if (!team) return;
        team.name = newName;
        broadcastTeamUpdateById(io, userId);
    });

    socket.on("team:leave", () => {
        const userId = socketUsers.get(socket.id);
        if (!userId) return;
        removeFromAllTeams(io, userId);
    });

    socket.on("teams:list", () => {
        socket.emit("teams:listed", Array.from(liveTeams.values()));
    });

    socket.on("team:fill", () => {
        const userId = socketUsers.get(socket.id);
        if (!userId) return;
        const team = liveTeams.get(userId);
        if (!team) return;
        for (let i = 0; i < team.maxSize; i++) {
            if (team.members.length >= team.maxSize) break;
            team.members.push(createFillerMember("Member " + (i + 1)))
        }
        broadcastTeamUpdateByTeam(io, team)
    });

    socket.on("team:invite", async (member: LiveMember) => {
        const leaderId = socketUsers.get(socket.id);
        if (!leaderId) return;
        const team = liveTeams.get(leaderId);
        if (!team || team.members.length >= team.maxSize) return;
        if (team.members.some(m => m.userId === member.userId)) return;

        if (team && team.members.length < team.maxSize) {
            team.members.push(member);
            broadcastTeamUpdateByTeam(io, team);
        }
        io.to(`user:${member.userId}`).emit("team:invite", team);
    });

    socket.on("team:kick", (targetUserId: string) => {
        const userId = socketUsers.get(socket.id);
        if (!userId) return;
        if (!liveTeams.has(userId)) return; // only the leader can kick
        removeFromAllTeams(io, targetUserId);
    });

    socket.on("team:invite:respond", (accepted: boolean, leaderId: string) => {
        const userId = socketUsers.get(socket.id);
        if (!userId) return;

        const team = liveTeams.get(leaderId);
        if (!team) return;
        const member = team.members.find(m => m.userId === userId)

        removeFromAllTeams(io, userId);

        if (accepted&&member) {
            team.members.push({ ...member, status: "JOINED"})
        } else
            io.to(`profile:${userId}`).emit("team:update", team, userId);

        broadcastTeamUpdateByTeam(io, team);
    });

    socket.on("disconnect", () => {
        const userId = socketUsers.get(socket.id);
        if (!userId) return;

        const existing = disconnectTimers.get(userId);
        if (existing) clearTimeout(existing);

        const timer = setTimeout(() => {
            removeFromAllTeams(io, userId);
            disconnectTimers.delete(userId);
        }, TEAM_GRACE_PERIOD_MS);

        disconnectTimers.set(userId, timer);
    });
}

interface ScrimPatch {
    status: string;
    result: string | null;
    readyHost: boolean;
    readyOpponent: boolean;
    partyCode: string | null;
    matches: Array<{
        number: number;
        match_id: string | null;
        result: string | null;
        startedAt: number;
        concludedAt: number | null;
    }>;
}

function setupScrimSocket(_io: Server, socket: Socket) {
    socket.on("scrim:subscribe", (scrimmageId: string) => {
        socket.join(`scrim:${scrimmageId}`);
    });

    socket.on("scrim:unsubscribe", (scrimmageId: string) => {
        socket.leave(`scrim:${scrimmageId}`);
    });

    socket.on("scrim:patch", (scrimmageId: string, patch: ScrimPatch) => {
        socket.broadcast.to(`scrim:${scrimmageId}`).emit("scrim:patch", patch);
    });

    socket.on("scrim:refresh", (scrimmageId: string) => {
        socket.broadcast.to(`scrim:${scrimmageId}`).emit("scrim:refresh");
    });
}

httpServer.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV ?? "development"} mode on port ${PORT}`);
});

const createFillerMember: (name: string) => LiveMember = (name: string) => ({
    name,
    mmr: 1,
    status: "JOINED",
    userId: name + "-id"
})
