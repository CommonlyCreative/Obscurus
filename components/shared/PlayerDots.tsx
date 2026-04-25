export function PlayerDots({ filled }: { filled: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i < filled ? "bg-primary" : "bg-edge"}`}
        />
      ))}
    </div>
  );
}
