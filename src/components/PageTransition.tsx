import { motion, type MotionProps } from "motion/react";
import { useLocation } from "react-router-dom";

/**
 * Wrapper de transition de page (section 7 : transitions douces).
 * Utilise Motion (ex-Framer Motion) pour animer l'entrée/sortie.
 * Respecte prefers-reduced-motion (désactivé automatiquement par Motion).
 */
interface PageTransitionProps {
  /** Props passées au composant motion.div. */
  motionProps?: MotionProps;
  /** Enfants : le contenu de la page. */
  children: React.ReactNode;
}

/**
 * Transition partagée : on utilise le prop `transition` directement
 * sur le motion.div avec `initial`, `animate`, `exit` (pas de variants).
 * N'anime QUE opacity et transform (fluidité mobile).
 */
const pageTransition = {
  duration: 0.25,
  ease: "easeOut" as const,
};

export function PageTransition({ children, motionProps }: PageTransitionProps) {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={pageTransition}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

/**
 * Variante pour les transitions d'onglets (plus rapide).
 */
export function TabTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Variante pour le zoom fluide grille → fiche (section 7).
 * Utilisé par la fiche carte pour un effet de zoom depuis la miniature.
 * NOTE : nécessite une coordination avec la grille (FLIP animation).
 * Version simplifiée ici : apparition par zoom + fade.
 */
export function ZoomTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}