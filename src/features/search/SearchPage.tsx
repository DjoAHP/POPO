import { SearchIcon } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { t } from "../../i18n";

/**
 * Écran Recherche (fonctionnalité 1).
 * Phase 0 : écran vide. Le champ de recherche, les filtres et la grille
 * de résultats arrivent à la phase 2.
 */
export default function SearchPage() {
  return (
    <div>
      <PageHeader title={t.search.title} description={t.search.description} />
      <EmptyState icon={SearchIcon} title={t.search.emptyTitle} text={t.search.emptyText} />
    </div>
  );
}
