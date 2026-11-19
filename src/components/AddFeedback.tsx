import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { Check } from "lucide-react";

/**
 * Retour visuel à l'ajout d'une carte (section 7) : coche animée par-dessus
 * l'interface. Respecte prefers-reduced-motion.
 */
interface AddFeedbackProps {
  /** Déclencheur : quand `true`, la coche apparaît brièvement. */
  trigger: boolean;
  /** Contenu toujours affiché (ex. le bouton d'ajout). */
  children: ReactNode;
  /** Durée d'affichage de la coche (ms). */
  duration?: number;
}

/**
 * Enveloppe un contrôle et superpose une coche animée quand `trigger` passe
 * à `true`.
 *
 * Correctif : les enfants sont TOUJOURS rendus. La version précédente
 * renvoyait `null` hors animation, ce qui faisait disparaître les boutons
 * « Ajouter à ma collection / wishlist » de la fiche carte.
 */
export function AddFeedback({ trigger, children, duration = 800 }: AddFeedbackProps) {
  const [show, setShow] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!trigger) return;
    setShow(true);
    const timer = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(timer);
  }, [trigger, duration]);

  return (
    <>
      {children}
      <AnimatePresence>
        {show && !prefersReduced && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
            aria-hidden="true"
          >
            <motion.span
              initial={{ scale: 0.5, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent to-brand-2 text-on-brand shadow-[var(--shadow-float)]"
            >
              <Check className="h-8 w-8" strokeWidth={3} />
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Variante inline (pour feedback local, ex. dans la grille) :
 * affiche un contenu de remplacement bref quand `trigger` est vrai.
 */
interface InlineAddFeedbackProps {
  trigger: boolean;
  children: ReactNode;
  className?: string;
}

export function InlineAddFeedback({ trigger, children, className }: InlineAddFeedbackProps) {
  const prefersReduced = useReducedMotion();

  if (!trigger) return <>{children}</>;

  if (prefersReduced) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
      className={className}
    >
      {children}
    </motion.span>
  );
}
