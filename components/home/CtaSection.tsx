import { DiscordIcon } from "@/components/shared/DiscordIcon";
import { Button } from "@/components/shared/Button";

export function CtaSection() {
  return (
    <section className="bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black uppercase text-foreground mb-1">
            Ready to Compete?
          </h3>
          <p className="text-sm text-dimmed">
            Connect your Discord and create your team in under a minute.
          </p>
        </div>
        <Button variant="discord" size="xl" className="shrink-0">
          <DiscordIcon />
          Get Started with Discord
        </Button>
      </div>
    </section>
  );
}
