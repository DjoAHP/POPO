import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { BottomSheet } from "../../components/BottomSheet";
import { CardImage } from "../../components/CardImage";
import { Button, buttonStyles } from "../../components/ui/Button";
import {
  removeFromCollection,
  setCondition,
  setQuantity,
} from "../../db/collection";
import { CARD_CONDITIONS, type CollectionItem } from "../../db/schema";
import { conditionLabel } from "../../lib/conditions";
import { formatDate, formatEur } from "../../lib/format";
import { t } from "../../i18n";

interface CollectionItemSheetProps {
  item: CollectionItem | null;
  onClose: () => void;
}

/**
 * Feuille d'édition d'une carte possédée : quantité, état, valeur,
 * lien vers la fiche, suppression.
 * Contrôles ≥ 44 px et visuels de la galerie (docs/DESIGN.md §4.4).
 */
export function CollectionItemSheet({ item, onClose }: CollectionItemSheetProps) {
  if (!item) return null;
  const price = item.snapshot.price;

  return (
    <BottomSheet open title={t.collection.editTitle} onClose={onClose}>
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
          <p className="tabular mt-2 text-lg font-semibold text-gold">
            {price ? formatEur(price.eur) : t.collection.priceUnavailable}
          </p>
          <p className="text-xs text-ink-muted">
            {t.collection.updatedAt} : {formatDate(price?.updatedAt ?? null) ?? "—"}
          </p>
        </div>
      </div>

      {/* Quantité */}
      <div className="mt-4 flex items-center justify-between rounded-control border border-line/70 bg-glass p-3">
        <span className="text-sm">{t.collection.quantity}</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="-1"
            disabled={item.quantity <= 1}
            onClick={() => void setQuantity(item.id, item.quantity - 1)}
            className="flex h-11 w-11 items-center justify-center rounded-control border border-line/70 bg-surface transition-colors hover:bg-surface-2 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="tabular w-6 text-center font-semibold">{item.quantity}</span>
          <button
            type="button"
            aria-label="+1"
            onClick={() => void setQuantity(item.id, item.quantity + 1)}
            className="flex h-11 w-11 items-center justify-center rounded-control border border-line/70 bg-surface transition-colors hover:bg-surface-2"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* État */}
      <label htmlFor="item-condition" className="mt-4 block text-sm">
        {t.collection.condition}
      </label>
      <select
        id="item-condition"
        value={item.condition}
        onChange={(e) => void setCondition(item.id, e.target.value as CollectionItem["condition"])}
        className="mt-1 h-11 w-full rounded-control border border-line/70 bg-surface px-3 text-sm focus:border-cyan/60 focus:outline-none"
      >
        {CARD_CONDITIONS.map((condition) => (
          <option key={condition} value={condition}>
            {conditionLabel(condition)}
          </option>
        ))}
      </select>

      {/* Actions */}
      <div className="mt-4 grid gap-2">
        <Link
          to={`/carte/${encodeURIComponent(item.id)}`}
          onClick={onClose}
          className={buttonStyles("secondary")}
        >
          {t.collection.openCard}
        </Link>
        <Button
          variant="danger"
          onClick={() => void removeFromCollection(item.id).then(onClose)}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          {t.collection.remove}
        </Button>
      </div>
    </BottomSheet>
  );
}
