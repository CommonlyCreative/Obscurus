import Link from "next/link";
import { formatTimeAgo } from "@/lib/utils";
import { OrgMemberStatus } from "@/app/api/graphql/types/graphql";

type OrgHeaderData = {
    name: string;
    slug: string;
    description?: string | null;
    createdAt: number;
    members: Array<{ status: string }>;
};

export function OrgHeader({
    org,
    isManager,
    activeMemberCount,
}: {
    org: OrgHeaderData;
    isManager: boolean;
    activeMemberCount: number;
}) {
    return (
        <div className="border-b border-edge bg-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-xl bg-surface-2 border border-edge flex items-center justify-center text-2xl font-black text-primary shrink-0">
                            {org.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-2xl font-black text-foreground">{org.name}</h1>
                                <span className="text-sm font-mono text-muted">[{org.slug}]</span>
                            </div>
                            {org.description && (
                                <p className="text-sm text-dimmed mt-1 max-w-lg leading-relaxed">
                                    {org.description}
                                </p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-muted">
                                    {activeMemberCount} member{activeMemberCount !== 1 ? "s" : ""}
                                </span>
                                <span className="text-edge">·</span>
                                <span className="text-xs text-muted">
                                    Founded {formatTimeAgo(new Date(org.createdAt))}
                                </span>
                            </div>
                        </div>
                    </div>
                    {isManager && (
                        <Link
                            href={`/org/${org.slug}/manage`}
                            className="shrink-0 px-4 py-2 text-sm font-semibold border border-edge rounded-lg text-muted hover:text-foreground hover:border-foreground/20 transition-colors"
                        >
                            Manage
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
