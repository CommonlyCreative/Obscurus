import { ArchiveCard } from "./ArchiveCard";
import type { ArchivedScrim } from "./types";

interface ArchivesListProps {
    scrims: ArchivedScrim[] | undefined;
    totalCount: number;
}

export function ArchivesList({ scrims, totalCount }: ArchivesListProps) {
    if (!scrims) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-surface border border-edge rounded-lg p-4 animate-pulse">
                        <div className="flex items-center gap-1.5 mb-3">
                            <div className="h-5 w-16 bg-surface-2 rounded-full" />
                            <div className="h-5 w-10 bg-surface-2 rounded-full" />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-4 flex-1 bg-surface-2 rounded" />
                            <div className="h-4 w-8 bg-surface-2 rounded" />
                            <div className="h-4 flex-1 bg-surface-2 rounded" />
                        </div>
                        <div className="h-3 w-24 bg-surface-2 rounded mt-4" />
                    </div>
                ))}
            </div>
        );
    }

    if (scrims.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-surface border border-edge rounded-lg">
                <div className="w-16 h-16 border border-edge rounded-xl flex items-center justify-center mb-4">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <circle cx="14" cy="14" r="10" stroke="#2c2c2c" strokeWidth="1.5" />
                        <path d="M14 9v6M14 18v1" stroke="#6b6b6b" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">No scrimmages found</h3>
                <p className="text-sm text-muted">
                    {totalCount === 0 ? "No completed scrimmages have been recorded yet." : "Try adjusting your filters."}
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="text-xs text-muted mb-4">
                Showing {scrims.length} of {totalCount} completed scrimmage{totalCount !== 1 ? "s" : ""}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                {scrims.map((scrim) => (
                    <ArchiveCard key={scrim._id} scrim={scrim} />
                ))}
            </div>
        </div>
    );
}
