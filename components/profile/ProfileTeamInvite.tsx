"use client";

import { useEffect, useState, useTransition } from "react";
import { socket } from "@/lib/socket/socket-client";
import { Button } from "@/components/shared/Button";
import { notifyTeamInviteResponseAction } from "@/app/profile/[id]/actions";
import { LiveTeam } from "@/lib/socket/teams";
import { findInvites, isActiveMember, useTeamSocket } from "@/hooks/useTeamSocket";


function InviteCard({
    invite,
    userName,
    userMmr,
    profileId,
}: {
    invite: LiveTeam;
    userName: string;
    userMmr: number;
    profileId: string;
}) {
    const [acceptPending, startAccept] = useTransition();
    const [declinePending, startDecline] = useTransition();
    const isPending = acceptPending || declinePending;

    async function respond(accepted: boolean) {
        const notification = await notifyTeamInviteResponseAction(
            invite.leaderId,
            accepted,
            profileId,
        );

        if (notification) {
            socket.emit("notify", notification);
        }

        socket.emit(
            "team:invite:respond",
            accepted,
            invite.leaderId,
        );

    }

    const leaderName = invite.members.find(m => m.userId === invite.leaderId)?.name;

    return (
        <div className="flex items-center justify-between gap-4 px-5 py-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                    <span className="text-primary">{leaderName ?? "Someone"}</span> invited you to join their team
                </p>
                <p className="text-xs text-muted mt-0.5">
                    {invite.name} · {invite.members.filter(member => member.status === "JOINED").length}/{invite.maxSize} players
                </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <Button
                    variant="secondary"
                    className="text-danger border-danger/20 hover:border-danger/40 px-3"
                    onClick={() => startDecline(() => respond(false))}
                    disabled={isPending}
                >
                    {declinePending ? "Declining…" : "Decline"}
                </Button>
                <Button
                    onClick={() => startAccept(() => respond(true))}
                    disabled={isPending}
                    className="px-3"
                >
                    {acceptPending ? "Accepting…" : "Accept"}
                </Button>
            </div>
        </div>
    );
}

export function ProfileTeamInvite({
    userName,
    userMmr,
    profileId,
}: {
    userName: string;
    userMmr: number;
    profileId: string;
}) {
    const { teams: socketTeams } = useTeamSocket([profileId])
    const teams = findInvites(socketTeams, profileId)


    if (teams.length === 0) return null;

    return (
        <div className="mb-6 space-y-2">
            {teams.map(invite => (
                <InviteCard
                    key={invite.leaderId}
                    invite={invite}
                    userName={userName}
                    userMmr={userMmr}
                    profileId={profileId}
                />
            ))}
        </div>
    );
}
