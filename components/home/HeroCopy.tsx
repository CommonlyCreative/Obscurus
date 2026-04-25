import { DiscordIcon } from "@/components/shared/DiscordIcon";
import { ArrowRightIcon } from "@/components/shared/ArrowRightIcon";
import { Button } from "@/components/shared/Button";
import ConnectDiscordButton from "../shared/ConnectDiscordButton";
import { auth } from "@/lib/database/auth";
import { headers } from "next/headers";

export async function HeroCopy() {
    const session = await auth.api.getSession({ headers: await headers() })
    
    return (
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-28 w-full">
            <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-5">
                    <div className="h-px w-8 bg-primary" />
                    <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
                        Deadlock Competitive
                    </span>
                </div>

                <h1 className="text-6xl sm:text-7xl font-black uppercase leading-[0.88] tracking-tight text-foreground mb-7">
                    Find Your
                    <br />
                    <span className="text-primary">Scrimmage</span>
                </h1>

                <p className="text-base text-dimmed leading-relaxed mb-10 max-w-100">
                    Connect with competitive Deadlock teams, organize scrimmages, and
                    sharpen your game. Build a 6-player roster and start competing
                    tonight.
                </p>

                <div className="flex flex-wrap gap-3">
                    <Button href="/scrims" size="xl">
                        Browse Scrims
                        <ArrowRightIcon />
                    </Button>
                    {!session?.user ? (
                        <ConnectDiscordButton size="xl" />
                    ) : <></>}
                </div>
            </div>
        </div>
    );
}
