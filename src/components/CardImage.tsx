import { cardImageUrl } from "../api/tcgdex";
import { HolographicCard } from "./HolographicCard";
import { getHolographicEffectType } from "../config/holographic";

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
}

/**
 * Image de carte TCGdex, toujours respectée (jamais déformée ni rognée :
 * ratio natif 245×337 en `low`, 600×825 en `high`).
 * Repli propre quand la carte n'a pas de visuel dans la base.
 * Sur les cartes rares/holo : inclinaison 3D + reflet irisé (effet "full").
 * Sur les communes : inclinaison légère seulement (effet "tilt-only").
 */
export function CardImage({
  image,
  name,
  rarity,
  quality = "low",
  className,
  disableHolographic = false,
}: CardImageProps) {
  const url = cardImageUrl(image, quality);

  if (!url) {
    return (
      <div
        className={[
          "flex aspect-[245/337] w-full items-center justify-center rounded-standard bg-surface-2 text-xs text-ink-muted",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        Pas de visuel
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
      className="aspect-[245/337] w-full"
    />
  );

  // Miniatures en grille : pas d'effet holographique (perf + lisibilité)
  if (disableHolographic || quality === "low") {
    return <>{img}</>;
  }

  // Fiche carte (high) : effet selon la rareté
  const effect = getHolographicEffectType(rarity);
  return (
    <HolographicCard effect={effect} maxTilt={effect === "full" ? 12 : 3}>
      {img}
    </HolographicCard>
  );
}
