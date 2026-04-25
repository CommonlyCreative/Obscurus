import SteamAPI from 'steamapi';

export const steam = new SteamAPI(String(process.env.STEAM_API_KEY));