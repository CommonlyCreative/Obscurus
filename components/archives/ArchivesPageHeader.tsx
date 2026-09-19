export function ArchivesPageHeader() {
    return (
        <div className="border-b border-edge bg-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-px w-6 bg-primary" />
                    <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">History</span>
                </div>
                <h1 className="text-3xl font-black uppercase text-foreground">Archives</h1>
                <p className="text-sm text-dimmed mt-1">
                    Browse completed scrimmages. Filter by player, organization, rank, and more.
                </p>
            </div>
        </div>
    );
}
