import { Link, NavLink } from "react-router-dom";
import { Settings } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { t } from "../i18n";

const items = [
  { to: "/", label: t.nav.home },
  { to: "/recherche", label: t.nav.search },
  { to: "/collection", label: t.nav.collection },
  { to: "/wishlist", label: t.nav.wishlist },
  { to: "/sets", label: t.nav.sets },
] as const;

/**
 * Header global (docs/DESIGN.md §2.1) : identité POPO, navigation desktop,
 * thème et réglages. Sticky sur toutes les pages.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-surface/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6 lg:h-[72px]">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2.5"
          aria-label={`${t.app.name} — ${t.nav.home}`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-accent to-brand-2 text-on-brand shadow-[var(--glow-brand)]">
            <Logo className="h-6 w-6" />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-lg font-bold leading-none tracking-[0.04em]">
              {t.app.name}
            </span>
            <span className="mt-1 hidden text-[11px] text-ink-muted sm:block">
              {t.app.taglineShort}
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label={t.nav.mainLabel}>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                [
                  "relative rounded-pill px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-glass text-ink after:absolute after:inset-x-4 after:-bottom-0.5 after:h-0.5 after:rounded-pill after:bg-gradient-to-r after:from-accent after:to-brand-2"
                    : "text-ink-muted hover:bg-glass hover:text-ink",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-3">
          <ThemeToggle />
          <Link
            to="/reglages"
            aria-label={t.settings.title}
            title={t.settings.title}
            className="flex h-11 w-11 items-center justify-center rounded-pill border border-line/70 bg-glass text-ink-muted backdrop-blur transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-accent via-brand-2 to-accent opacity-60"
      />
    </header>
  );
}
