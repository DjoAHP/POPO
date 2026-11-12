import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

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

/**
 * Nombre animé générique (pour compteurs simples).
 */
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
}

function AnimatedNumber({ value, duration = 1, className }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      setDisplayValue(value);
      return;
    }
    const startTime = performance.now();
    const startValue = displayValue;

    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // Easing easeOut
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startValue + (value - startValue) * eased);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration, prefersReduced, displayValue]);

  return <motion.span className={className}>{Math.round(displayValue)}</motion.span>;
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

  return <AnimatedNumber value={value} duration={duration} className={className} />;
}

/**
 * Version pour les valeurs monétaires (€).
 */
export function AnimatedEurCounter({
  value,
  duration = 1.2,
  className,
}: Omit<AnimatedCounterProps, "formatter">) {
  return (
    <AnimatedCounter
      value={value}
      formatter={(v) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v)}
      duration={duration}
      className={className}
    />
  );
}

/**
 * Version pour les entiers simples (nombre de cartes).
 */
export function AnimatedIntCounter({
  value,
  duration = 0.8,
  className,
}: Omit<AnimatedCounterProps, "formatter">) {
  return <AnimatedCounter value={value} formatter={(v) => v.toLocaleString("fr-FR")} duration={duration} className={className} />;
}