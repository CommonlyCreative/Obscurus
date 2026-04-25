"use client";

import { ArrayElement, cn } from "@/lib/utils";
import { useLiveTeams } from "@/hooks/useLiveTeams";
import type { LiveTeam } from "@/lib/socket/teams";
import { CreateScrimPageQuery } from "@/app/api/graphql/types/graphql";
import { OrgProp } from "./CreateScrimForm";
import { useTeamSocket } from "@/hooks/useTeamSocket";

export function LiveTeamPicker({
    userId,
    selected,
    onSelect,
    orgs: unfilteredOrgs,
    org,
    orgAffiliated,
    isManager,
}: {
    orgs: CreateScrimPageQuery["getOrganizations"],
    isManager: boolean,
    orgAffiliated: boolean,
    org: OrgProp | null,
    userId: string,
    selected: string | null;
    onSelect: (leaderId: string) => void;
}) {
    // const { teams: allTeams, loading, refresh } = useLiveTeams();
    const { teams: allTeams, loading} = useTeamSocket(["all"])
    const orgs = unfilteredOrgs ? unfilteredOrgs.filter(o => o.coreTeam.length === 6 && o._id !== org?._id) : [];
    const teams: LiveTeam[] = Object.values(allTeams).filter(team => team !== null).filter(team => team.leaderId !== userId);
    const displayOrgs = isManager&&orgAffiliated&&orgs && orgs.length > 0;
    const showTeams = teams.length > 0;
    const totalTeams = orgs && displayOrgs ? orgs.length + teams.length : teams.length;

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="w-5 h-5 rounded-full border-2 border-edge border-t-primary animate-spin" />
            </div>
        );
    }

    if (!showTeams&&!displayOrgs) {
        return (
            <div className="py-8 text-center space-y-2">
                <p className="text-xs text-muted">No teams are currently online.</p>
                {/* <button
                    type="button"
                    onClick={refresh}
                    className="text-xs text-primary hover:underline"
                >
                    Refresh
                </button> */}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted">
                    {totalTeams} team{totalTeams !== 1 ? "s" : ""} available
                </span>
                {/* <button
                    type="button"
                    onClick={refresh}
                    className="text-xs text-primary hover:underline"
                >
                    Refresh
                </button> */}
            </div>

            {displayOrgs && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Organizations</span>
                        <div className="flex-1 h-px bg-secondary/20" />
                        <span className="text-[10px] text-secondary/60">{orgs!.length}</span>
                    </div>
                    {orgs!.map((org) => <OrgCard key={org._id} team={org} selected={selected} onSelect={onSelect} />)}
                </div>
            )}

            {displayOrgs && showTeams && <div className="h-px bg-edge" />}

            {showTeams && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-success">Live Teams</span>
                        <div className="flex-1 h-px bg-success/20" />
                        <span className="text-[10px] text-success/60">{teams.length}</span>
                    </div>
                    {teams.map((team: LiveTeam) => <LiveTeamCard key={team.leaderId} team={team} selected={selected} onSelect={onSelect} />)}
                </div>
            )}
        </div>
    );
}

function LiveTeamCard({ team, selected, onSelect }: { team: LiveTeam, selected: string | null; onSelect: (leaderId: string) => void; }) {
    const isSelected = selected === team.leaderId;
    return (
        <button
            type="button"
            onClick={() => onSelect(team.leaderId)}
            className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                isSelected
                    ? "border-success/40 bg-success/5"
                    : "border-edge hover:border-success/25 bg-surface-2"
            )}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0 animate-pulse" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">
                        {team.members[0]?.name ?? "Unnamed Team"}
                    </span>
                    <span className="text-[10px] font-mono text-success bg-success/10 border border-success/20 px-1.5 py-0.5 rounded shrink-0">
                        LIVE
                    </span>
                    <span className="text-xs text-muted shrink-0 ml-auto">
                        {team.members.length}/{team.maxSize}
                    </span>
                </div>
                {team.members.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                        {team.members.slice(0, 4).map((m, i) => (
                            <span
                                key={i}
                                className="text-[10px] bg-surface border border-edge px-1.5 py-0.5 rounded text-dimmed"
                            >
                                {m.name}
                            </span>
                        ))}
                        {team.members.length > 4 && (
                            <span className="text-[10px] text-muted">
                                +{team.members.length - 4} more
                            </span>
                        )}
                    </div>
                )}
            </div>
            {isSelected && (
                <span className="text-xs font-semibold text-success shrink-0">✓</span>
            )}
        </button>
    )
}

function OrgCard({ team, selected, onSelect }: { team: ArrayElement<NonNullable<CreateScrimPageQuery["getOrganizations"]>>, selected: string | null; onSelect: (leaderId: string) => void; }) {
    const isSelected = selected === team.owner._id;
    const letter = team.name.charAt(0).toUpperCase();
    return (
        <button
            type="button"
            onClick={() => onSelect(team.owner._id)}
            className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                isSelected
                    ? "border-secondary/50 bg-secondary/5"
                    : "border-secondary/15 hover:border-secondary/35 bg-surface-2"
            )}
        >
            <div className={cn(
                "w-7 h-7 rounded flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                isSelected ? "bg-secondary/25 text-secondary" : "bg-secondary/10 text-secondary"
            )}>
                {letter}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">
                        {team.name}
                    </span>
                    <span className="text-[10px] font-mono text-secondary/80 bg-secondary/10 border border-secondary/20 px-1.5 py-0.5 rounded shrink-0">
                        ORG
                    </span>
                    <span className="text-[10px] text-muted font-mono shrink-0 ml-auto">
                        {team.slug}
                    </span>
                </div>
                {team.coreTeam.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                        {team.coreTeam.map((m, i) => (
                            <span
                                key={i}
                                className="text-[10px] bg-secondary/5 border border-secondary/15 px-1.5 py-0.5 rounded text-dimmed"
                            >
                                {m.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            {team.owner.online && (
                <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" title="Owner online" />
            )}
            {isSelected && (
                <span className="text-xs font-semibold text-secondary shrink-0">✓</span>
            )}
        </button>
    )
}
