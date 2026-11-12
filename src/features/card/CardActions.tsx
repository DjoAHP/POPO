import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { Bookmark, BookmarkCheck, Check, Library } from "lucide-react";
import type { TcgdexCard } from "../../api/types";
import { db } from "../../db/database";
import { addToCollection } from "../../db/collection";
import { buildSnapshot } from "../../db/snapshot";
import { toggleWishlist } from "../../db/wishlist";
import { t } from "../../i18n";
import { AddFeedback } from "../../components/AddFeedback";

interface CardActionsProps {
  card: TcgdexCard;
  /** Taux USD→EUR, pour valoriser la carte dans l'instantané. */
  rate: number;
}

/**
 * Boutons de la fiche carte (fonctionnalités 5 et 6), branchés sur IndexedDB.
 * - Collection : ajoute la carte (quantité 1). Si elle est déjà possédée, le
 *   bouton devient un lien vers la Collection (on ne double pas par accident ;
 *   la quantité se règle là-bas).
 * - Wishlist : bouton bascule (ajouter / retirer).
 */
export function CardActions({ card, rate }: CardActionsProps) {
  // useLiveQuery : l'interface se met à jour toute seule quand la base change.
  const collectionItem = useLiveQuery(() => db.collection.get(card.id), [card.id]);
  const wishlistItem = useLiveQuery(() => db.wishlist.get(card.id), [card.id]);

  const snapshot = () => buildSnapshot(card, rate);
  const [collectionFeedback, setCollectionFeedback] = useState(false);
  const [wishlistFeedback, setWishlistFeedback] = useState(false);

  const handleAddToCollection = () => {
    addToCollection(card.id, snapshot());
    setCollectionFeedback(true);
    setTimeout(() => setCollectionFeedback(false), 800);
  };

  const handleToggleWishlist = () => {
    toggleWishlist(card.id, snapshot());
    setWishlistFeedback(true);
    setTimeout(() => setWishlistFeedback(false), 800);
  };

  return (
    <div className="mt-4 grid grid-cols-2 gap-3 relative">
      {collectionItem ? (
        <Link
          to="/collection"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-standard border border-accent bg-surface px-4 text-sm font-medium text-accent"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          {t.card.inCollection(collectionItem.quantity)}
        </Link>
      ) : (
        <AddFeedback trigger={collectionFeedback}>
          <button
            type="button"
            onClick={handleAddToCollection}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-standard bg-accent px-4 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
          >
            <Library className="h-4 w-4" aria-hidden="true" />
            {t.card.addToCollection}
          </button>
        </AddFeedback>
      )}

      <AddFeedback trigger={wishlistFeedback}>
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-pressed={Boolean(wishlistItem)}
          className={[
            "inline-flex h-11 items-center justify-center gap-2 rounded-standard border px-4 text-sm font-medium transition-colors",
            wishlistItem
              ? "border-accent bg-surface text-accent"
              : "border-line bg-surface text-ink-muted hover:text-ink",
          ].join(" ")}
        >
          {wishlistItem ? (
            <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Bookmark className="h-4 w-4" aria-hidden="true" />
          )}
          {wishlistItem ? t.card.inWishlist : t.card.addToWishlist}
        </button>
      </AddFeedback>
    </div>
  );
}
