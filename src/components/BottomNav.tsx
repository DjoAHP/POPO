import { NavLink } from "react-router-dom";
import { Home, Search, Layers, Heart, Library } from "lucide-react";
import { t } from "../i18n";

const items = [
  { to: "/", label: t.nav.home, icon: Home },
  { to: "/recherche", label: t.nav.search, icon: Search },
  { to: "/collection", label: t.nav.collection, icon: Library },
  { to: "/wishlist", label: t.nav.wishlist, icon: Heart },
  { to: "/sets", label: t.nav.sets, icon: Layers },
] as const;

/**
 * Barre d'onglets mobile flottante (docs/DESIGN.md §2.2).
 * Masquée à partir de lg : la navigation est alors dans le header.
 */
export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 lg:hidden"
      aria-label={t.nav.mainLabel}
    >
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-card border border-line/70 bg-surface/80 p-1.5 shadow-[var(--shadow-float)] backdrop-blur-xl">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-control text-[11px] font-medium text-ink-muted transition-colors"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={[
                      "flex h-8 w-10 items-center justify-center rounded-pill transition-all",
                      isActive
                        ? "bg-gradient-to-br from-accent to-brand-2 text-on-brand shadow-[var(--glow-brand)]"
                        : "",
                    ].join(" ")}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className={isActive ? "text-ink" : undefined}>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
