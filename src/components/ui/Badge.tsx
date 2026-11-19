import type { ReactNode } from "react";

export type BadgeTone =
  | "neutral"
  | "accent"
  | "cyan"
  | "gold"
  | "success"
  | "danger";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line/70 bg-surface-2 text-ink-muted",
  accent: "border-accent/30 bg-accent/10 text-accent",
  cyan: "border-cyan/30 bg-cyan/10 text-cyan",
  gold: "border-gold/30 bg-gold/10 text-gold",
  success: "border-success/30 bg-success/10 text-success",
  danger: "border-danger/30 bg-danger/10 text-danger",
};

interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

/** Pastille compacte (rareté, type, quantité). */
export function Badge({ tone = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-pill border px-2.5 py-0.5 text-[11px] font-medium",
        tones[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
