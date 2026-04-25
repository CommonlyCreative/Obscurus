import { FeedbackForm } from "@/components/shared/FeedbackForm";

export default function FeedbackPage() {
    return (
        <main className="flex-1">
            <div className="border-b border-edge bg-surface">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-px w-6 bg-primary" />
                        <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
                            Community
                        </span>
                    </div>
                    <h1 className="text-3xl font-black uppercase text-foreground">Submit Feedback</h1>
                    <p className="text-sm text-dimmed mt-1">
                        Report bugs, share ideas, or send us your thoughts. We read everything.
                    </p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <FeedbackForm />
            </div>
        </main>
    );
}
