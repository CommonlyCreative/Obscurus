export interface Step {
  step: string;
  title: string;
  body: string;
}

export function StepCard({ step }: { step: Step }) {
  return (
    <div className="bg-surface p-8 relative">
      <span className="text-6xl font-black text-edge absolute top-5 right-6 select-none leading-none">
        {step.step}
      </span>
      <div className="w-8 h-8 border border-primary/40 rounded-sm flex items-center justify-center mb-6">
        <div className="w-2 h-2 bg-primary rounded-full" />
      </div>
      <h3 className="text-sm font-bold text-foreground mb-2">{step.title}</h3>
      <p className="text-sm text-dimmed leading-relaxed">{step.body}</p>
    </div>
  );
}
