import { socket } from "./socket-client";

export interface ScrimPatchMatch {
    number: number;
    match_id: string | null;
    result: string | null;
    startedAt: number;
    concludedAt: number | null;
}

export interface ScrimPatch {
    status: string;
    result: string | null;
    readyHost: boolean;
    readyOpponent: boolean;
    partyCode: string | null;
    matches: ScrimPatchMatch[];
}

export function broadcastScrimPatch(scrimmageId: string, patch: ScrimPatch) {
    socket.emit("scrim:patch", scrimmageId, patch);
}

export function broadcastScrimRefresh(scrimmageId: string) {
    socket.emit("scrim:refresh", scrimmageId);
}
