import { Link } from "react-router-dom";
import { Heart, Search } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { t } from "../../i18n";

/**
 * Écran Wishlist (fonctionnalité 6).
 * Phase 0 : écran vide. La wishlist locale arrive à la phase 3.
 */
export default function WishlistPage() {
  return (
    <div>
      <PageHeader title={t.wishlist.title} description={t.wishlist.description} />
      <EmptyState icon={Heart} title={t.wishlist.emptyTitle} text={t.wishlist.emptyText}>
        <Link
          to="/recherche"
          className="inline-flex h-11 items-center gap-2 rounded-standard bg-accent px-4 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          {t.wishlist.ctaSearch}
        </Link>
      </EmptyState>
    </div>
  );
}
