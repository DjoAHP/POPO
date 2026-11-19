import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Layers, Search } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { SetLogo } from "../../components/SetLogo";
import { Surface } from "../../components/ui/Surface";
import { useSets } from "../../api/queries";
import { db } from "../../db/database";
import { t } from "../../i18n";

/** Minuscules sans accents, pour une recherche tolérante. */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr");
}

/**
 * Liste des extensions (fonctionnalité 7) :
 * - recherche locale par nom ;
 * - progression (possédées / total officiel) calculée côté client ;
 * - lien vers le détail du set.
 */
export default function SetsPage() {
  const setsQuery = useSets();
  const collection = useLiveQuery(() => db.collection.toArray(), []);
  const [query, setQuery] = useState("");

  const sets = setsQuery.data ?? [];
  const loading = setsQuery.isPending;

  /** Cartes possédées par set, d'après l'instantané enregistré localement. */
  const ownedBySet = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of collection ?? []) {
      const setId = item.snapshot.setId;
      if (!setId) continue;
      counts.set(setId, (counts.get(setId) ?? 0) + 1);
    }
    return counts;
  }, [collection]);

  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) return sets;
    return sets.filter((set) => normalize(set.name).includes(needle));
  }, [sets, query]);

  const header = (
    <PageHeader
      eyebrow={t.sets.eyebrow}
      title={t.sets.title}
      description={t.sets.description}
    />
  );

  if (loading) {
    return (
      <div>
        {header}
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse items-center gap-3 rounded-card border border-line/70 bg-surface p-3"
            >
              <div className="h-12 w-12 rounded-control bg-surface-2" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded-pill bg-surface-2" />
                <div className="h-2 w-1/2 rounded-pill bg-surface-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <div>
        {header}
        <EmptyState icon={Layers} title={t.sets.emptyTitle} text={t.sets.emptyText} />
      </div>
    );
  }

  return (
    <div>
      {header}

      <label className="relative mb-4 block">
        <span className="sr-only">{t.sets.searchPlaceholder}</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.sets.searchPlaceholder}
          className="h-11 w-full rounded-control border border-line/70 bg-glass pl-9 pr-3 text-sm backdrop-blur-xl transition-colors placeholder:text-ink-muted focus:border-cyan/60 focus:outline-none"
        />
      </label>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title={t.sets.searchEmptyTitle}
          text={t.sets.searchEmptyText}
        />
      ) : (
        <ul className="space-y-3" role="list">
          {filtered.map((set) => {
            const total = set.cardCount.official ?? set.cardCount.total ?? 0;
            const owned = ownedBySet.get(set.id) ?? 0;
            const pct = total > 0 ? Math.min(100, Math.round((owned / total) * 100)) : 0;

            return (
              <li key={set.id}>
                <Link
                  to={`/set/${encodeURIComponent(set.id)}`}
                  className="block rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <Surface className="flex items-center gap-3 p-3 transition-colors hover:bg-surface-2 sm:p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-glass p-1.5">
                      <SetLogo
                        logo={set.logo}
                        symbol={set.symbol}
                        name={set.name}
                        className="h-9 w-9"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate font-medium">{set.name}</p>
                        <span className="tabular shrink-0 text-xs font-semibold text-cyan">
                          {t.sets.progressPercent(pct)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-surface-2">
                          <div
                            className="h-full rounded-pill bg-gradient-to-r from-accent to-brand-2 transition-[width] duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="tabular shrink-0 text-[11px] text-ink-muted">
                          {owned} / {total}
                        </span>
                      </div>
                    </div>
                  </Surface>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
