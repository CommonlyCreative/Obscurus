import { StatCard } from "./StatCard";
import { ScrimmageResult, UserProfileQuery } from "@/app/api/graphql/types/graphql";

export function ProfileStats({ _id, scrimmages }: { _id: string; scrimmages: NonNullable<UserProfileQuery["getUser"]>["scrimmages"] }) {
    const { wins, losses } = scrimmages.reduce((acc, scrim) => {
        const isHost = scrim.hostTeam.members.some(m => m._id === _id);
        const hostWon = scrim.result === ScrimmageResult.HostWin;
        
        if (isHost || !hostWon) {
            acc.wins += 1;
        } else {
            acc.losses += 1;
        }
        return acc;
    }, { wins: 0, losses: 0 });
    const games = scrimmages.length == 0 ? 1 : scrimmages.length;
    const winRate = Math.round((wins / games) * 100);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <StatCard value={wins} label="Scrim Wins" />
            <StatCard value={losses} label="Scrim Losses" />
            <StatCard value={`${winRate}%`} label="Win Rate" />
            <StatCard value={scrimmages.length} label="Total Scrims" />
        </div>
    );
}
