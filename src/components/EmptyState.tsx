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
    <div className="flex flex-col items-center rounded-standard border border-line bg-surface px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-ink-muted">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="font-medium">{title}</h2>
      <p className="mt-1 max-w-xs text-sm text-ink-muted">{text}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
