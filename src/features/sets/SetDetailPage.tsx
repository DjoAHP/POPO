import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, Layers, Search } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { CardImage } from "../../components/CardImage";
import { EmptyState } from "../../components/EmptyState";
import { SetLogo } from "../../components/SetLogo";
import { db } from "../../db/database";
import { useSetDetail } from "../../api/queries";
import { t } from "../../i18n";

/**
 * Détail d'un set : onglets Possédées / Manquantes / Toutes.
 * Grille de miniatures, avec badge ×N pour les quantités.
 */
export default function SetDetailPage() {
  // Tous les hooks au début, AVANT tout retour conditionnel
  const { id } = useParams<{ id: string }>();
  const setId = id ?? null;

  const setQuery = useSetDetail(setId);
  const items = useLiveQuery(() => db.collection.toArray(), []);

  const loading = setQuery.isPending;
  const set = setQuery.data;

  const [filter, setFilter] = useState<"all" | "owned" | "missing">("all");

  useEffect(() => {
    document.title = set ? `${set.name} — POPO` : "POPO — Set";
    return () => {
      document.title = "POPO — Collection Pokémon";
    };
  }, [set]);

  // États de chargement / erreur / absent : on rend un squelette ou un message
  // mais on ne quitte PAS la fonction (pas de `return` avant les hooks).
  if (loading) {
    return (
      <div>
        <PageHeader eyebrow={t.sets.eyebrow} title={t.sets.detailTitle} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[245/337] w-full animate-pulse rounded-standard bg-surface-2" />
          ))}
        </div>
      </div>
    );
  }

  if (setQuery.isError) {
    return (
      <div>
        <PageHeader eyebrow={t.sets.eyebrow} title={t.sets.detailTitle} />
        <EmptyState
          icon={Layers}
          title="Impossible de charger"
          text="Vérifie ta connexion internet, puis réessaie."
        >
          <button
            type="button"
            onClick={() => void setQuery.refetch()}
            className="inline-flex h-11 items-center rounded-standard bg-accent px-4 text-sm font-medium text-accent-ink hover:opacity-90"
          >
            {t.search.retry}
          </button>
        </EmptyState>
      </div>
    );
  }

  if (!set) {
    return (
      <div>
        <PageHeader eyebrow={t.sets.eyebrow} title={t.sets.detailTitle} />
        <EmptyState icon={Layers} title="Set introuvable" text="Ce set n'existe pas dans la base TCGdex." />
      </div>
    );
  }

  // Calculs communs
  const ownedIds = new Map<string, { quantity: number; condition: string }>();
  for (const item of items ?? []) {
    ownedIds.set(item.id, { quantity: item.quantity, condition: item.condition });
  }

  const allCards = set.cards ?? [];
  const filtered = allCards.filter((card: { id: string }) => {
    const owned = ownedIds.has(card.id);
    if (filter === "owned") return owned;
    if (filter === "missing") return !owned;
    return true;
  });

  const ownedCount = allCards.filter((c: { id: string }) => ownedIds.has(c.id)).length;
  const total = set.cardCount.official ?? set.cardCount.total ?? 0;
  const pct = total > 0 ? Math.round((ownedCount / total) * 100) : 0;

  return (
    <div>
      <nav className="mb-3" aria-label="Fil d'ariane">
        <Link to="/sets" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t.sets.backToSets}
        </Link>
      </nav>

      <div className="mb-5 rounded-standard border border-line bg-surface p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <SetLogo logo={set.logo} symbol={set.symbol} name={set.name} className="h-12 w-12" />
            <div>
              <h1 className="text-xl font-semibold">{set.name}</h1>
              <p className="text-sm text-ink-muted">
                {t.sets.progress(ownedCount, total)}
              </p>
            </div>
          </div>
          <div className="shrink-0 w-24 text-right">
            <p className="text-sm font-semibold text-accent">{t.sets.progressPercent(pct)}</p>
            <div className="mt-1 h-2 w-full bg-surface-2 rounded-full overflow-hidden">
              <div className="h-full bg-accent transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-3 flex gap-2" role="tablist" aria-label={t.sets.allCards}>
        <button
          type="button"
          role="tab"
          aria-selected={filter === "all"}
          onClick={() => setFilter("all")}
          className={[
            "h-10 px-4 rounded-standard border text-sm font-medium transition-colors",
            filter === "all" ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-ink-muted hover:text-ink",
          ].join(" ")}
        >
          {t.sets.allCards}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === "owned"}
          onClick={() => setFilter("owned")}
          className={[
            "h-10 px-4 rounded-standard border text-sm font-medium transition-colors",
            filter === "owned" ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-ink-muted hover:text-ink",
          ].join(" ")}
        >
          {t.sets.filterOwned}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === "missing"}
          onClick={() => setFilter("missing")}
          className={[
            "h-10 px-4 rounded-standard border text-sm font-medium transition-colors",
            filter === "missing" ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-ink-muted hover:text-ink",
          ].join(" ")}
        >
          {t.sets.filterMissing}
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title={t.sets.noCards} text={filter === "owned" ? "Tu ne possèdes aucune carte de ce set." : filter === "missing" ? "Tu as toutes les cartes de ce set !" : ""} />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((card: { id: string; image?: string; name: string; localId: string }) => {
            const owned = ownedIds.get(card.id);
            return (
              <li key={card.id}>
                <Link
                  to={`/carte/${encodeURIComponent(card.id)}`}
                  className="block rounded-standard transition-opacity hover:opacity-90"
                >
                  <div className="relative">
                    <CardImage image={card.image} name={card.name} />
                    {owned && owned.quantity > 1 && (
                      <span className="absolute right-1 top-1 rounded-full bg-bg/85 px-1.5 py-0.5 text-[11px] font-medium">
                        ×{owned.quantity}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 truncate text-xs">{card.name}</p>
                  <p className="truncate text-[11px] text-ink-muted">
                    n° {card.localId}
                    {owned ? ` · ${t.sets.cardsOwned}` : ` · ${t.sets.cardsMissing}`}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}