import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";
import type { HoloTheme } from "../config/holographic";

interface HolographicCardProps {
  /** Thème iridescent déterminé par la rareté. */
  theme: HoloTheme;
  /** Contenu : l'image de la carte. */
  children: ReactNode;
  className?: string;
  /** Désactive toute interaction (image absente, carte en cours de chargement…). */
  disabled?: boolean;
  /** Inclinaison au gyroscope, après accord explicite de l'utilisateur. */
  gyroscope?: boolean;
}

/** Amplitude maximale de l'inclinaison, en degrés. */
const MAX_TILT = 12;
/** Amplitude réduite des cartes communes : effet présent, jamais spectaculaire. */
const MAX_TILT_STANDARD = 5;

interface HoloTarget {
  /** Position horizontale du pointeur, 0 → 1. */
  x: number;
  /** Position verticale du pointeur, 0 → 1. */
  y: number;
  /** Rotation autour de l'axe horizontal, en degrés. */
  rx: number;
  /** Rotation autour de l'axe vertical, en degrés. */
  ry: number;
}

const NEUTRAL: HoloTarget = { x: 0.5, y: 0.5, rx: 0, ry: 0 };

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

/**
 * Carte avec effet holographique (docs/DESIGN.md §5).
 *
 * Correction du rognage : le conteneur qui porte la rotation 3D
 * (`.holo-card`) ne masque rien. Seule `.holo-clip`, autour de l'image,
 * applique `overflow: hidden` et l'arrondi. Les coins peuvent donc sortir de
 * la boîte pendant l'inclinaison sans être coupés.
 *
 * Technique : les positions sont écrites dans des variables CSS
 * (`--holo-x`, `--holo-y`, `--holo-rx`, `--holo-ry`) via une seule frame
 * `requestAnimationFrame` par mouvement. Aucun re-render React.
 */
export function HolographicCard({
  theme,
  children,
  className,
  disabled = false,
  gyroscope = false,
}: HolographicCardProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const targetRef = useRef<HoloTarget>(NEUTRAL);
  const prefersReduced = useReducedMotion();

  const interactive = !disabled && !prefersReduced;
  const maxTilt = theme.id === "standard" ? MAX_TILT_STANDARD : MAX_TILT;

  /* ---------------------------- écriture DOM ---------------------------- */

  const applyTarget = useCallback(() => {
    frameRef.current = null;
    const card = cardRef.current;
    if (!card) return;

    const { x, y, rx, ry } = targetRef.current;
    card.style.setProperty("--holo-x", x.toFixed(4));
    card.style.setProperty("--holo-y", y.toFixed(4));
    card.style.setProperty("--holo-rx", `${rx.toFixed(2)}deg`);
    card.style.setProperty("--holo-ry", `${ry.toFixed(2)}deg`);
  }, []);

  const schedule = useCallback(
    (next: HoloTarget) => {
      targetRef.current = next;
      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(applyTarget);
      }
    },
    [applyTarget],
  );

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  /* ------------------------- pointeur / toucher ------------------------- */

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const stage = stageRef.current;
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = clamp((event.clientX - rect.left) / rect.width);
    const y = clamp((event.clientY - rect.top) / rect.height);

    schedule({
      x,
      y,
      rx: (0.5 - y) * maxTilt * 2,
      ry: (x - 0.5) * maxTilt * 2,
    });
  };

  const handlePointerEnter = () => {
    if (!interactive || !cardRef.current) return;
    cardRef.current.dataset.active = "true";
    // Promu seulement pendant l'interaction (docs/DESIGN.md §5.7).
    cardRef.current.style.willChange = "transform";
  };

  const reset = () => {
    if (!cardRef.current) return;
    delete cardRef.current.dataset.active;
    cardRef.current.style.willChange = "";
    if (!interactive) return;
    schedule(NEUTRAL);
  };

  /* ------------------------------ gyroscope ----------------------------- */

  useEffect(() => {
    if (!gyroscope || !interactive) return;
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
      return;
    }

    // Position neutre = orientation du téléphone au moment de l'activation.
    let origin: { beta: number; gamma: number } | null = null;

    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null) return;
      if (!origin) origin = { beta: event.beta, gamma: event.gamma };

      const deltaBeta = event.beta - origin.beta;
      const deltaGamma = event.gamma - origin.gamma;

      schedule({
        x: clamp(0.5 + deltaGamma / 60),
        y: clamp(0.5 + deltaBeta / 60),
        rx: clamp(deltaBeta * 0.35, -maxTilt, maxTilt),
        ry: clamp(-deltaGamma * 0.35, -maxTilt, maxTilt),
      });
    };

    window.addEventListener("deviceorientation", onOrientation);
    return () => window.removeEventListener("deviceorientation", onOrientation);
  }, [gyroscope, interactive, maxTilt, schedule]);

  /* -------------------------------- rendu ------------------------------- */

  const cardStyle = {
    "--foil-1": theme.foil[0],
    "--foil-2": theme.foil[1],
    "--foil-3": theme.foil[2],
    "--holo-strength": theme.intensity,
    boxShadow: `0 26px 50px -28px ${theme.glow}`,
  } as CSSProperties;

  return (
    <div
      ref={stageRef}
      className={["holo-stage relative", className].filter(Boolean).join(" ")}
      onPointerMove={interactive ? handlePointerMove : undefined}
      onPointerEnter={interactive ? handlePointerEnter : undefined}
      onPointerLeave={interactive ? reset : undefined}
      onPointerCancel={interactive ? reset : undefined}
    >
      <div ref={cardRef} className="holo-card" style={cardStyle}>
        {/* Seul élément masquant : l'image. */}
        <div className="holo-clip">{children}</div>

        {theme.id !== "standard" && (
          <>
            <span className="holo-layer holo-foil" aria-hidden="true" />
            <span className="holo-layer holo-glare" aria-hidden="true" />
          </>
        )}
        <span className="holo-layer holo-grain" aria-hidden="true" />
        <span className="holo-layer holo-edge" aria-hidden="true" />
      </div>
    </div>
  );
}
