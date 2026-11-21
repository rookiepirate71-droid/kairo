export default function Badge({
  children,
  tone = "gold",
}: {
  children: React.ReactNode;
  tone?: "gold" | "terra" | "stone";
}) {
  const tones = {
    gold: "border-oxidized text-oxidized",
    terra: "border-terracotta text-terracotta",
    stone: "border-stone text-marble",
  };
  return (
    <span
      className={`inline-block border px-2.5 py-0.5 rounded-sm font-mono text-[10px] tracking-[0.18em] uppercase ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
