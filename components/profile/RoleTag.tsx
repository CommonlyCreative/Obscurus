const ROLE_COLORS: Record<string, string> = {
  Flex:    "text-primary bg-primary/10",
  Support: "text-[#94d4a4] bg-[#94d4a4]/10",
  Carry:   "text-[#f4a261] bg-[#f4a261]/10",
  Tank:    "text-[#b9f2ff] bg-[#b9f2ff]/10",
};

export function RoleTag({ role }: { role: string }) {
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[role] ?? "text-dimmed bg-surface-2"}`}>
      {role}
    </span>
  );
}
