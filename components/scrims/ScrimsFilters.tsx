"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Rank, REGIONS } from "@/lib/deadlock";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const RANKS: (Rank | "Any")[] = ["Any", Rank.PHANTOM, Rank.ASCENDANT, Rank.ETERNUS];

interface ScrimsFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  rankFilter: Rank | "Any";
  setRankFilter: (value: Rank | "Any") => void;
  regionFilter: typeof REGIONS[number] | "All";
  setRegionFilter: (value: typeof REGIONS[number] | "All") => void;
}

export function ScrimsFilters({
  search,
  setSearch,
  rankFilter,
  setRankFilter,
  regionFilter,
  setRegionFilter,
}: ScrimsFiltersProps) {
  const [open, setOpen] = useState(false);
  const activeCount = (rankFilter !== "Any" ? 1 : 0) + (regionFilter !== "All" ? 1 : 0);

  function clearFilters() {
    setRankFilter("Any");
    setRegionFilter("All");
  }

  return (
    <div className="border-b border-edge sticky top-16 z-10 bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teams or notes…"
              className="w-full bg-surface border border-edge rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Filters */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-sm font-semibold transition-colors shrink-0",
                  activeCount > 0
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-edge text-muted hover:text-foreground hover:border-foreground/20"
                )}
              >
                <SlidersHorizontal className="size-3.5" />
                Filters
                {activeCount > 0 && (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-background text-[10px] font-bold">
                    {activeCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Rank</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {RANKS.map((r) => {
                      const name = r === "Any" ? "Any" : r.name;
                      return (
                        <button
                          key={name}
                          onClick={() => setRankFilter(r)}
                          className={cn(
                            "px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors",
                            rankFilter === r
                              ? "bg-primary text-background border-primary"
                              : "border-edge text-muted hover:text-foreground hover:border-foreground/20"
                          )}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Region</p>
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      onClick={() => setRegionFilter("All")}
                      className={cn(
                        "px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors",
                        regionFilter === "All"
                          ? "bg-primary text-background border-primary"
                          : "border-edge text-muted hover:text-foreground hover:border-foreground/20"
                      )}
                    >
                      All
                    </button>
                    {REGIONS.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRegionFilter(r)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors",
                          regionFilter === r
                            ? "bg-primary text-background border-primary"
                            : "border-edge text-muted hover:text-foreground hover:border-foreground/20"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {activeCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-muted hover:text-foreground transition-colors underline underline-offset-2"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>

        </div>
      </div>
    </div>
  );
}
