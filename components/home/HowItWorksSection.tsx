import { SectionLabel } from "@/components/shared/SectionLabel";
import { StepCard, type Step } from "./StepCard";

const STEPS: Step[] = [
  {
    step: "01",
    title: "Connect Discord",
    body: "Link your Discord account to verify your identity and get access to the full platform.",
  },
  {
    step: "02",
    title: "Build Your Team",
    body: "Create a team and invite up to 5 other players. Manage your roster from your profile.",
  },
  {
    step: "03",
    title: "Post a Scrim",
    body: "Once your 6-player roster is ready, post an open scrimmage or browse for opponents.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 border-b border-edge">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <SectionLabel>Getting Started</SectionLabel>
          <h2 className="text-3xl font-black uppercase text-foreground">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-edge rounded-lg overflow-hidden">
          {STEPS.map((step) => (
            <StepCard key={step.step} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
}
