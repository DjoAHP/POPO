import { useState } from "react";
import { Layers } from "lucide-react";

interface SetLogoProps {
  /** URL « nue » du logo (sans extension). */
  logo?: string;
  /** URL « nue » du symbole, utilisée si le logo est absent ou introuvable. */
  symbol?: string;
  /** Nom du set (texte alternatif et repli visuel). */
  name: string;
  className?: string;
}

/**
 * Vignette d'un set (docs/DESIGN.md §3).
 *
 * Tous les sets ne sont pas illustrés dans TCGdex : certains renvoient 404.
 * On tente le logo, puis le symbole, puis une icône neutre — jamais de carré
 * vide, qui donnerait une impression de chargement cassé.
 */
export function SetLogo({ logo, symbol, name, className = "" }: SetLogoProps) {
  const sources = [logo, symbol]
    .filter((source): source is string => Boolean(source))
    .map((source) => `${source}.webp`);

  const [index, setIndex] = useState(0);
  const src = sources[index];

  if (!src) {
    return (
      <span
        aria-hidden="true"
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-glass text-ink-muted ${className}`}
      >
        <Layers className="h-5 w-5" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={`Logo ${name}`}
      loading="lazy"
      width={40}
      height={40}
      onError={() => setIndex((current) => current + 1)}
      className={`h-10 w-10 shrink-0 rounded-control object-contain ${className}`}
    />
  );
}
