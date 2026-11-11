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
    emptyTitle: "Aucune recherche",
    emptyText: "Tape le nom d'une carte pour la retrouver.",
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
