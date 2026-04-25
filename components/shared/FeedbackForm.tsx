"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/shared/Button";
import { submitFeedbackAction, FeedbackType } from "@/app/feedback/actions";

const TYPES: { value: FeedbackType; label: string; desc: string }[] = [
    { value: "BUG",        label: "Bug Report",  desc: "Something is broken or not working as expected" },
    { value: "SUGGESTION", label: "Suggestion",  desc: "An idea or improvement you'd like to see" },
    { value: "CRITICISM",  label: "Criticism",   desc: "Constructive feedback about how the site works" },
    { value: "OTHER",      label: "Other",        desc: "Anything else you'd like to share" },
];

export function FeedbackForm() {
    const [type, setType] = useState<FeedbackType>("BUG");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pending, start] = useTransition();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim() || !body.trim()) return;
        setError(null);
        start(async () => {
            try {
                await submitFeedbackAction({ type, title, body });
                setDone(true);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to submit.");
            }
        });
    }

    if (done) {
        return (
            <div className="bg-surface border border-edge rounded-xl p-10 flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 border border-success/30 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-success">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-base font-bold text-foreground">Feedback Received</h2>
                    <p className="text-sm text-dimmed mt-1">Thank you — our team will review your submission.</p>
                </div>
                <Button
                    variant="secondary"
                    onClick={() => { setDone(false); setTitle(""); setBody(""); }}
                    className="mt-2"
                >
                    Submit Another
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-surface border border-edge rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-edge bg-surface-2">
                <p className="text-xs text-muted uppercase tracking-widest mb-1">New Submission</p>
                <p className="text-sm text-dimmed">All feedback is anonymous unless you're signed in.</p>
            </div>

            <div className="px-6 py-6 space-y-5">
                {/* Type */}
                <div>
                    <label className="block text-xs font-semibold text-foreground mb-2">
                        Type <span className="text-danger">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {TYPES.map((t) => (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => setType(t.value)}
                                className={cn(
                                    "text-left px-3 py-2.5 rounded-md border text-sm transition-colors",
                                    type === t.value
                                        ? "border-primary/50 bg-primary/5 text-foreground"
                                        : "border-edge bg-surface-2 text-dimmed hover:border-primary/20",
                                )}
                            >
                                <span className="block font-semibold text-xs">{t.label}</span>
                                <span className="block text-muted text-[11px] mt-0.5 leading-tight">{t.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Title <span className="text-danger">*</span>
                    </label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Short summary"
                        required
                        maxLength={120}
                        className="w-full bg-surface-2 border border-edge rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>

                {/* Body */}
                <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                        Details <span className="text-danger">*</span>
                    </label>
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Describe the issue, idea, or feedback in detail..."
                        required
                        rows={5}
                        maxLength={2000}
                        className="w-full bg-surface-2 border border-edge rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    />
                    <p className="text-[11px] text-muted mt-1 text-right">{body.length}/2000</p>
                </div>

                {error && (
                    <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-md px-3 py-2">
                        {error}
                    </p>
                )}

                <Button
                    type="submit"
                    disabled={pending || !title.trim() || !body.trim()}
                    className="px-6"
                >
                    {pending ? "Submitting..." : "Submit Feedback"}
                </Button>
            </div>
        </form>
    );
}
