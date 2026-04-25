export function HeroBackground() {
  return (
    <>
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#e8bc87 1px, transparent 1px), linear-gradient(90deg, #e8bc87 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="absolute right-[-8%] top-1/2 -translate-y-1/2 w-150 h-150 border border-primary/6  rounded-full hidden lg:block pointer-events-none" />
      <div className="absolute right-[-4%] top-1/2 -translate-y-1/2 w-105 h-105 border border-primary/10 rounded-full hidden lg:block pointer-events-none" />
      <div className="absolute right-[4%]  top-1/2 -translate-y-1/2 w-60  h-60  border border-primary/14 rounded-full hidden lg:block pointer-events-none" />
    </>
  );
}
