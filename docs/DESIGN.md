# POPO — Direction artistique et design system

> **Statut** : validé le 2026-11-19.
> **Portée** : ce document fait foi pour le design visuel, conformément à
> `docs/POPO_SPEC.md` §6 (« si `docs/DESIGN.md` existe, il fait foi en priorité »).
> En cas de conflit avec `POPO_SPEC.md` sur les couleurs, les rayons, la
> typographie ou les animations, **ce document gagne**.
> Les règles fonctionnelles, les données, la stack et les contraintes
> techniques de `POPO_SPEC.md` restent inchangées.

---

## 0. Objectif

Remplacer l'esthétique actuelle (« panneaux gris, un seul cyan sombre, peu de
profondeur ») par une **galerie premium colorée** :

- une identité forte et cohérente sur toutes les pages (header POPO) ;
- de la lumière et de la profondeur, sans surcharger ;
- des cartes Pokémon mises en scène (vrai effet holographique) ;
- une expérience **mobile first** : le téléphone est la référence, le desktop
  est une adaptation confortable.

**Ce qui ne change pas** : les fonctionnalités, les données, la navigation
(logique), le stockage local, les performances, l'accessibilité de base et le
respect de « réduire les animations ».

### Mobile first — règle directrice

Toute décision visuelle se prend d'abord à **390 px de large**, puis s'étend :

| Élément | Mobile (référence) | Desktop (adaptation) |
|---|---|---|
| Navigation | barre flottante en bas | liens dans le header |
| Filtres | panneau depuis le bas | sélecteurs alignés |
| Grilles de cartes | 2 colonnes | 3 → 6 colonnes |
| Actions secondaires | panneaux (bottom sheets) | panneaux centrés |
| Zones tactiles | ≥ 44 px | idem |

---

## 1. Jetons de design (design tokens)

**Toutes les couleurs vivent dans `src/styles/index.css`.** Aucun composant ne
doit contenir de couleur en dur (`#...`, `rgb(...)`, `hsl(...)`), sauf les
dégradés de l'effet holographique définis dans `src/config/holographic.ts`.

### 1.1 Palette — thème sombre (défaut)

Direction validée par le client : **noir et rouge dominants, cyan et or pour
le reste.**

| Jeton | Valeur | Usage |
|---|---|---|
| `--bg` | `hsl(0 0% 5%)` | fond de l'app (noir) |
| `--surface` | `hsl(0 8% 9%)` | cartes UI, panneaux |
| `--surface-2` | `hsl(0 6% 14%)` | surfaces élevées, survol |
| `--glass` | `hsl(0 0% 100% / 0.05)` | surfaces en verre |
| `--line` | `hsl(0 5% 22%)` | bordures |
| `--ink` | `hsl(0 0% 97%)` | texte principal |
| `--ink-muted` | `hsl(0 4% 68%)` | texte secondaire |
| `--accent` | `hsl(357 80% 51%)` | marque 1 (rouge dominant) |
| `--accent-ink` | `hsl(0 0% 100%)` | texte sur accent |
| `--brand-2` | `hsl(348 80% 36%)` | marque 2 (cramoisi profond, fin de dégradé) |
| `--cyan` | `hsl(188 92% 56%)` | accents secondaires, eyebrows, liens, focus |
| `--gold` | `hsl(42 95% 60%)` | prix, valeur de collection |
| `--success` | `hsl(158 70% 48%)` | positif, écart favorable |
| `--danger` | `hsl(345 80% 62%)` | négatif, suppression |
| `--ring` | `hsl(188 92% 60%)` | focus visible (cyan) |
| `--glow-1` | `hsl(357 85% 52%)` | halo de fond rouge |
| `--glow-2` | `hsl(188 92% 55%)` | halo de fond cyan |

### 1.2 Palette — thème clair

| Jeton | Valeur |
|---|---|
| `--bg` | `hsl(0 25% 98%)` |
| `--surface` | `hsl(0 0% 100%)` |
| `--surface-2` | `hsl(0 15% 95%)` |
| `--glass` | `hsl(0 20% 20% / 0.04)` |
| `--line` | `hsl(0 12% 88%)` |
| `--ink` | `hsl(0 5% 10%)` |
| `--ink-muted` | `hsl(0 5% 40%)` |
| `--accent` | `hsl(357 72% 44%)` |
| `--accent-ink` | `hsl(0 0% 100%)` |
| `--brand-2` | `hsl(348 70% 32%)` |
| `--cyan` | `hsl(192 85% 32%)` |
| `--gold` | `hsl(38 85% 42%)` |
| `--success` | `hsl(158 65% 32%)` |
| `--danger` | `hsl(345 75% 45%)` |
| `--ring` | `hsl(192 85% 42%)` |

