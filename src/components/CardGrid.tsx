import { Link } from "react-router-dom";
import { CardImage } from "./CardImage";
import type { TcgdexCardBrief } from "../api/types";

/** Grille de miniatures, partagée par la Recherche (puis Collection/Wishlist). */
export function CardGrid({ cards }: { cards: TcgdexCardBrief[] }) {
  return (
    <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {cards.map((card) => (
        <li key={card.id}>
          <Link
            to={`/carte/${encodeURIComponent(card.id)}`}
            className="block rounded-standard transition-opacity hover:opacity-90 focus-visible:opacity-100"
          >
            <CardImage image={card.image} name={card.name} />
            <p className="mt-1.5 truncate text-xs">{card.name}</p>
            <p className="truncate text-[11px] text-ink-muted">{card.id}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Squelette de la grille pendant le chargement (section 7 : pas de spinner). */
export function CardGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <div className="aspect-[245/337] w-full animate-pulse rounded-standard bg-surface-2" />
          <div className="mt-1.5 h-3 w-3/4 animate-pulse rounded-standard bg-surface-2" />
          <div className="mt-1 h-2.5 w-1/2 animate-pulse rounded-standard bg-surface-2" />
        </li>
      ))}
    </ul>
  );
}
