import { useState } from "react";
import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Library, Search, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { CardImage } from "../../components/CardImage";
import { db } from "../../db/database";
import {
  collectionCardCount,
  collectionValue,
  sortCollection,
  type CollectionSort,
} from "../../db/collection";
import { t } from "../../i18n";
import { formatEur } from "../../lib/format";
import { conditionLabel } from "../../lib/conditions";
import { CollectionItemSheet } from "./CollectionItemSheet";

/**
 * Écran Collection (fonctionnalité 5) : grille, tri, valeur totale estimée,
 * quantité et état modifiables. Tout vient de la base locale (hors ligne OK).
 */
export default function CollectionPage() {
  const [sort, setSort] = useState<CollectionSort>("addedAt");
  const [editingId, setEditingId] = useState<string | null>(null);

  const items = useLiveQuery(() => db.collection.toArray(), []);
  const loading = items === undefined;
  const list = items ?? [];
  const sorted = sortCollection(list, sort);
  const value = collectionValue(list);
  const cardCount = collectionCardCount(list);

  const editing = editingId ? list.find((i) => i.id === editingId) ?? null : null;

  return (
    <div>
      <PageHeader
        eyebrow={t.collection.eyebrow}
        title={t.collection.title}
        description={t.collection.description}
      />

      {!loading && list.length > 0 && (
        <section className="mb-5 rounded-standard border border-line bg-surface p-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-ink-muted">{t.collection.totalValue}</p>
              <p className="text-2xl font-semibold tracking-tight">{formatEur(value.total)}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{t.collection.cardCount(cardCount)}</p>
            </div>
            <div className="text-right">
              {value.unpricedCount > 0 && (
                <p className="text-xs text-ink-muted">{t.collection.unpricedNote(value.unpricedCount)}</p>
              )}
            </div>
          </div>

          {/* Tri */}
          <label htmlFor="collection-sort" className="mt-4 flex items-center gap-2 text-xs text-ink-muted">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            {t.collection.sortLabel}
          </label>
          <select
            id="collection-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as CollectionSort)}
            className="mt-1 h-10 w-full rounded-standard border border-line bg-surface px-2.5 text-sm"
          >
            <option value="addedAt">{t.collection.sortAddedAt}</option>
            <option value="name">{t.collection.sortName}</option>
            <option value="value">{t.collection.sortValue}</option>
          </select>
        </section>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="aspect-[245/337] w-full animate-pulse rounded-standard bg-surface-2" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState icon={Library} title={t.collection.emptyTitle} text={t.collection.emptyText}>
          <Link
            to="/recherche"
            className="inline-flex h-11 items-center gap-2 rounded-standard bg-accent px-4 text-sm font-medium text-accent-ink hover:opacity-90"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            {t.collection.ctaSearch}
          </Link>
        </EmptyState>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {sorted.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setEditingId(item.id)}
                className="block w-full rounded-standard text-left transition-opacity hover:opacity-90"
              >
                <div className="relative">
                  <CardImage image={item.snapshot.image} name={item.snapshot.name} />
                  {item.quantity > 1 && (
                    <span className="absolute right-1 top-1 rounded-full bg-bg/85 px-1.5 py-0.5 text-[11px] font-medium">
                      ×{item.quantity}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 truncate text-xs">{item.snapshot.name}</p>
                <p className="truncate text-[11px] text-ink-muted">
                  {conditionLabel(item.condition)} ·{" "}
                  {item.snapshot.price ? formatEur(item.snapshot.price.eur) : t.collection.priceUnavailable}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      <CollectionItemSheet item={editing} onClose={() => setEditingId(null)} />
    </div>
  );
}
