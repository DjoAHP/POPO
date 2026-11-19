import { useState } from "react";
import { Search, SlidersHorizontal, XCircle } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { CardGrid, CardGridSkeleton } from "../../components/CardGrid";
import { FilterSelect } from "../../components/FilterSelect";
import { BottomSheet } from "../../components/BottomSheet";
import { Badge } from "../../components/ui/Badge";
import { Button, buttonStyles } from "../../components/ui/Button";
import { useCardSearch, useRarities, useSets, useTypes } from "../../api/queries";
import type { SearchFilters } from "../../api/tcgdex";
import { useDebouncedValue } from "../../lib/useDebouncedValue";
import { t } from "../../i18n";

/**
 * Écran Recherche (fonctionnalité 1) :
 * - champ avec attente de 300 ms après la dernière frappe ;
 * - filtres set / rareté / type, appliqués côté serveur par TCGdex ;
 * - sur mobile, les filtres s'ouvrent dans un panneau depuis le bas ;
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debouncedName = useDebouncedValue(nameInput.trim(), 300);

  const search = useCardSearch(debouncedName, filters);
  const sets = useSets();
  const rarities = useRarities();
  const types = useTypes();

  const activeFilterCount = [filters.set, filters.rarity, filters.type].filter(Boolean).length;
  const hasActiveFilter = activeFilterCount > 0;

  const filterFields = (idPrefix: string) => (
    <>
      <FilterSelect
        id={`${idPrefix}-set`}
        label={t.search.filterSet}
        value={filters.set ?? ""}
        options={(sets.data ?? []).map((s) => ({ value: s.id, label: s.name }))}
        onChange={(value) => setFilters((f) => ({ ...f, set: value || undefined }))}
      />
      <FilterSelect
        id={`${idPrefix}-rarity`}
        label={t.search.filterRarity}
        value={filters.rarity ?? ""}
        options={(rarities.data ?? []).map((r) => ({ value: r, label: r }))}
        onChange={(value) => setFilters((f) => ({ ...f, rarity: value || undefined }))}
      />
      <FilterSelect
        id={`${idPrefix}-type`}
        label={t.search.filterType}
        value={filters.type ?? ""}
        options={(types.data ?? []).map((ty) => ({ value: ty, label: ty }))}
        onChange={(value) => setFilters((f) => ({ ...f, type: value || undefined }))}
      />
    </>
  );

  return (
    <div>
      <PageHeader
        eyebrow={t.search.eyebrow}
        title={t.search.title}
        description={t.search.description}
      />

      {/* Champ de recherche */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-ink-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder={t.search.placeholder}
          aria-label={t.search.title}
          className="h-14 w-full rounded-pill border border-line/70 bg-glass pl-12 pr-4 text-base shadow-[var(--shadow-soft)] outline-none backdrop-blur transition-shadow placeholder:text-ink-muted focus:border-cyan/60 focus:shadow-[var(--glow-brand)]"
        />
      </div>

      {/* Filtres desktop */}
      <div className="mt-3 hidden gap-3 lg:grid lg:grid-cols-3">{filterFields("desktop")}</div>

      {/* Filtres mobile : panneau depuis le bas */}
      <button
        type="button"
        onClick={() => setFiltersOpen(true)}
        className={buttonStyles("secondary", "md", "mt-3 w-full lg:hidden")}
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        {t.search.filtersButton}
        {activeFilterCount > 0 && <Badge tone="cyan">{activeFilterCount}</Badge>}
      </button>

      <BottomSheet
        open={filtersOpen}
        title={t.search.filtersLabel}
        onClose={() => setFiltersOpen(false)}
      >
        <div className="grid gap-3">{filterFields("mobile")}</div>
        <Button className="mt-4 w-full" onClick={() => setFiltersOpen(false)}>
          {t.search.filtersApply}
        </Button>
      </BottomSheet>

      <div className="mt-3 flex items-center justify-between gap-3">
        {search.data && (
          <p className="text-xs text-ink-muted">{t.search.resultsCount(search.data.length)}</p>
        )}
        {hasActiveFilter && (
          <button
            type="button"
            onClick={() => setFilters({})}
            className="ml-auto inline-flex min-h-9 items-center gap-1 text-xs text-ink-muted transition-colors hover:text-ink"
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
          <EmptyState icon={Search} title={t.search.errorTitle} text={t.search.errorText}>
            <Button onClick={() => void search.refetch()}>{t.search.retry}</Button>
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
