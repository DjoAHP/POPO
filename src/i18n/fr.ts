/**
 * Fichier central des textes en français (section 4 : « hors V1, prévoir
 * l'anglais »). Tous les libellés de l'interface vivent ici : quand on
 * ajoutera l'anglais, il suffira de créer un fichier `en.ts` avec la même
 * forme et de choisir selon la langue.
 */
export const fr = {
  app: {
    name: "POPO",
    tagline: "Ta collection Pokémon, en poche.",
  },
  nav: {
    home: "Accueil",
    search: "Recherche",
    collection: "Collection",
    wishlist: "Wishlist",
    sets: "Sets",
    mainLabel: "Navigation principale",
  },
  theme: {
    toLight: "Passer en thème clair",
    toDark: "Passer en thème sombre",
  },
  home: {
    title: "Accueil",
    dashboardLaterTitle: "Tableau de bord à venir",
    dashboardLaterText:
      "La valeur de ta collection, le nombre de cartes et la progression des sets arriveront à la phase 4.",
    ctaSearch: "Rechercher une carte",
  },
  search: {
    title: "Recherche",
    description: "Cherche une carte par son nom, filtre par set, rareté ou type.",
    placeholder: "Nom de la carte (ex. Dracaufeu)",
    hint: "Tape au moins 2 caractères pour lancer la recherche.",
    filtersLabel: "Filtres",
    filterSet: "Set",
    filterRarity: "Rareté",
    filterType: "Type",
    filterAll: "Tous",
    clearFilters: "Réinitialiser",
    resultsCount: (n: number) => `${n} résultat${n > 1 ? "s" : ""}`,
    emptyTitle: "Aucune carte trouvée",
    emptyText: "Essaie un autre nom, ou allège tes filtres.",
    errorTitle: "Impossible de charger",
    errorText: "Vérifie ta connexion internet, puis réessaie.",
    retry: "Réessayer",
    loading: "Chargement…",
  },
  card: {
    backToSearch: "Recherche",
    notFoundTitle: "Carte introuvable",
    notFoundText: "Cette carte n'existe pas (ou plus) dans la base TCGdex.",
    addToCollection: "Ajouter à ma collection",
    addToWishlist: "Wishlist",
    actionSoon: "Disponible à la phase 3",
    priceCardmarket: "Cardmarket",
    priceTcgplayer: "TCGplayer",
    priceUnavailable: "Prix indisponible",
    priceTrend: "prix tendance",
    priceConverted: (usd: string) => `${usd} USD convertis`,
    priceGap: "Écart Cardmarket ↔ TCGplayer",
    detailsTitle: "Détails",
    detailSet: "Set",
    detailNumber: "Numéro",
    detailRarity: "Rareté",
    detailArtist: "Illustrateur",
    detailHp: "PV",
    detailStage: "Stade",
    detailEvolvesFrom: "Évolue de",
    detailWeakness: "Faiblesses",
    detailResistance: "Résistances",
    detailRetreat: "Retraite",
    detailLegal: "Jouable",
    legalStandard: "Standard",
    legalExpanded: "Étendue",
    attacksTitle: "Attaques",
    abilitiesTitle: "Talents",
    noDetails: "Aucun détail disponible pour cette carte.",
  },
  pokemon: {
    sectionTitle: "Fiche Pokémon",
    evolutions: "Évolutions",
    level: (n: number) => `Nv. ${n}`,
    legendary: "Légendaire",
    mythical: "Mythique",
    unavailable: "PokéAPI indisponible",
  },
  collection: {
    title: "Collection",
    description: "Toutes les cartes que tu possèdes, sauvegardées sur ton appareil.",
    emptyTitle: "Ta collection est vide",
    emptyText: "Ajoute des cartes depuis la recherche pour commencer.",
    ctaSearch: "Aller à la recherche",
  },
  wishlist: {
    title: "Wishlist",
    description: "Les cartes que tu veux ajouter à ta collection un jour.",
    emptyTitle: "Ta wishlist est vide",
    emptyText: "Marque les cartes qui te font envie depuis leur fiche.",
    ctaSearch: "Aller à la recherche",
  },
  sets: {
    title: "Sets",
    description: "Les extensions Pokémon et ta progression dans chacune.",
    emptyTitle: "Aucun set",
    emptyText: "La liste des extensions arrivera à la phase 4.",
  },
} as const;

/** Type dérivé : garantit qu'une future traduction aura exactement la même forme. */
export type Texts = typeof fr;
