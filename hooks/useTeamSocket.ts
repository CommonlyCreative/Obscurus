"use client";

import { useEffect, useState } from "react";
import type { LiveTeam } from "@/lib/socket/teams";
import { socket } from "@/lib/socket/socket-client";

export function useTeamSocket(targetUserIds: string[] | "all", debug?: boolean) {
    const [liveTeams, setLiveTeams] = useState<LiveTeam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (targetUserIds.length === 0) {
            setLoading(false);
            return;
        }

        socket.emit("team:subscribe", targetUserIds);

        const handleMultiple = (teams: Record<string, LiveTeam | null>) => {
            if (debug) console.log("MULTIPLE", teams, targetUserIds)
            if (targetUserIds !== "all") return;
            setLiveTeams(list => {
                const updated = [...list]
                Object.entries(teams).forEach(entry => {
                    const index = updated.findIndex(team => isMember(team, entry[0]));
                    if (index !== -1) {
                        if (entry[1])
                            updated[index] = entry[1]; // Replaces the object at that index
                        else updated.splice(index, 1)
                    } else if (entry[1]) updated.push(entry[1])
                })
                return updated;
            });
            setLoading(false);
        };

        const handleState = (team: LiveTeam | null, userId: string) => {
            if (debug) console.log("STATE", team, userId, targetUserIds)
            if (targetUserIds !== "all" && !targetUserIds.includes(userId)) return;
            setLiveTeams(list => {
                const updated = [...list]
                const index = updated.findIndex(team => isMember(team, userId));
                if (index !== -1) {
                    if (team)
                        updated[index] = team; // Replaces the object at that index
                    else updated.splice(index, 1)
                } else if (team) updated.push(team);
                return updated;
            });
            setLoading(false);
        };
        const handleUpdate = (team: LiveTeam | null, userId: string) => {
            if (debug) console.log("UPDATE", team, userId, targetUserIds)
            if (targetUserIds !== "all" && !targetUserIds.includes(userId)) return;
            setLiveTeams(list => {
                const updated = [...list]
                const index = updated.findIndex(team => isMember(team, userId));
                if (index !== -1) {
                    if (team)
                        updated[index] = team; // Replaces the object at that index
                    else updated.splice(index, 1)
                } else if (team) updated.push(team);
                return updated;
            });
        };

        socket.on("team:state", handleState);
        socket.on("team:multiple", handleMultiple);
        socket.on("team:update", handleUpdate);

        return () => {
            socket.emit("team:unsubscribe", targetUserIds);
            socket.off("team:state", handleState);
            socket.off("team:update", handleUpdate);
        };

    }, [JSON.stringify(targetUserIds)])

    return { teams: liveTeams, loading };
}

export function isMember(team: LiveTeam, memberId: string) {
    return team.members.some(member => member.userId === memberId)
}

export function isActiveMember(team: LiveTeam, memberId: string) {
    return team.members.some(member => member.userId === memberId&&member.status === "JOINED")
}

export function isInvitedMember(team: LiveTeam, memberId: string) {
    return team.members.some(member => member.userId === memberId&&member.status === "INVITED")
}

export function getMember(team: LiveTeam, memberId: string) {
    return team.members.find(member => member.userId === memberId)
}

export function findTeam(teams: LiveTeam[], memberId: string) {
    return teams.find(team => isActiveMember(team, memberId))
}

export function findInvites(teams: LiveTeam[], memberId: string) {
    return teams.filter(team => isInvitedMember(team, memberId))
}

class Teams {
    private list: LiveTeam[];
    private listeners: string[] | "all";

    constructor(listeners: string[] | "all") {
        this.list = [];
        this.listeners = listeners;
    }

    find(memberId: string) {
        return this.list.find(team => this.predicate(team, memberId));
    }

    update(team: LiveTeam | null, memberId?: string) {
        if (!team && memberId) {
            this.list = this.list.filter(team => this.predicate(team, memberId))
        } else if (team) {
            const index = this.list.findIndex(team => this.predicate(team, team.leaderId));
            if (index !== -1) {
                this.list[index] = team; // Replaces the object at that index
            } else this.list.push(team)
        }
        return this;
    }

    private predicate(team: LiveTeam, memberId: string) {
        return team.members.some(member => member.userId === memberId)
    }
}