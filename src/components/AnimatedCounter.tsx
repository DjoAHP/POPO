import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * Compteur animé : la valeur monte jusqu'à son total (section 7).
 * Respecte prefers-reduced-motion (affiche directement la valeur finale).
 */
interface AnimatedCounterProps {
  /** Valeur finale à atteindre. */
  value: number;
  /** Fonction de formatage (ex. formatEur). */
  formatter?: (v: number) => string;
  /** Durée de l'animation en secondes. */
  duration?: number;
  /** ClassName additionnel. */
  className?: string;
}

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  formatter?: (v: number) => string;
}

/**
 * Nombre animé générique.
 * La valeur affichée est suivie dans un ref pour éviter de relancer
 * l'animation à chaque image (l'effet ne dépend que de `value`).
 */
function AnimatedNumber({
  value,
  duration = 1,
  className,
  formatter = (v) => String(Math.round(v)),
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const displayRef = useRef(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      displayRef.current = value;
      setDisplayValue(value);
      return;
    }

    const from = displayRef.current;
    const startTime = performance.now();
    let raf = 0;

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      // Easing easeOut
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (value - from) * eased;
      displayRef.current = next;
      setDisplayValue(next);
      if (progress < 1) raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, prefersReduced]);

  return <span className={className}>{formatter(displayValue)}</span>;
}

export function AnimatedCounter({
  value,
  formatter = (v) => v.toLocaleString("fr-FR"),
  duration = 1.2,
  className,
}: AnimatedCounterProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <span className={className}>{formatter(value)}</span>;
  }

  return (
    <AnimatedNumber
      value={value}
      duration={duration}
      className={className}
      formatter={formatter}
    />
  );
}

/** Version pour les valeurs monétaires (€). */
export function AnimatedEurCounter({
  value,
  duration = 1.2,
  className,
}: Omit<AnimatedCounterProps, "formatter">) {
  return (
    <AnimatedCounter
      value={value}
      formatter={(v) =>
        new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
        }).format(v)
      }
      duration={duration}
      className={className}
    />
  );
}

/** Version pour les entiers simples (nombre de cartes). */
export function AnimatedIntCounter({
  value,
  duration = 0.8,
  className,
}: Omit<AnimatedCounterProps, "formatter">) {
  return (
    <AnimatedCounter
      value={value}
      formatter={(v) => String(Math.round(v))}
      duration={duration}
      className={className}
    />
  );
}
