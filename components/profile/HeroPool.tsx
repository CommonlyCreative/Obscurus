import { DeadlockHero } from "@/lib/types/deadlock/heroes";
import { SectionCard } from "@/components/shared/SectionCard";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function HeroPool({ heroes }: { heroes: DeadlockHero[] }) {
    if (heroes.length === 0) {
        return (
            <SectionCard title="Hero Pool" subtitle="No heroes selected yet.">
                <p className="text-xs text-muted">This player hasn&apos;t picked their heroes.</p>
            </SectionCard>
        );
    }

    return (
        <SectionCard
            title="Hero Pool"
            subtitle={`${heroes.length} hero${heroes.length !== 1 ? "es" : ""} played`}
        >
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
                {heroes.map((hero) => {
                    const [r, g, b] = hero.colors?.ui ?? [232, 188, 135];
                    return (
                        <Tooltip key={hero.id}>
                            <TooltipTrigger
                                className="group relative aspect-square rounded-lg overflow-hidden border border-edge bg-surface-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30"
                                style={{ borderColor: `rgba(${r}, ${g}, ${b}, 0.35)` }}
                            >
                                <img
                                    src={hero.images.icon_hero_card_webp}
                                    alt={hero.name}
                                    loading="lazy"
                                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-transparent" />
                                <div
                                    className="absolute inset-x-0 bottom-0 h-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                                    style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
                                />
                                <p className="absolute bottom-1 inset-x-1 truncate text-[10px] font-semibold text-white drop-shadow-sm">
                                    {hero.name}
                                </p>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-center">
                                    <p className="font-semibold">{hero.name}</p>
                                    {/* {hero.description?.role && (
                                        <p className="text-background/70">{hero.description.role}</p>
                                    )} */}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </div>
        </SectionCard>
    );
}
