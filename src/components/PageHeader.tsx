import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Élément optionnel à droite du titre (ex. bouton de thème). */
  action?: ReactNode;
}

/** En-tête commun à toutes les pages : titre + description discrète. */
export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
