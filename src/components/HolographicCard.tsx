import { useEffect, useRef, useState, type ReactNode, type MouseEvent, type TouchEvent } from "react";
import { type HolographicEffectType } from "../config/holographic";

interface HolographicCardProps {
  /** Type d'effet : "full" (inclinaison + reflet) ou "tilt-only" (inclinaison légère). */
  effect: HolographicEffectType;
  /** Enfants : l'image de la carte, etc. */
  children: ReactNode;
  /** ClassName additionnel. */
  className?: string;
  /** Désactive l'effet (ex. prefers-reduced-motion). */
  disabled?: boolean;
  /** Intensité max de l'inclinaison en degrés. */
  maxTilt?: number;
  /** Vitesse de l'animation de reflet (secondes). */
  shimmerSpeed?: number;
}

/**
 * Carte avec effet holographique :
 * - Inclinaison 3D suivant la souris / le toucher
 * - Reflet irisé animé (sur effet "full")
 * - Sur mobile : DeviceOrientation API (inclinaison téléphone) avec permission iOS,
 *   fallback sur le toucher/glissement
 * - Respecte prefers-reduced-motion (désactive tout, garde l'essentiel)
 * - N'anime QUE transform et opacity (fluidité mobile)
 */
export function HolographicCard({
  effect,
  children,
  className,
  disabled = false,
  maxTilt = 12,
  shimmerSpeed = 4,
}: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [useDeviceOrientation, setUseDeviceOrientation] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  // Détection prefers-reduced-motion au montage
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Demande de permission DeviceOrientation (iOS 13+) si nécessaire
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReduced || disabled) return;
    if (effect !== "full") return;

    // DeviceOrientationEvent.requestPermission existe seulement sur iOS (Safari)
    const requestPermission = async () => {
      try {
        // @ts-expect-error - requestPermission n'existe que sur iOS
        const permission = await DeviceOrientationEvent.requestPermission?.();
        if (permission === "granted") {
          setUseDeviceOrientation(true);
        }
      } catch {
        // Permission refusée ou non supportée → fallback tactile
      }
    };

    // On ne demande la permission qu'au premier interaction utilisateur
    // (clic/touch n'importe où) pour ne pas bloquer l'UI
    const onFirstInteraction = () => {
      requestPermission();
      document.removeEventListener("click", onFirstInteraction);
      document.removeEventListener("touchstart", onFirstInteraction);
    };
    document.addEventListener("click", onFirstInteraction, { once: true });
    document.addEventListener("touchstart", onFirstInteraction, { once: true, passive: true });

    return () => {
      document.removeEventListener("click", onFirstInteraction);
      document.removeEventListener("touchstart", onFirstInteraction);
    };
  }, [prefersReduced, disabled, effect]);

  // Gestion DeviceOrientation (inclinaison téléphone)
  useEffect(() => {
    if (!useDeviceOrientation || prefersReduced || disabled || effect !== "full") return;

    const handler = (event: DeviceOrientationEvent) => {
      // event.beta = inclinaison avant/arrière (-180 à 180)
      // event.gamma = inclinaison gauche/droite (-90 à 90)
      // On inverse gamma pour que l'inclinaison soit naturelle
      const x = Math.max(-maxTilt, Math.min(maxTilt, event.beta ?? 0));
      const y = Math.max(-maxTilt, Math.min(maxTilt, -(event.gamma ?? 0)));
      setTilt({ x, y });
    };

    window.addEventListener("deviceorientation", handler);
    return () => window.removeEventListener("deviceorientation", handler);
  }, [useDeviceOrientation, prefersReduced, disabled, effect, maxTilt]);

  // Gestion souris (desktop)
  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReduced || disabled || useDeviceOrientation) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = ((e.clientY - centerY) / (rect.height / 2)) * maxTilt;
    const y = ((e.clientX - centerX) / (rect.width / 2)) * maxTilt * -1;
    setTilt({ x: Math.max(-maxTilt, Math.min(maxTilt, x)), y: Math.max(-maxTilt, Math.min(maxTilt, y)) });
  };

  const onMouseLeave = () => {
    if (prefersReduced || disabled || useDeviceOrientation) return;
    setTilt({ x: 0, y: 0 });
  };

  // Gestion tactile (mobile fallback)
  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (prefersReduced || disabled || useDeviceOrientation) return;
    const touch = e.touches[0];
    if (!touch) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = ((touch.clientY - centerY) / (rect.height / 2)) * maxTilt;
    const y = ((touch.clientX - centerX) / (rect.width / 2)) * maxTilt * -1;
    setTilt({ x: Math.max(-maxTilt, Math.min(maxTilt, x)), y: Math.max(-maxTilt, Math.min(maxTilt, y)) });
  };

  const onTouchEnd = () => {
    if (prefersReduced || disabled || useDeviceOrientation) return;
    setTilt({ x: 0, y: 0 });
  };

  // Styles calculés : ONLY transform et opacity
  const cardStyle: React.CSSProperties = {
    transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
    transformStyle: "preserve-3d",
    transition: prefersReduced || disabled ? "none" : "transform 0.1s ease-out",
  };

  const shimmerStyle: React.CSSProperties = effect === "full" && !prefersReduced && !disabled
    ? {
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        pointerEvents: "none",
        background: "linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
        backgroundSize: "200% 100%",
        animation: `shimmer ${shimmerSpeed}s linear infinite`,
        opacity: 0.6,
      }
    : { display: "none" };

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-standard ${className}`}
      style={{ transformStyle: "preserve-3d" }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div style={cardStyle} className="relative">
        {children}
        {/* Reflet irisé animé */}
        <div style={shimmerStyle} aria-hidden="true" />
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}