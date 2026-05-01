import Link from "next/link";
import { cn } from "@/lib/utils";
import { OrgRole, OrgMemberStatus } from "@/app/api/graphql/types/graphql";

type OrgMemberUser = { _id: string; name: string; };
type OrgMember = {
    user: OrgMemberUser;
    orgRole: OrgRole;
    status: OrgMemberStatus;
};
type OrgForRoster = {
    owner: { _id: string; name: string };
    members: OrgMember[];
    coreTeam: { _id: string }[];
};

function memberRank(m: OrgMember, ownerId: string, coreIds: Set<string>): number {
    if (m.user._id === ownerId) return 0;
    if (m.orgRole === OrgRole.Manager) return 1;
    if (coreIds.has(m.user._id)) return 2;
    return 3;
}

export function OrgRosterPanel({
    org,
    currentUserId,
}: {
    org: OrgForRoster;
    currentUserId?: string;
}) {
    const coreIds = new Set(org.coreTeam.map(c => c._id));
    const active = org.members.filter(m => m.status === OrgMemberStatus.Active);
    const invited = org.members.filter(m => m.status === OrgMemberStatus.Invited);

    const sorted = [...active].sort(
        (a, b) => memberRank(a, org.owner._id, coreIds) - memberRank(b, org.owner._id, coreIds),
    );

    const coreSlots = org.coreTeam.map(ref => active.find(m => m.user._id === ref._id));

    return (
        <div className="bg-surface border border-edge rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-edge">
                <div className="text-sm font-bold text-foreground">Roster</div>
                <div className="text-xs text-muted mt-0.5">
                    {active.length} active · {org.coreTeam.length}/6 core slots filled
                </div>
            </div>

            {/* Core Team grid */}
            <div className="px-5 py-4 border-b border-edge">
                <p className="text-[10px] text-muted uppercase tracking-widest mb-3">Core Team</p>
                <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => {
                        const member = coreSlots[i];
                        return member ? (
                            <Link
                                key={i}
                                href={`/profile/${member.user._id}`}
                                className="flex flex-col items-center gap-1.5 group"
                            >
                                <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-black text-primary group-hover:border-primary/50 transition-colors">
                                    {member.user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-[10px] text-dimmed truncate max-w-full text-center group-hover:text-foreground transition-colors">
                                    {member.user.name}
                                </span>
                            </Link>
                        ) : (
                            <div key={i} className="flex flex-col items-center gap-1.5">
                                <div className="w-11 h-11 rounded-full bg-surface-2 border border-dashed border-edge flex items-center justify-center">
                                    <span className="text-xs text-edge">—</span>
                                </div>
                                <span className="text-[10px] text-edge">Open</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Full member list */}
            <div className="px-5 py-4">
                <p className="text-[10px] text-muted uppercase tracking-widest mb-3">All Members</p>
                <div className="space-y-1">
                    {sorted.map(member => {
                        const isOwner = member.user._id === org.owner._id;
                        const isManager = member.orgRole === OrgRole.Manager;
                        const isCore = coreIds.has(member.user._id);
                        const isMe = member.user._id === currentUserId;

                        return (
                            <Link
                                key={member.user._id}
                                href={`/profile/${member.user._id}`}
                                className="flex items-center justify-between gap-2 -mx-2 px-2 py-1.5 rounded-md hover:bg-surface-2 transition-colors"
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
                                        {isMe && (
                                            <span className="text-muted font-normal"> (you)</span>
                                        )}
                                        {/* TODO {isMe && (
                                            <span className="text-muted font-normal"> (you)</span>
                                        )} */}
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
                            </Link>
                        );
                    })}
                </div>

                {invited.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-edge">
                        <p className="text-[10px] text-muted uppercase tracking-widest mb-2">
                            Pending Invites
                        </p>
                        <div className="space-y-1.5">
                            {invited.map(member => (
                                <div key={member.user._id} className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-surface-2 border border-dashed border-edge flex items-center justify-center text-[10px] text-muted">
                                        {member.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-xs text-muted truncate flex-1">
                                        {member.user.name}
                                    </span>
                                    <span className="text-[9px] text-amber-400 font-semibold">Invited</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
