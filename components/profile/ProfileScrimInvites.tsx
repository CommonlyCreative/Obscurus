"use client";

import { useTransition } from "react";
import Link from "next/link";
import { ArrayElement, cn, formatTimeAgo } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import {
    acceptScrimInviteAction,
    declineScrimInviteAction,
} from "@/app/profile/[id]/actions";
import { MatchSide, UserProfileQuery } from "@/app/api/graphql/types/graphql";

type ScrimInvite = ArrayElement<UserProfileQuery["getScrimmageInvitations"]>;

function ScrimInviteCard({ invite, profileId }: { invite: ScrimInvite; profileId: string }) {
    const [acceptPending, startAccept] = useTransition();
    const [declinePending, startDecline] = useTransition();
    const isPending = acceptPending || declinePending;

    const { scrimmage, side } = invite;
    const hostLabel = scrimmage.hostOrg
        ? scrimmage.hostOrg.name
        : scrimmage.host.name;
    const hostHref = scrimmage.hostOrg
        ? `/org/${scrimmage.hostOrg.slug}`
        : undefined;

    return (
        <div className="flex items-center justify-between gap-4 px-5 py-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">
                        Scrimmage invite from{" "}
                        {hostHref ? (
                            <Link href={hostHref} className="text-primary hover:underline">
                                {hostLabel}
                            </Link>
                        ) : (
                            <span className="text-primary">{hostLabel}</span>
                        )}
                    </p>
                    <span className="text-[10px] font-mono text-muted">
                        [{side === MatchSide.Host ? "HOST" : "OPPONENT"}]
                    </span>
                </div>
                <p className="text-xs text-muted mt-0.5">
                    {scrimmage.scheduledAt
                        ? `Scheduled ${formatTimeAgo(new Date(scrimmage.scheduledAt))}`
                        : "ASAP"}
                </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <Link
                    href={`/scrims/${scrimmage._id}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-md border border-edge text-muted hover:text-foreground hover:border-foreground/20 transition-colors"
                >
                    View Scrim
                </Link>
                <Button
                    variant="secondary"
                    className="text-danger border-danger/20 hover:border-danger/40 px-3"
                    onClick={() =>
                        startDecline(() => declineScrimInviteAction(invite._id, profileId))
                    }
                    disabled={isPending}
                >
                    {declinePending ? "Declining…" : "Decline"}
                </Button>
                <Button
                    onClick={() =>
                        startAccept(() => acceptScrimInviteAction(invite._id, profileId))
                    }
                    disabled={isPending}
                    className="px-3"
                >
                    {acceptPending ? "Accepting…" : "Accept"}
                </Button>
            </div>
        </div>
    );
}

export function ProfileScrimInvites({
    invites,
    profileId,
}: {
    invites: ScrimInvite[];
    profileId: string;
}) {
    if (invites.length === 0) return null;

    return (
        <div className="mb-6 space-y-2">
            {invites.map(invite => (
                <ScrimInviteCard key={invite._id} invite={invite} profileId={profileId} />
            ))}
        </div>
    );
}
