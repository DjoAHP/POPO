import type { ReactNode } from "react";

type SurfaceVariant = "solid" | "glass" | "gradient";

interface SurfaceProps {
  variant?: SurfaceVariant;
  className?: string;
  children: ReactNode;
}

const variants: Record<SurfaceVariant, string> = {
  solid: "border-line/70 bg-surface",
  glass: "border-line/60 bg-glass backdrop-blur-xl",
  gradient:
    "border-line/60 bg-gradient-to-br from-accent/10 via-glass to-brand-2/10 backdrop-blur-xl",
};

/** Panneau de base (docs/DESIGN.md §3). */
export function Surface({ variant = "solid", className, children }: SurfaceProps) {
  return (
    <div
      className={[
        "rounded-card border shadow-[var(--shadow-soft)]",
        variants[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
