# Refonte visuelle POPO — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer l'esthétique actuelle de POPO par la direction « galerie premium colorée » décrite dans `docs/DESIGN.md`, avec un header global, une navigation mobile first et un vrai effet holographique.

**Architecture:** Design system centralisé dans `src/styles/index.css` (jetons CSS + mapping Tailwind v4) et `src/config/brand.ts`. Nouveaux composants d'interface dans `src/components/ui/`. Header et barre mobile remplacent l'actuel `TabBar`. La refonte se fait en 3 lots validés séparément, sans toucher aux données ni aux API.

**Tech Stack:** React 19, TypeScript strict, Vite 8, Tailwind CSS v4, React Router 7, Motion, Lucide, Dexie, TanStack Query. Ajout de deux polices auto-hébergées (`@fontsource-variable/outfit`, `@fontsource-variable/inter`).

**Référence visuelle :** `docs/DESIGN.md` (fait foi). **Mobile first : 390 px est la référence.**

---

## Structure des fichiers

### Créés
| Fichier | Responsabilité |
|---|---|
| `src/config/brand.ts` | Couleurs des types Pokémon et des raretés (données métier de couleur) |
| `src/components/BrandBackground.tsx` | Halos + trame de fond |
| `src/components/Header.tsx` | Header global sticky |
| `src/components/BottomNav.tsx` | Barre d'onglets mobile flottante |
| `src/components/BackLink.tsx` | Retour cohérent |
| `src/components/CardTile.tsx` | Carte de grille présentative |
| `src/components/ui/Surface.tsx` | Panneau solide / verre / dégradé |
| `src/components/ui/Button.tsx` | Styles + composant bouton |
| `src/components/ui/Badge.tsx` | Pastille colorée |
| `src/components/ui/StatTile.tsx` | Tuile statistique |
| `src/components/ui/SegmentedControl.tsx` | Tri / onglets en pilules |

### Modifiés (lot 1)
`src/styles/index.css`, `src/main.tsx`, `index.html`, `src/lib/theme.ts`,
`src/components/AppShell.tsx`, `src/components/PageHeader.tsx`,
`src/components/ThemeToggle.tsx`, `src/components/CardGrid.tsx`,
`src/components/BottomSheet.tsx`, `src/components/FilterSelect.tsx`,
`src/features/dashboard/HomePage.tsx`, `src/features/search/SearchPage.tsx`,
`src/i18n/fr.ts`, `src/App.tsx` (suppression de `TabBar`).

### Modifiés (lots 2 et 3)
`src/config/holographic.ts`, `src/components/HolographicCard.tsx`,
`src/components/CardImage.tsx`, `src/features/card/*`,
`src/features/collection/*`, `src/features/wishlist/*`,
`src/features/sets/*`, `src/features/settings/SettingsPage.tsx`,
`src/components/PageTransition.tsx`.

---

# LOT 1 — Fondations, header, Accueil, Recherche

## Task 1 : Jetons de design, polices, couleur système

**Files:**
- Modify: `src/styles/index.css`
- Modify: `src/main.tsx`
- Modify: `index.html`
- Modify: `src/lib/theme.ts`
- Modify: `package.json` (via npm)

- [ ] **Step 1 : Installer les polices auto-hébergées**

Run:
```bash
npm install @fontsource-variable/outfit @fontsource-variable/inter
```
Expected: deux entrées ajoutées dans `dependencies`.

- [ ] **Step 2 : Remplacer les jetons de `src/styles/index.css`**

```css
@import "tailwindcss";

/* ============================================================
   Jetons de design — docs/DESIGN.md §1.
   Seul endroit où changer la palette de POPO.
   ============================================================ */

:root {
  color-scheme: dark;

  --bg: hsl(230 32% 7%);
  --surface: hsl(230 24% 11%);
  --surface-2: hsl(230 22% 16%);
  --glass: hsl(225 40% 96% / 0.05);
  --line: hsl(230 18% 24%);
  --ink: hsl(225 30% 96%);
  --ink-muted: hsl(225 14% 68%);
  --accent: hsl(188 92% 52%);
  --accent-ink: hsl(230 40% 8%);
  --on-brand: hsl(0 0% 100%);
  --brand-2: hsl(265 85% 65%);
  --gold: hsl(42 95% 60%);
  --success: hsl(158 70% 48%);
  --danger: hsl(345 80% 62%);
  --ring: hsl(188 92% 60%);
  --glow-1: hsl(188 92% 55%);
  --glow-2: hsl(265 85% 65%);
}

[data-theme="light"] {
  color-scheme: light;

  --bg: hsl(225 30% 97%);
  --surface: hsl(0 0% 100%);
  --surface-2: hsl(225 20% 94%);
  --glass: hsl(225 40% 20% / 0.04);
  --line: hsl(225 18% 87%);
  --ink: hsl(230 35% 12%);
  --ink-muted: hsl(225 12% 42%);
  --accent: hsl(192 85% 36%);
  --accent-ink: hsl(0 0% 100%);
  --on-brand: hsl(0 0% 100%);
  --brand-2: hsl(265 70% 48%);
  --gold: hsl(38 85% 42%);
  --success: hsl(158 65% 32%);
  --danger: hsl(345 75% 45%);
  --ring: hsl(192 85% 42%);
  --glow-1: hsl(192 85% 45%);
  --glow-2: hsl(265 70% 55%);
}

/* Mapping Tailwind v4 : bg-bg, bg-surface, text-ink, from-accent, etc. */
@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-glass: var(--glass);
  --color-line: var(--line);
  --color-ink: var(--ink);
  --color-ink-muted: var(--ink-muted);
  --color-accent: var(--accent);
  --color-accent-ink: var(--accent-ink);
  --color-on-brand: var(--on-brand);
  --color-brand-2: var(--brand-2);
  --color-gold: var(--gold);
  --color-success: var(--success);
  --color-danger: var(--danger);

  --font-sans: "Inter Variable", ui-sans-serif, system-ui, -apple-system,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-display: "Outfit Variable", ui-sans-serif, system-ui, sans-serif;
}

/* Jetons statiques (rayons, ombres) */
@theme {
  --radius-standard: 8px; /* conservé pour la migration, supprimé au lot 3 */
  --radius-card: 16px;
  --radius-control: 12px;
  --radius-pill: 9999px;

  --shadow-soft: 0 12px 32px -12px hsl(230 60% 2% / 0.55);
  --shadow-float: 0 20px 48px -20px hsl(230 60% 2% / 0.7);
  --glow-brand: 0 0 32px -6px hsl(188 92% 52% / 0.45);
}

@layer base {
  html {
    -webkit-text-size-adjust: 100%;
  }

  body {
    @apply bg-bg text-ink antialiased;
  }

  h1, h2, h3 {
    @apply font-display;
  }

  /* Chiffres stables pour les prix */
  .tabular {
    font-variant-numeric: tabular-nums;
  }

  :focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}

@layer components {
  /* Carte de grille + reflet irisé CSS (aucun JS) */
  .card-tile {
    @apply relative transition-transform duration-200;
  }

  .card-tile-media {
    @apply relative overflow-hidden rounded-card bg-surface-2;
  }

  .card-sheen {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    background: linear-gradient(
      115deg,
      transparent 25%,
      hsl(188 92% 70% / 0.3) 40%,
      hsl(265 85% 75% / 0.3) 52%,
      hsl(42 95% 65% / 0.26) 64%,
      transparent 80%
    );
    background-size: 220% 100%;
    background-position: 120% 0;
    mix-blend-mode: screen;
    transition: opacity 0.3s ease;
  }

  @media (hover: hover) and (pointer: fine) {
    .card-tile:hover {
      transform: translateY(-3px);
    }
    .card-tile[data-holo="true"]:hover .card-sheen {
      opacity: 1;
      animation: card-sheen 1.6s ease forwards;
    }
  }

  @keyframes card-sheen {
    from { background-position: 140% 0; }
    to { background-position: -40% 0; }
  }
}
```

