import { Link } from "react-router-dom";
import { CardTile } from "./CardTile";
import type { TcgdexCardBrief } from "../api/types";

const gridClass =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

/** Grille de miniatures, partagée par Recherche, Collection et Wishlist. */
export function CardGrid({ cards }: { cards: TcgdexCardBrief[] }) {
  return (
    <ul className={gridClass}>
      {cards.map((card) => (
        <li key={card.id}>
          <Link to={`/carte/${encodeURIComponent(card.id)}`} className="block rounded-card">
            <CardTile image={card.image} name={card.name} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Squelette de la grille pendant le chargement (section 7 : pas de spinner). */
export function CardGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <ul className={gridClass} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <div className="aspect-[245/337] w-full animate-pulse rounded-card bg-surface-2" />
          <div className="mt-2 h-3 w-3/4 animate-pulse rounded-pill bg-surface-2" />
          <div className="mt-1.5 h-2.5 w-1/2 animate-pulse rounded-pill bg-surface-2" />
        </li>
      ))}
    </ul>
  );
}