**Contraste** : AA minimum dans les deux thèmes. Le rouge `--accent` est une
couleur de **remplissage** (boutons, pilules actives) qui porte du texte blanc.
Pour du texte coloré sur fond sombre, utiliser `--cyan` ou `--gold`, jamais
`--accent` en petit corps.

### 1.3 Remplacer la palette plus tard

Quand le client fournit sa palette, on ne modifie **que** :

1. les variables ci-dessus dans `src/styles/index.css` ;
2. les couleurs métier dans `src/config/brand.ts` (types Pokémon, raretés) ;
3. éventuellement les couleurs de rareté dans `src/config/holographic.ts`.

Aucun composant n'est à retoucher.

### 1.4 Typographie

- Titres : **Outfit** variable, auto-hébergée (`@fontsource-variable/outfit`).
- Texte : **Inter** variable, auto-hébergée (`@fontsource-variable/inter`).
- Repli : `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- Prix et valeurs : `font-variant-numeric: tabular-nums`.
- Échelle : titre de page 28 px (mobile) / 32 px (desktop), titres de section
  18–20 px, corps 14–16 px, micro-étiquettes 11 px en majuscules avec
  `letter-spacing: 0.12em`.

Les polices sont importées dans `src/main.tsx` (avant le CSS global) pour
fonctionner hors ligne et éviter tout appel à Google Fonts.

### 1.5 Formes, ombres, lumière

| Jeton | Valeur | Usage |
|---|---|---|
| `--radius-card` | `16px` | cartes, panneaux, feuilles |
| `--radius-control` | `12px` | boutons, champs, sélecteurs |
| `--radius-pill` | `9999px` | badges, pastilles, onglets |
| `--shadow-soft` | `0 12px 32px -12px hsl(230 60% 2% / 0.55)` | élévation douce |
| `--shadow-float` | `0 20px 48px -20px hsl(230 60% 2% / 0.7)` | header, barre flottante |
| `--glow-brand` | `0 0 32px -6px hsl(357 80% 51% / 0.5)` | boutons et états actifs |

- Ombres **colorées et diffuses**, jamais de gros bloc noir.
- Les éléments interactifs importants peuvent porter un `box-shadow` teinté
  (rouge, cyan ou or), jamais plus d'une teinte à la fois sur le même élément.
- Rayons : `rounded-card`, `rounded-control`, `rounded-pill` (Tailwind v4 les
  génère depuis `--radius-*`).
- Tous les composants utilisent `rounded-card`, `rounded-control` et
  `rounded-pill` ; il n'existe plus de rayon de transition.

### 1.6 Fond de l'application

Composant `BrandBackground` (dans `AppShell`, `fixed inset-0 -z-10`,
`pointer-events-none`) :

- deux halos radiaux très diffus : rouge en haut à gauche, cyan en bas à
  droite, opacité 8–12 % ;
- une trame de points quasi invisible (CSS pur, pas d'image) ;
- aucune animation (coût GPU nul pendant le défilement).

---

## 2. Header global et navigation

### 2.1 Header (`src/components/Header.tsx`)

Présent sur **toutes** les pages, `sticky top-0 z-40`.

```
DESKTOP
[⬤ POPO]   Accueil  Recherche  Collection  Wishlist  Sets      ☾  ⚙

