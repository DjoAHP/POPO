import { cardImageUrl } from "../api/tcgdex";
import { HolographicCard } from "./HolographicCard";
import { Logo } from "./Logo";
import { getHoloTheme } from "../config/holographic";
import { t } from "../i18n";

interface CardImageProps {
  /** URL « nue » TCGdex (sans extension). Absente si la carte n'a pas de visuel. */
  image?: string;
  name: string;
  /** Rareté de la carte (ex. "Rare Holo", "Commune") — détermine l'effet holographique. */
  rarity?: string;
  quality?: "low" | "high";
  className?: string;
  /** Désactive l'effet holographique (ex. pour les miniatures en grille). */
  disableHolographic?: boolean;
  /** Inclinaison au gyroscope (opt-in explicite depuis la fiche carte). */
  gyroscope?: boolean;
}

/**
 * Image de carte TCGdex, toujours respectée (jamais déformée ni rognée :
 * ratio natif 245×337 en `low`, 600×825 en `high`).
 * Repli propre quand la carte n'a pas de visuel dans la base.
 *
 * En fiche carte (`high`) : inclinaison 3D + iridescence dont l'intensité
 * dépend de la rareté (docs/DESIGN.md §5). En grille (`low`) : image seule,
 * le reflet est géré en CSS par `CardTile`.
 */
export function CardImage({
  image,
  name,
  rarity,
  quality = "low",
  className,
  disableHolographic = false,
  gyroscope = false,
}: CardImageProps) {
  const url = cardImageUrl(image, quality);

  if (!url) {
    return (
      <div
        className={[
          "relative flex aspect-[245/337] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-card border border-line/60 bg-gradient-to-br from-surface-2 via-surface to-surface-2 text-ink-muted",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-accent/10 blur-2xl"
        />
        <Logo className="h-9 w-9 opacity-25" />
        <span className="text-[11px]">{t.common.noVisual}</span>
      </div>
    );
  }

  const img = (
    <img
      src={url}
      alt={name}
      loading="lazy"
      width={quality === "high" ? 600 : 245}
      height={quality === "high" ? 825 : 337}
      className="block aspect-[245/337] w-full"
    />
  );

  // Miniatures en grille : pas d'effet holographique (perf + lisibilité)
  if (disableHolographic || quality === "low") {
    return <>{img}</>;
  }

  // Fiche carte : effet dont l'intensité dépend de la rareté.
  return (
    <HolographicCard theme={getHoloTheme(rarity)} gyroscope={gyroscope}>
      {img}
    </HolographicCard>
  );
}
