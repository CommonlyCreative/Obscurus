import { Button } from "@/components/shared/Button";

export function ScrimsPageHeader({ totalOpen }: { totalOpen: number }) {
  return (
    <div className="border-b border-edge bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px w-6 bg-primary" />
              <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
                {totalOpen} Open
              </span>
            </div>
            <h1 className="text-3xl font-black uppercase text-foreground">Scrimmages</h1>
            <p className="text-sm text-dimmed mt-1">
              Browse open match requests. Request to join any team below.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button href="/scrims/calendar" size="lg" variant="secondary" className="shrink-0">
              View Calendar
            </Button>
            <Button href="/scrims/create" size="lg" className="shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Post a Scrim
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
