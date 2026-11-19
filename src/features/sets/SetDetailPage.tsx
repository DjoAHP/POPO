import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Check, Layers, Search } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { BackLink } from "../../components/BackLink";
import { CardTile } from "../../components/CardTile";
import { CardGridSkeleton } from "../../components/CardGrid";
import { EmptyState } from "../../components/EmptyState";
import { SetLogo } from "../../components/SetLogo";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import { Surface } from "../../components/ui/Surface";
import { Button } from "../../components/ui/Button";
import { db } from "../../db/database";
import { useSetDetail } from "../../api/queries";
import { t } from "../../i18n";

const gridClass =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

type SetFilter = "all" | "owned" | "missing";

/**
 * Détail d'un set : hero avec logo et progression, onglets
 * Toutes / Possédées / Manquantes, grille de cartes.
 * (docs/DESIGN.md §4.4)
 */
export default function SetDetailPage() {
  // Tous les hooks au début, AVANT tout retour conditionnel
  const { id } = useParams<{ id: string }>();
  const setId = id ?? null;

  const setQuery = useSetDetail(setId);
  const items = useLiveQuery(() => db.collection.toArray(), []);

  const loading = setQuery.isPending;
  const set = setQuery.data;

  const [filter, setFilter] = useState<SetFilter>("all");

  useEffect(() => {
    document.title = set ? `${set.name} — POPO` : "POPO — Collection Pokémon";
    return () => {
      document.title = "POPO — Collection Pokémon";
    };
  }, [set]);

  if (loading) {
    return (
      <div>
        <BackLink to="/sets" label={t.sets.backToSets} />
        <PageHeader eyebrow={t.sets.eyebrow} title={t.sets.detailTitle} />
        <div className="mb-5 h-24 animate-pulse rounded-card bg-surface-2" />
        <CardGridSkeleton count={12} />
      </div>
    );
  }

  if (setQuery.isError) {
    return (
      <div>
        <BackLink to="/sets" label={t.sets.backToSets} />
        <PageHeader eyebrow={t.sets.eyebrow} title={t.sets.detailTitle} />
        <EmptyState
          icon={Layers}
          title="Impossible de charger"
          text="Vérifie ta connexion internet, puis réessaie."
        >
          <Button onClick={() => void setQuery.refetch()}>{t.search.retry}</Button>
        </EmptyState>
      </div>
    );
  }

  if (!set) {
    return (
      <div>
        <BackLink to="/sets" label={t.sets.backToSets} />
        <PageHeader eyebrow={t.sets.eyebrow} title={t.sets.detailTitle} />
        <EmptyState
          icon={Layers}
          title="Set introuvable"
          text="Ce set n'existe pas dans la base TCGdex."
        />
      </div>
    );
  }

  // Calculs communs
  const ownedIds = new Map<string, { quantity: number; condition: string }>();
  for (const item of items ?? []) {
    ownedIds.set(item.id, { quantity: item.quantity, condition: item.condition });
  }

  const allCards = set.cards ?? [];
  const filtered = allCards.filter((card) => {
    const owned = ownedIds.has(card.id);
    if (filter === "owned") return owned;
    if (filter === "missing") return !owned;
    return true;
  });

  const ownedCount = allCards.filter((card) => ownedIds.has(card.id)).length;
  const total = set.cardCount.official ?? set.cardCount.total ?? 0;
  const pct = total > 0 ? Math.min(100, Math.round((ownedCount / total) * 100)) : 0;

  return (
    <div>
      <BackLink to="/sets" label={t.sets.backToSets} />

      {/* Hero du set */}
      <Surface variant="gradient" className="relative mb-5 overflow-hidden p-4 sm:p-5">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent"
        />
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-card bg-glass p-2">
            <SetLogo
              logo={set.logo}
              symbol={set.symbol}
              name={set.name}
              className="h-11 w-11"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan">
              {t.sets.eyebrow}
            </p>
            <h1 className="mt-0.5 text-xl font-semibold tracking-tight sm:text-2xl">
              {set.name}
            </h1>
            <p className="text-sm text-ink-muted">{t.sets.progress(ownedCount, total)}</p>
          </div>
          <div className="w-full sm:w-40">
            <p className="tabular text-right text-sm font-semibold text-cyan">
              {t.sets.progressPercent(pct)}
            </p>
            <div className="mt-1 h-2 overflow-hidden rounded-pill bg-surface-2">
              <div
                className="h-full rounded-pill bg-gradient-to-r from-accent to-brand-2 transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </Surface>

      {/* Filtres en pilules */}
      <div className="mb-4">
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          ariaLabel={t.sets.allCards}
          options={[
            { value: "all", label: t.sets.allCards },
            { value: "owned", label: t.sets.filterOwned },
            { value: "missing", label: t.sets.filterMissing },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title={t.sets.noCards}
          text={
            filter === "owned"
              ? "Tu ne possèdes aucune carte de ce set."
              : filter === "missing"
                ? "Tu as toutes les cartes de ce set !"
                : ""
          }
        />
      ) : (
        <ul className={gridClass}>
          {filtered.map((card) => {
            const owned = ownedIds.get(card.id);
            return (
              <li key={card.id}>
                <Link
                  to={`/carte/${encodeURIComponent(card.id)}`}
                  className="block rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <CardTile
                    image={card.image}
                    name={card.name}
                    quantity={owned?.quantity}
                    meta={`n° ${card.localId}${owned ? ` · ${t.sets.cardsOwned}` : ""}`}
                    badge={
                      owned ? (
                        <span className="flex h-6 w-6 items-center justify-center rounded-pill border border-success/40 bg-success/90 text-white shadow-[var(--shadow-soft)]">
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          <span className="sr-only">{t.sets.cardsOwned}</span>
                        </span>
                      ) : undefined
                    }
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
