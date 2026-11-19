import { useState } from "react";
import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Heart, Search } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { CardTile } from "../../components/CardTile";
import { CardGridSkeleton } from "../../components/CardGrid";
import { Surface } from "../../components/ui/Surface";
import { buttonStyles } from "../../components/ui/Button";
import { db } from "../../db/database";
import { wishlistValue } from "../../db/wishlist";
import { t } from "../../i18n";
import { formatEur } from "../../lib/format";
import { WishlistItemSheet } from "./WishlistItemSheet";

const gridClass =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

/**
 * Écran Wishlist (fonctionnalité 6) : les cartes voulues, sauvegardées
 * localement, avec leur valeur estimée totale.
 * Même coffre que la Collection, accent violet (docs/DESIGN.md §4.4).
 */
export default function WishlistPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const items = useLiveQuery(() => db.wishlist.toArray(), []);
  const loading = items === undefined;
  const list = items ?? [];
  const value = wishlistValue(list);
  const editing = editingId ? list.find((i) => i.id === editingId) ?? null : null;

  return (
    <div>
      <PageHeader
        eyebrow={t.wishlist.eyebrow}
        title={t.wishlist.title}
        description={t.wishlist.description}
      />

      {!loading && list.length > 0 && (
        <Surface variant="gradient" className="relative mb-5 overflow-hidden p-4">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent"
          />
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-muted">
                {t.wishlist.totalValue}
              </p>
              <p className="tabular mt-1 text-3xl font-semibold tracking-tight text-cyan">
                {formatEur(value.total)}
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {t.collection.cardCount(list.length)}
                {value.unpricedCount > 0 &&
                  ` · ${t.collection.unpricedNote(value.unpricedCount)}`}
              </p>
            </div>
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-control bg-cyan/12 text-cyan"
            >
              <Heart className="h-6 w-6" />
            </span>
          </div>
        </Surface>
      )}

      {loading ? (
        <CardGridSkeleton />
      ) : list.length === 0 ? (
        <EmptyState icon={Heart} title={t.wishlist.emptyTitle} text={t.wishlist.emptyText}>
          <Link to="/recherche" className={buttonStyles("primary")}>
            <Search className="h-4 w-4" aria-hidden="true" />
            {t.wishlist.ctaSearch}
          </Link>
        </EmptyState>
      ) : (
        <ul className={gridClass}>
          {list.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setEditingId(item.id)}
                className="block w-full rounded-card text-left transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
              >
                <CardTile
                  image={item.snapshot.image}
                  name={item.snapshot.name}
                  rarity={item.snapshot.rarity}
                  meta={
                    item.snapshot.price
                      ? formatEur(item.snapshot.price.eur)
                      : t.collection.priceUnavailable
                  }
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <WishlistItemSheet item={editing} onClose={() => setEditingId(null)} />
    </div>
  );
}
