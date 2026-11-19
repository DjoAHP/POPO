import { Link } from "react-router-dom";
import { BookmarkMinus, Library } from "lucide-react";
import { BottomSheet } from "../../components/BottomSheet";
import { CardImage } from "../../components/CardImage";
import { Button, buttonStyles } from "../../components/ui/Button";
import { moveWishlistItemToCollection } from "../../db/collection";
import { removeFromWishlist } from "../../db/wishlist";
import type { WishlistItem } from "../../db/schema";
import { formatEur } from "../../lib/format";
import { t } from "../../i18n";

interface WishlistItemSheetProps {
  item: WishlistItem | null;
  onClose: () => void;
}

/** Feuille d'une carte voulue : l'ajouter à la collection, la retirer, voir la fiche. */
export function WishlistItemSheet({ item, onClose }: WishlistItemSheetProps) {
  if (!item) return null;

  return (
    <BottomSheet open title={t.wishlist.editTitle} onClose={onClose}>
      <div className="flex gap-4">
        <div className="w-24 shrink-0">
          <CardImage image={item.snapshot.image} name={item.snapshot.name} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{item.snapshot.name}</p>
          <p className="truncate text-xs text-ink-muted">
            {item.snapshot.setName}
            {item.snapshot.localId ? ` · n° ${item.snapshot.localId}` : ""}
            {item.snapshot.rarity ? ` · ${item.snapshot.rarity}` : ""}
          </p>
          <p className="tabular mt-2 text-lg font-semibold text-cyan">
            {item.snapshot.price
              ? formatEur(item.snapshot.price.eur)
              : t.collection.priceUnavailable}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <Button onClick={() => void moveWishlistItemToCollection(item.id).then(onClose)}>
          <Library className="h-4 w-4" aria-hidden="true" />
          {t.wishlist.moveToCollection}
        </Button>
        <Link
          to={`/carte/${encodeURIComponent(item.id)}`}
          onClick={onClose}
          className={buttonStyles("secondary")}
        >
          {t.wishlist.openCard}
        </Link>
        <Button
          variant="danger"
          onClick={() => void removeFromWishlist(item.id).then(onClose)}
        >
          <BookmarkMinus className="h-4 w-4" aria-hidden="true" />
          {t.wishlist.remove}
        </Button>
      </div>
    </BottomSheet>
  );
}
