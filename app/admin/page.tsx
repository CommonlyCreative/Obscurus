import { Suspense } from "react";
import { getAnalyticsAction, AnalyticsData } from "./actions";

function StatCard({
    label,
    value,
    sub,
    accent,
}: {
    label: string;
    value: number;
    sub?: string;
    accent?: boolean;
}) {
    return (
        <div className={`bg-surface border rounded-lg px-5 py-4 ${accent ? "border-primary/30" : "border-edge"}`}>
            <p className="text-xs text-muted uppercase tracking-widest mb-2">{label}</p>
            <p className={`text-3xl font-black ${accent ? "text-primary" : "text-foreground"}`}>
                {value.toLocaleString()}
            </p>
            {sub && <p className="text-xs text-dimmed mt-1">{sub}</p>}
        </div>
    );
}

export default function AdminAnalyticsPage() {
    return (
        <div className="p-4 sm:p-8 max-w-5xl">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-px w-6 bg-primary" />
                    <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">Admin</span>
                </div>
                <h1 className="text-3xl font-black uppercase text-foreground">Analytics</h1>
                <p className="text-sm text-dimmed mt-1">Platform-wide statistics overview.</p>
            </div>
            <Suspense fallback={<AnalyticsSkeleton />}>
                <AnalyticsContent />
            </Suspense>
        </div>
    );
}

async function AnalyticsContent() {
    let stats: AnalyticsData | null = null;

    try {
        stats = await getAnalyticsAction();
    } catch {
        return (
            <div className="text-center py-8">
                <p className="text-sm text-muted">Analytics are available to Admins and Moderators only.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard label="Total Users" value={stats.totalUsers} />
            <StatCard
                label="Scrimmages"
                value={stats.totalScrimmages}
                sub={`${stats.activeScrimmages} active`}
            />
            <StatCard label="Organizations" value={stats.totalOrganizations} />
            <StatCard
                label="Pending Org Requests"
                value={stats.pendingOrgRequests}
                sub="awaiting review"
                accent={stats.pendingOrgRequests > 0}
            />
            <StatCard
                label="Open Disputes"
                value={stats.openDisputes}
                sub="needs attention"
                accent={stats.openDisputes > 0}
            />
            <StatCard
                label="Open Feedback"
                value={stats.openFeedback}
                sub="needs review"
                accent={stats.openFeedback > 0}
            />
        </div>
    );
}

function AnalyticsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 bg-surface-2 rounded-lg border border-edge" />
            ))}
        </div>
    );
}
