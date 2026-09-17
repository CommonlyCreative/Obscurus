"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { SectionCard } from "@/components/shared/SectionCard";
import { EditProfilePageQuery } from "@/app/api/graphql/types/graphql";
import { cn } from "@/lib/utils";
import { updateProfileAction } from "@/app/profile/[id]/edit/actions";
import { DeadlockHero } from "@/lib/types/deadlock/heroes";
import { authClient } from "@/lib/database/auth-client";
import { DisconnectSteamButton } from "./DisconnectSteamButton";
import { GoogleIcon } from "@/components/shared/GoogleIcon";
import Image from "next/image";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { getRankImage } from "@/lib/rankImage";
import Link from "next/link";

interface Props {
    userId: string;
    stats: NonNullable<EditProfilePageQuery["getUser"]>["stats"]
    steam: NonNullable<EditProfilePageQuery["getUser"]>["steam"];
    heroes: DeadlockHero[];
    initialHeroes: number[];
    initialBio: string;
    disconnectGoogleOnMount?: boolean;
}

export function EditProfileForm({
    userId,
    initialHeroes,
    initialBio,
    heroes,
    steam,
    stats,
    disconnectGoogleOnMount = false,
}: Props) {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const [isPending, startTransition] = useTransition();
    const [profileError, setProfileError] = useState<string | null>(null);
    const [profileSuccess, setProfileSuccess] = useState(false);

    const [selectedHeroes, setSelectedHeroes] = useState<Set<number>>(
        new Set(initialHeroes)
    );
    const [bio, setBio] = useState(initialBio);

    const [syncPending, startSyncTransition] = useTransition();
    const [syncSuccess, setSyncSuccess] = useState(false);
    const rankImage = getRankImage(stats?.mmr ?? 0)

    const [linkedAccounts, setLinkedAccounts] = useState<Array<{ providerId: string }>>([]);
    const [accountsLoading, setAccountsLoading] = useState(true);
    const [googleDisconnectError, setGoogleDisconnectError] = useState<string | null>(null);
    const [showReauthDialog, setShowReauthDialog] = useState(false);
    const autoDisconnectAttempted = useRef(false);

    function toggleHero(id: number) {
        setSelectedHeroes((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function handleSaveProfile() {
        setProfileError(null);
        setProfileSuccess(false);
        startTransition(async () => {
            try {
                await updateProfileAction({ userId, heroes: Array.from(selectedHeroes), bio });
                await authClient.updateUser({ heroes: Array.from(selectedHeroes), bio });
                setProfileSuccess(true);
                router.refresh();
            } catch {
                setProfileError("Failed to save profile. Please try again.");
            }
        });
    }

    function handleSyncSession() {
        setSyncSuccess(false);
        startSyncTransition(async () => {
            router.refresh();
            setSyncSuccess(true);
        });
    }

    useEffect(() => {
        authClient.listAccounts().then(({ data }) => {
            if (data) setLinkedAccounts(data);
            setAccountsLoading(false);
        });
    }, []);

    // Force a fresh server fetch on load — under Cache Components, navigating back to
    // this route can otherwise show a client-cached (stale) version instead of the
    // latest DB state.
    useEffect(() => {
        router.refresh();
    }, [router]);

    // Local editable state is only seeded from props once via useState; resync it
    // whenever a refresh brings in new values so the form actually reflects them.
    useEffect(() => {
        setSelectedHeroes(new Set(initialHeroes));
        setBio(initialBio);
    }, [initialHeroes, initialBio]);

    const googleConnected = linkedAccounts.some(a => a.providerId === "google");

    async function handleGoogleDisconnect() {
        setGoogleDisconnectError(null);
        const { error } = await authClient.unlinkAccount({ providerId: "google" });
        if (error) {
            if (error.status === 403) {
                setShowReauthDialog(true);
            } else {
                setGoogleDisconnectError(error.message ?? "Failed to disconnect Google.");
            }
        } else {
            setLinkedAccounts(prev => prev.filter(a => a.providerId !== "google"));
        }
    }

    function handleReauthAndDisconnect() {
        setShowReauthDialog(false);
        authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    authClient.signIn.social({
                        provider: "discord",
                        callbackURL: `${window.location.pathname}?disconnect_google=1`,
                    });
                },
            },
        });
    }

    useEffect(() => {
        if (!disconnectGoogleOnMount || accountsLoading || autoDisconnectAttempted.current) return;
        autoDisconnectAttempted.current = true;
        handleGoogleDisconnect().then(() => {
            router.replace(window.location.pathname);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [disconnectGoogleOnMount, accountsLoading]);


    const profileSections = (
        <>
            {/* Connected Accounts */}
            <section className="bg-surface border border-edge rounded-lg p-5 mb-6">
                <div className="mb-4">
                    <h2 className="text-sm font-bold text-foreground">Connected Accounts</h2>
                    <p className="text-xs text-muted mt-0.5">Link external accounts to enhance your profile.</p>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-edge">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-surface-2 border border-edge flex items-center justify-center shrink-0">
                            {steam?.avatar ? <Image height={24} width={24} src={steam.avatar} alt="Steam Profile" /> :
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-steam" viewBox="0 0 16 16">
                                    <path d="M.329 10.333A8.01 8.01 0 0 0 7.99 16C12.414 16 16 12.418 16 8s-3.586-8-8.009-8A8.006 8.006 0 0 0 0 7.468l.003.006 4.304 1.769A2.2 2.2 0 0 1 5.62 8.88l1.96-2.844-.001-.04a3.046 3.046 0 0 1 3.042-3.043 3.046 3.046 0 0 1 3.042 3.043 3.047 3.047 0 0 1-3.111 3.044l-2.804 2a2.223 2.223 0 0 1-3.075 2.11 2.22 2.22 0 0 1-1.312-1.568L.33 10.333Z" />
                                    <path d="M4.868 12.683a1.715 1.715 0 0 0 1.318-3.165 1.7 1.7 0 0 0-1.263-.02l1.023.424a1.261 1.261 0 1 1-.97 2.33l-.99-.41a1.7 1.7 0 0 0 .882.84Zm3.726-6.687a2.03 2.03 0 0 0 2.027 2.029 2.03 2.03 0 0 0 2.027-2.029 2.03 2.03 0 0 0-2.027-2.027 2.03 2.03 0 0 0-2.027 2.027m2.03-1.527a1.524 1.524 0 1 1-.002 3.048 1.524 1.524 0 0 1 .002-3.048" />
                                </svg>}
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-foreground">Steam</div>
                            {steam ? (
                                <div className="text-xs text-muted">Connected · {steam.username}</div>
                            ) : (
                                <div className="text-xs text-muted">Not connected</div>
                            )}
                        </div>
                    </div>
                    {steam ? (
                        <DisconnectSteamButton userId={userId} />
                    ) : (
                        <a
                            href={`${process.env.NEXT_PUBLIC_SOCKET_URL}/auth/steam`}
                            className="px-3 py-1.5 text-xs font-semibold rounded border border-edge text-dimmed hover:border-primary/30 hover:text-foreground transition-colors"
                        >
                            Connect Steam
                        </a>
                    )}
                </div>

                {/* Google */}
                <div className="flex items-center justify-between py-3 border-t border-edge">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-surface-2 border border-edge flex items-center justify-center shrink-0">
                            <GoogleIcon size={16} />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-foreground">Google</div>
                            {accountsLoading ? (
                                <div className="text-xs text-muted">Loading…</div>
                            ) : googleConnected ? (
                                <div className="text-xs text-muted">Connected · Calendar access granted</div>
                            ) : (
                                <div className="text-xs text-muted">Not connected</div>
                            )}
                        </div>
                    </div>
                    {!accountsLoading && (
                        googleConnected ? (
                            <div className="flex flex-col items-end gap-1">
                                <button
                                    type="button"
                                    onClick={handleGoogleDisconnect}
                                    className="px-3 py-1.5 text-xs font-semibold cursor-pointer rounded border border-danger/30 text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                                >
                                    Disconnect
                                </button>
                                {googleDisconnectError && (
                                    <p className="text-[10px] text-danger">{googleDisconnectError}</p>
                                )}
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => authClient.linkSocial({
                                    provider: "google",
                                    callbackURL: window.location.href,
                                })}
                                className="px-3 py-1.5 text-xs font-semibold rounded border border-edge text-dimmed hover:border-primary/30 hover:text-foreground transition-colors"
                            >
                                Connect Google
                            </button>
                        )
                    )}
                </div>
            </section>

            <Dialog open={showReauthDialog} onOpenChange={setShowReauthDialog}>
                <DialogContent className="sm:max-w-md" showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Identity Verification Required</DialogTitle>
                        <DialogDescription>
                            For your security, please re-verify your identity to disconnect this account.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start">
                        <Button onClick={handleReauthAndDisconnect}>
                            Continue with Discord
                        </Button>
                        <DialogClose asChild>
                            <Button type="button" variant="ghost">Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rank */}
            <SectionCard
                title="Rank"
                subtitle="Your rank is pulled directly from Statlocker.gg. You must be signed in to Steam to connect your rank."
            >
                {steam&&rankImage ? (
                    <div className="flex justify-center">
                        <img src={rankImage} className="h-24" />
                    </div>
                ) : (
                    <p className="text-xs text-muted">
                        Connect your&nbsp;
                        <Link href={`${process.env.NEXT_PUBLIC_SOCKET_URL}/auth/steam`} className="text-foreground font-medium">
                            Steam
                        </Link>
                        &nbsp;to pull your rank
                    </p>
                )}
            </SectionCard>

            {/* Heroes */}
            <SectionCard
                title="Heroes"
                subtitle={`Select the heroes you play. ${selectedHeroes.size} selected.`}
            >
                <div className="flex flex-wrap gap-1.5">
                    {heroes.map((hero) => {
                        const selected = selectedHeroes.has(hero.id);
                        return (
                            <button
                                key={hero.id}
                                type="button"
                                onClick={() => toggleHero(hero.id)}
                                className={cn(
                                    "px-2.5 py-1 rounded text-xs font-medium border transition-colors",
                                    selected
                                        ? "border-primary/60 bg-primary/10 text-primary"
                                        : "border-edge text-muted hover:text-dimmed hover:border-foreground/20"
                                )}
                            >
                                {hero.name}
                            </button>
                        );
                    })}
                </div>
            </SectionCard>

            {/* Bio */}
            <SectionCard title="Bio" subtitle="Tell other players about yourself.">
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={300}
                    rows={4}
                    placeholder="Flex player focused on support/carry. Available most evenings EST."
                    className="w-full bg-surface-2 border border-edge rounded px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
                <p className="text-xs text-muted text-right">{bio.length}/300</p>
            </SectionCard>

            {/* Sync Session */}
            <SectionCard
                title="Sync Session"
                subtitle="If your profile data was changed externally (e.g. by an admin), use this to refresh your active session."
            >
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={handleSyncSession} disabled={syncPending}>
                        {syncPending ? "Syncing..." : "Sync Session"}
                    </Button>
                    {syncSuccess && (
                        <span className="text-xs text-success">Session synced.</span>
                    )}
                </div>
            </SectionCard>

            {/* Save / Cancel */}
            <div className="flex items-center gap-3">
                <Button onClick={handleSaveProfile} disabled={isPending} className="px-6">
                    {isPending ? "Saving…" : "Save Profile"}
                </Button>
                <Button variant="secondary" href={`/profile/${userId}`} className="px-6">
                    Cancel
                </Button>
                {profileSuccess && (
                    <span className="text-xs text-success">Profile saved.</span>
                )}
                {profileError && (
                    <span className="text-xs text-danger">{profileError}</span>
                )}
            </div>
        </>
    );

    return <div className="space-y-5">{profileSections}</div>;
}