- [ ] **Step 3 : Importer les polices dans `src/main.tsx`**

Ajouter avant `import "./styles/index.css";` :

```ts
import "@fontsource-variable/outfit";
import "@fontsource-variable/inter";
```

- [ ] **Step 4 : Aligner la couleur de barre système**

Dans `src/lib/theme.ts` :

```ts
const THEME_COLOR: Record<Theme, string> = {
  dark: "#0c0e18",
  light: "#f5f6f9",
};
```

Dans `index.html`, remplacer la balise :

```html
<meta name="theme-color" content="#0c0e18" />
```

- [ ] **Step 5 : Vérifier la compilation**

Run: `npm run build`
Expected: succès (aucune erreur TypeScript).

- [ ] **Step 6 : Commit**

```bash
git add package.json package-lock.json src/styles/index.css src/main.tsx src/lib/theme.ts index.html
git commit -m "feat(design): jetons galerie premium, polices Outfit/Inter, couleurs système"
```

---

## Task 2 : Couleurs métier (`src/config/brand.ts`)

**Files:**
- Create: `src/config/brand.ts`

- [ ] **Step 1 : Créer le fichier**

```ts
/**
 * Couleurs métier de POPO (docs/DESIGN.md §1.3).
 * Les clés correspondent aux noms techniques renvoyés par PokéAPI.
 * Seul endroit à modifier pour ajuster les couleurs de types / raretés.
 */

export const POKEMON_TYPE_COLORS: Record<string, string> = {
  normal: "hsl(40 12% 60%)",
  fire: "hsl(18 90% 58%)",
  water: "hsl(210 85% 58%)",
  electric: "hsl(48 95% 55%)",
  grass: "hsl(135 60% 48%)",
  ice: "hsl(185 70% 62%)",
  fighting: "hsl(5 75% 55%)",
  poison: "hsl(285 65% 58%)",
  ground: "hsl(38 65% 52%)",
  flying: "hsl(210 70% 70%)",
  psychic: "hsl(335 80% 62%)",
  bug: "hsl(85 55% 45%)",
  rock: "hsl(45 40% 48%)",
  ghost: "hsl(265 55% 50%)",
  dragon: "hsl(255 75% 60%)",
  dark: "hsl(240 25% 35%)",
  steel: "hsl(210 20% 60%)",
  fairy: "hsl(330 75% 72%)",
  stellar: "hsl(280 80% 65%)",
  unknown: "hsl(220 10% 55%)",
  shadow: "hsl(265 40% 35%)",
};

/** Couleur d'un type, avec repli neutre. */
export function typeColor(type: string): string {
  return POKEMON_TYPE_COLORS[type] ?? "hsl(220 10% 55%)";
}

/** Couleur d'accent d'une rareté (badges). */
export function rarityColor(rarity: string | undefined): string {
  if (!rarity) return "hsl(220 12% 60%)";
  const r = rarity.toLowerCase();
  if (r.includes("hyper") || r.includes("magnifique")) return "hsl(42 95% 60%)";
  if (r.includes("ultra") || r.includes("illustration")) return "hsl(265 85% 68%)";
  if (r.includes("shiny") || r.includes("chromatique")) return "hsl(188 92% 62%)";
  if (r.includes("holo") || r.includes("rare")) return "hsl(198 85% 60%)";
  return "hsl(220 12% 60%)";
}
```

- [ ] **Step 2 : Commit**

```bash
git add src/config/brand.ts
git commit -m "feat(design): couleurs des types Pokémon et des raretés"
```

---

## Task 3 : Fond, coquille et lien d'évitement

**Files:**
- Create: `src/components/BrandBackground.tsx`
- Modify: `src/components/AppShell.tsx`
- Modify: `src/i18n/fr.ts`

