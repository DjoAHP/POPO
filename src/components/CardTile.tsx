import type { ReactNode } from "react";
import { CardImage } from "./CardImage";
import { isHolographicRarity } from "../config/holographic";

interface CardTileProps {
  image?: string;
  name: string;
  meta?: string;
  rarity?: string;
  quantity?: number;
  badge?: ReactNode;
}

/**
 * Carte de grille présentative (docs/DESIGN.md §3).
 * Le lien ou le bouton est fourni par l'appelant.
 * Les cartes rares reçoivent un reflet irisé CSS au survol (aucun JS).
 */
export function CardTile({ image, name, meta, rarity, quantity, badge }: CardTileProps) {
  const holo = isHolographicRarity(rarity);

  return (
    <div className="card-tile" data-holo={holo ? "true" : undefined}>
      <div className="card-tile-media">
        <CardImage image={image} name={name} />
        {holo && <span className="card-sheen" aria-hidden="true" />}
        {quantity !== undefined && quantity > 1 && (
          <span className="absolute right-1.5 top-1.5 rounded-pill bg-bg/85 px-1.5 py-0.5 text-[11px] font-semibold backdrop-blur">
            ×{quantity}
          </span>
        )}
        {badge && <span className="absolute left-1.5 top-1.5">{badge}</span>}
      </div>
      <p className="mt-2 truncate text-[13px] font-medium">{name}</p>
      {meta && <p className="truncate text-[11px] text-ink-muted">{meta}</p>}
    </div>
  );
}
