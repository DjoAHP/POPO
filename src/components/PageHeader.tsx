import type { ReactNode } from "react";

interface PageHeaderProps {
  /** Micro-étiquette en majuscules (ex. « MA COLLECTION »). */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Élément optionnel à droite du titre. */
  action?: ReactNode;
}

/** En-tête commun à toutes les pages (docs/DESIGN.md §2.3). */
export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight sm:text-[32px]">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
