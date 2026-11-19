import type { ComponentType, ReactNode } from "react";

interface EmptyStateProps {
  /** Icône Lucide illustrant l'état vide. */
  icon: ComponentType<{ className?: string }>;
  title: string;
  text: string;
  /** Actions optionnelles sous le texte (ex. bouton). */
  children?: ReactNode;
}

/**
 * État vide réutilisable partout (section 5 : « liste vide avec message
 * utile »), affiché dans une surface arrondie et discrète.
 */
export function EmptyState({ icon: Icon, title, text, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-card border border-line/70 bg-glass px-6 py-12 text-center backdrop-blur-xl">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-pill bg-gradient-to-br from-accent/15 to-brand-2/15 text-accent">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="font-medium">{title}</h2>
      <p className="mt-1 max-w-xs text-sm text-ink-muted">{text}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
