export function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bg-surface border border-edge rounded-lg p-4 text-center">
      <div className="text-2xl font-black text-foreground">{value}</div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
    </div>
  );
}