MOBILE
[⬤ POPO]                                                ☾  ⚙
```

- **Identité** : logo dans une pastille 40×40, dégradé rouge → cramoisi, logo
  en blanc. À côté, « POPO » en Outfit 700, `letter-spacing: 0.04em`. Sous-titre
  « Collection Pokémon » visible à partir de `sm`. Le bloc entier est un lien
  vers `/`.
- **Navigation desktop** (`lg+`) : les 5 liens en pilules. Actif = fond en
  verre teinté (`--glass` + dégradé rouge/cramoisi à 12 %), texte clair,
  soulignement dégradé 2 px. Survol = texte clair + fond très léger.
- **Actions** : bouton thème et bouton réglages, rondelles de verre 44×44,
  visibles sur **toutes** les tailles.
- **Fond** : `bg-surface/70`, `backdrop-blur-xl`, bordure basse `line/60`, et
  un **fil dégradé rouge → cramoisi de 1 px** en bas (signature POPO).
- La barre latérale fine desktop est **supprimée**.

### 2.2 Barre d'onglets mobile (`src/components/BottomNav.tsx`)

Remplace `TabBar`. Barre **flottante** :

- `fixed`, 8 px des bords, `bottom: calc(0.75rem + env(safe-area-inset-bottom))`,
  coins `--radius-card`, verre dépoli, `--shadow-float` ;
- 5 onglets, hauteur ≥ 56 px ;
- onglet actif : icône dans une pastille dégradée rouge → cramoisi, libellé clair ;
- inactif : gris bleuté ;
- masquée à partir de `lg` (la nav est dans le header).

Le contenu réserve la place : `padding-bottom` suffisant (`pb-32` mobile).

### 2.3 Titres de page (`PageHeader` v2)

Composant unique, identique partout :

- micro-étiquette en majuscules (`eyebrow`), cyan, 11 px, `tracking` large ;
- titre en Outfit 28–32 px ;
- description en `ink-muted`, une ligne ;
- emplacement d'action optionnel à droite.

Les pages de détail utilisent `BackLink` (même style partout : icône + libellé,
44 px de zone tactile).

### 2.4 Accessibilité

- Lien « Aller au contenu » visible au clavier uniquement.
- `aria-current="page"` sur l'onglet actif, `aria-label` sur les boutons icônes.
- Focus visible : anneau `--ring` de 2 px, décalé de 2 px.
- Zones tactiles ≥ 44 px.

---

## 3. Composants communs

Créés dans `src/components` et réutilisés partout :

| Composant | Rôle |
|---|---|
| `Header` | header global |
| `BottomNav` | barre d'onglets flottante |
| `BrandBackground` | halos + trame de fond |
| `PageHeader` | eyebrow + titre + description + action |
| `BackLink` | retour cohérent |
| `Surface` | panneau verre/solide, avec variantes |
| `Button` | variantes `primary` (dégradé), `secondary` (verre), `ghost`, tailles |
| `Badge` | pastille (rareté, type, quantité, état) |
| `StatTile` | tuile statistique (icône + libellé + valeur) |
| `SegmentedControl` | tri et onglets en pilules |
| `CardTile` | carte de grille : image, nom, méta, reflet CSS |
| `Sheet` | évolution de `BottomSheet` (poignée, en-tête dégradé) |

Règles : un composant = une responsabilité ; pas de logique métier dans les
composants visuels ; props typées ; pas de `any`.

---

## 4. Pages

### 4.1 Accueil — la vitrine

1. **Hero** : panneau `Surface` avec dégradé rouge/cramoisi très léger et halo.
   Logo, tagline, puis **valeur de collection en très grand** (or, chiffres
   tabulaires) et nombre de cartes.
2. **Recherche rapide** dans le hero : champ + bouton ; validation →
   `/recherche?q=...`.
3. **Deux tuiles de stats** (valeur / cartes) avec icône en pastille colorée.
4. **Dernières ajoutées** : rangée horizontale de cartes plus grandes, badge
   de quantité.
5. **Progression des sets** : barres dégradées, pourcentage cyan.
6. **État vide** : hero avec logo en grand, halo, bouton « Rechercher une
   carte » et 3 mini-explications (chercher, comparer, collectionner).

### 4.2 Recherche — la galerie

- Grand champ de recherche 56 px, `rounded-pill`, verre, halo dégradé au focus.
- **Filtres** : desktop = 3 sélecteurs alignés ; mobile = bouton « Filtres »
  avec compteur → `Sheet` contenant les 3 sélecteurs.
- Compteur de résultats + puce « Réinitialiser » si un filtre est actif.
- **Grille** : 2 colonnes mobile, 3 `sm`, 4 `md`, 5 `lg`, 6 `xl`.
- Squelettes avec dégradé animé ; états vide/erreur avec logo en filigrane.

### 4.3 Fiche carte — la mise en scène

- Desktop : carte à gauche (320 px) sur un **socle lumineux** teinté par la
  rareté ; colonne de droite (titre, badges, prix, actions).
- Mobile : carte centrée avec halo, puis titre, prix, actions.
- **Prix** : deux cartes en verre, montant en gros, devise d'origine, écart
  avec flèche et couleur (`success` / `danger`).
- **Actions** : bouton principal en dégradé rouge → cramoisi, secondaire en verre.
- **Détails** : panneau en verre, lignes aérées.
- **Attaques** : coûts d'énergie en pastilles colorées par type.
- **Pokémon** : badges de types colorés, stats en barres, évolutions en
  chaîne de pilules.
- Bouton discret « Incliner avec le téléphone » (gyroscope, opt-in).

### 4.4 Collection / Wishlist — le coffre

- **Bandeau résumé** avec liseré dégradé : valeur totale en or, nombre de
  cartes, note « X sans prix ».
- **Tri en pilules** (`SegmentedControl`) : Ajout récent / Nom / Valeur.
- Grille identique à la Recherche ; badges quantité (dégradé), état, prix.
- `Sheet` d'édition repolissée : poignée, en-tête dégradé, contrôles ≥ 44 px.
- Wishlist : même structure, accent cyan.

### 4.5 Sets — la progression

- Champ de recherche de set en haut (liste longue).
- Chaque set = carte avec vignette du logo, nom, nombre de cartes, barre de
  progression et pourcentage.
- Détail : hero (logo + progression), onglets en pilules (Toutes / Possédées /
  Manquantes), coche sur les cartes possédées.

### 4.6 Réglages

- Sections en cartes avec icône en pastille.
- **Thème** : deux aperçus cliquables (Sombre / Clair) au lieu d'un simple
  bouton.
- Export / Import : bouton dégradé + bouton verre.
- Résumé des données en 3 tuiles.

### 4.7 Transitions

- Pages : fondu + montée de 8 px, 200 ms, `ease-out`.
- Onglets : 150 ms.
- Fiche carte : léger agrandissement (échelle 0,97 → 1) + fondu, sans à-coup.
- Uniquement `transform` et `opacity` ; désactivées avec
  `prefers-reduced-motion`.

---

## 5. Effet holographique et correction du rognage

### 5.1 Cause du bug actuel

`src/components/HolographicCard.tsx` applique `overflow-hidden` sur le
conteneur qui porte l'inclinaison 3D. Dès que la carte tourne, ses coins
sortent de la boîte et sont **coupés**. Ce n'est pas la taille du conteneur
qui est en cause, mais le masquage.

### 5.2 Correction

- Le conteneur qui porte l'inclinaison ne masque rien (`overflow: visible`).
- L'arrondi et le masquage de l'image se font **uniquement sur l'image**.
- La grille utilise un `gap` de 12–16 px et une petite marge interne par
  tuile, pour que le soulèvement au survol ne soit pas rogné.
- Au survol, la carte passe au-dessus des voisines (`z-index`) avec une
  transition douce.
- `perspective` portée par le conteneur (et non dans le `transform` de la
  carte) pour un rendu 3D plus juste.

Structure cible :

```
<div class="holo-stage">            // perspective, overflow visible
  <div class="holo-card">           // rotation, transform-style: preserve-3d
    <div class="holo-clip">         // overflow hidden + arrondi (image seule)
      <img />
    </div>
    <div class="holo-foil" />       // iridescence
    <div class="holo-glare" />      // reflet qui suit le pointeur
    <div class="holo-grain" />      // micro-lignes métalliques
    <div class="holo-edge" />       // liseré intérieur dégradé
  </div>
