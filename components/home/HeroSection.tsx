import { HeroBackground } from "./HeroBackground";
import { HeroCopy } from "./HeroCopy";
import { StatsBar } from "./StatsBar";

export function HeroSection({ scrims, players, orgs }: { scrims: number, players: number, orgs: number }) {
  return (
    <section className="relative flex flex-col justify-center min-h-[88vh] overflow-hidden border-b border-edge">
      <HeroBackground />
      <HeroCopy />
      <StatsBar scrims={scrims} players={players} orgs={orgs} />
    </section>
  );
}
