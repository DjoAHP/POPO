import { useState } from "react";
import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Library, Search } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { CardTile } from "../../components/CardTile";
import { CardGridSkeleton } from "../../components/CardGrid";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import { Surface } from "../../components/ui/Surface";
import { buttonStyles } from "../../components/ui/Button";
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

const gridClass =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

/**
 * Écran Collection (fonctionnalité 5) : grille, tri, valeur totale estimée,
 * quantité et état modifiables. Tout vient de la base locale (hors ligne OK).
 * Présentation « coffre » (docs/DESIGN.md §4.4).
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
        <section className="mb-5">
          {/* Bandeau résumé, liseré dégradé */}
          <Surface variant="gradient" className="relative overflow-hidden p-4">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent"
            />
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-muted">
                  {t.collection.totalValue}
                </p>
                <p className="tabular mt-1 text-3xl font-semibold tracking-tight text-gold">
                  {formatEur(value.total)}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {t.collection.cardCount(cardCount)}
                  {value.unpricedCount > 0 &&
                    ` · ${t.collection.unpricedNote(value.unpricedCount)}`}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="flex h-12 w-12 items-center justify-center rounded-control bg-gold/12 text-gold"
              >
                <Library className="h-6 w-6" />
              </span>
            </div>
          </Surface>

          {/* Tri en pilules */}
          <div className="mt-4">
            <p className="mb-2 text-[11px] uppercase tracking-wide text-ink-muted">
              {t.collection.sortLabel}
            </p>
            <SegmentedControl
              value={sort}
              onChange={setSort}
              ariaLabel={t.collection.sortLabel}
              options={[
                { value: "addedAt", label: t.collection.sortAddedAt },
                { value: "name", label: t.collection.sortName },
                { value: "value", label: t.collection.sortValue },
              ]}
            />
          </div>
        </section>
      )}

      {loading ? (
        <CardGridSkeleton />
      ) : list.length === 0 ? (
        <EmptyState icon={Library} title={t.collection.emptyTitle} text={t.collection.emptyText}>
          <Link to="/recherche" className={buttonStyles("primary")}>
            <Search className="h-4 w-4" aria-hidden="true" />
            {t.collection.ctaSearch}
          </Link>
        </EmptyState>
      ) : (
        <ul className={gridClass}>
          {sorted.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setEditingId(item.id)}
                className="block w-full rounded-card text-left transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <CardTile
                  image={item.snapshot.image}
                  name={item.snapshot.name}
                  rarity={item.snapshot.rarity}
                  quantity={item.quantity}
                  meta={`${conditionLabel(item.condition)} · ${
                    item.snapshot.price
                      ? formatEur(item.snapshot.price.eur)
                      : t.collection.priceUnavailable
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <CollectionItemSheet item={editing} onClose={() => setEditingId(null)} />
    </div>
  );
}
