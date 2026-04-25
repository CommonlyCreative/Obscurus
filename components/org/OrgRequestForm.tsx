"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { submitOrgRequestAction, cancelOrgRequestAction, type OrgRequestRecord } from "@/app/org/request/actions";

const STATUS_CONFIG = {
    PENDING: {
        label: "Under Review",
        classes: "text-amber-400 bg-amber-400/10 border border-amber-400/30",
    },
    APPROVED: {
        label: "Approved",
        classes: "text-success bg-success/10 border border-success/30",
    },
    REJECTED: {
        label: "Rejected",
        classes: "text-danger bg-danger/10 border border-danger/30",
    },
};

function slugify(name: string): string {
    return name.replace(/[^a-zA-Z]/g, "").slice(0, 5).toUpperCase();
}

interface Props {
    userId: string;
    existingRequest: OrgRequestRecord | null;
}

export function OrgRequestForm({ userId, existingRequest }: Props) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [slugTouched, setSlugTouched] = useState(false);
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [request, setRequest] = useState<OrgRequestRecord | null>(existingRequest);

    function handleNameChange(val: string) {
        setName(val);
        if (!slugTouched) setSlug(slugify(val));
    }

    function handleSlugChange(val: string) {
        const cleaned = val.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 5);
        setSlug(cleaned);
        setSlugTouched(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim() || !slug.trim()) return;
        setError(null);
        setSubmitting(true);
        try {
            const result = await submitOrgRequestAction(userId, {
                name: name.trim(),
                slug: slug.trim(),
                reason: reason.trim() || undefined,
            });
            setRequest(result);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleCancel() {
        if (!request) return;
        setCancelling(true);
        try {
            await cancelOrgRequestAction(request._id, userId);
            setRequest(null);
            setName("");
            setSlug("");
            setReason("");
            setSlugTouched(false);
        } catch {
            setError("Failed to cancel the request.");
        } finally {
            setCancelling(false);
        }
    }

    // Existing request — show status card
    if (request) {
        const cfg = STATUS_CONFIG[request.status];
        return (
            <div className="bg-surface border border-edge rounded-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-edge bg-surface-2 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted uppercase tracking-widest mb-1">Your Request</p>
                        <h2 className="text-xl font-bold text-foreground">{request.name}</h2>
                        <p className="text-sm text-dimmed mt-0.5 font-mono">[{request.slug}]</p>
                    </div>
                    <span className={cn("text-xs font-bold px-3 py-1.5 rounded-full", cfg.classes)}>
                        {cfg.label}
                    </span>
                </div>

                <div className="px-6 py-5 space-y-4">
                    {request.reason && (
                        <div>
                            <p className="text-xs text-muted uppercase tracking-widest mb-1">Your Note</p>
                            <p className="text-sm text-dimmed leading-relaxed">{request.reason}</p>
                        </div>
                    )}

                    {request.reviewNote && (
                        <div className="bg-surface-2 border border-edge rounded-lg px-4 py-3">
                            <p className="text-xs text-muted uppercase tracking-widest mb-1">Admin Note</p>
                            <p className="text-sm text-dimmed leading-relaxed">{request.reviewNote}</p>
                        </div>
                    )}

                    {request.status === "PENDING" && (
                        <div className="pt-2">
                            <p className="text-xs text-dimmed mb-3">
                                Your request is awaiting admin review. You'll be notified once a decision is made.
                            </p>
                            <Button
                                variant="secondary"
                                onClick={handleCancel}
                                disabled={cancelling}
                                className="text-danger border-danger/20 hover:border-danger/40 text-xs"
                            >
                                {cancelling ? "Cancelling…" : "Cancel Request"}
                            </Button>
                        </div>
                    )}

                    {request.status === "APPROVED" && (
                        <p className="text-sm text-success">
                            Your request was approved. An admin will create your organization shortly.
                        </p>
                    )}

                    {request.status === "REJECTED" && (
                        <div className="pt-2">
                            <p className="text-xs text-dimmed mb-3">
                                Your request was rejected. You may submit a new one.
                            </p>
                            <Button
                                variant="secondary"
                                onClick={() => setRequest(null)}
                                className="text-xs"
                            >
                                Submit New Request
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Form
    return (
        <form onSubmit={handleSubmit} className="bg-surface border border-edge rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-edge bg-surface-2">
                <p className="text-xs text-muted uppercase tracking-widest mb-1">New Request</p>
                <p className="text-sm text-dimmed leading-relaxed">
                    Fill in the details below. An admin will review your request and reach out if approved.
                </p>
            </div>

            <div className="px-6 py-6 space-y-5">
                {/* Org name */}
                <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Organization Name <span className="text-danger">*</span>
                    </label>
                    <input
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="e.g. Void Casters"
                        required
                        maxLength={64}
                        className={cn(
                            "w-full bg-surface-2 border border-edge rounded-md px-3 py-2.5 text-sm text-foreground",
                            "placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors",
                        )}
                    />
                </div>

                {/* Slug */}
                <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Abbreviation (slug) <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                        <input
                            value={slug}
                            onChange={(e) => handleSlugChange(e.target.value)}
                            placeholder="e.g. VCAST"
                            required
                            maxLength={5}
                            className={cn(
                                "w-full bg-surface-2 border border-edge rounded-md px-3 py-2.5 text-sm font-mono text-foreground pr-12",
                                "placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors",
                            )}
                        />
                        <span className={cn(
                            "absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold tabular-nums",
                            slug.length === 5 ? "text-primary" : "text-muted",
                        )}>
                            {slug.length}/5
                        </span>
                    </div>
                    <p className="text-[11px] text-muted mt-1">
                        Letters only, max 5 characters. Used as a short identifier (e.g. [VC]).
                    </p>
                </div>

                {/* Reason */}
                <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Reason <span className="text-muted font-normal">(optional)</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Tell us a bit about your team and why you'd like an organization…"
                        rows={4}
                        maxLength={500}
                        className={cn(
                            "w-full bg-surface-2 border border-edge rounded-md px-3 py-2.5 text-sm text-foreground",
                            "placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors resize-none",
                        )}
                    />
                    <p className="text-[11px] text-muted mt-1 text-right">{reason.length}/500</p>
                </div>

                {error && (
                    <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-md px-3 py-2">
                        {error}
                    </p>
                )}

                <div className="flex items-center gap-3 pt-1">
                    <Button
                        type="submit"
                        disabled={submitting || !name.trim() || slug.length === 0}
                        className="px-6"
                    >
                        {submitting ? "Submitting…" : "Submit Request"}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </form>
    );
}
