import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-edge bg-background mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">Obscurus</span>
                    <span className="text-muted text-xs">·</span>
                    <span className="text-xs text-muted">Deadlock Scrimmage Platform</span>
                </div>
                <div>
                    <p className="text-xs text-muted">
                        Not affiliated with Valve or the Deadlock development team.
                    </p>
                    <hr className="my-2" />
                    <div className="flex items-center gap-1 px-2">
                        <Link href="/privacy" className="text-xs text-neutral-400 hover:text-foreground">Privacy</Link>
                        <p className="text-muted">·</p>
                        <Link href="/terms" className="text-xs text-neutral-400 hover:text-foreground">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
