export function Footer() {
    return (
        <footer className="border-t border-edge bg-background mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">Obscurus</span>
                    <span className="text-muted text-xs">·</span>
                    <span className="text-xs text-muted">Deadlock Scrimmage Platform</span>
                </div>
                <p className="text-xs text-muted">
                    Not affiliated with Valve or the Deadlock development team.
                </p>
            </div>
        </footer>
    );
}
