import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { LiveMember, LiveTeam } from "./lib/socket/teams.js";
import 'dotenv/config'
import SteamAuth from "node-steam-openid";
import cors from 'cors';

const HOST = "http://localhost"
const PORT = 3001;

const steam = new SteamAuth({
    realm: `${HOST}:${PORT}`, // Site name displayed to users on logon
    returnUrl: `${HOST}:${PORT}/auth/steam/authenticate`, // Your return route
    apiKey: String(process.env.STEAM_API_KEY), // Steam API key
});


const app = express();
app.use(express.json());
app.use(cors({ origin: `${HOST}:${PORT}` }))

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
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

// app.get("/cors", async (req, res) => {
//     const link: string | undefined = req.query.link?.toString();
//     if (!link)return;

//     return res.send(await fetch(decodeURI(link)))
// });

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
        socket.join(`user:${userId}`);

        const pending = disconnectTimers.get(userId);
        if (pending) {
            clearTimeout(pending);
            disconnectTimers.delete(userId);
        }
    });

    setupTeamSocket(io, socket);
    setupScrimSocket(io, socket);

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        const userId = socketUsers.get(socket.id);
        if (userId) delete connectedUsers[userId];
        socketUsers.delete(socket.id);
    });
});

const liveTeams = new Map<string, LiveTeam>();

function broadcastTeamUpdate(io: Server, leaderId: string) {
    const team = liveTeams.get(leaderId) ?? null;
    const rooms = new Set([`profile:${leaderId}`]);
    if (team) {
        for (const member of team.members.filter(member => member.userId !== leaderId))
            rooms.add(`profile:${member.userId}`);
    }
    for (const room of rooms) {
        io.to(room).emit("team:update", team, leaderId);
    }
    io.to(AllTeams).emit("team:update", team, leaderId);
}

function removeFromAllTeams(io: Server, userId: string) {
    if (liveTeams.has(userId)) {
        liveTeams.delete(userId);
        broadcastTeamUpdate(io, userId);
        return;
    }
    for (const [leaderId, team] of liveTeams.entries()) {
        const idx = team.members.findIndex((m) => m.userId === userId);
        if (idx !== -1) {
            team.members.splice(idx, 1);
            broadcastTeamUpdate(io, leaderId);
            return;
        }
    }
}

const AllTeams = `teams:all`;

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
            broadcastTeamUpdate(io, userId);
        }
    );

    socket.on("team:subscribe", (targetUserIds: string[]) => {
        for (const userId of targetUserIds) {
            if (userId === "all") {
                socket.join(AllTeams);
                io.to(AllTeams).emit("team:multiple", liveTeams)
            } else {
                socket.join(`profile:${userId}`);
                const team =
                    liveTeams.get(userId) ??
                    Array.from(liveTeams.values()).find(t => t.members.some(m => m.userId === userId)) ??
                    null;
                io.to(`profile:${userId}`).to(AllTeams).emit("team:state", team, userId);
            }
        }
    });

    socket.on("team:unsubscribe", (targetUserIds: string[]) => {
        for (const userId of targetUserIds)
            if (userId === "all")
                socket.leave(AllTeams);
            else
                socket.leave(`profile:${userId}`);
    });

    socket.on("team:rename", (newName: string) => {
        const userId = socketUsers.get(socket.id);
        if (!userId) return;
        const team = liveTeams.get(userId);
        if (!team) return;
        team.name = newName;
        broadcastTeamUpdate(io, userId);
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
        broadcastTeamUpdate(io, team.leaderId)
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
    console.log(`Socket.IO server running on http://localhost:${PORT}`);
});

const createFillerMember: (name: string) => LiveMember = (name: string) => ({
    name,
    mmr: 1,
    role: "Fill",
    userId: name + "-id"
})
