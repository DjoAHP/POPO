import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { BarChart3, Search, Settings, ChevronRight } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { ThemeToggle } from "../../components/ThemeToggle";
import { Logo } from "../../components/Logo";
import { CardImage } from "../../components/CardImage";
import { db } from "../../db/database";
import { collectionValue, collectionCardCount, sortCollection, type CollectionItem } from "../../db/collection";
import { formatEur } from "../../lib/format";
import { t } from "../../i18n";

/**
 * Écran Accueil (dashboard, fonctionnalité 8) :
 * - valeur de la collection
 * - nombre de cartes
 * - dernières cartes ajoutées
 * - progression de quelques sets
 * - accès rapide à la recherche
 */
export default function HomePage() {
  const items = useLiveQuery(() => db.collection.toArray(), []);
  const loading = items === undefined;
  const list = items ?? [];

  const value = collectionValue(list);
  const count = collectionCardCount(list);
  const recent = sortCollection(list, "addedAt").slice(0, 4);

  return (
    <div>
      <PageHeader
        title={t.home.title}
        action={
          <div className="flex gap-2">
            <ThemeToggle />
            <Link
              to="/reglages"
              aria-label={t.settings.title}
              title={t.settings.title}
              className="flex h-11 w-11 items-center justify-center rounded-standard border border-line bg-surface text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <Settings className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        }
      />

      {loading ? (
        <DashboardSkeleton />
      ) : list.length === 0 ? (
        <EmptyDashboard />
      ) : (
        <DashboardContent
          value={value}
          count={count}
          recent={recent}
        />
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="animate-pulse rounded-standard border border-line bg-surface p-4 h-24" />
        <div className="animate-pulse rounded-standard border border-line bg-surface p-4 h-24" />
      </div>
      <div className="mt-6 animate-pulse rounded-standard border border-line bg-surface p-4 h-32" />
      <div className="mt-6 animate-pulse rounded-standard border border-line bg-surface p-4 h-48" />
    </>
  );
}

function EmptyDashboard() {
  return (
    <div>
      <section className="mb-6 flex flex-col items-center rounded-standard border border-line bg-surface px-6 py-10 text-center">
        <Logo className="mb-4 h-14 w-14 text-accent" />
        <h2 className="text-xl font-semibold tracking-tight">{t.app.name}</h2>
        <p className="mt-1 text-sm text-ink-muted">{t.app.tagline}</p>
        <Link
          to="/recherche"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-standard bg-accent px-4 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          {t.home.ctaSearch}
        </Link>
      </section>
      <div className="rounded-standard border border-line bg-surface p-6 text-center">
        <BarChart3 className="mx-auto mb-3 h-10 w-10 text-ink-muted" aria-hidden="true" />
        <h3 className="font-medium">Tableau de bord vide</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Ajoute des cartes à ta collection pour voir les statistiques.
        </p>
      </div>
    </div>
  );
}

function DashboardContent({
  value,
  count,
  recent,
}: {
  value: { total: number; pricedCount: number; unpricedCount: number };
  count: number;
  recent: CollectionItem[];
}) {
  return (
    <>
      {/* Cartes principales : valeur + nombre */}
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-standard border border-line bg-surface p-4">
          <p className="text-xs text-ink-muted">Valeur estimée</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{formatEur(value.total)}</p>
          {value.unpricedCount > 0 && (
            <p className="mt-1 text-xs text-ink-muted">
              {value.unpricedCount} carte{value.unpricedCount > 1 ? "s" : ""} sans prix connu
            </p>
          )}
        </section>

        <section className="rounded-standard border border-line bg-surface p-4">
          <p className="text-xs text-ink-muted">Cartes possédées</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{count}</p>
          <p className="mt-1 text-xs text-ink-muted">
            {value.pricedCount} avec prix connu
          </p>
        </section>
      </div>

      {/* Dernières cartes ajoutées */}
      {recent.length > 0 && (
        <section className="mt-6 rounded-standard border border-line bg-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Dernières ajoutées</h2>
            <Link
              to="/collection"
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              Tout voir <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
          <ul className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {recent.map((item) => (
              <li key={item.id} className="shrink-0 w-32">
                <Link to={`/carte/${encodeURIComponent(item.id)}`} className="block">
                  <CardImage image={item.snapshot.image} name={item.snapshot.name} />
                  <p className="mt-1.5 truncate text-xs">{item.snapshot.name}</p>
                  <p className="truncate text-[11px] text-ink-muted">×{item.quantity}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Progression de quelques sets */}
      <SetsProgressSection />
    </>
  );
}

/** Progression de quelques sets (dynamique : les sets où on a des cartes). */
function SetsProgressSection() {
  const items = useLiveQuery(() => db.collection.toArray(), []);
  const loading = items === undefined;
  const collection = items ?? [];

  if (loading) {
    return (
      <section className="mt-6 animate-pulse rounded-standard border border-line bg-surface p-4 h-48" />
    );
  }

  if (collection.length === 0) return null;

  // Grouper les cartes possédées par set
  const bySet = new Map<
    string,
    { setId: string; setName: string; owned: number; total: number }
  >();
  for (const item of collection) {
    const snap = item.snapshot;
    if (!snap.setId || !snap.setName) continue;
    const key = snap.setId;
    const entry = bySet.get(key) ?? { setId: key, setName: snap.setName, owned: 0, total: 0 };
    entry.owned += item.quantity;
    bySet.set(key, entry);
  }

  // Remplir le total officiel via l'API (cache) pour les 5 premiers sets
  // Pour l'instant on affiche sans le total officiel (sera enrichi plus tard)
  const setsArray = Array.from(bySet.values())
    .sort((a, b) => b.owned - a.owned)
    .slice(0, 5);

  if (setsArray.length === 0) return null;

  return (
    <section className="mt-6 rounded-standard border border-line bg-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Progression des sets</h2>
        <Link
          to="/sets"
          className="text-xs text-accent hover:underline flex items-center gap-1"
        >
          Tout voir <ChevronRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
      <ul className="space-y-3">
        {setsArray.map((s) => (
          <li key={s.setId}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{s.setName}</p>
                <p className="text-xs text-ink-muted">{s.owned} carte{s.owned > 1 ? "s" : ""}</p>
              </div>
              <div className="shrink-0 w-28 text-right">
                <p className="text-sm font-semibold text-accent">
                  {s.total > 0 ? Math.round((s.owned / s.total) * 100) : "—"} %
                </p>
                <div className="mt-1 h-2 w-full bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: s.total > 0 ? `${Math.round((s.owned / s.total) * 100)}%` : "0%" }}
                  />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}