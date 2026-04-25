import Link from "next/link";
import { PlayerDots } from "@/components/shared/PlayerDots";
import { ArrayElement, formatTimeAgo } from "@/lib/utils";
import { GetScrimmagesQuery } from "@/app/api/graphql/types/graphql";

export interface PreviewScrim {
    id: number;
    team: string;
    rank: string;
    region: string;
    players: number;
    note: string;
    postedAgo: string;
    rankColor: string;
    rankBg: string;
}

export function ScrimPreviewCard({ scrim }: { scrim: ArrayElement<GetScrimmagesQuery["getScrimmages"]> }) {
    const name = scrim.hostOrg ? scrim.hostOrg.name : scrim.hostTeam.name ?? scrim.hostTeam.leader.name+"'s Team";
    return (
        <div className="bg-surface border border-edge rounded-lg p-5 hover:border-primary/30 transition-colors group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="font-bold text-foreground text-sm">{name}</div>
                    <div className="text-xs text-muted mt-0.5">{formatTimeAgo(new Date(scrim.createdAt))}</div>
                </div>
                {/* <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scrim.rankColor} ${scrim.rankBg}`}>
          {scrim.rank}
        </span> */}
            </div>

            <p className="text-xs text-dimmed leading-relaxed mb-5 line-clamp-2">
                {scrim.note}
            </p>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <PlayerDots filled={6} />
                    <span className="text-xs text-muted font-medium">{scrim.region}</span>
                </div>
                <Link href="/scrims" className="text-xs font-bold text-primary hover:underline">
                    Request →
                </Link>
            </div>
        </div>
    );
}