</div>
```

### 5.3 Couches de l'effet

1. **Image** de la carte.
2. **Feuille iridescente** : dégradé multicolore (cyan → or → rouge → blanc)
   en `mix-blend-mode`, orientation et intensité pilotées par la position du
   pointeur/du doigt (`--holo-x`, `--holo-y`).
3. **Reflet** : tache blanche douce qui suit le pointeur.
4. **Grain métallique** : fines lignes diagonales, opacité très faible.
5. **Liseré** : bordure intérieure dégradée + **halo extérieur** teinté par la
   rareté.

### 5.4 Palettes par rareté (`src/config/holographic.ts`)

```ts
export interface HoloTheme {
  id: "standard" | "holo" | "ultra" | "shiny";
  foil: [string, string, string]; // couleurs du foil
  glow: string;                   // halo extérieur
  intensity: number;              // 0 → 1
}
```

- `standard` : aucune iridescence (inclinaison très légère possible).
- `holo` : cyan / or / blanc glacé.
- `ultra` : or / rouge / cyan.
- `shiny` : argent / cyan / or.
- Le mapping rareté → thème reste dans ce fichier, seul endroit à modifier.

### 5.5 Comportement mobile

- **Toucher/glisser sur la carte** = inclinaison + reflet qui suit le doigt.
- **Gyroscope opt-in** : plus de demande de permission au premier clic
  n'importe où. Un bouton discret « Incliner avec le téléphone » sur la fiche
  demande la permission iOS uniquement si l'utilisateur le souhaite ; sinon
  repli tactile automatique.
- Mise à jour lissée : une seule mise à jour par image (`requestAnimationFrame`).
- `prefers-reduced-motion` : aucune inclinaison ni reflet animé, liseré
  statique conservé.

### 5.6 En grille (léger, sans JavaScript)

- Uniquement `@media (hover: hover) and (pointer: fine)`.
- Cartes rares : reflet irisé CSS qui balaie la carte au survol + soulèvement
  léger.
- Aucun écouteur d'événement, aucun calcul : zéro impact sur le défilement
  mobile.
- Cartes communes : sobres.

### 5.7 Performance

- Animer uniquement `transform` et `opacity`.
- `will-change` activé pendant l'interaction seulement, retiré ensuite.
- Une seule carte animée en détail à la fois.
- Aucune animation de fond permanente.

---

## 6. Contenus et i18n

Tous les nouveaux libellés passent par `src/i18n/fr.ts` (aucun texte en dur
dans les composants) :

- `nav.settings`, `nav.theme`, `nav.skipToContent` ;
- `home.hero*` (salutation, valeur, recherche rapide, explications) ;
- `search.filtersButton`, `search.filtersCount`, `search.results` ;
- `card.tiltEnable`, `card.tiltDisable`, `card.tiltUnsupported` ;
- `collection.sort*` (déjà présent), `collection.badge*` ;
- `sets.searchPlaceholder`, `sets.progressLabel`.

---

## 7. Fichiers touchés

**Fondations**
- `src/styles/index.css` (jetons, thème Tailwind, base)
- `src/main.tsx` (import des polices)
- `index.html` + `src/lib/theme.ts` (couleur de barre système alignée sur le
  nouveau fond : `#0c0e18` en sombre, `#f5f6f9` en clair)
