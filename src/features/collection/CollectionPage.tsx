import { Link } from "react-router-dom";
import { Library, Search } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { t } from "../../i18n";

/**
 * Écran Collection (fonctionnalité 5).
 * Phase 0 : écran vide. La base locale (Dexie), la grille et la valeur
 * totale arrivent à la phase 3.
 */
export default function CollectionPage() {
  return (
    <div>
      <PageHeader title={t.collection.title} description={t.collection.description} />
      <EmptyState icon={Library} title={t.collection.emptyTitle} text={t.collection.emptyText}>
        <Link
          to="/recherche"
          className="inline-flex h-11 items-center gap-2 rounded-standard bg-accent px-4 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          {t.collection.ctaSearch}
        </Link>
      </EmptyState>
    </div>
  );
}
