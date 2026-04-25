export interface Stat {
  value: string | number;
  label: string;
}

export function StatItem({ stat }: { stat: Stat }) {
  return (
    <div className="py-5 px-6 text-center">
      <div className="text-2xl font-black text-primary">{stat.value}</div>
      <div className="text-xs text-muted mt-0.5">{stat.label}</div>
    </div>
  );
}