- [ ] **Step 1 : Créer `BrandBackground`**

```tsx
/**
 * Fond de l'application (docs/DESIGN.md §1.6) :
 * deux halos radiaux diffus + une trame de points quasi invisible.
 * Aucune animation : coût nul pendant le défilement.
 */
export function BrandBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-32 -top-32 h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,var(--glow-1)_0%,transparent_70%)] opacity-[0.13]" />
      <div className="absolute -bottom-40 -right-32 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,var(--glow-2)_0%,transparent_70%)] opacity-[0.11]" />
      <div className="absolute inset-0 opacity-[0.10] [background-image:radial-gradient(var(--line)_1px,transparent_1px)] [background-size:24px_24px]" />
    </div>
  );
}
```

- [ ] **Step 2 : Ajouter les textes dans `src/i18n/fr.ts`**

Dans `nav`, ajouter :

```ts
    skipToContent: "Aller au contenu",
    settings: "Réglages",
```

Dans `app`, ajouter :

```ts
    taglineShort: "Collection Pokémon",
```

- [ ] **Step 3 : Réécrire `src/components/AppShell.tsx`**

```tsx
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
```

- [ ] **Step 4 : Commit**

```bash
git add src/components/BrandBackground.tsx src/components/AppShell.tsx src/i18n/fr.ts
git commit -m "feat(design): fond lumineux et coquille mobile first"
```

---

## Task 4 : Header global

**Files:**
- Create: `src/components/Header.tsx`
- Modify: `src/components/ThemeToggle.tsx`
- Modify: `src/App.tsx` (rien à changer ici, `AppShell` suffit)

- [ ] **Step 1 : Restyler `ThemeToggle`**

Remplacer la `className` du bouton par :

```tsx
      className="flex h-11 w-11 items-center justify-center rounded-pill border border-line/70 bg-glass text-ink-muted backdrop-blur transition-colors hover:bg-surface-2 hover:text-ink"
```

- [ ] **Step 2 : Créer `Header`**

```tsx
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
```

- [ ] **Step 3 : Vérifier que `App.tsx` n'importe plus `TabBar`**

`App.tsx` n'importe pas `TabBar` directement : c'est `AppShell`. Aucun changement nécessaire.

- [ ] **Step 4 : Commit**

```bash
git add src/components/Header.tsx src/components/ThemeToggle.tsx
git commit -m "feat(design): header global avec logo, nav desktop et actions"
```

---

## Task 5 : Barre d'onglets mobile flottante

**Files:**
- Create: `src/components/BottomNav.tsx`
- Delete: `src/components/TabBar.tsx`

- [ ] **Step 1 : Créer `BottomNav`**

```tsx
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
```

- [ ] **Step 2 : Supprimer l'ancien composant**

```bash
git rm src/components/TabBar.tsx
```

- [ ] **Step 3 : Vérifier qu'aucun fichier n'importe `TabBar`**

Run: `grep -rn "TabBar" src`
Expected: aucun résultat.

- [ ] **Step 4 : Commit**

```bash
git add src/components/BottomNav.tsx
git commit -m "feat(design): barre d'onglets mobile flottante"
```

---

## Task 6 : Primitives d'interface

**Files:**
- Create: `src/components/ui/Surface.tsx`
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/StatTile.tsx`
- Create: `src/components/ui/SegmentedControl.tsx`

- [ ] **Step 1 : `Surface`**

```tsx
import type { ReactNode } from "react";

type SurfaceVariant = "solid" | "glass" | "gradient";

interface SurfaceProps {
  variant?: SurfaceVariant;
  className?: string;
  children: ReactNode;
}

const variants: Record<SurfaceVariant, string> = {
  solid: "border-line/70 bg-surface",
  glass: "border-line/60 bg-glass backdrop-blur-xl",
  gradient:
    "border-line/60 bg-gradient-to-br from-accent/10 via-glass to-brand-2/10 backdrop-blur-xl",
};

