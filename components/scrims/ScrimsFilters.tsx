"use client";

import { Rank } from "@/lib/deadlock";
import type { Region } from "./types";

const RANKS: (Rank | "Any")[] = ["Any", Rank.PHANTOM, Rank.ASCENDANT, Rank.ETERNUS];
const REGIONS: (Region | "All")[] = ["All", "NA", "EU"];

interface ScrimsFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  rankFilter: Rank | "Any";
  setRankFilter: (value: Rank | "Any") => void;
  regionFilter: Region | "All";
  setRegionFilter: (value: Region | "All") => void;
}

export function ScrimsFilters({
  search,
  setSearch,
  rankFilter,
  setRankFilter,
  regionFilter,
  setRegionFilter,
}: ScrimsFiltersProps) {
  return (
    <div className="border-b border-edge sticky top-16 z-10 bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row gap-3">

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

          {/* Rank filter */}
          <div className="flex gap-1.5 flex-wrap">
            {RANKS.map((r) => {
              let name = r === "Any" ? "Any" : r.name;
              return (
              
              <button
                key={name}
                onClick={() => setRankFilter(r)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                  rankFilter === r
                    ? "bg-primary text-background border-primary"
                    : "border-edge text-muted hover:text-foreground hover:border-foreground/20"
                }`}
              >
                {name}
              </button>
            );
              })}
          </div>

          {/* Region filter */}
          <div className="flex gap-1.5">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRegionFilter(r)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                  regionFilter === r
                    ? "bg-primary text-background border-primary"
                    : "border-edge text-muted hover:text-foreground hover:border-foreground/20"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
