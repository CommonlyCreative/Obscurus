import { DiscordIcon } from "@/components/shared/DiscordIcon";
import { Button } from "@/components/shared/Button";
import { getRankByMMR, Rank } from "@/lib/deadlock";
import { UserProfileQuery } from "@/app/api/graphql/types/graphql";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Ban } from "lucide-react";
import { getRankImage } from "@/lib/rankImage";

export function ProfileHeader({
    profile,
    editHref,
}: {
    profile: NonNullable<UserProfileQuery["getUser"]>;
    editHref?: string;
}) {
    const rank = getRankByMMR(profile.stats?.mmr ?? 0);
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
                        <h1 className="text-2xl font-black text-foreground mb-1">{profile.name}</h1>
                        <p className="text-sm text-dimmed leading-relaxed max-w-lg">{profile.bio}</p>
                    </div>
                    {profile.stats?.mmr && rank && <Tooltip>
                        <TooltipTrigger>
                            <img
                                src={getRankImage(profile.stats.mmr)}
                                alt={rank.rank.name}
                                loading="lazy"
                                className="w-32"
                            />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{`${rank.rank.name} ${rank.division}`}</p>
                        </TooltipContent>
                    </Tooltip>}
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