/** Panneau de base (docs/DESIGN.md §3). */
export function Surface({ variant = "solid", className, children }: SurfaceProps) {
  return (
    <div
      className={[
        "rounded-card border shadow-[var(--shadow-soft)]",
        variants[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2 : `Button`**

```tsx
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-medium transition-all disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-br from-accent to-brand-2 text-on-brand shadow-[var(--glow-brand)] hover:brightness-110",
  secondary:
    "border border-line/70 bg-glass text-ink backdrop-blur hover:bg-surface-2",
  ghost: "text-ink-muted hover:bg-glass hover:text-ink",
  danger: "border border-danger/40 bg-danger/10 text-danger hover:bg-danger/15",
};

/** Classes réutilisables pour les liens stylés comme des boutons. */
export function buttonStyles(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = "",
) {
  return [base, sizes[size], variants[variant], className].filter(Boolean).join(" ");
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonStyles(variant, size, className)} {...props}>
      {children}
    </button>
  );
}
```

- [ ] **Step 3 : `Badge`**

```tsx
import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "accent" | "brand2" | "gold" | "success" | "danger";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line/70 bg-surface-2 text-ink-muted",
  accent: "border-accent/30 bg-accent/10 text-accent",
  brand2: "border-brand-2/30 bg-brand-2/10 text-brand-2",
  gold: "border-gold/30 bg-gold/10 text-gold",
  success: "border-success/30 bg-success/10 text-success",
  danger: "border-danger/30 bg-danger/10 text-danger",
};

interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

/** Pastille compacte (rareté, type, quantité). */
export function Badge({ tone = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-pill border px-2.5 py-0.5 text-[11px] font-medium",
        tones[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 4 : `StatTile`**

```tsx
import type { ComponentType, ReactNode } from "react";
import { Surface } from "./Surface";

interface StatTileProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "accent" | "gold" | "brand2";
}

const tones = {
  accent: "bg-accent/12 text-accent",
  gold: "bg-gold/12 text-gold",
  brand2: "bg-brand-2/12 text-brand-2",
};

/** Tuile statistique (Accueil, Réglages). */
export function StatTile({ icon: Icon, label, value, hint, tone = "accent" }: StatTileProps) {
  return (
    <Surface className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-ink-muted">{label}</p>
          <p className="tabular mt-1 text-2xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-control ${tones[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </Surface>
  );
}
```

- [ ] **Step 5 : `SegmentedControl`**

```tsx
interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}

/**
 * Contrôle segmenté en pilules (tri, filtres, onglets).
 * Scroll horizontal autorisé sur mobile.
 */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={[
        "inline-flex max-w-full gap-1 overflow-x-auto rounded-pill border border-line/70 bg-glass p-1",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={[
              "shrink-0 rounded-pill px-3.5 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-gradient-to-br from-accent to-brand-2 text-on-brand shadow-[var(--glow-brand)]"
                : "text-ink-muted hover:text-ink",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 6 : Vérifier la compilation**

Run: `npm run build`
Expected: succès.

- [ ] **Step 7 : Commit**

```bash
git add src/components/ui
git commit -m "feat(design): primitives Surface, Button, Badge, StatTile, SegmentedControl"
```

---

## Task 7 : Titres de page, retour et textes

**Files:**
- Modify: `src/components/PageHeader.tsx`
- Create: `src/components/BackLink.tsx`
- Modify: `src/i18n/fr.ts`

- [ ] **Step 1 : Réécrire `PageHeader`**

```tsx
import type { ReactNode } from "react";

interface PageHeaderProps {
  /** Micro-étiquette en majuscules (ex. « MA COLLECTION »). */
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

/** En-tête commun à toutes les pages (docs/DESIGN.md §2.3). */
export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight sm:text-[32px]">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
```

- [ ] **Step 2 : Créer `BackLink`**

```tsx
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackLinkProps {
  to: string;
  label: string;
}

/** Retour cohérent sur toutes les pages de détail. */
export function BackLink({ to, label }: BackLinkProps) {
  return (
    <Link
      to={to}
      className="mb-5 inline-flex min-h-11 items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {label}
    </Link>
  );
}
```

- [ ] **Step 3 : Ajouter les textes**

Dans `src/i18n/fr.ts` :

```ts
  home: {
    eyebrow: "Tableau de bord",
    // … existant
  },
  search: {
    eyebrow: "Explorer",
    filtersButton: "Filtres",
    filtersActive: (n: number) => `${n} filtre${n > 1 ? "s" : ""} actif${n > 1 ? "s" : ""}`,
    // … existant
  },
  collection: {
    eyebrow: "Ma collection",
    // … existant
  },
  wishlist: {
    eyebrow: "Mes envies",
    // … existant
  },
  sets: {
    eyebrow: "Extensions",
    // … existant
  },
  settings: {
    eyebrow: "Préférences",
    // … existant
  },
  card: {
    eyebrow: "Fiche carte",
    // … existant
  },
```

(Conserver toutes les clés existantes ; n'en supprimer aucune.)

- [ ] **Step 4 : Commit**

```bash
git add src/components/PageHeader.tsx src/components/BackLink.tsx src/i18n/fr.ts
git commit -m "feat(design): en-têtes de page et retour cohérents"
```

---

## Task 8 : Carte de grille et grille

**Files:**
- Create: `src/components/CardTile.tsx`
- Modify: `src/components/CardGrid.tsx`
- Modify: `src/components/CardImage.tsx`
- Modify: `src/components/FilterSelect.tsx`
- Modify: `src/components/BottomSheet.tsx`

- [ ] **Step 1 : Créer `CardTile`**

```tsx
import type { ReactNode } from "react";
import { CardImage } from "./CardImage";
import { isHolographicRarity } from "../config/holographic";

interface CardTileProps {
  image?: string;
  name: string;
  meta?: string;
  rarity?: string;
  quantity?: number;
  badge?: ReactNode;
}

/**
 * Carte de grille présentative (docs/DESIGN.md §3).
 * Le lien ou le bouton est fourni par l'appelant.
 * Les cartes rares reçoivent un reflet irisé CSS au survol (aucun JS).
 */
export function CardTile({ image, name, meta, rarity, quantity, badge }: CardTileProps) {
  const holo = isHolographicRarity(rarity);

  return (
    <div className="card-tile" data-holo={holo ? "true" : undefined}>
      <div className="card-tile-media">
        <CardImage image={image} name={name} />
        {holo && <span className="card-sheen" aria-hidden="true" />}
        {quantity !== undefined && quantity > 1 && (
          <span className="absolute right-1.5 top-1.5 rounded-pill bg-bg/85 px-1.5 py-0.5 text-[11px] font-semibold backdrop-blur">
            ×{quantity}
          </span>
        )}
        {badge && <span className="absolute left-1.5 top-1.5">{badge}</span>}
      </div>
      <p className="mt-2 truncate text-[13px] font-medium">{name}</p>
      {meta && <p className="truncate text-[11px] text-ink-muted">{meta}</p>}
    </div>
  );
}
```

- [ ] **Step 2 : Réécrire `CardGrid`**

```tsx
import { Link } from "react-router-dom";
import { CardTile } from "./CardTile";
import type { TcgdexCardBrief } from "../api/types";

const gridClass =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

/** Grille de miniatures, partagée par Recherche, Collection et Wishlist. */
export function CardGrid({ cards }: { cards: TcgdexCardBrief[] }) {
  return (
    <ul className={gridClass}>
      {cards.map((card) => (
        <li key={card.id}>
          <Link
            to={`/carte/${encodeURIComponent(card.id)}`}
            className="block rounded-card"
          >
            <CardTile
              image={card.image}
              name={card.name}
              meta={card.id}
              rarity={card.rarity}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Squelette de la grille pendant le chargement. */
export function CardGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <ul className={gridClass} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <div className="aspect-[245/337] w-full animate-pulse rounded-card bg-surface-2" />
          <div className="mt-2 h-3 w-3/4 animate-pulse rounded-pill bg-surface-2" />
          <div className="mt-1.5 h-2.5 w-1/2 animate-pulse rounded-pill bg-surface-2" />
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 3 : Ajuster `CardImage`**

Remplacer la classe de l'image par :

```tsx
      className="block aspect-[245/337] w-full"
```

et la classe du repli par :

```tsx
        className={[
          "flex aspect-[245/337] w-full items-center justify-center rounded-card bg-surface-2 text-xs text-ink-muted",
          className,
        ]
```

- [ ] **Step 4 : Restyler `FilterSelect`**

Remplacer la `className` du `<select>` par :

```tsx
        className="h-11 w-full rounded-control border border-line/70 bg-glass px-3 text-sm backdrop-blur transition-colors hover:bg-surface-2"
```

- [ ] **Step 5 : Restyler `BottomSheet`**

Remplacer la `className` du panneau par :

```tsx
        className="relative w-full max-w-md rounded-t-card border border-line/70 bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-[var(--shadow-float)] lg:rounded-card"
```

et ajouter, juste après l'ouverture du panneau :

```tsx
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-pill bg-line lg:hidden" aria-hidden="true" />
```

- [ ] **Step 6 : Vérifier**

Run: `npm run build`
Expected: succès.

- [ ] **Step 7 : Commit**

```bash
git add src/components/CardTile.tsx src/components/CardGrid.tsx src/components/CardImage.tsx src/components/FilterSelect.tsx src/components/BottomSheet.tsx
git commit -m "feat(design): cartes de grille avec reflet irisé et contrôles repolissés"
```

---

## Task 9 : Accueil

**Files:**
- Modify: `src/features/dashboard/HomePage.tsx`
- Modify: `src/i18n/fr.ts`

- [ ] **Step 1 : Ajouter les textes**

Dans `home` :

```ts
    quickSearchPlaceholder: "Rechercher une carte…",
    quickSearchButton: "Rechercher",
    recentTitle: "Dernières ajoutées",
    seeAll: "Tout voir",
    setsTitle: "Progression des sets",
    valueLabel: "Valeur estimée",
    cardsLabel: "Cartes possédées",
    featureSearchTitle: "Chercher",
    featureSearchText: "Trouve une carte et compare son prix.",
    featureCompareTitle: "Comparer",
    featureCompareText: "Cardmarket face à TCGplayer, en euros.",
    featureCollectTitle: "Collectionner",
    featureCollectText: "Ta collection reste sur ton appareil.",
```

- [ ] **Step 2 : Réécrire le rendu**

Conserver toute la logique Dexie existante (`useLiveQuery`, `collectionValue`,
`collectionCardCount`, `sortCollection`) et remplacer uniquement le rendu :

- `PageHeader` avec `eyebrow={t.home.eyebrow}` ;
- si chargement → `DashboardSkeleton` (surfaces `rounded-card`, hauteurs inchangées) ;
- si vide → `EmptyDashboard` avec `Surface variant="gradient"`, logo 64 px,
  tagline, bouton primaire (via `buttonStyles`), et 3 `Surface` avec icônes
  `Search`, `BarChart3`, `Library` ;
- sinon → `DashboardContent` :

```tsx
<Surface variant="gradient" className="relative overflow-hidden p-5 sm:p-6">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-xs text-ink-muted">{t.home.valueLabel}</p>
      <p className="tabular mt-1 font-display text-4xl font-bold tracking-tight text-gold sm:text-5xl">
        <AnimatedEurCounter value={value.total} duration={1.2} />
      </p>
      <p className="mt-2 text-sm text-ink-muted">
        {t.collection.cardCount(count)}
        {value.unpricedCount > 0 && ` · ${t.collection.unpricedNote(value.unpricedCount)}`}
      </p>
    </div>
    <form
      className="flex w-full gap-2 sm:max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get("q");
        if (typeof q === "string" && q.trim().length >= 2) {
          navigate(`/recherche?q=${encodeURIComponent(q.trim())}`);
        }
      }}
    >
      <input
        name="q"
        type="search"
        placeholder={t.home.quickSearchPlaceholder}
        aria-label={t.home.quickSearchPlaceholder}
        className="h-11 min-w-0 flex-1 rounded-control border border-line/70 bg-glass px-3 text-sm outline-none placeholder:text-ink-muted"
      />
      <Button type="submit">{t.home.quickSearchButton}</Button>
    </form>
  </div>
</Surface>

<div className="mt-4 grid gap-4 sm:grid-cols-2">
  <StatTile icon={Wallet} label={t.home.valueLabel} value={<AnimatedEurCounter value={value.total} />} tone="gold" />
  <StatTile icon={Library} label={t.home.cardsLabel} value={<AnimatedIntCounter value={count} />} tone="accent" />
</div>
```

- Section « Dernières ajoutées » : `Surface` avec titre + lien « Tout voir »,
  rangée `flex gap-3 overflow-x-auto` de `CardTile` (largeur 9rem) dans des
  `Link` ;
- Section « Progression des sets » : `Surface`, barres `h-2 rounded-pill
  bg-surface-2` avec remplissage `bg-gradient-to-r from-accent to-brand-2`.
  Enrichir le total avec `useSets()` (données déjà en cache) : construire une
  `Map` `setId → cardCount.official ?? cardCount.total` et l'utiliser pour le
  pourcentage. Si le total reste inconnu, afficher le nombre possédé sans
  pourcentage.

- [ ] **Step 3 : Vérifier**

Run: `npm run build`
Expected: succès.

- [ ] **Step 4 : Commit**

```bash
git add src/features/dashboard/HomePage.tsx src/i18n/fr.ts
git commit -m "feat(design): accueil vitrine (hero, valeur, recherche rapide)"
```

---

## Task 10 : Recherche

**Files:**
- Modify: `src/features/search/SearchPage.tsx`
- Modify: `src/i18n/fr.ts`

- [ ] **Step 1 : Ajouter les textes**

Dans `search` :

```ts
    filtersApply: "Voir les résultats",
```

- [ ] **Step 2 : Réécrire le rendu**

Conserver la logique (`useState`, `useDebouncedValue`, `useCardSearch`,
`useSets`, `useRarities`, `useTypes`, filtres URL). Ajouter :

```tsx
const [filtersOpen, setFiltersOpen] = useState(false);
const activeFilterCount = [filters.set, filters.rarity, filters.type].filter(Boolean).length;
```

Rendu :

- `PageHeader` avec `eyebrow={t.search.eyebrow}` ;
- champ de recherche :

```tsx
<div className="relative">
  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
  <input
    type="search"
    value={nameInput}
    onChange={(e) => setNameInput(e.target.value)}
    placeholder={t.search.placeholder}
    aria-label={t.search.title}
    className="h-14 w-full rounded-pill border border-line/70 bg-glass pl-12 pr-4 text-base shadow-[var(--shadow-soft)] outline-none backdrop-blur transition-shadow placeholder:text-ink-muted focus:border-accent/60 focus:shadow-[var(--glow-brand)]"
  />
</div>
```

- filtres desktop :

```tsx
<div className="mt-3 hidden gap-3 lg:grid lg:grid-cols-3">
  {/* les 3 FilterSelect existants */}
</div>
```

- filtres mobile :

```tsx
<button
  type="button"
  onClick={() => setFiltersOpen(true)}
  className={buttonStyles("secondary", "md", "mt-3 w-full lg:hidden")}
>
  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
  {t.search.filtersButton}
  {activeFilterCount > 0 && <Badge tone="accent">{activeFilterCount}</Badge>}
</button>

<BottomSheet open={filtersOpen} title={t.search.filtersLabel} onClose={() => setFiltersOpen(false)}>
  <div className="grid gap-3">
    {/* les 3 mêmes FilterSelect */}
  </div>
  <Button className="mt-4 w-full" onClick={() => setFiltersOpen(false)}>
    {t.search.filtersApply}
  </Button>
</BottomSheet>
```

- compteur de résultats + « Réinitialiser » conservés, restylés ;
- grille : `CardGrid` (2 colonnes mobile) inchangée côté appelant ;
- états vide/erreur : `EmptyState` conservé.

- [ ] **Step 3 : Vérifier**

Run: `npm run build`
Expected: succès.

- [ ] **Step 4 : Commit**

```bash
git add src/features/search/SearchPage.tsx src/i18n/fr.ts
git commit -m "feat(design): recherche galerie, filtres mobiles en panneau"
```

---

## Task 11 : Validation du lot 1

- [ ] **Step 1 : Build complet**

Run: `npm run build`
Expected: succès.

- [ ] **Step 2 : Lancer en local**

Run: `npm run dev`
Expected: serveur Vite prêt (http://localhost:1420).

- [ ] **Step 3 : Vérifications manuelles**

À 390 px de large :
- header avec logo + POPO + thème + réglages ;
- barre flottante en bas, onglet actif en pastille dégradée ;
- accueil : hero, valeur en or, recherche rapide, cartes récentes ;
- recherche : grand champ, bouton Filtres, panneau depuis le bas, grille 2 colonnes ;
- aucune couleur grise « plate » résiduelle, aucun débordement horizontal.

En desktop :
- nav dans le header, pas de barre latérale ;
- grille jusqu'à 6 colonnes.

- [ ] **Step 4 : Commit éventuel des ajustements**

```bash
git add -A
git commit -m "fix(design): ajustements lot 1 après vérification"
```

---

# LOT 2 — Fiche carte, holographie, rognage

## Task 12 : Thèmes holographiques par rareté

**Files:**
- Modify: `src/config/holographic.ts`

- [ ] **Step 1 : Ajouter les thèmes**

```ts
export interface HoloTheme {
  id: "standard" | "holo" | "ultra" | "shiny";
  foil: [string, string, string];
  glow: string;
  intensity: number;
}

export const HOLO_THEMES: Record<HoloTheme["id"], HoloTheme> = {
  standard: {
    id: "standard",
    foil: ["transparent", "transparent", "transparent"],
    glow: "hsl(220 12% 60% / 0.25)",
    intensity: 0,
  },
  holo: {
    id: "holo",
    foil: ["hsl(188 92% 70%)", "hsl(265 85% 75%)", "hsl(210 90% 85%)"],
    glow: "hsl(188 92% 55% / 0.45)",
    intensity: 0.55,
  },
  ultra: {
    id: "ultra",
    foil: ["hsl(42 95% 65%)", "hsl(335 85% 70%)", "hsl(265 85% 72%)"],
    glow: "hsl(42 95% 60% / 0.5)",
    intensity: 0.7,
  },
  shiny: {
    id: "shiny",
    foil: ["hsl(0 0% 95%)", "hsl(188 92% 75%)", "hsl(265 85% 80%)"],
    glow: "hsl(0 0% 90% / 0.45)",
    intensity: 0.65,
  },
};

/** Choisit le thème holo d'une rareté. */
export function getHoloTheme(rarity: string | undefined): HoloTheme {
  const r = rarity?.toLowerCase() ?? "";
  if (r.includes("shiny") || r.includes("chromatique")) return HOLO_THEMES.shiny;
  if (r.includes("hyper") || r.includes("ultra") || r.includes("illustration")) {
    return HOLO_THEMES.ultra;
  }
  if (isHolographicRarity(rarity)) return HOLO_THEMES.holo;
  return HOLO_THEMES.standard;
}
```

- [ ] **Step 2 : Commit**

```bash
git add src/config/holographic.ts
git commit -m "feat(holo): thèmes iridescents par rareté"
```

---

## Task 13 : Réécriture de `HolographicCard` (et correction du rognage)

**Files:**
- Modify: `src/components/HolographicCard.tsx`

- [ ] **Step 1 : Remplacer le composant**

Points obligatoires :
- conteneur extérieur **sans** `overflow-hidden` ;
- `perspective` sur le conteneur, rotation sur l'enfant ;
- `overflow-hidden` + arrondi uniquement sur le conteneur de l'image ;
- pointer events unifiés (`onPointerMove`, `onPointerLeave`) + repli tactile ;
- mise à jour via `requestAnimationFrame` ;
- variables CSS `--holo-x`, `--holo-y` (0 → 1), `--holo-rx`, `--holo-ry` ;
- couches `holo-foil`, `holo-glare`, `holo-grain`, `holo-edge` ;
- `prefers-reduced-motion` : aucune animation ;
- `will-change` seulement pendant l'interaction.

Structure :

```tsx
<div
  ref={stageRef}
  className="holo-stage relative"
  style={{ perspective: "1000px" }}
  onPointerMove={handlePointerMove}
  onPointerLeave={reset}
>
  <div
    className="holo-card relative rounded-card"
    style={{
      transform: `rotateX(var(--holo-rx, 0deg)) rotateY(var(--holo-ry, 0deg))`,
      transformStyle: "preserve-3d",
      transition: active ? "transform 0.08s ease-out" : "transform 0.4s ease-out",
      boxShadow: `0 18px 40px -20px ${theme.glow}`,
    }}
  >
    <div className="overflow-hidden rounded-card">{children}</div>
    <div className="holo-foil" aria-hidden="true" />
    <div className="holo-glare" aria-hidden="true" />
    <div className="holo-grain" aria-hidden="true" />
    <div className="holo-edge" aria-hidden="true" />
  </div>
</div>
```

CSS (dans le composant, via `<style>` ou dans `index.css`) :

```css
.holo-foil {
  position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: linear-gradient(115deg,
    transparent 20%,
    color-mix(in srgb, var(--foil-1) 60%, transparent) 38%,
    color-mix(in srgb, var(--foil-2) 60%, transparent) 52%,
    color-mix(in srgb, var(--foil-3) 60%, transparent) 66%,
    transparent 82%);
  background-size: 220% 220%;
  background-position: calc(var(--holo-x, 0.5) * 100%) calc(var(--holo-y, 0.5) * 100%);
  mix-blend-mode: screen;
  opacity: var(--holo-opacity, 0);
  transition: opacity 0.3s ease;
}
.holo-glare {
  position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: radial-gradient(circle at calc(var(--holo-x, 0.5) * 100%) calc(var(--holo-y, 0.5) * 100%),
    rgba(255,255,255,0.55), transparent 55%);
  opacity: calc(var(--holo-opacity, 0) * 0.7);
  mix-blend-mode: soft-light;
}
.holo-grain {
  position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background-image: repeating-linear-gradient(115deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px);
  opacity: 0.35;
}
.holo-edge {
  position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.18), inset 0 0 24px -8px var(--foil-1);
}
```

Le composant pose `--foil-1`, `--foil-2`, `--foil-3`, `--holo-opacity` depuis
le thème, et met à jour `--holo-x`, `--holo-y`, `--holo-rx`, `--holo-ry` sur
le nœud.

- [ ] **Step 2 : Vérifier le rognage**

Run: `npm run dev`, ouvrir une fiche carte rare, incliner à la souris.
Expected: les coins ne sont jamais coupés, la carte sort librement de sa boîte.

> ⚠️ Ne pas lancer `npm run build` à cette étape : `CardImage` utilise encore
> l'ancienne signature. Le build est validé à la fin de la Task 14.

- [ ] **Step 3 : Commit**

```bash
git add src/components/HolographicCard.tsx src/styles/index.css
git commit -m "fix(holo): correction du rognage et nouvel effet iridescent"
```

---

## Task 14 : Branchement de `CardImage`

**Files:**
- Modify: `src/components/CardImage.tsx`

- [ ] **Step 1 : Utiliser le thème de rareté**

Remplacer la fin du composant par :

```tsx
  const theme = getHoloTheme(rarity);

  if (theme.id === "standard" && quality === "low") {
    return <>{img}</>;
  }

  return (
    <HolographicCard theme={theme} disabled={disableHolographic}>
      {img}
    </HolographicCard>
  );
```

Adapter la signature de `HolographicCard` pour accepter `theme: HoloTheme`
(au lieu de `effect` / `maxTilt` / `shimmerSpeed`).

- [ ] **Step 2 : Commit**

```bash
git add src/components/CardImage.tsx src/components/HolographicCard.tsx
git commit -m "feat(holo): branchement des thèmes par rareté sur la fiche carte"
```

---

## Task 15 : Fiche carte

**Files:**
- Modify: `src/features/card/CardPage.tsx`
- Modify: `src/features/card/PriceCompare.tsx`
- Modify: `src/features/card/CardActions.tsx`
- Modify: `src/features/card/PokemonSection.tsx`

- [ ] **Step 1 : Mise en page**

- `BackLink` au lieu du `<nav>` bricolé ;
- `PageHeader` avec `eyebrow={t.card.eyebrow}` et le nom de la carte ;
- desktop : `grid gap-8 sm:grid-cols-[320px_1fr]` ;
- socle lumineux : wrapper `relative` avec un halo
  `absolute inset-6 rounded-full blur-3xl` teinté par la rareté ;
- badges set / rareté via `Badge` ;
- panneaux via `Surface`.

- [ ] **Step 2 : Prix**

`PriceCompare` : deux `Surface variant="glass"`, montant en
`text-2xl font-semibold tabular`, écart avec `ArrowUpRight` / `ArrowDownRight`
et `text-success` / `text-danger`.

- [ ] **Step 3 : Actions**

`CardActions` : `Button` primaire (collection) et `Button variant="secondary"`
(wishlist), `w-full` sur mobile.

- [ ] **Step 4 : Pokémon**

`PokemonSection` : `Surface`, badges de types colorés via `typeColor` et
`typeNameFr`, stats en barres (`h-2 rounded-pill`, largeur = valeur / 255),
évolutions en pilules.

- [ ] **Step 5 : Vérifier**

Run: `npm run build`
Expected: succès.

- [ ] **Step 6 : Commit**

```bash
git add src/features/card
git commit -m "feat(design): fiche carte mise en scène (prix, actions, Pokémon)"
```

---

## Task 16 : Validation du lot 2

- [ ] Build (`npm run build`) ;
- [ ] fiche carte à 390 px : carte centrée, halo, prix lisibles, actions pleine largeur ;
- [ ] inclinaison : aucun coin coupé, reflet fluide ;
- [ ] grille : reflet irisé au survol desktop uniquement ;
- [ ] mode « réduire les animations » : pas d'inclinaison.

---

# LOT 3 — Collection, Wishlist, Sets, Réglages, finitions

## Task 17 : Collection et Wishlist

**Files:**
- Modify: `src/features/collection/CollectionPage.tsx`
- Modify: `src/features/wishlist/WishlistPage.tsx`
- Modify: `src/features/collection/CollectionItemSheet.tsx`
- Modify: `src/features/wishlist/WishlistItemSheet.tsx`

- [ ] **Step 1 : Bandeau résumé**

`Surface variant="gradient"` avec liseré, valeur en `text-gold` + `tabular`,
nombre de cartes, note « sans prix ».

- [ ] **Step 2 : Tri en pilules**

Remplacer le `<select>` par :

```tsx
<SegmentedControl
  value={sort}
  onChange={setSort}
  ariaLabel={t.collection.sortLabel}
  options={[
    { value: "addedAt", label: t.collection.sortAddedAt },
    { value: "name", label: t.collection.sortName },
    { value: "value", label: t.collection.sortValue },
  ]}
/>
```

- [ ] **Step 3 : Grille**

Utiliser `CardTile` dans un `<button>` (édition) avec `quantity`, méta
condition + prix. Même grille 2 → 6 colonnes.

- [ ] **Step 4 : Wishlist**

Même structure, accent violet, `CardTile` avec prix.

- [ ] **Step 5 : Commit**

```bash
git add src/features/collection src/features/wishlist
git commit -m "feat(design): collection et wishlist en coffre premium"
```

---

## Task 18 : Sets

**Files:**
- Modify: `src/features/sets/SetsPage.tsx`
- Modify: `src/features/sets/SetDetailPage.tsx`

- [ ] **Step 1 : Recherche de set**

Ajouter un champ de recherche local (`useState`) filtrant `sets` par nom
(insensible à la casse et aux accents via `toLocaleLowerCase("fr")`).

- [ ] **Step 2 : Cartes de set**

`Surface` par set, vignette logo dans `rounded-control bg-glass`, barre de
progression dégradée.

- [ ] **Step 3 : Détail**

`BackLink`, hero avec logo + progression, `SegmentedControl` pour
Toutes / Possédées / Manquantes, `CardTile` avec coche `Check` sur les cartes
possédées.

- [ ] **Step 4 : Commit**

```bash
git add src/features/sets
git commit -m "feat(design): sets avec recherche et progression"
```

---

## Task 19 : Réglages

**Files:**
- Modify: `src/features/settings/SettingsPage.tsx`
- Modify: `src/i18n/fr.ts`

- [ ] **Step 1 : Aperçus de thème**

Remplacer le `ThemeToggle` de la section Apparence par deux cartes cliquables
« Sombre » / « Clair », avec un mini-aperçu (trois barres de couleur) et un
anneau `ring-accent` sur le thème actif. Le clic appelle `toggle()` si le
thème choisi diffère.

- [ ] **Step 2 : Sections**

`Surface` + icône en pastille, boutons `Button`, 3 `StatTile` pour les données.

- [ ] **Step 3 : Commit**

```bash
git add src/features/settings src/i18n/fr.ts
git commit -m "feat(design): réglages avec aperçus de thème"
```

---

## Task 20 : Transitions et finitions

**Files:**
- Modify: `src/components/PageTransition.tsx`
- Modify: `src/styles/index.css` (suppression de `--radius-standard` si plus utilisé)

- [ ] **Step 1 : Transitions**

```tsx
const pageTransition = { duration: 0.2, ease: "easeOut" as const };
// initial: { opacity: 0, y: 8 } ; animate: { opacity: 1, y: 0 }
// ZoomTransition : scale 0.97 → 1, durée 0.2
```

- [ ] **Step 2 : Nettoyage**

Run: `grep -rn "rounded-standard" src`
Remplacer les occurrences restantes par `rounded-card` / `rounded-control`,
puis supprimer `--radius-standard` de `index.css`.

- [ ] **Step 3 : Vérification finale**

Run: `npm run build`
Expected: succès.

- [ ] **Step 4 : Commit**

```bash
git add -A
git commit -m "feat(design): transitions douces et nettoyage final"
```

---

## Task 21 : Validation finale

- [ ] `npm run build` ;
- [ ] parcours complet à 390 px : accueil → recherche → fiche → ajout collection → collection → wishlist → sets → réglages ;
- [ ] les deux thèmes ;
- [ ] « réduire les animations » ;
- [ ] aucun débordement horizontal, aucune carte rognée ;
- [ ] aucune couleur en dur dans les composants :
  `grep -rnE "#[0-9a-fA-F]{3,6}|rgb\(|hsl\(" src --include="*.tsx"` → seuls
  `src/config/*` et `src/styles/index.css` doivent apparaître.
