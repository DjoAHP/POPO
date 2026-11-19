import type { ComponentType, ReactNode } from "react";
import { Surface } from "./Surface";

interface StatTileProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "accent" | "gold" | "brand2";
}

const tones = {
  accent: "bg-accent/12 text-accent",
  gold: "bg-gold/12 text-gold",
  brand2: "bg-brand-2/12 text-brand-2",
};

/** Tuile statistique (Accueil, Réglages). */
export function StatTile({ icon: Icon, label, value, hint, tone = "accent" }: StatTileProps) {
  return (
    <Surface className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-ink-muted">{label}</p>
          <p className="tabular mt-1 text-2xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
        </div>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-control ${tones[tone]}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </Surface>
  );
}
