import { cache } from "react";
import heroes from "@/lib/types/deadlock/HeroList.json";

// heroId here is the numeric Deadlock hero id (matches Statlocker draft exports'
// `heroId` field) — same id space as HeroList.json, unrelated to lib/deadlock.ts's
// hand-authored string Hero ids.
export const getHeroImage = cache((heroId: number): string | undefined => {
    return heroes.find(h => h.id === heroId)?.images.icon_hero_card_webp;
});
