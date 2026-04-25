import { StatCard } from "@/components/profile/StatCard";
import { ScrimmageResult, ScrimmageStatus } from "@/app/api/graphql/types/graphql";

type ScrimForStats = {
    result?: string | null;
    status: string;
    hostOrg?: { _id: string } | null;
    opponentOrg?: { _id: string } | null;
};

export function OrgStats({
    orgId,
    scrims,
    memberCount,
}: {
    orgId: string;
    scrims: ScrimForStats[];
    memberCount: number;
}) {
    const completed = scrims.filter(s => s.status === ScrimmageStatus.Completed);

    const { wins, losses, draws } = completed.reduce(
        (acc, scrim) => {
            const isHost = scrim.hostOrg?._id === orgId;
            if (scrim.result === ScrimmageResult.HostWin) {
                isHost ? acc.wins++ : acc.losses++;
            } else if (scrim.result === ScrimmageResult.OpponentWin) {
                isHost ? acc.losses++ : acc.wins++;
            } else if (scrim.result === ScrimmageResult.Draw) {
                acc.draws++;
            }
            return acc;
        },
        { wins: 0, losses: 0, draws: 0 },
    );

    const total = wins + losses + draws;
    const winRate = total === 0 ? 0 : Math.round((wins / total) * 100);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            <StatCard value={wins} label="Wins" />
            <StatCard value={losses} label="Losses" />
            <StatCard value={draws} label="Draws" />
            <StatCard value={`${winRate}%`} label="Win Rate" />
            <StatCard value={memberCount} label="Members" />
        </div>
    );
}
