import { DiscordIcon } from "@/components/shared/DiscordIcon";
import { Button } from "@/components/shared/Button";
import { getRankByMMR, Rank } from "@/lib/deadlock";
import { UserProfileQuery } from "@/app/api/graphql/types/graphql";
import { DeadlockHero } from "@/lib/types/deadlock/heroes";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Ban } from "lucide-react";

export function ProfileHeader({
    profile,
    editHref,
    heroes,
}: {
    profile: NonNullable<UserProfileQuery["getUser"]>;
    heroes: DeadlockHero[];
    editHref?: string;
}) {
    const rank = getRankByMMR(profile.mmr) ?? { rank: Rank.INITIATE, division: 1 };
    return (
        <div className="border-b border-edge bg-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center text-3xl font-black text-foreground">
                            {profile.name.charAt(0)}
                        </div>
                        {profile.steam && (
                            <Tooltip>
                                <TooltipTrigger className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center"><img src={profile.steam.avatar} className="h-8 w-8 rounded-full flex items-center justify-center" /></TooltipTrigger>
                                <TooltipContent>
                                    <p>{profile.steam.username}</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-black text-foreground">{profile.name}</h1>
                            {heroes.length > 0 && (
                                <span className="flex flex-wrap gap-2 text-xs text-muted font-medium px-2 py-0.5 bg-surface-2 rounded-full border border-edge">
                                    {heroes.map((hero, x) => (
                                        <Tooltip key={x}>
                                            <TooltipTrigger><img className="w-6 h-6" src={hero.images.minimap_image_webp} /></TooltipTrigger>
                                            <TooltipContent>
                                                <p>{hero.name}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            {/* <RoleTag role={profile.role} /> */}
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rank.rank.color} ${rank.rank.bg}`}>
                                {rank.rank.name} {rank.division > 0 ? `- Division ${rank.division}` : ""}
                            </span>

                        </div>
                        <p className="text-sm text-dimmed leading-relaxed max-w-lg">{profile.bio}</p>
                    </div>

                    {/* Edit button */}
                    {editHref && (
                        <Button variant="secondary" href={editHref} className="shrink-0">
                            Edit Profile
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
