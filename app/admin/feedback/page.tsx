import { getFeedbacksAction } from "../actions";
import { FeedbackPanel } from "@/components/admin/FeedbackPanel";

export default async function AdminFeedbackPage() {
    const feedback = await getFeedbacksAction();

    return (
        <div className="p-4 sm:p-8 max-w-4xl">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-px w-6 bg-primary" />
                    <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">Admin</span>
                </div>
                <h1 className="text-3xl font-black uppercase text-foreground">Feedback</h1>
                <p className="text-sm text-dimmed mt-1">View and manage community feedback reports.</p>
            </div>

            <FeedbackPanel feedback={feedback} />
        </div>
    );
}
