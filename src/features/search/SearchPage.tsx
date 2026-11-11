import { useState } from "react";
import { Search, XCircle } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { CardGrid, CardGridSkeleton } from "../../components/CardGrid";
import { FilterSelect } from "../../components/FilterSelect";
import { useCardSearch, useRarities, useSets, useTypes } from "../../api/queries";
import type { SearchFilters } from "../../api/tcgdex";
import { useDebouncedValue } from "../../lib/useDebouncedValue";
import { t } from "../../i18n";

/**
 * Écran Recherche (fonctionnalité 1) :
 * - champ avec attente de 300 ms après la dernière frappe ;
 * - filtres set / rareté / type, appliqués côté serveur par TCGdex ;
 * - grille de miniatures, squelettes, états vide et erreur.
 */
export default function SearchPage() {
  // État initial depuis l'URL (?q=&set=&rarity=&type=) : une recherche
  // filtrée reste partageable / rafraîchissable.
  const urlParams = () => new URLSearchParams(window.location.search);
  const [nameInput, setNameInput] = useState(() => urlParams().get("q") ?? "");
  const [filters, setFilters] = useState<SearchFilters>(() => {
    const params = urlParams();
    return {
      set: params.get("set") || undefined,
      rarity: params.get("rarity") || undefined,
      type: params.get("type") || undefined,
    };
  });
  const debouncedName = useDebouncedValue(nameInput.trim(), 300);

  const search = useCardSearch(debouncedName, filters);
  const sets = useSets();
  const rarities = useRarities();
  const types = useTypes();

  const hasActiveFilter = Boolean(filters.set || filters.rarity || filters.type);

  return (
    <div>
      <PageHeader title={t.search.title} description={t.search.description} />

      {/* Champ de recherche */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder={t.search.placeholder}
          aria-label={t.search.title}
          className="h-12 w-full rounded-standard border border-line bg-surface pl-10 pr-4 text-base outline-none placeholder:text-ink-muted"
        />
      </div>

      {/* Filtres set / rareté / type */}
      <div className="mt-3 grid grid-cols-3 items-end gap-2">
        <FilterSelect
          id="filter-set"
          label={t.search.filterSet}
          value={filters.set ?? ""}
          options={(sets.data ?? []).map((s) => ({ value: s.id, label: s.name }))}
          onChange={(value) => setFilters((f) => ({ ...f, set: value || undefined }))}
        />
        <FilterSelect
          id="filter-rarity"
          label={t.search.filterRarity}
          value={filters.rarity ?? ""}
          options={(rarities.data ?? []).map((r) => ({ value: r, label: r }))}
          onChange={(value) => setFilters((f) => ({ ...f, rarity: value || undefined }))}
        />
        <FilterSelect
          id="filter-type"
          label={t.search.filterType}
          value={filters.type ?? ""}
          options={(types.data ?? []).map((ty) => ({ value: ty, label: ty }))}
          onChange={(value) => setFilters((f) => ({ ...f, type: value || undefined }))}
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        {search.data && <p className="text-xs text-ink-muted">{t.search.resultsCount(search.data.length)}</p>}
        {hasActiveFilter && (
          <button
            type="button"
            onClick={() => setFilters({})}
            className="ml-auto inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink"
          >
            <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {t.search.clearFilters}
          </button>
        )}
      </div>

      {/* Résultats, avec tous les états prévus (section 5) */}
      <div className="mt-4">
        {debouncedName.length < 2 ? (
          <p className="text-sm text-ink-muted">{t.search.hint}</p>
        ) : search.isPending ? (
          <CardGridSkeleton />
        ) : search.isError ? (
          <EmptyState
            icon={Search}
            title={t.search.errorTitle}
            text={t.search.errorText}
          >
            <button
              type="button"
              onClick={() => void search.refetch()}
              className="inline-flex h-11 items-center rounded-standard bg-accent px-4 text-sm font-medium text-accent-ink hover:opacity-90"
            >
              {t.search.retry}
            </button>
          </EmptyState>
        ) : (search.data?.length ?? 0) === 0 ? (
          <EmptyState icon={Search} title={t.search.emptyTitle} text={t.search.emptyText} />
        ) : (
          <CardGrid cards={search.data ?? []} />
        )}
      </div>
    </div>
  );
}