- `src/config/brand.ts` (nouveau : types Pokémon, raretés)
- `src/components/AppShell.tsx`, `Header.tsx`, `BottomNav.tsx`,
  `BrandBackground.tsx`, `PageHeader.tsx`, `BackLink.tsx`
- `src/components/ui/` : `Surface.tsx`, `Button.tsx`, `Badge.tsx`,
  `StatTile.tsx`, `SegmentedControl.tsx`, `Sheet.tsx`
- `src/components/CardTile.tsx`, `CardGrid.tsx`, `CardImage.tsx`

**Pages**
- `src/features/dashboard/HomePage.tsx`
- `src/features/search/SearchPage.tsx`
- `src/features/card/*`
- `src/features/collection/*`, `src/features/wishlist/*`
- `src/features/sets/*`
- `src/features/settings/SettingsPage.tsx`
- `src/components/PageTransition.tsx`

**Holographie**
- `src/components/HolographicCard.tsx` (réécriture)
- `src/config/holographic.ts` (thèmes par rareté)
- `src/components/CardImage.tsx` (branchement propre)

---

## 8. Critères de validation

Pour chaque lot :

1. `npm run build` passe (TypeScript strict + Vite).
2. Vérification manuelle à **390 px** (référence) puis en desktop.
3. Aucune couleur en dur dans les composants.
4. Les deux thèmes restent lisibles (contraste AA).
5. Aucun débordement horizontal ; la barre mobile ne masque pas de contenu.
6. « Réduire les animations » respecté.
7. Les cartes ne sont jamais rognées, y compris inclinées.

---

## 9. Découpage en lots

### Lot 1 — Fondations, header, Accueil, Recherche
Jetons + polices + fond + composants communs + header + barre flottante +
refonte Accueil et Recherche. **Validation utilisateur.**

### Lot 2 — Fiche carte, holographie, rognage
Réécriture de l'effet holo, palettes par rareté, reflet en grille, refonte de
la fiche carte, correction du rognage, gyroscope opt-in. **Validation
utilisateur.**

### Lot 3 — Collection, Wishlist, Sets, Réglages, finitions
Bandeaux, tris en pilules, feuilles, recherche de sets, onglets, aperçus de
thème, transitions, vérifications finales. **Validation utilisateur.**

---

## 10. Hors périmètre

- Aucune nouvelle fonctionnalité métier.
- Aucun changement d'API, de base Dexie ou de logique de données.
- Aucune nouvelle grosse dépendance (seules les deux polices auto-hébergées
  sont ajoutées).
- Pas de scan caméra, pas d'alertes, pas de compte.
