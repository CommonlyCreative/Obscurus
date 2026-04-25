import bigInt from "big-integer";

export type Hero = {
    image: string,
    id: string,
    name: string,
}

export const Hero = {
    ABRAMS: CreateHero("", "abrams", "Abrams"),
    APOLLO: CreateHero("", "apollo", "Apollo"),
    BEBOP: CreateHero("", "bebop", "Bebop"),
    BILLY: CreateHero("", "billy", "Billy"),
    CALICO: CreateHero("", "calico", "Calico"),
    CELESTE: CreateHero("", "celeste", "Celeste"),
    DOORMAN: CreateHero("", "doorman", "Doorman"),
    DRIFTER: CreateHero("", "drifter", "Drifter"),
    DYNAMO: CreateHero("", "dynamo", "Dynamo"),
    GRAVES: CreateHero("", "graves", "Graves"),
    GREY_TALON: CreateHero("", "grey_talon", "Grey Talon"),
    HAZE: CreateHero("", "haze", "Haze"),
    HOLLIDAY: CreateHero("", "holliday", "Holliday"),
    INFERNUS: CreateHero("", "infernus", "Infernus"),
    IVY: CreateHero("", "ivy", "Ivy"),
    KELVIN: CreateHero("", "kelvin", "Kelvin"),
    LADY_GEIST: CreateHero("", "lady_geist", "Lady Geist"),
    LASH: CreateHero("", "lash", "Lash"),
    MIRAGE: CreateHero("", "mirage", "Mirage"),
    MINA: CreateHero("", "mina", "Mina"),
    MO_KRILL: CreateHero("", "mo_krill", "Mo & Krill"),
    PAIGE: CreateHero("", "paige", "Paige"),
    PARADOX: CreateHero("", "paradox", "Paradox"),
    POCKET: CreateHero("", "pocket", "Pocket"),
    REM: CreateHero("", "rem", "Rem"),
    SEVEN: CreateHero("", "seven", "Seven"),
    SHIV: CreateHero("", "shiv", "Shiv"),
    SILVER: CreateHero("", "silver", "Silver"),
    SINCLAIR: CreateHero("", "sinclair", "Sinclair"),
    VENATOR: CreateHero("", "venator", "Venator"),
    VINDICTA: CreateHero("", "vindicta", "Vindicta"),
    VISCOUS: CreateHero("", "viscous", "Viscous"),
    VYPER: CreateHero("", "vyper", "Vyper"),
    WARDEN: CreateHero("", "warden", "Warden"),
    WRAITH: CreateHero("", "wraith", "Wraith"),
    YAMATO: CreateHero("", "yamato", "Yamato"),
}

function CreateHero(image: string, id: string, name: string): Hero {
    return {
        image,
        id,
        name
    }
}

export function getRankByMMR(mmr: number): { rank: Rank, division: number } | undefined {
    const rankEntries = Object.entries(Rank) as [string, Rank][];

    for (const [_, rank] of rankEntries) {
        const { ranking } = rank;
        if (mmr >= ranking * 6 && mmr < (ranking + 1) * 6) {
            return { rank, division: mmr - ranking * 6 };
        }
    }
}

export function calculateMMR(rank: Rank, division: number) {
    return rank.ranking * 6 + division;
}

export const Rank = {
    INITIATE:  { name: "Initiate",  ranking: 0,  color: "#8B6914", text: "text-[#8B6914]", bg: "bg-[#8B6914]/10" },
    SEEKER:    { name: "Seeker",    ranking: 1,  color: "#6B3A5E", text: "text-[#6B3A5E]", bg: "bg-[#6B3A5E]/10" },
    ALCHEMIST: { name: "Alchemist", ranking: 2,  color: "#4A7A2E", text: "text-[#4A7A2E]", bg: "bg-[#4A7A2E]/10" },
    ARCHANIST: { name: "Archanist", ranking: 3,  color: "#3DA53D", text: "text-[#3DA53D]", bg: "bg-[#3DA53D]/10" },
    RITUALIST: { name: "Ritualist", ranking: 4,  color: "#7B8A8E", text: "text-[#7B8A8E]", bg: "bg-[#7B8A8E]/10" },
    EMISSARY:  { name: "Emissary",  ranking: 5,  color: "#9B2D4E", text: "text-[#9B2D4E]", bg: "bg-[#9B2D4E]/10" },
    ARCHON:    { name: "Archon",    ranking: 6,  color: "#6A4D8A", text: "text-[#6A4D8A]", bg: "bg-[#6A4D8A]/10" },
    ORACLE:    { name: "Oracle",    ranking: 7,  color: "#A0764A", text: "text-[#A0764A]", bg: "bg-[#A0764A]/10" },
    PHANTOM:   { name: "Phantom",   ranking: 8,  color: "#7A7A7E", text: "text-[#7A7A7E]", bg: "bg-[#7A7A7E]/10" },
    ASCENDANT: { name: "Ascendant", ranking: 9,  color: "#C8A832", text: "text-[#C8A832]", bg: "bg-[#C8A832]/10" },
    ETERNUS:   { name: "Eternus",   ranking: 10, color: "#40E8D8", text: "text-[#40E8D8]", bg: "bg-[#40E8D8]/10" },
} as const;

export const convertSteam32toSteam64 = (friend_code: string | number) => {
    return bigInt("76561197960265728").plus(friend_code).toString();
}

export type Rank = typeof Rank[keyof typeof Rank];