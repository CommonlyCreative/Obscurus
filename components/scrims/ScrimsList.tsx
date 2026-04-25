import { ScrimCard } from "./ScrimCard";
import { Button } from "@/components/shared/Button";
import type { Scrim, Region } from "./types";
import { Rank } from "@/lib/deadlock";
import { ScrimListQuery } from "@/app/api/graphql/types/graphql";

interface ScrimsListProps {
    scrims: ScrimListQuery["getScrimmages"] | undefined;
    rankFilter: Rank | "Any";
    regionFilter: Region | "All";
}

export function ScrimsList({ scrims, rankFilter, regionFilter }: ScrimsListProps) {
    if (!scrims) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="h-4 w-32 bg-surface-2 rounded mb-5 animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-surface border border-edge rounded-lg animate-pulse">
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="space-y-2">
                                        <div className="h-3.5 w-28 bg-surface-2 rounded" />
                                        <div className="h-2.5 w-16 bg-surface-2 rounded" />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="h-5 w-14 bg-surface-2 rounded-full" />
                                        <div className="h-5 w-10 bg-surface-2 rounded-full" />
                                    </div>
                                </div>
                                <div className="space-y-1.5 mb-4">
                                    <div className="h-2.5 w-full bg-surface-2 rounded" />
                                    <div className="h-2.5 w-4/5 bg-surface-2 rounded" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-1.5">
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <div key={j} className="w-6 h-6 rounded-full bg-surface-2 border-2 border-surface" />
                                        ))}
                                    </div>
                                    <div className="h-2.5 w-6 bg-surface-2 rounded" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between px-5 py-3 border-t border-edge bg-surface-2 rounded-b-lg">
                                <div className="h-2.5 w-16 bg-edge rounded" />
                                <div className="h-7 w-24 bg-edge rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    if (scrims.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 border border-edge rounded-xl flex items-center justify-center mb-4">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <circle cx="14" cy="14" r="10" stroke="#2c2c2c" strokeWidth="1.5" />
                            <path d="M14 9v6M14 18v1" stroke="#6b6b6b" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-1">No scrims found</h3>
                    <p className="text-sm text-muted mb-6">Try adjusting your filters or be the first to post.</p>
                    <Button href="/scrims/create" size="lg">Post a Scrim</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-xs text-muted mb-5">
                Showing {scrims.length} open scrim{scrims.length !== 1 ? "s" : ""}
                {rankFilter !== "Any" ? ` · ${rankFilter}` : ""}
                {regionFilter !== "All" ? ` · ${regionFilter}` : ""}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
                {scrims.map((scrim) => (
                    <ScrimCard key={scrim._id} scrim={scrim} />
                ))}
            </div>
        </div>
    );
}
