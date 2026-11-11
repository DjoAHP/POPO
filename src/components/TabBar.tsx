import { NavLink, Link } from "react-router-dom";
import { Home, Search, Layers, Heart, Library } from "lucide-react";
import { Logo } from "./Logo";
import { t } from "../i18n";

/**
 * Barre d'onglets (section 5) :
 * - mobile : barre discrète fixée en bas ;
 * - grand écran (lg+) : barre latérale fine, verticale.
 */

const items = [
  { to: "/", label: t.nav.home, icon: Home },
  { to: "/recherche", label: t.nav.search, icon: Search },
  { to: "/collection", label: t.nav.collection, icon: Library },
  { to: "/wishlist", label: t.nav.wishlist, icon: Heart },
  { to: "/sets", label: t.nav.sets, icon: Layers },
] as const;

/** Onglet réutilisé par les deux variantes (bas et latérale). */
function TabLink({
  to,
  label,
  icon: Icon,
  variant,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  variant: "bottom" | "side";
}) {
  const base =
    variant === "bottom"
      ? "flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-[11px] transition-colors"
      : "flex h-11 w-11 items-center justify-center rounded-standard transition-colors";

  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        [
          base,
          isActive
            ? variant === "bottom"
              ? "text-accent"
              : "bg-surface-2 text-accent"
            : "text-ink-muted hover:text-ink",
        ].join(" ")
      }
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      {/* Libellé visible en bas, lu seulement par les lecteurs d'écran en latéral */}
      <span className={variant === "bottom" ? undefined : "sr-only"}>{label}</span>
    </NavLink>
  );
}

export function TabBar() {
  return (
    <>
      {/* Barre latérale fine sur grand écran */}
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden w-16 flex-col items-center gap-2 border-r border-line bg-surface py-4 lg:flex"
        aria-label={t.nav.mainLabel}
      >
        <Link to="/" className="mb-4 flex h-11 w-11 items-center justify-center text-accent">
          <Logo className="h-7 w-7" />
          <span className="sr-only">{t.app.name}</span>
        </Link>
        {items.map((item) => (
          <TabLink key={item.to} {...item} variant="side" />
        ))}
      </aside>

      {/* Barre d'onglets en bas sur mobile */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        aria-label={t.nav.mainLabel}
      >
        <div className="grid grid-cols-5">
          {items.map((item) => (
            <TabLink key={item.to} {...item} variant="bottom" />
          ))}
        </div>
      </nav>
    </>
  );
}
