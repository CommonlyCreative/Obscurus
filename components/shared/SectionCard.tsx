export function SectionCard({ title, subtitle, children }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="bg-surface border border-edge rounded-lg p-5 space-y-4">
            <div>
                <h2 className="text-sm font-bold text-foreground">{title}</h2>
                {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
            </div>
            {children}
        </section>
    );
}
