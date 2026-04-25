import Link from "next/link";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { ArrowRightIcon } from "@/components/shared/ArrowRightIcon";
import { ScrimPreviewCard, type PreviewScrim } from "./ScrimPreviewCard";
import { GetScrimmagesQuery } from "@/app/api/graphql/types/graphql";

const PREVIEW_SCRIMS: PreviewScrim[] = [
    {
        id: 1,
        team: "Void Casters",
        rank: "Diamond",
        region: "NA",
        players: 6,
        note: "Looking for scrim partners. Any rank welcome.",
        postedAgo: "12m ago",
        rankColor: "text-[#b9f2ff]",
        rankBg: "bg-[#b9f2ff]/10",
    },
    {
        id: 2,
        team: "Iron Circuit",
        rank: "Platinum",
        region: "EU",
        players: 6,
        note: "Serious team. Scrims only, no casual.",
        postedAgo: "34m ago",
        rankColor: "text-[#94d4a4]",
        rankBg: "bg-[#94d4a4]/10",
    },
    {
        id: 3,
        team: "Neon Remnants",
        rank: "Gold",
        region: "NA",
        players: 6,
        note: "Best of 3 preferred. DM for details.",
        postedAgo: "1h ago",
        rankColor: "text-primary",
        rankBg: "bg-primary/10",
    },
];

export function OpenScrimsSection({ scrims }: { scrims: GetScrimmagesQuery["getScrimmages"] }) {
    return (
        <section className="py-20 border-b border-edge">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <SectionLabel>Live Now</SectionLabel>
                        <h2 className="text-3xl font-black uppercase text-foreground">
                            Open Scrims
                        </h2>
                    </div>
                    <Link
                        href="/scrims"
                        className="text-sm text-dimmed hover:text-primary transition-colors font-medium hidden sm:flex items-center gap-1"
                    >
                        View all
                        <ArrowRightIcon />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scrims.map((scrim) => (
                        <ScrimPreviewCard key={scrim._id} scrim={scrim} />
                    ))}
                </div>

                <div className="mt-6 text-center sm:hidden">
                    <Link
                        href="/scrims"
                        className="text-sm text-dimmed hover:text-primary transition-colors font-medium"
                    >
                        View all open scrims →
                    </Link>
                </div>
            </div>
        </section>
    );
}
