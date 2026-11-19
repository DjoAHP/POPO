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
import { Button, buttonStyles } from "../../components/ui/Button";

interface CardActionsProps {
  card: TcgdexCard;
  /** Taux USD→EUR, pour valoriser la carte dans l'instantané. */
  rate: number;
}

/**
 * Actions de la fiche carte (fonctionnalités 5 et 6), branchées sur IndexedDB.
 * - Collection : ajoute la carte (quantité 1). Si elle est déjà possédée, le
 *   bouton devient un lien vers la Collection (on ne double pas par accident ;
 *   la quantité se règle là-bas).
 * - Wishlist : bouton bascule (ajouter / retirer).
 *
 * Mobile first : les deux actions sont empilées et pleine largeur, puis côte
 * à côte à partir de `sm`.
 */
export function CardActions({ card, rate }: CardActionsProps) {
  // useLiveQuery : l'interface se met à jour toute seule quand la base change.
  const collectionItem = useLiveQuery(() => db.collection.get(card.id), [card.id]);
  const wishlistItem = useLiveQuery(() => db.wishlist.get(card.id), [card.id]);

  /** Instantané figé au moment du clic (affichage hors ligne). */
  const snapshot = () => buildSnapshot(card, rate);
  const [collectionFeedback, setCollectionFeedback] = useState(false);
  const [wishlistFeedback, setWishlistFeedback] = useState(false);

  const handleAddToCollection = () => {
    void addToCollection(card.id, snapshot());
    setCollectionFeedback(true);
    setTimeout(() => setCollectionFeedback(false), 800);
  };

  const handleToggleWishlist = () => {
    void toggleWishlist(card.id, snapshot());
    setWishlistFeedback(true);
    setTimeout(() => setWishlistFeedback(false), 800);
  };

  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-2">
      {collectionItem ? (
        <Link
          to="/collection"
          className={buttonStyles("success", "md", "w-full")}
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          {t.card.inCollection(collectionItem.quantity)}
        </Link>
      ) : (
        <AddFeedback trigger={collectionFeedback}>
          <Button onClick={handleAddToCollection} className="w-full">
            <Library className="h-4 w-4" aria-hidden="true" />
            {t.card.addToCollection}
          </Button>
        </AddFeedback>
      )}

      <AddFeedback trigger={wishlistFeedback}>
        <Button
          variant={wishlistItem ? "brand2" : "secondary"}
          onClick={handleToggleWishlist}
          aria-pressed={Boolean(wishlistItem)}
          className="w-full"
        >
          {wishlistItem ? (
            <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Bookmark className="h-4 w-4" aria-hidden="true" />
          )}
          {wishlistItem ? t.card.inWishlist : t.card.addToWishlist}
        </Button>
      </AddFeedback>
    </div>
  );
}
