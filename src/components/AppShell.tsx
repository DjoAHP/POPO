import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { BrandBackground } from "./BrandBackground";
import { t } from "../i18n";

/**
 * Coquille commune (docs/DESIGN.md §2) :
 * fond, header global, contenu, barre d'onglets mobile.
 */
export function AppShell() {
  return (
    <div className="relative min-h-dvh bg-bg text-ink">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:text-sm"
      >
        {t.nav.skipToContent}
      </a>
      <BrandBackground />
      <Header />
      <main id="contenu" className="pb-32 pt-6 lg:pb-16 lg:pt-10">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
