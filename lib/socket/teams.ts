import { socket } from "./socket-client";

export interface LiveMember {
    userId: string;
    name: string;
    status: "INVITED" | "JOINED";
    mmr: number;
}

export interface LiveTeam {
    name: string,
    leaderId: string;
    members: LiveMember[];
    maxSize: number;
}

export const createFillerMember: (name: string) => LiveMember  = (name: string) => ({
        name,
        mmr: 1,
        status: "JOINED",
        userId: name+"-id"
    })

export function createSocketTeam(memeber: Omit<LiveMember, "userId">, teamName: string) {
    socket.emit("team:create", memeber, teamName);
}

export function renameSocketTeam(name: string) {
    socket.emit("team:rename", name);
}


export default { createFillerMember }