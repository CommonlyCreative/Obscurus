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
            mmr
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

export default async function ScrimCalendarPage() {
    const { getScrimmages: scrimmages } = await grafbase.request(ScrimCalendarPageQuery);

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
            <ScrimCalendar scrims={scrimmages} />
        </main>
    );
}
