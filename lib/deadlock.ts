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
    const rankNumber = Math.floor(mmr / 10)
    for (const [_, rank] of rankEntries) {
        const { ranking } = rank;
        if (rankNumber === ranking) {
            return { rank, division: mmr % 10 };
        }
    }
}

export function calculateMMR(rank: Rank, division: number) {
    return rank.ranking * 10 + division;
}

export const Rank = {
    OBSCURUS:  { name: "Obscurus",  ranking: 0,  color: "#2d2b29", text: "text-[#2d2b29]", bg: "bg-[#2d2b29]/10" },
    INITIATE:  { name: "Initiate",  ranking: 1,  color: "#8B6914", text: "text-[#8B6914]", bg: "bg-[#8B6914]/10" },
    SEEKER:    { name: "Seeker",    ranking: 2,  color: "#6c3f2e", text: "text-[#6c3f2e]", bg: "bg-[#6c3f2e]/10" },
    ACOLYTE:   { name: "Acolyte",   ranking: 3,  color: "#67696b", text: "text-[#67696b]", bg: "bg-[#67696b]/10" },
    SENTINEL:  { name: "Sentinel",  ranking: 4,  color: "#a06837", text: "text-[#a06837]", bg: "bg-[#a06837]/10" },
    MYSTIC:    { name: "Mystic",    ranking: 5,  color: "#bdcdda", text: "text-[#bdcdda]", bg: "bg-[#bdcdda]/10" },
    RITUALIST: { name: "Ritualist", ranking: 6,  color: "#deb64b", text: "text-[#deb64b]", bg: "bg-[#deb64b]/10" },
    EMISSARY:  { name: "Emissary",  ranking: 7,  color: "#a9d4d3", text: "text-[#a9d4d3]", bg: "bg-[#a9d4d3]/10" },
    ORACLE:    { name: "Oracle",    ranking: 8,  color: "#d2dfe8", text: "text-[#d2dfe8]", bg: "bg-[#d2dfe8]/10" },
    PHANTOM:   { name: "Phantom",   ranking: 9,  color: "#7076c1", text: "text-[#7076c1]", bg: "bg-[#7076c1]/10" },
    ASCENDANT: { name: "Ascendant", ranking: 10, color: "#e7b560", text: "text-[#e7b560]", bg: "bg-[#e7b560]/10" },
    ETERNUS:   { name: "Eternus",   ranking: 11, color: "#adede3", text: "text-[#adede3]", bg: "bg-[#adede3]/10" },
} as const;

export const convertSteam32toSteam64 = (friend_code: string | number) => {
    return bigInt("76561197960265728").plus(friend_code).toString();
}

export const convertSteam64toSteam32 = (steam_id: string) => {
    return bigInt(steam_id).minus("76561197960265728").toString();
}

export type Rank = typeof Rank[keyof typeof Rank];