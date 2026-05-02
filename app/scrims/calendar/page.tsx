import { Suspense } from "react";
import { graphql } from "@/app/api/graphql/types";
import { ScrimCalendar } from "@/components/scrims/ScrimCalendar";
import { Button } from "@/components/shared/Button";
import { grafbase } from "@/lib/database/grafbase";

const ScrimCalendarPageQuery = graphql(`
  query ScrimCalendar {
    getScrimmages {
      _id
      host {
        _id
        name
      }
      hostTeam {
        name
        members {
            _id
            steam { id }
            name
        }
      }
      hostOrg {
        name
      }
      opponentOrg {
        name
      }
      opponentTeam {
        leader {
            name
        }
      }
      scheduledAt
      status
      createdAt
      region
      note
      bestOf
    }
  }
`);

export default function ScrimCalendarPage() {
    return (
        <main className="flex-1">
            <div className="border-b border-edge bg-surface">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-px w-6 bg-primary" />
                                <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
                                    Schedule
                                </span>
                            </div>
                            <h1 className="text-3xl font-black uppercase text-foreground">
                                Scrimmage Calendar
                            </h1>
                            <p className="text-sm text-dimmed mt-1">
                                View upcoming scrimmages by week. Hover any event for details.
                            </p>
                        </div>
                        <Button href="/scrims" variant="secondary" size="lg" className="shrink-0 self-start sm:self-auto">
                            Browse Open Scrims
                        </Button>
                    </div>
                </div>
            </div>
            <Suspense fallback={<CalendarSkeleton />}>
                <CalendarContent />
            </Suspense>
        </main>
    );
}

async function CalendarContent() {
    const { getScrimmages: scrimmages } = await grafbase.request(ScrimCalendarPageQuery);
    return <ScrimCalendar scrims={scrimmages} />;
}

function CalendarSkeleton() {
    return (
        <div className="animate-pulse p-6 max-w-7xl mx-auto w-full">
            <div className="flex justify-between mb-4">
                <div className="h-8 w-40 bg-surface-2 rounded-lg" />
                <div className="flex gap-2">
                    <div className="h-8 w-8 bg-surface-2 rounded-md" />
                    <div className="h-8 w-8 bg-surface-2 rounded-md" />
                </div>
            </div>
            <div className="grid grid-cols-7 gap-px bg-edge rounded-xl overflow-hidden border border-edge">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="bg-surface-2 py-2 px-3 h-10" />
                ))}
                {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="bg-surface min-h-24 p-2">
                        <div className="h-4 w-6 bg-surface-2 rounded mb-1" />
                    </div>
                ))}
            </div>
        </div>
    );
}
