# POPO — Spécification du projet

> Fichier de référence pour l'agent de code (OpenCode). À placer dans `docs/POPO_SPEC.md` à la racine du projet.
> Toute l'interface utilisateur est en **français**. Le code (noms de variables, fonctions) est en anglais, les commentaires en français.

---

## 1. Vision

**POPO** est une application web **PWA mobile first** (utilisable aussi sur PC) pour un **collectionneur de cartes Pokémon**.
Elle permet de chercher une carte, de voir ses détails et son prix, de comparer les prix entre plateformes, et de suivre sa propre collection.

- Usage **perso**, **100 % gratuit** (aucune API payante, aucun abonnement).
- **Pas de compte, pas de backend** : tout tourne dans le navigateur. La collection est sauvegardée **localement sur l'appareil**.
- Cartes en **français uniquement** pour la V1.
- Ambiance **sobre et premium** : les cartes sont les vedettes, l'interface reste en retrait.

---

## 2. Stack technique (imposée)

| Besoin | Choix |
|---|---|
| Framework | React + Vite + TypeScript (mode strict) |
| Style | Tailwind CSS, avec variables CSS pour les thèmes |
| Routage | React Router |
| PWA | vite-plugin-pwa (installable + hors ligne) |
| Données distantes | TanStack Query (cache et états de chargement) |
| Stockage local | IndexedDB via Dexie |
| Icônes | Lucide (`lucide-react`) |
| Animations | Motion (ex-Framer Motion) + CSS pour les effets de carte |
| Hébergement | Vercel (plan Hobby, usage perso non commercial) |

Ne pas ajouter d'autre grosse dépendance sans me demander.

---

## 3. Sources de données (APIs gratuites, sans clé)

### 3.1 TCGdex — cartes, sets, prix
- Base REST : `https://api.tcgdex.net/v2/fr/` (le `fr` = langue française).
- Documentation : https://tcgdex.dev/fr (SDK JavaScript officiel `@tcgdex/sdk` disponible, à utiliser ou non selon ce qui est le plus simple).
- Endpoints principaux : recherche de cartes (ex. `cards?name=Dracaufeu`), détail d'une carte (`cards/{id}`), liste des sets, détail d'un set.
- Les **prix sont inclus dans la réponse de chaque carte** (`pricing`) :
  - **Cardmarket** en **EUR** (mis à jour environ 1 fois par jour)
  - **TCGplayer** en **USD** (mis à jour environ toutes les heures)
