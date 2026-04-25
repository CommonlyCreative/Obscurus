import Link from "next/link";
import { ArrayElement, formatTimeAgo } from "@/lib/utils";
import { UserProfileQuery } from "@/app/api/graphql/types/graphql";

type ActiveScrim = ArrayElement<NonNullable<NonNullable<UserProfileQuery["getUser"]>["scrimmages"]>>;

function ActiveScrimCard({ scrim, isOwner }: { scrim: ActiveScrim, isOwner: boolean }) {
    const hostName = scrim.hostOrg?.name ?? scrim.hostTeam?.name ?? scrim.hostTeam.leader.name + "'s Team";
    const oppName = scrim.opponentOrg?.name ?? scrim.opponentTeam?.name ?? scrim.hostTeam.leader.name + "'s Team";

    return (
        <div className="flex items-center justify-between gap-4 px-5 py-4 bg-success/5 border border-success/20 rounded-lg">
            <div className="flex items-center gap-3 min-w-0">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse shrink-0" />
                <div className="">
                    {isOwner && (
                        <p className="text-xs text-muted mt-0.5">
                            You're currently in a scrim
                        </p>
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                            {hostName}
                            <span className="text-muted font-normal mx-1.5">vs</span>
                            {oppName}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                            Started {formatTimeAgo(new Date(scrim.createdAt))}
                        </p>
                    </div>
                </div>
            </div>
            <Link
                href={`/scrims/${scrim._id}`}
                className="text-xs font-semibold px-3 py-1.5 rounded-md border border-success/30 text-success hover:bg-success/10 transition-colors shrink-0"
            >
                View Scrim
            </Link>
        </div>
    );
}

export function ProfileActiveScrim({
    activeScrims,
    isOwner
}: {
    activeScrims: ActiveScrim[];
    profileId: string;
    isOwner: boolean;
}) {
    if (activeScrims.length === 0) return null;

    return (
        <div className="mb-6 space-y-2">
            {activeScrims.map(scrim => (
                <ActiveScrimCard key={scrim._id} isOwner={isOwner} scrim={scrim} />
            ))}
        </div>
    );
}
