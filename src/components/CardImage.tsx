import { cardImageUrl } from "../api/tcgdex";

interface CardImageProps {
  /** URL « nue » TCGdex (sans extension). Absente si la carte n'a pas de visuel. */
  image?: string;
  name: string;
  quality?: "low" | "high";
  className?: string;
}

/**
 * Image de carte TCGdex, toujours respectée (jamais déformée ni rognée :
 * ratio natif 245×337 en `low`, 600×825 en `high`).
 * Repli propre quand la carte n'a pas de visuel dans la base.
 */
export function CardImage({ image, name, quality = "low", className }: CardImageProps) {
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

  return (
    <img
      src={url}
      alt={name}
      loading="lazy"
      width={quality === "high" ? 600 : 245}
      height={quality === "high" ? 825 : 337}
      className={["aspect-[245/337] w-full", className].filter(Boolean).join(" ")}
    />
  );
}
