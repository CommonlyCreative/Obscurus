"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
    href: string;
    label: string;
    roles: string[];
    icon: React.ReactNode;
};

function BarChartIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="18" y="3" width="4" height="18" /><rect x="10" y="8" width="4" height="13" /><rect x="2" y="13" width="4" height="8" />
        </svg>
    );
}

function BuildingIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function SwordsIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" /><line x1="13" y1="19" x2="19" y2="13" /><line x1="16" y1="16" x2="20" y2="20" /><line x1="19" y1="21" x2="21" y2="19" />
        </svg>
    );
}

function ScaleIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
        </svg>
    );
}

function ChatIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}

const NAV_ITEMS: NavItem[] = [
    { href: "/admin",              label: "Analytics",     roles: ["ADMIN", "MODERATOR"],                   icon: <BarChartIcon /> },
    { href: "/admin/org-requests", label: "Org Requests",  roles: ["ADMIN", "MODERATOR"],                   icon: <BuildingIcon /> },
    { href: "/admin/users",        label: "Users",         roles: ["ADMIN", "MODERATOR", "SUPPORT"],        icon: <UsersIcon /> },
    { href: "/admin/scrimmages",   label: "Scrimmages",    roles: ["ADMIN", "MODERATOR", "SUPPORT"],        icon: <SwordsIcon /> },
    { href: "/admin/disputes",     label: "Disputes",      roles: ["ADMIN", "MODERATOR", "SUPPORT"],        icon: <ScaleIcon /> },
    { href: "/admin/feedback",     label: "Feedback",      roles: ["ADMIN", "MODERATOR", "SUPPORT"],        icon: <ChatIcon /> },
];

const ROLE_LABELS: Record<string, string> = {
    ADMIN: "Administrator",
    MODERATOR: "Moderator",
    SUPPORT: "Support",
};

const ROLE_COLORS: Record<string, string> = {
    ADMIN: "text-primary",
    MODERATOR: "text-indigo-400",
    SUPPORT: "text-amber-400",
};

export function AdminSidebar({ role }: { role: string }) {
    const pathname = usePathname();
    const visible = NAV_ITEMS.filter((item) => item.roles.includes(role));

    return (
        <aside className="w-12 sm:w-56 shrink-0 border-r border-edge bg-surface sticky top-16 h-[calc(100vh-4rem)] flex flex-col overflow-y-auto">
            <div className="hidden sm:block px-4 py-4 border-b border-edge">
                <p className="text-[10px] text-muted uppercase tracking-widest mb-0.5">Control Panel</p>
                <p className={cn("text-xs font-bold", ROLE_COLORS[role] ?? "text-foreground")}>
                    {ROLE_LABELS[role] ?? role}
                </p>
            </div>

            <nav className="flex-1 px-1.5 sm:px-2 py-3 space-y-0.5">
                {visible.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={item.label}
                            className={cn(
                                "flex items-center gap-3 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted hover:text-foreground hover:bg-surface-2",
                            )}
                        >
                            <span className={cn("shrink-0", isActive ? "text-primary" : "")}>{item.icon}</span>
                            <span className="hidden sm:block">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="hidden sm:block px-4 py-3 border-t border-edge">
                <Link href="/" className="text-xs text-muted hover:text-foreground transition-colors">
                    Back to site
                </Link>
            </div>
        </aside>
    );
}
