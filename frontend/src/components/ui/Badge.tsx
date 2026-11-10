type BadgeTone = "neutral" | "vegetarian" | "spicy" | "popular";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  vegetarian: "bg-emerald-50 text-emerald-700",
  spicy: "bg-orange-50 text-orange-700",
  popular: "bg-amber-50 text-amber-700",
};

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}