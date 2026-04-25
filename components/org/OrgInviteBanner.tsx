"use client";

import { useTransition } from "react";
import { Button } from "@/components/shared/Button";
import { acceptOrgInviteAction, declineOrgInviteAction } from "@/app/org/[slug]/actions";

export function OrgInviteBanner({
    orgId,
    userId,
    orgName,
    slug,
}: {
    orgId: string;
    userId: string;
    orgName: string;
    slug: string;
}) {
    const [acceptPending, startAccept] = useTransition();
    const [declinePending, startDecline] = useTransition();

    return (
        <div className="flex items-center justify-between gap-4 px-5 py-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div>
                <p className="text-sm font-semibold text-foreground">
                    You've been invited to join{" "}
                    <span className="text-primary">{orgName}</span>
                </p>
                <p className="text-xs text-muted mt-0.5">
                    Accept to become an active member of this organization.
                </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <Button
                    variant="secondary"
                    className="text-danger border-danger/20 hover:border-danger/40 px-4"
                    onClick={() => startDecline(() => declineOrgInviteAction(orgId, slug))}
                    disabled={declinePending || acceptPending}
                >
                    {declinePending ? "Declining…" : "Decline"}
                </Button>
                <Button
                    onClick={() => startAccept(() => acceptOrgInviteAction(orgId, slug))}
                    disabled={acceptPending || declinePending}
                    className="px-4"
                >
                    {acceptPending ? "Accepting…" : "Accept"}
                </Button>
            </div>
        </div>
    );
}
