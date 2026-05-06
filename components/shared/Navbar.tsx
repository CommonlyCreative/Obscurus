"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/shared/Button";
import { authClient } from "@/lib/database/auth-client";
import ConnectDiscordButton from "./ConnectDiscordButton";
import { User } from "@/lib/database/auth";
import { findTeam, useTeamSocket } from "@/hooks/useTeamSocket";
import { socket } from "@/lib/socket/socket-client";
import { getUserScrimmages } from "@/app/actions";
import { ScrimmageStatus } from "@/app/api/graphql/types/graphql";
import { cn } from "@/lib/utils";
import { NotificationDropdown } from "./NotificationDropdown";

function HamburgerIcon({ open }: { open: boolean }) {
    return (
        <div className="w-5 flex flex-col gap-1 cursor-pointer">
            <span className={`block h-0.5 bg-current transition-all duration-200 ${open ? "rotate-45 translate-y-1.5" : ""}`} />
            <span className={`block h-0.5 bg-current transition-all duration-200 ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 bg-current transition-all duration-200 ${open ? "-rotate-45 -translate-y-1.5" : ""}`} />
        </div>
    );
}

export function Navbar() {
    const pathname = usePathname();
    const { data: session } = authClient.useSession();
    const [mobileOpen, setMobileOpen] = useState(false);
    const router = useRouter();
    const [avatarOpen, setAvatarOpen] = useState(false);
    const [inScrim, setInScrim] = useState(false);
    const avatarRef = useRef<HTMLDivElement>(null);

    const user = session?.user as User | undefined;
    const { teams } = useTeamSocket(user ? [user.id] : []);
    const team = user ? findTeam(teams, user.id) : undefined;
    const teamCount = team ? team.members.length : 0;
    const teamFull = teamCount === 6;

    const ADMIN_ROLES = ["ADMIN", "MODERATOR", "SUPPORT"];
    const isAdmin = user && ADMIN_ROLES.includes((user as any).role ?? "");

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (avatarRef.current && !avatarRef.current.contains(e.target as Node))
                setAvatarOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!user) return;
        socket.emit("login", user.id);
        getUserScrimmages(user.id).then(u => {
            if (!u) return;
            setInScrim(u.scrimmages.some(
                s => s.status !== ScrimmageStatus.Completed && s.status !== ScrimmageStatus.Cancelled
            ));
        });
    }, [user]);

    async function handleSignOut() {
        await authClient.signOut();
        setAvatarOpen(false);
        router.push("/");
    }

    const navLinks = [
        { href: "/", label: "Home", exact: true },
        { href: "/scrims", label: "Scrims", exact: false },
        { href: "/search", label: "Search", exact: false },
        { href: "/feedback", label: "Feedback", exact: false },
    ];

    const isActive = (href: string, exact: boolean) =>
        exact ? pathname === href : pathname.startsWith(href);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-edge">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 3-column grid: logo | nav | actions */}
                <div className="grid grid-cols-3 items-center h-16">

                    {/* ── Logo ── */}
                    <Link href="/" className="flex items-center gap-3 w-fit">
                        <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-sm shrink-0">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="#141414" strokeWidth="1.5" fill="none" />
                                <circle cx="8" cy="8" r="2" fill="#141414" />
                            </svg>
                        </div>
                        <span className="font-black text-base tracking-widest uppercase text-foreground hidden sm:block">
                            Obscurus
                        </span>
                    </Link>

                    {/* ── Centered nav links ── */}
                    <div className="hidden md:flex items-center justify-center gap-1">
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded transition-colors",
                                    isActive(link.href, link.exact)
                                        ? "text-primary"
                                        : "text-muted hover:text-foreground"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* ── Right actions + Mobile hamburger ── */}
                    <div className="col-start-3 flex items-center justify-end gap-3">
                        {user && <NotificationDropdown userId={user.id} />}
                        <div className="hidden md:flex items-center gap-2">
                            {user ? (
                                <>
                                    {teamFull && !inScrim && (
                                        <Button href="/scrims/create" size="sm">
                                            Create Match
                                        </Button>
                                    )}

                                    {/* Avatar + dropdown */}
                                    <div className="relative" ref={avatarRef}>
                                        <button
                                            onClick={() => setAvatarOpen(o => !o)}
                                            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface transition-colors cursor-pointer"
                                        >
                                            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                                                {user.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-foreground max-w-28 truncate">
                                                {user.name}
                                            </span>
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={cn("text-muted transition-transform", avatarOpen && "rotate-180")}>
                                                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>

                                        {avatarOpen && (
                                            <div className="absolute right-0 mt-1 w-52 bg-surface border border-edge rounded-lg shadow-xl overflow-hidden">
                                                {/* User info + team status */}
                                                <div className="px-4 py-3 border-b border-edge">
                                                    <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                                                    <div className="flex items-center gap-2 mt-2.5">
                                                        <div className="flex items-center gap-0.5">
                                                            {Array.from({ length: 6 }).map((_, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={cn(
                                                                        "w-2 h-2 rounded-full transition-colors",
                                                                        i < teamCount ? "bg-primary" : "bg-edge"
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-dimmed">{teamCount}/6 players</span>
                                                    </div>
                                                </div>

                                                {/* Navigation items */}
                                                <div className="py-1">
                                                    <Link
                                                        href={`/profile/${user.id}`}
                                                        onClick={() => setAvatarOpen(false)}
                                                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-dimmed hover:text-foreground hover:bg-surface-2 transition-colors"
                                                    >
                                                        My Profile
                                                    </Link>

                                                    {teamFull && !inScrim && (
                                                        <Link
                                                            href="/scrims/create"
                                                            onClick={() => setAvatarOpen(false)}
                                                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-primary hover:bg-primary/5 transition-colors"
                                                        >
                                                            Create Match
                                                        </Link>
                                                    )}

                                                    <Link
                                                        href="/feedback"
                                                        onClick={() => setAvatarOpen(false)}
                                                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-dimmed hover:text-foreground hover:bg-surface-2 transition-colors"
                                                    >
                                                        Submit Feedback
                                                    </Link>

                                                    {isAdmin && (
                                                        <Link
                                                            href="/admin"
                                                            onClick={() => setAvatarOpen(false)}
                                                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-dimmed hover:text-foreground hover:bg-surface-2 transition-colors"
                                                        >
                                                            Admin Panel
                                                        </Link>
                                                    )}
                                                </div>

                                                <div className="border-t border-edge py-1">
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="w-full cursor-pointer text-left px-4 py-2 text-sm text-danger hover:bg-danger/5 transition-colors"
                                                    >
                                                        Sign out
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <ConnectDiscordButton size="sm" />
                            )}
                        </div>

                        <button
                            className="md:hidden text-muted hover:text-foreground transition-colors"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                        >
                            <HamburgerIcon open={mobileOpen} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Mobile menu ── */}
            {mobileOpen && (
                <div className="md:hidden bg-surface border-t border-edge">
                    <div className="px-4 py-3 space-y-1">
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "block px-3 py-2 text-sm font-medium rounded transition-colors",
                                    isActive(link.href, link.exact)
                                        ? "text-primary bg-primary/10"
                                        : "text-dimmed hover:text-foreground hover:bg-surface-2"
                                )}
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {user ? (
                            <div className="pt-2 border-t border-edge mt-2 space-y-1">
                                <div className="flex items-center justify-between px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <span className="text-sm font-medium">{user.name}</span>
                                    </div>
                                    <span className="text-xs text-dimmed">{teamCount}/6</span>
                                </div>
                                <Link
                                    href={`/profile/${user.id}`}
                                    className="block px-3 py-2 text-sm text-dimmed hover:text-foreground hover:bg-surface-2 rounded transition-colors"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    My Profile
                                </Link>
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        className="block px-3 py-2 text-sm text-dimmed hover:text-foreground hover:bg-surface-2 rounded transition-colors"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Admin Panel
                                    </Link>
                                )}
                                {teamFull && !inScrim && (
                                    <Button
                                        href="/scrims/create"
                                        size="md"
                                        className="block mx-0 mt-1 text-center"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Create Match
                                    </Button>
                                )}
                                <button
                                    onClick={handleSignOut}
                                    className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-surface-2 transition-colors rounded"
                                >
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <div className="pt-2 border-t border-edge mt-2">
                                <ConnectDiscordButton />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
