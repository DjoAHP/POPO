import { Link } from "react-router-dom";
import { BarChart3, Search } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { ThemeToggle } from "../../components/ThemeToggle";
import { Logo } from "../../components/Logo";
import { t } from "../../i18n";

/**
 * Écran Accueil (dashboard, fonctionnalité 8).
 * Phase 0 : le logo, la promesse de l'app, le thème et un accès rapide à la
 * recherche. Les statistiques réelles arrivent à la phase 4.
 */
export default function HomePage() {
  return (
    <div>
      <PageHeader title={t.home.title} action={<ThemeToggle />} />

      {/* Bloc d'identité */}
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

      {/* Emplacement du futur dashboard (phase 4) */}
      <EmptyState icon={BarChart3} title={t.home.dashboardLaterTitle} text={t.home.dashboardLaterText} />
    </div>
  );
}
