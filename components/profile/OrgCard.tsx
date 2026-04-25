"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { OrgRole, OrgMemberStatus, BestOf, ScrimmageStatus } from "@/app/api/graphql/types/graphql";

type OrgMemberUser = { _id: string; name: string; mmr: number };
type OrgMemberItem = {
    user: OrgMemberUser;
    orgRole: OrgRole;
    status: OrgMemberStatus;
};
type CoreTeamRef = { _id: string };
type OrgOwner = { _id: string; name: string };

export type OrgCardOrg = {
    _id: string;
    name: string;
    slug: string;
    owner: OrgOwner;
    members: OrgMemberItem[];
    coreTeam: CoreTeamRef[];
};

export type OrgCardScrim = {
    _id: string;
    status: ScrimmageStatus;
    scheduledAt?: number | null;
    hostOrg?: { _id: string; name: string } | null;
    opponentOrg?: { _id: string; name: string } | null;
    region: string;
    wagerAmount: number;
    bestOf?: BestOf | null;
};

function bestOfLabel(bo: BestOf): string {
    if (bo === BestOf.One) return "BO1";
    if (bo === BestOf.Three) return "BO3";
    if (bo === BestOf.Five) return "BO5";
    return "Open";
}

function formatScheduledAt(ts: number): string {
    return new Date(ts).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getNextScrim(scrims: OrgCardScrim[]): OrgCardScrim | null {
    const now = Date.now();
    return (
        scrims
            .filter(
                (s) =>
                    (s.status === ScrimmageStatus.Scheduled ||
                        s.status === ScrimmageStatus.Scheduling) &&
                    s.scheduledAt != null &&
                    s.scheduledAt > now,
            )
            .sort((a, b) => (a.scheduledAt ?? 0) - (b.scheduledAt ?? 0))[0] ?? null
    );
}

export function OrgCard({
    org,
    scrims,
}: {
    org: OrgCardOrg;
    scrims: OrgCardScrim[];
}) {
    const coreIds = new Set(org.coreTeam.map((c) => c._id));
    const active = org.members.filter((m) => m.status === OrgMemberStatus.Active);

    const sorted = [...active].sort((a, b) => {
        const rank = (m: OrgMemberItem) => {
            if (m.user._id === org.owner._id) return 0;
            if (m.orgRole === OrgRole.Manager) return 1;
            if (coreIds.has(m.user._id)) return 2;
            return 3;
        };
        return rank(a) - rank(b);
    });

    const nextScrim = getNextScrim(scrims);

    return (
        <>
            {/* Header */}
            <div className="px-5 py-4 border-b border-edge flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-foreground truncate">
                            {org.name}
                        </span>
                        <span className="text-[10px] font-mono text-muted shrink-0">
                            [{org.slug}]
                        </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                        {active.length} active member{active.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <Link
                    href={`/org/${org.slug}`}
                    className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-md border border-edge text-muted hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                    View Org
                </Link>
            </div>

            {/* Upcoming scrim */}
            {nextScrim && (
                <div className="px-5 py-3 border-b border-edge bg-primary/5">
                    <p className="text-[10px] text-primary uppercase tracking-widest font-semibold mb-2">
                        Upcoming Scrim
                    </p>
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                                vs{" "}
                                {nextScrim.opponentOrg?.name ??
                                    (nextScrim.hostOrg?._id !== org._id
                                        ? nextScrim.hostOrg?.name
                                        : null) ??
                                    "TBD"}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                {nextScrim.scheduledAt != null && (
                                    <span className="text-[10px] text-muted">
                                        {formatScheduledAt(nextScrim.scheduledAt)}
                                    </span>
                                )}
                                <span className="text-[10px] text-muted">{nextScrim.region}</span>
                                {nextScrim.bestOf != null && (
                                    <span className="text-[10px] text-dimmed">
                                        {bestOfLabel(nextScrim.bestOf)}
                                    </span>
                                )}
                                {nextScrim.wagerAmount > 0 && (
                                    <span className="text-[10px] text-primary font-semibold">
                                        {nextScrim.wagerAmount} cr
                                    </span>
                                )}
                            </div>
                        </div>
                        <Link
                            href={`/scrims/${nextScrim._id}`}
                            className="shrink-0 text-[10px] font-semibold text-primary hover:underline mt-0.5"
                        >
                            View
                        </Link>
                    </div>
                </div>
            )}

            {/* Members */}
            <div className="px-5 py-4">
                <p className="text-[10px] text-muted uppercase tracking-widest mb-3">Members</p>
                {sorted.length === 0 ? (
                    <p className="text-xs text-muted">No active members.</p>
                ) : (
                    <div className="space-y-2">
                        {sorted.map((member) => {
                            const isOwner = member.user._id === org.owner._id;
                            const isManager = member.orgRole === OrgRole.Manager;
                            const isCore = coreIds.has(member.user._id);

                            return (
                                <div
                                    key={member.user._id}
                                    className="flex items-center justify-between gap-2"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div
                                            className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                                                isOwner
                                                    ? "bg-primary text-background"
                                                    : isManager
                                                    ? "bg-secondary text-foreground"
                                                    : "bg-surface-2 text-dimmed",
                                            )}
                                        >
                                            {member.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span
                                            className={cn(
                                                "text-xs truncate",
                                                isOwner
                                                    ? "text-primary font-semibold"
                                                    : isManager
                                                    ? "text-foreground font-medium"
                                                    : "text-dimmed",
                                            )}
                                        >
                                            {member.user.name}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        {isOwner && (
                                            <span className="text-[9px] font-bold px-1 py-0.5 rounded border text-primary bg-primary/10 border-primary/30 uppercase">
                                                Owner
                                            </span>
                                        )}
                                        {!isOwner && isManager && (
                                            <span className="text-[9px] font-bold px-1 py-0.5 rounded border text-secondary bg-secondary/10 border-secondary/30 uppercase">
                                                Mgr
                                            </span>
                                        )}
                                        {isCore && (
                                            <span className="text-[9px] font-bold px-1 py-0.5 rounded border text-indigo-400 bg-indigo-400/10 border-indigo-400/30 uppercase">
                                                Core
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
