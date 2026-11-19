import { Link, useNavigate } from "react-router-dom";
import type { FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { BarChart3, ChevronRight, Layers, Library, Search } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { Logo } from "../../components/Logo";
import { CardTile } from "../../components/CardTile";
import { Surface } from "../../components/ui/Surface";
import { StatTile } from "../../components/ui/StatTile";
import { Button } from "../../components/ui/Button";
import { db } from "../../db/database";
import {
  collectionValue,
  collectionCardCount,
  sortCollection,
  type CollectionItem,
} from "../../db/collection";
import { useSets } from "../../api/queries";
import { t } from "../../i18n";
import { AnimatedEurCounter, AnimatedIntCounter } from "../../components/AnimatedCounter";

/**
 * Écran Accueil (dashboard, fonctionnalité 8) :
 * - valeur de la collection
 * - nombre de cartes
 * - dernières cartes ajoutées
 * - progression de quelques sets
 * - accès rapide à la recherche
 */
export default function HomePage() {
  const navigate = useNavigate();
  const items = useLiveQuery(() => db.collection.toArray(), []);
  const loading = items === undefined;
  const list = items ?? [];

  const value = collectionValue(list);
  const count = collectionCardCount(list);
  const setCount = new Set(
    list
      .map((item) => item.snapshot.setId)
      .filter((setId): setId is string => Boolean(setId)),
  ).size;
  const recent = sortCollection(list, "addedAt").slice(0, 6);

  function goToSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get("q");
    if (typeof query === "string" && query.trim().length >= 2) {
      navigate(`/recherche?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div>
      <PageHeader eyebrow={t.home.eyebrow} title={t.home.title} />

      {loading ? (
        <DashboardSkeleton />
      ) : list.length === 0 ? (
        <EmptyDashboard />
      ) : (
        <DashboardContent
          value={value}
          count={count}
          setCount={setCount}
          recent={recent}
          onSearch={goToSearch}
        />
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="h-36 animate-pulse rounded-card border border-line/70 bg-surface" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="h-24 animate-pulse rounded-card border border-line/70 bg-surface" />
        <div className="h-24 animate-pulse rounded-card border border-line/70 bg-surface" />
      </div>
      <div className="mt-6 h-48 animate-pulse rounded-card border border-line/70 bg-surface" />
    </>
  );
}

function EmptyDashboard() {
  const features = [
    { icon: Search, title: t.home.featureSearchTitle, text: t.home.featureSearchText },
    { icon: BarChart3, title: t.home.featureCompareTitle, text: t.home.featureCompareText },
    { icon: Library, title: t.home.featureCollectTitle, text: t.home.featureCollectText },
  ];

  return (
    <div>
      <Surface
        variant="gradient"
        className="relative overflow-hidden px-6 py-10 text-center"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-brand-2/15 blur-3xl"
        />
        <Logo className="mx-auto mb-4 h-16 w-16 text-accent" />
        <h2 className="text-2xl font-semibold tracking-tight">{t.app.name}</h2>
        <p className="mt-1 text-sm text-ink-muted">{t.app.tagline}</p>
        <Link
          to="/recherche"
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-control bg-gradient-to-br from-accent to-brand-2 px-5 text-sm font-medium text-on-brand shadow-[var(--glow-brand)] transition-all hover:brightness-110"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          {t.home.ctaSearch}
        </Link>
      </Surface>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Surface key={feature.title} className="p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-control bg-accent/10 text-accent">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-sm font-medium">{feature.title}</h3>
              <p className="mt-1 text-xs text-ink-muted">{feature.text}</p>
            </Surface>
          );
        })}
      </div>
    </div>
  );
}

function DashboardContent({
  value,
  count,
  setCount,
  recent,
  onSearch,
}: {
  value: { total: number; pricedCount: number; unpricedCount: number };
  count: number;
  setCount: number;
  recent: CollectionItem[];
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <>
      {/* Hero : valeur + recherche rapide */}
      <Surface variant="gradient" className="relative overflow-hidden p-5 sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-accent/15 blur-3xl"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs text-ink-muted">{t.home.valueLabel}</p>
            <p className="tabular mt-1 font-display text-4xl font-bold tracking-tight text-gold sm:text-5xl">
              <AnimatedEurCounter value={value.total} duration={1.2} />
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              {value.unpricedCount > 0
                ? t.collection.unpricedNote(value.unpricedCount)
                : t.home.valueHint}
            </p>
          </div>

          <form onSubmit={onSearch} className="flex w-full gap-2 sm:max-w-sm">
            <input
              name="q"
              type="search"
              placeholder={t.home.quickSearchPlaceholder}
              aria-label={t.home.quickSearchPlaceholder}
              className="h-11 min-w-0 flex-1 rounded-control border border-line/70 bg-glass px-3 text-sm outline-none backdrop-blur transition-shadow placeholder:text-ink-muted focus:border-cyan/60 focus:shadow-[var(--glow-brand)]"
            />
            <Button type="submit">{t.home.quickSearchButton}</Button>
          </form>
        </div>
      </Surface>

      {/* Tuiles statistiques */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <StatTile
          icon={Library}
          label={t.home.cardsLabel}
          value={<AnimatedIntCounter value={count} />}
          hint={t.home.cardsHint}
          tone="accent"
        />
        <StatTile
          icon={Layers}
          label={t.home.setsLabel}
          value={<AnimatedIntCounter value={setCount} />}
          hint={t.home.setsHint}
          tone="cyan"
        />
      </div>

      {/* Dernières cartes ajoutées */}
      {recent.length > 0 && (
        <Surface className="mt-6 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t.home.recentTitle}</h2>
            <Link
              to="/collection"
              className="flex items-center gap-1 text-xs text-cyan hover:underline"
            >
              {t.home.seeAll}
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
          <ul className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
            {recent.map((item) => (
              <li key={item.id} className="w-32 shrink-0 sm:w-36">
                <Link to={`/carte/${encodeURIComponent(item.id)}`} className="block rounded-card">
                  <CardTile
                    image={item.snapshot.image}
                    name={item.snapshot.name}
                    meta={item.snapshot.setName ?? undefined}
                    rarity={item.snapshot.rarity}
                    quantity={item.quantity}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Surface>
      )}

      {/* Progression de quelques sets */}
      <SetsProgressSection />
    </>
  );
}

/** Progression de quelques sets (dynamique : les sets où on a des cartes). */
function SetsProgressSection() {
  const items = useLiveQuery(() => db.collection.toArray(), []);
  const setsQuery = useSets();
  const loading = items === undefined;

  if (loading) {
    return (
      <div className="mt-6 h-48 animate-pulse rounded-card border border-line/70 bg-surface" />
    );
  }

  const collection = items ?? [];
  if (collection.length === 0) return null;

  // Totaux officiels des sets, depuis le cache TanStack Query (déjà chargé
  // ailleurs dans l'app, aucune requête supplémentaire imposée).
  const totals = new Map<string, number>();
  for (const set of setsQuery.data ?? []) {
    totals.set(set.id, set.cardCount.official || set.cardCount.total);
  }

  // Grouper les cartes possédées par set
  const bySet = new Map<
    string,
    { setId: string; setName: string; owned: number; total: number }
  >();
  for (const item of collection) {
    const snap = item.snapshot;
    if (!snap.setId || !snap.setName) continue;
    const key = snap.setId;
    const entry =
      bySet.get(key) ??
      { setId: key, setName: snap.setName, owned: 0, total: totals.get(key) ?? 0 };
    entry.owned += item.quantity;
    bySet.set(key, entry);
  }

  const setsArray = Array.from(bySet.values())
    .sort((a, b) => b.owned - a.owned)
    .slice(0, 5);

  if (setsArray.length === 0) return null;

  return (
    <Surface className="mt-6 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t.home.setsTitle}</h2>
        <Link
          to="/sets"
          className="flex items-center gap-1 text-xs text-cyan hover:underline"
        >
          {t.home.seeAll}
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
      <ul className="space-y-4">
        {setsArray.map((set) => {
          const pct = set.total > 0 ? Math.round((set.owned / set.total) * 100) : null;
          return (
            <li key={set.setId}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{set.setName}</p>
                  <p className="text-xs text-ink-muted">
                    {set.total > 0
                      ? t.sets.progress(set.owned, set.total)
                      : `${set.owned} carte${set.owned > 1 ? "s" : ""}`}
                  </p>
                </div>
                {pct !== null && (
                  <p className="tabular shrink-0 text-sm font-semibold text-cyan">{pct} %</p>
                )}
              </div>
              {pct !== null && (
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-pill bg-surface-2">
                  <div
                    className="h-full rounded-pill bg-gradient-to-r from-accent to-brand-2 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Surface>
  );
}
