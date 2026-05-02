"use client"

import Link from "next/link";
import { useState } from "react";
import { Building2, User, Search } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrayElement, cn } from "@/lib/utils";
import { SearchPageQuery } from "@/app/api/graphql/types/graphql";
import { getRankImage } from "@/lib/rankImage";

export type SearchPlayerData = {
    _id: string;
    name: string;
    role: string;
    online: boolean;
    heroes: Array<{ id: number; name: string; minimap_image_webp: string }>;
    orgName?: string;
    orgSlug?: string;
    stats: ArrayElement<SearchPageQuery["getUsers"]>["stats"]
};

export type SearchOrgData = {
    _id: string;
    name: string;
    slug: string;
    memberCount: number;
    winRate: number | null;
    totalMatches: number;
};

const roleStyle: Record<string, string> = {
    ADMIN: "text-danger bg-danger/10",
    MODERATOR: "text-yellow-400 bg-yellow-400/10",
    SUPPORT: "text-blue-400 bg-blue-400/10",
};

export function SearchResults({
    players,
    organizations,
}: {
    players: SearchPlayerData[];
    organizations: SearchOrgData[];
}) {
    const [query, setQuery] = useState("");
    const q = query.toLowerCase();

    const filteredOrgs = q
        ? organizations.filter(o =>
            o.name.toLowerCase().includes(q) || o.slug.toLowerCase().includes(q)
        )
        : organizations;

    const filteredPlayers = q
        ? players.filter(p =>
            p.name.toLowerCase().includes(q) || p.orgName?.toLowerCase().includes(q)
        )
        : players;

    return (
        <div className="w-full bg-surface border border-edge rounded-lg overflow-hidden">

            {/* Search input */}
            <div className="p-4 border-b border-edge">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted pointer-events-none" />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search players and organizations..."
                        className="w-full bg-surface-2 border border-edge rounded-md pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                    />
                </div>
            </div>

            {/* Organizations */}
            <div>
                <div className="px-4 py-2.5 flex items-center gap-2 bg-surface-2 border-b border-edge">
                    <Building2 className="size-3.5 text-muted" />
                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                        Organizations
                    </span>
                    <span className="text-xs text-muted ml-auto">{filteredOrgs.length}</span>
                </div>

                {filteredOrgs.length === 0 ? (
                    <p className="px-4 py-4 text-sm text-muted">No organizations found.</p>
                ) : (
                    <div className="divide-y divide-edge">
                        {filteredOrgs.map(org => (
                            <Link
                                key={org._id}
                                href={`/org/${org.slug}`}
                                className="flex items-center justify-between px-4 py-3 hover:bg-surface-2 transition-colors group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center text-sm font-bold text-foreground shrink-0">
                                        {org.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                            {org.name}
                                        </p>
                                        <p className="text-xs text-muted">
                                            @{org.slug}&nbsp;·&nbsp;{org.memberCount} {org.memberCount === 1 ? "member" : "members"}
                                        </p>
                                    </div>
                                </div>

                                {org.totalMatches > 0 ? (
                                    <div className="text-right shrink-0 ml-4">
                                        <p className={cn(
                                            "text-sm font-bold",
                                            org.winRate! >= 0.5 ? "text-success" : "text-danger"
                                        )}>
                                            {Math.round(org.winRate! * 100)}%
                                        </p>
                                        <p className="text-xs text-muted">{org.totalMatches} {org.totalMatches === 1 ? "match" : "matches"}</p>
                                    </div>
                                ) : (
                                    <span className="text-xs text-muted shrink-0 ml-4">No matches yet</span>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="border-t border-edge" />

            {/* Players */}
            <div>
                <div className="px-4 py-2.5 flex items-center gap-2 bg-surface-2 border-b border-edge">
                    <User className="size-3.5 text-muted" />
                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                        Players
                    </span>
                    <span className="text-xs text-muted ml-auto">{filteredPlayers.length}</span>
                </div>

                {filteredPlayers.length === 0 ? (
                    <p className="px-4 py-4 text-sm text-muted">No players found.</p>
                ) : (
                    <div className="divide-y divide-edge">
                        {filteredPlayers.map(player => (
                            <Link
                                key={player._id}
                                href={`/profile/${player._id}`}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors group"
                            >
                                {/* Avatar + online dot */}
                                <div className="relative shrink-0">
                                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-foreground">
                                        {player.name.charAt(0)}
                                    </div>
                                    <span className={cn(
                                        "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface",
                                        player.online ? "bg-success" : "bg-edge"
                                    )} />
                                </div>

                                {/* Name + role + org */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                            {player.name}
                                        </p>
                                        {roleStyle[player.role] && (
                                            <span className={cn(
                                                "text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase shrink-0",
                                                roleStyle[player.role]
                                            )}>
                                                {player.role}
                                            </span>
                                        )}
                                    </div>
                                    {player.orgName ? (
                                        <p className="text-xs text-muted truncate">{player.orgName}</p>
                                    ) : (
                                        <p className="text-xs text-muted/60">No organization</p>
                                    )}
                                </div>

                                <div className="flex gap-1 items-center">
                                    {/* Hero icons */}
                                    {player.heroes.length > 0 && (
                                        <div className="flex items-center gap-1 shrink-0">
                                            {player.heroes.slice(0, 5).map((hero, i) => (
                                                <Tooltip key={i}>
                                                    <TooltipTrigger>
                                                        <img
                                                            src={hero.minimap_image_webp}
                                                            alt={hero.name}
                                                            loading="lazy"
                                                            className="w-6 h-6 rounded"
                                                        />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{hero.name}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            ))}
                                        </div>
                                    )}
                                    {/* {player.heroes.length > 0 && player.stats && <p>·</p>} */}
                                    {player.stats && (
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <img
                                                    src={getRankImage(player.stats.mmr)}
                                                    alt={player.stats.rank.name}
                                                    loading="lazy"
                                                    className="w-12"
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{`${player.stats.rank.name} ${player.stats.division}`}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
