import { Link } from "react-router-dom";
import { BookmarkMinus, Library } from "lucide-react";
import { BottomSheet } from "../../components/BottomSheet";
import { CardImage } from "../../components/CardImage";
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
          <p className="mt-2 text-sm">
            {item.snapshot.price
              ? formatEur(item.snapshot.price.eur)
              : t.collection.priceUnavailable}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <button
          type="button"
          onClick={() => void moveWishlistItemToCollection(item.id).then(onClose)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-standard bg-accent text-sm font-medium text-accent-ink hover:opacity-90"
        >
          <Library className="h-4 w-4" aria-hidden="true" />
          {t.wishlist.moveToCollection}
        </button>
        <Link
          to={`/carte/${encodeURIComponent(item.id)}`}
          onClick={onClose}
          className="inline-flex h-11 items-center justify-center rounded-standard border border-line text-sm hover:bg-surface-2"
        >
          {t.wishlist.openCard}
        </Link>
        <button
          type="button"
          onClick={() => void removeFromWishlist(item.id).then(onClose)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-standard border border-line text-sm text-ink-muted hover:bg-surface-2 hover:text-ink"
        >
          <BookmarkMinus className="h-4 w-4" aria-hidden="true" />
          {t.wishlist.remove}
        </button>
      </div>
    </BottomSheet>
  );
}
