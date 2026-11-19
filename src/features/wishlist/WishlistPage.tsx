import { useState } from "react";
import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Heart, Search } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { CardImage } from "../../components/CardImage";
import { db } from "../../db/database";
import { wishlistValue } from "../../db/wishlist";
import { t } from "../../i18n";
import { formatEur } from "../../lib/format";
import { WishlistItemSheet } from "./WishlistItemSheet";

/**
 * Écran Wishlist (fonctionnalité 6) : les cartes voulues, sauvegardées
 * localement, avec leur valeur estimée totale.
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
        <section className="mb-5 rounded-standard border border-line bg-surface p-4">
          <p className="text-xs text-ink-muted">{t.wishlist.totalValue}</p>
          <p className="text-2xl font-semibold tracking-tight">{formatEur(value.total)}</p>
          <p className="mt-0.5 text-xs text-ink-muted">{t.collection.cardCount(list.length)}</p>
          {value.unpricedCount > 0 && (
            <p className="mt-0.5 text-xs text-ink-muted">
              {t.collection.unpricedNote(value.unpricedCount)}
            </p>
          )}
        </section>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="aspect-[245/337] w-full animate-pulse rounded-standard bg-surface-2" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState icon={Heart} title={t.wishlist.emptyTitle} text={t.wishlist.emptyText}>
          <Link
            to="/recherche"
            className="inline-flex h-11 items-center gap-2 rounded-standard bg-accent px-4 text-sm font-medium text-accent-ink hover:opacity-90"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            {t.wishlist.ctaSearch}
          </Link>
        </EmptyState>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {list.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setEditingId(item.id)}
                className="block w-full rounded-standard text-left transition-opacity hover:opacity-90"
              >
                <CardImage image={item.snapshot.image} name={item.snapshot.name} />
                <p className="mt-1.5 truncate text-xs">{item.snapshot.name}</p>
                <p className="truncate text-[11px] text-ink-muted">
                  {item.snapshot.price
                    ? formatEur(item.snapshot.price.eur)
                    : t.collection.priceUnavailable}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      <WishlistItemSheet item={editing} onClose={() => setEditingId(null)} />
    </div>
  );
}
