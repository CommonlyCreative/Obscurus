export interface SteamAvatar {
    small: string;
    medium: string;
    large: string;
    hash: string;
}

export interface SteamUserSummary {
    steamID: string;
    avatar: SteamAvatar;
    url: string;
    visible: boolean;
    personaState: number;
    personaStateFlags: number;
    allowsComments: boolean;
    nickname: string;
    lastLogOffTimestamp: number;
    createdTimestamp: number;
    realName: string | null;
    primaryGroupID: string;
}
