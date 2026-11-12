import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Retour visuel à l'ajout d'une carte (section 7) : léger "pop" ou coche.
 * Respecte prefers-reduced-motion.
 */
interface AddFeedbackProps {
  /** Déclencheur : quand `true`, l'animation se joue. */
  trigger: boolean;
  /** Enfants : le contenu à afficher (ex. icône de coche). */
  children: ReactNode;
  /** Délai avant de masquer (ms). */
  duration?: number;
}

/**
 * Wrapper qui joue l'animation quand `trigger` devient true.
 */
export function AddFeedback({
  trigger,
  children,
  duration = 800,
}: AddFeedbackProps) {
  const [show, setShow] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), duration);
      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  if (!show) return null;

  if (prefersReduced) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.2, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
    >
      <motion.div
        initial={{ scale: 0.5, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-ink shadow-lg"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/**
 * Variante inline (pour feedback local, ex. dans la grille).
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