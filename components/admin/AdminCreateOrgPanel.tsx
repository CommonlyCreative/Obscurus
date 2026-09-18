"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { adminCreateOrganizationAction, type AdminCreatedOrg } from "@/app/admin/actions";

function slugify(name: string): string {
    return name.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 5);
}

export function AdminCreateOrgPanel() {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const [orgName, setOrgName] = useState("");
    const [orgSlug, setOrgSlug] = useState("");
    const [slugTouched, setSlugTouched] = useState(false);
    const [ownerName, setOwnerName] = useState("");
    const [ownerEmail, setOwnerEmail] = useState("");

    const [pending, start] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [created, setCreated] = useState<AdminCreatedOrg | null>(null);

    const inp = "w-full bg-surface border border-edge rounded px-2 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors";

    function reset() {
        setOrgName("");
        setOrgSlug("");
        setSlugTouched(false);
        setOwnerName("");
        setOwnerEmail("");
        setCreated(null);
        setError(null);
    }

    function handleCreate() {
        if (!orgName.trim() || !orgSlug.trim() || !ownerName.trim() || !ownerEmail.trim()) return;
        setError(null);
        start(async () => {
            try {
                const result = await adminCreateOrganizationAction(
                    { name: ownerName, email: ownerEmail },
                    { name: orgName, slug: orgSlug },
                );
                setCreated(result);
                router.refresh();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to create organization.");
            }
        });
    }

    if (!open) {
        return (
            <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
                + Create Organization
            </Button>
        );
    }

    return (
        <div className="bg-surface border border-edge rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-foreground">Create Organization</p>
                    <p className="text-xs text-muted mt-0.5">
                        Creates the org with a placeholder, unverified owner. They can claim it later by
                        signing in with Discord using this exact email.
                    </p>
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setOpen(false); reset(); }}
                >
                    Close
                </Button>
            </div>

            {!created ? (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] text-muted uppercase tracking-wide mb-1">Org Name</label>
                            <input
                                value={orgName}
                                onChange={(e) => {
                                    setOrgName(e.target.value);
                                    if (!slugTouched) setOrgSlug(slugify(e.target.value));
                                }}
                                placeholder="Void Casters"
                                className={inp}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-muted uppercase tracking-wide mb-1">Slug</label>
                            <input
                                value={orgSlug}
                                onChange={(e) => { setOrgSlug(slugify(e.target.value)); setSlugTouched(true); }}
                                placeholder="VOID"
                                className={inp + " font-mono"}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] text-muted uppercase tracking-wide mb-1">Owner Name</label>
                            <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Owner display name" className={inp} />
                        </div>
                        <div>
                            <label className="block text-[10px] text-muted uppercase tracking-wide mb-1">Owner Email</label>
                            <input
                                type="email"
                                value={ownerEmail}
                                onChange={(e) => setOwnerEmail(e.target.value)}
                                placeholder="owner@example.com"
                                className={inp}
                            />
                        </div>
                    </div>
                    {error && <p className="text-xs text-danger">{error}</p>}
                    <Button
                        size="sm"
                        disabled={pending || !orgName.trim() || !orgSlug.trim() || !ownerName.trim() || !ownerEmail.trim()}
                        onClick={handleCreate}
                    >
                        {pending ? "Creating..." : "Create Organization"}
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="px-3 py-2 bg-success/5 border border-success/20 rounded-md">
                        <p className="text-sm text-success font-semibold">{created.slug} created.</p>
                        <p className="text-xs text-muted mt-0.5">
                            Owner: {created.ownerName} — unverified until claimed.
                        </p>
                    </div>
                    <p className="text-xs text-muted">
                        Find it in the organizations list below to add players, set the core team, and edit
                        weekly availability.
                    </p>
                    <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={reset}>
                            Create Another
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
