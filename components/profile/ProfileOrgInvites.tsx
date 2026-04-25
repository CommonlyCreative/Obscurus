"use client";

import { useTransition } from "react";
import Link from "next/link";
import { ArrayElement, cn } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import {
    acceptProfileOrgInviteAction,
    declineProfileOrgInviteAction,
} from "@/app/profile/[id]/actions";
import { OrgMemberStatus, UserProfileQuery } from "@/app/api/graphql/types/graphql";

type OrgInvite = NonNullable<ArrayElement<NonNullable<UserProfileQuery["getUserOrgInvitations"]>>>;

function InviteCard({ invite, profileId }: { invite: OrgInvite; profileId: string }) {
    const [acceptPending, startAccept] = useTransition();
    const [declinePending, startDecline] = useTransition();
    const isPending = acceptPending || declinePending;
    const nonInvitedMembers = invite.members.filter(member => member.status !== OrgMemberStatus.Invited);

    return (
        <div className="flex items-center justify-between gap-4 px-5 py-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">
                        Invited to{" "}
                        <Link
                            href={`/org/${invite.slug}`}
                            className="text-primary hover:underline"
                        >
                            {invite.name}
                        </Link>
                    </p>
                    <span className="text-[10px] font-mono text-muted">[{invite.slug}]</span>
                </div>
                <p className="text-xs text-muted mt-0.5">
                    {nonInvitedMembers.length} member{nonInvitedMembers.length !== 1 ? "s" : ""}
                </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <Link
                    href={`/org/${invite.slug}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-md border border-edge text-muted hover:text-foreground hover:border-foreground/20 transition-colors"
                >
                    View Org
                </Link>
                <Button
                    variant="secondary"
                    className="text-danger border-danger/20 hover:border-danger/40 px-3"
                    onClick={() =>
                        startDecline(() => declineProfileOrgInviteAction(invite._id, profileId))
                    }
                    disabled={isPending}
                >
                    {declinePending ? "Declining…" : "Decline"}
                </Button>
                <Button
                    onClick={() =>
                        startAccept(() => acceptProfileOrgInviteAction(invite._id, profileId))
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

export function ProfileOrgInvites({
    invites,
    profileId,
}: {
    invites: OrgInvite[];
    profileId: string;
}) {
    if (invites.length === 0) return null;

    return (
        <div className="mb-6 space-y-2">
            {invites.map(invite => (
                <InviteCard key={invite._id} invite={invite} profileId={profileId} />
            ))}
        </div>
    );
}
