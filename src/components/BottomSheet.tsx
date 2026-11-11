import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Feuille modale qui monte du bas sur mobile (et se centre sur grand écran).
 * Sert à l'édition d'une carte de la collection, aux confirmations, etc.
 * Accessibilité : role="dialog", fermeture par Échap ou clic sur le fond,
 * focus déplacé dans la feuille à l'ouverture.
 */
export function BottomSheet({ open, title, onClose, children }: BottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    // Focus initial : premier élément interactif de la feuille.
    panelRef.current?.querySelector<HTMLElement>("button, select, input, a")?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center">
      {/* Fond cliquable pour fermer */}
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md rounded-t-standard border border-line bg-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:rounded-standard"
      >
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-9 w-9 items-center justify-center rounded-standard text-ink-muted hover:bg-surface-2 hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
