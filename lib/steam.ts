import SteamAPI from 'steamapi';

export const steam = new SteamAPI(String(process.env.NEXT_PUBLIC_STEAM_API_KEY));