- Les images de cartes viennent du CDN de TCGdex (voir la page « Assets » de la doc pour construire l'URL et choisir la qualité : miniature pour les listes, haute qualité pour la fiche).

### 3.2 PokéAPI — fiche du Pokémon
- Base : `https://pokeapi.co/api/v2/`
- Sert pour : stats, types, évolutions, description, sprite, **nom français** (via `pokemon-species`).
- Le lien carte → Pokémon se fait via le numéro de Pokédex fourni par la carte TCGdex (`dexId`).
- **Règle d'usage de PokéAPI : mettre les réponses en cache** (ce sont des données statiques, durée de cache longue).

### 3.3 Taux de change
- Pour comparer EUR et USD : utiliser une API de taux de change **gratuite sans clé** (par exemple Frankfurter), mise en cache 24 h, avec un taux de secours si elle échoue.
- Toujours **afficher la devise d'origine** de chaque prix, et indiquer l'équivalent converti en EUR.

### 3.4 IMPORTANT — vérifier avant de coder
**Avant d'écrire les types TypeScript, appeler réellement l'API** (via un petit script ou `curl`) sur 2-3 cartes (une commune, une rare/holo, une sans prix) et **regarder la vraie forme des réponses** : noms exacts des champs de prix, champs possiblement absents, valeurs de rareté en français. Ne pas deviner la structure. Gérer proprement les cas où un prix est absent (afficher « Prix indisponible »).

---

## 4. Fonctionnalités

### V1 (à faire)
1. **Recherche de cartes** par nom, avec suggestions pendant la frappe (attendre ~300 ms après la dernière touche avant d'envoyer la requête). Filtres : set, rareté, type.
2. **Fiche carte détaillée** : grande image, puis **prix Cardmarket vs TCGplayer** juste en dessous, puis détails (set, numéro, rareté, artiste, HP, attaques, faiblesses…).
3. **Fiche du Pokémon** (dans la fiche carte) : stats, types, évolutions, description.
4. **Comparaison de prix** Cardmarket (EUR) vs TCGplayer (USD, converti en EUR), avec mise en évidence de l'écart.
5. **Collection locale** : ajouter/retirer une carte, quantité, état (Neuf/NM, Excellent, Bon, Joué, Abîmé), **valeur totale estimée**.
6. **Wishlist** (cartes que je veux).
7. **Sets** : liste des extensions avec **progression** (ex. 85 / 165 cartes possédées).
8. **Dashboard** (accueil) : valeur de la collection, nombre de cartes, dernières cartes ajoutées, progression de quelques sets, accès rapide à la recherche.
9. **Export / Import** de la collection (fichier JSON versionné), pour sauvegarder ou changer d'appareil.
10. **Thème sombre (défaut) / clair** avec un bouton de bascule, choix mémorisé.
11. **PWA** installable ; la collection reste consultable hors ligne.

### Hors V1 (ne PAS faire maintenant, mais ne pas bloquer l'évolution)
- Anglais (prévoir un code propre où les textes ne sont pas écrits « en dur » partout : les regrouper dans un fichier central de textes)
- Historique de prix (graphique)
- Scan de carte par caméra
- Alertes de prix
- Comptes / synchronisation cloud

---

## 5. Écrans et navigation

**Barre d'onglets discrète en bas** (mobile) : Accueil · Recherche · Collection · Wishlist · Sets. Sur grand écran, elle peut devenir une barre latérale fine.
Les réglages (thème, export/import, installation PWA) sont accessibles via une icône sur l'Accueil.

- **Accueil** : dashboard (voir fonctionnalité 8).
- **Recherche** : champ de recherche en haut, filtres, grille de résultats.
- **Fiche carte** : image en grand → prix → boutons « Ajouter à ma collection » / « Wishlist » → détails carte → fiche Pokémon.
- **Collection** et **Wishlist** : grille de cartes, tri (date d'ajout, nom, valeur), valeur totale.
- **Sets** : liste des sets, et page d'un set avec cartes possédées/manquantes.

États à prévoir partout : chargement (squelettes), liste vide (message utile), erreur réseau (message clair + bouton réessayer), prix indisponible.

---

## 6. Design

### Principes
Sobre, premium, très lisible. Peu de couleurs. Beaucoup d'espace. Les images de cartes sont toujours respectées (jamais déformées ni rognées). Interface en français. Icônes Lucide. Rayon standard des coins : **8 px**.

### Thème sombre (par défaut) — ma direction artistique existante
- Fond de l'app : `hsl(222, 25%, 7%)` (bleu nuit très sombre)
- Accent : cyan `hsl(198, 60%, 35%)`
- Bordures : `hsl(220, 15%, 22%)`
- Surfaces (cartes UI, panneaux) : un cran plus clair que le fond, à dériver de la même teinte.
- Texte : blanc cassé pour le principal, gris bleuté pour le secondaire.

> Si le fichier `DESIGN.md` du dépôt GitHub `setlab-saas` est copié dans `docs/DESIGN.md`, **le lire et le suivre en priorité** pour les recettes de composants et les règles visuelles. En cas de conflit avec ce document, DESIGN.md gagne pour le visuel.

### Thème clair (à dériver, ajustable)
Garder la même identité : fond très clair légèrement bleuté (ex. `hsl(220, 20%, 97%)`), surfaces blanches, bordures claires (ex. `hsl(220, 15%, 86%)`), texte bleu nuit très foncé, accent cyan un peu plus profond pour rester lisible (ex. `hsl(198, 65%, 30%)`).

### Mise en œuvre
Définir toutes les couleurs comme **variables CSS** (jetons de design) pour les deux thèmes, branchées sur Tailwind. **Aucune couleur écrite en dur dans les composants.** Bascule via un attribut sur `<html>`.
Vérifier le **contraste** (texte lisible) dans les deux thèmes.

---

## 7. Animations (niveau « équilibré » : fluide et agréable, jamais envahissant)

1. **Effet holographique sur les cartes rares** (c'est la signature de l'appli) :
   - La carte s'incline en 3D en suivant le doigt/la souris, et un **reflet irisé** se déplace dessus.
   - Sur mobile, utiliser l'inclinaison du téléphone si disponible (attention : sur iOS une **permission** est demandée), sinon repli sur le toucher/glissement.
   - Réservé aux cartes de rareté « holo / rare / ultra rare… » : la liste des raretés concernées doit être **dans un fichier de configuration facile à modifier** (se baser sur les vraies valeurs de rareté vues dans l'API).
   - Cartes communes : inclinaison légère possible, sans reflet.
2. **Zoom fluide** de la carte depuis la grille vers la fiche.
3. **Transitions douces** entre pages et onglets.
4. **Compteurs animés** sur le dashboard (la valeur monte jusqu'à son total).
5. **Squelettes de chargement** plutôt que des spinners.
6. **Petit retour visuel** à l'ajout d'une carte (léger « pop » ou coche).

Contraintes : animer uniquement `transform` et `opacity` (fluidité sur téléphone), pas d'effets lourds (pas de particules/confettis), **respecter le réglage « réduire les animations »** du système (désactiver les effets, garder l'essentiel).

---

## 8. Données locales (Dexie / IndexedDB)

Tables prévues (à affiner) :
- `collection` : id de carte TCGdex, quantité, état, date d'ajout, et un **instantané** minimal de la carte (nom, set, image, rareté, dernier prix connu) pour pouvoir l'afficher **hors ligne**.
- `wishlist` : id de carte, date d'ajout, même instantané minimal.
- `settings` : thème, préférences.

Prévoir un **numéro de version du schéma** et une migration propre. L'export JSON contient ce numéro de version ; l'import valide le fichier avant d'écraser quoi que ce soit (et demande confirmation).

---

## 9. Qualité et contraintes

- **Mobile first** : concevoir d'abord pour ~390 px de large, puis adapter aux grands écrans. Zones tactiles ≥ 44 px.
- **Performance** : images en chargement différé (lazy), miniatures dans les listes, listes longues virtualisées si besoin.
- **Cache** : TanStack Query avec durées adaptées (infos carte et PokéAPI : longue ; prix : ~1 h).
- **Respect des API** : pas de requête à chaque frappe, pas de rafale de requêtes ; ne charger les détails qu'au clic.
- **Accessibilité de base** : textes alternatifs, focus visible, navigation clavier, contraste.
- **TypeScript strict**, pas de `any` sauf justification en commentaire.
- **Aucun secret** dans le code (de toute façon aucune clé n'est nécessaire).
- Structure de dossiers claire (ex. `src/api`, `src/components`, `src/features/{search,card,collection,wishlist,sets,dashboard}`, `src/db`, `src/styles`, `src/i18n`).

---

## 10. Règles de travail pour l'agent

1. Je suis **débutant** : explique en français, simplement, ce que tu fais et pourquoi, à la fin de chaque étape.
2. Travaille **par phases** (voir ci-dessous), une à la fois. **Ne passe pas à la phase suivante sans que j'aie validé.**
3. À la fin de chaque phase : indique comment **lancer et tester** l'application, et ce que je dois vérifier.
4. Si une information manque ou si un choix est ambigu, **pose-moi la question** au lieu de deviner.
5. Fais des **commits Git** clairs à la fin de chaque phase.
6. Ne modifie pas ce document sans me le demander.

---

# PLAN DE RÉALISATION — prompts à donner à OpenCode, phase par phase

> Avant la phase 0 : créer le dossier du projet, y placer ce fichier dans `docs/POPO_SPEC.md` (et idéalement `docs/DESIGN.md`), puis lancer OpenCode dans ce dossier.

### Fichier `AGENTS.md` (à créer à la racine, court)

```
# POPO
Application PWA mobile first de collection de cartes Pokémon, en français.
La spécification complète est dans docs/POPO_SPEC.md : la lire au début de chaque session et la respecter.
Si docs/DESIGN.md existe, il fait foi pour le design visuel.
Je suis débutant : explique simplement, en français, et travaille phase par phase en attendant ma validation.
```

### Phase 0 — Fondations
```
Lis docs/POPO_SPEC.md en entier. Nous commençons par la PHASE 0 uniquement.

Objectif : mettre en place le squelette du projet POPO.
- Initialise un projet React + Vite + TypeScript (strict), avec Tailwind CSS, React Router, vite-plugin-pwa, Dexie, TanStack Query, lucide-react et Motion.
- Crée la structure de dossiers de la section 9.
- Mets en place les thèmes sombre (défaut) et clair avec des variables CSS (section 6), et un bouton de bascule dont le choix est mémorisé.
- Crée la barre d'onglets du bas (Accueil, Recherche, Collection, Wishlist, Sets) avec 5 écrans vides mais stylés, et la navigation entre eux.
- Prépare le fichier central des textes en français (src/i18n).
- Configure la PWA de base (manifeste, nom « POPO », icônes provisoires).
- Initialise Git et fais un premier commit.

Ne fais aucune requête API pour l'instant. À la fin, explique-moi comment lancer l'appli et ce que je dois voir à l'écran, puis attends ma validation.
```

### Phase 1 — Couche de données
```
PHASE 1 de docs/POPO_SPEC.md : la couche de données.

D'abord, AVANT d'écrire le moindre type, appelle réellement l'API TCGdex (en français) sur 3 cartes : une commune, une holo/rare, et une sans prix. Montre-moi les champs réels (prix, rareté, images, dexId). Fais pareil avec PokéAPI pour un Pokémon (nom français, stats, évolutions).

Ensuite crée dans src/api : un client TCGdex, un client PokéAPI, un service de taux de change EUR/USD (gratuit, sans clé, en cache 24 h), les types TypeScript basés sur les VRAIES réponses, et les hooks TanStack Query avec les durées de cache de la section 9. Gère les prix absents sans planter.

Ajoute une page de test temporaire (cachée) qui affiche le résultat d'une recherche pour vérifier que tout fonctionne. Explique-moi les résultats et attends ma validation.
```

### Phase 2 — Recherche et fiche carte
```
PHASE 2 de docs/POPO_SPEC.md : recherche et fiche carte.

Construis l'écran Recherche (champ avec attente de 300 ms, filtres set/rareté/type, grille de résultats avec miniatures, squelettes de chargement, états vide/erreur) et la fiche carte complète (image en grand, puis prix Cardmarket vs TCGplayer converti en EUR avec l'écart mis en évidence, puis détails de la carte, puis fiche du Pokémon via PokéAPI). Les boutons « Ajouter à ma collection » et « Wishlist » sont présents mais pas encore branchés.

Respecte le design de la section 6 dans les deux thèmes. Pas encore d'animations avancées. Explique-moi et attends ma validation.
```

### Phase 3 — Collection, wishlist, export/import
```
PHASE 3 de docs/POPO_SPEC.md : collection et wishlist locales.

Mets en place la base Dexie (section 8, avec version de schéma). Branche les boutons de la fiche carte. Construis les écrans Collection et Wishlist (grille, tri, valeur totale estimée, quantité et état modifiables) et fais fonctionner l'affichage hors ligne grâce à l'instantané stocké. Ajoute l'export JSON et l'import avec validation et confirmation (dans les réglages).

Explique-moi comment tester (y compris hors ligne) et attends ma validation.
```

### Phase 4 — Dashboard et Sets
```
PHASE 4 de docs/POPO_SPEC.md : dashboard et sets.

Construis la liste des sets avec la progression (cartes possédées / total) et la page d'un set (cartes possédées et manquantes). Construis le dashboard d'accueil : valeur de la collection, nombre de cartes, dernières cartes ajoutées, progression de quelques sets, accès rapide à la recherche. Pense aux états vides (collection vide) avec un message d'accueil utile.

Explique-moi et attends ma validation.
```

### Phase 5 — Animations et effet holographique
```
PHASE 5 de docs/POPO_SPEC.md : animations (section 7).

Implémente l'effet holographique sur les cartes rares (inclinaison 3D + reflet irisé, inclinaison du téléphone avec demande de permission sur iOS et repli au toucher), avec la liste des raretés concernées dans un fichier de configuration, basée sur les vraies raretés de l'API. Ajoute le zoom fluide grille → fiche, les transitions de pages, les compteurs animés du dashboard, et le petit retour à l'ajout d'une carte. Respecte « réduire les animations » et n'anime que transform et opacity.

Niveau d'animation : équilibré. Vérifie la fluidité en mode mobile. Explique-moi et attends ma validation.
```

### Phase 6 — Finitions PWA et déploiement
```
PHASE 6 de docs/POPO_SPEC.md : finitions et déploiement.

Vérifie l'installation PWA (icônes finales, écran de démarrage, couleurs de la barre du téléphone), le mode hors ligne, l'accessibilité de base et les performances (rapport Lighthouse mobile). Corrige ce qui est faible. Prépare le déploiement sur Vercel et explique-moi, étape par étape et très simplement, comment publier l'appli et l'installer sur mon téléphone.
```