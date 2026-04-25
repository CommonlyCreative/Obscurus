export function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="h-px w-6 bg-primary" />
      <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
        {children}
      </span>
    </div>
  );
}
