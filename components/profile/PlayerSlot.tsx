import { LiveMember } from "@/lib/socket/teams";
import { RoleTag } from "./RoleTag";
import { authClient } from "@/lib/database/auth-client";
import { getRankByMMR } from "@/lib/deadlock";
import { isActiveMember } from "@/hooks/useTeamSocket";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function PlayerSlot({
    player,
    index,
    isTeammateViewer,
    isOwner,
    onEmptySlotClick,
    onRemove,
}: {
    player?: LiveMember;
    index: number;
    isOwner: boolean;
    isTeammateViewer: boolean;
    onEmptySlotClick: () => void;
    onRemove?: () => void;
}) {
    const { data: session } = authClient.useSession();


    const isMe = !!session?.user.id && !!player && session.user.id === player.userId;
    if (!player) {
        return (
            <div onClick={() => isOwner && onEmptySlotClick()} className={cn("flex items-center gap-3 p-3 rounded-lg border border-dashed border-edge group", isOwner && "hover:border-primary/30 transition-colors cursor-pointer")}>
                <div className="w-8 h-8 rounded-full bg-surface-2 border border-dashed border-edge flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 2v10M2 7h10" stroke="#6b6b6b" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted">Empty slot</div>
                    <div className="text-xs text-edge mt-0.5">Slot {index + 1}</div>
                </div>
                {isOwner && <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    Invite
                </span>}
            </div>
        );
    }

    return (
        <div className={cn(`flex items-center gap-3 p-3 rounded-lg transition-colors`, 
            player.status === "JOINED" ? 
            `border ${isMe ? "border-primary/30 bg-primary/5" : "border-edge hover:border-edge/70"}` 
            : `border border-dashed ${isMe ? "border-primary/30 bg-primary/5" : "border-edge hover:border-edge/70"}`)}>
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-foreground shrink-0">
                {player.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-foreground truncate">{player.name}</span>
                    {isMe && (
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0">
                            You
                        </span>
                    )}
                </div>
                <div className="text-xs text-muted mt-0.5">{getRankByMMR(player.mmr)?.rank.name}</div>
            </div>
            {player.status === "INVITED" && <RoleTag role={player.status} />}
            {onRemove && !isMe && (
                <button
                    onClick={e => { e.stopPropagation(); onRemove(); }}
                    className="shrink-0 text-muted hover:text-danger transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
}
