/**
 * Types TCGdex et PokéAPI, écrits à partir des VRAIES réponses de l'API
 * (vérifiées le 2026-11-11, conformément à la section 3.4 de la spec).
 *
 * Rappels imports observés dans les réponses réelles :
 * - la recherche renvoie une liste minimale {id, localId, name, image?} ;
 *   `image` est ABSENT quand la carte n'a pas de visuel ;
 * - `pricing` peut exister mais `tcgplayer` peut être null ;
 * - les clés de `pricing.tcgplayer` varient selon la finition de la carte
 *   (holofoil / normal / reverse-holofoil / …) ;
 * - `dexId` est un TABLEAU de numéros de Pokédex (plusieurs Pokémon possibles).
 */

/* ============================== TCGdex ============================== */

export interface TcgdexCardCount {
  total: number;
  official: number;
}

/** Set renvoyé dans le détail d'une carte, et éléments de /sets. */
export interface TcgdexSetBrief {
  id: string;
  name: string;
  cardCount?: TcgdexCardCount;
  /** URL sans extension (logo : + "/logo.webp", symbole : + "/symbol.webp"). */
  logo?: string;
  symbol?: string;
}

/** Résultat de recherche (doc : « CardBrief »). */
export interface TcgdexCardBrief {
  id: string;
  localId: string;
  name: string;
  /** URL sans extension : ajouter "/{low|high}.webp". Absent si pas de visuel. */
  image?: string;
}

export interface TcgdexAttack {
  name: string;
  /** Coût énergétique : noms de types en français (ex. ["Feu", "Incolore"]). */
  cost?: string[];
  /** Texte d'effet ; peut contenir des balises HTML basiques. */
  effect?: string;
  /** Dégâts, ex. "120" ou "10+" ou "×2". */
  damage?: string;
}

export interface TcgdexAbility {
  name: string;
  type?: string;
  effect?: string;
}

export interface TcgdexWeaknessResistance {
  /** Nom du type en français (ex. "Feu"). */
  type: string;
  /** ex. "×2" */
  value: string;
}

/** Prix Cardmarket, en EUR. Champs optionnels car parfois null dans l'API. */
export interface TcgdexCardmarketPricing {
  updated: string;
  unit: "EUR";
  idProduct?: number;
  avg?: number | null;
  low?: number | null;
  /** Prix « marché » Cardmarket, le plus représentatif. */
  trend?: number | null;
  avg1?: number | null;
  avg7?: number | null;
  avg30?: number | null;
}

/** Une ligne de prix TCGplayer pour une finition donnée, en USD. */
export interface TcgdexTcgplayerEntry {
  productId?: number;
  lowPrice?: number | null;
  midPrice?: number | null;
  highPrice?: number | null;
  marketPrice?: number | null;
  directLowPrice?: number | null;
}

/**
 * Prix TCGplayer : les clés varient selon la finition observée dans les
 * réponses réelles (holofoil, normal, reverse-holofoil). Signature d'index
 * pour couvrir les autres cas possibles sans `any`.
 */
export interface TcgdexTcgplayerPricing {
  updated: string;
  unit: "USD";
  holofoil?: TcgdexTcgplayerEntry | null;
  normal?: TcgdexTcgplayerEntry | null;
  "reverse-holofoil"?: TcgdexTcgplayerEntry | null;
  /** Clés supplémentaires possibles selon les cartes (ex. "1stEdition"). */
  [finition: string]: TcgdexTcgplayerEntry | null | undefined | string;
}

export interface TcgdexPricing {
  cardmarket?: TcgdexCardmarketPricing | null;
  tcgplayer?: TcgdexTcgplayerPricing | null;
}

/** Détail complet d'une carte : /cards/{id}. Tous les champs peuvent manquer. */
export interface TcgdexCard extends TcgdexCardBrief {
  category?: string;
  rarity?: string;
  set?: TcgdexSetBrief;
  /** Numéros de Pokédex (tableau : certaines cartes montrent plusieurs Pokémon). */
  dexId?: number[];
  hp?: number;
  stage?: string;
  evolveFrom?: string;
  illustrator?: string;
  description?: string;
  attacks?: TcgdexAttack[];
  abilities?: TcgdexAbility[];
  weaknesses?: TcgdexWeaknessResistance[];
  resistances?: TcgdexWeaknessResistance[];
  /** Nombre d'énergies pour battre en retraite. */
  retreat?: number;
  legal?: { standard: boolean; expanded: boolean };
  updated?: string;
  variants?: string[];
  pricing?: TcgdexPricing;
}

/** Liste des sets : /sets (les réponses réelles ne renvoient que id/name/cardCount). */
export interface TcgdexSetListItem {
  id: string;
  name: string;
  cardCount: TcgdexCardCount;
}

/* ============================== PokéAPI ============================== */

export interface PokeApiNamedResource {
  name: string;
  url: string;
}

export interface PokeApiSpecies {
  id: number;
  name: string;
  names: { name: string; language: PokeApiNamedResource }[];
  genera: { genus: string; language: PokeApiNamedResource }[];
  flavor_text_entries: {
    flavor_text: string;
    language: PokeApiNamedResource;
    version: PokeApiNamedResource;
  }[];
  evolution_chain: { url: string };
  evolves_from_species: PokeApiNamedResource | null;
  is_legendary: boolean;
  is_mythical: boolean;
}

export interface PokeApiPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  stats: { base_stat: number; stat: PokeApiNamedResource }[];
  types: { slot: number; type: PokeApiNamedResource }[];
  sprites: {
    other: {
      "official-artwork": { front_default: string | null } | null;
    } | null;
  };
}

/** Nœud de la chaîne d'évolution (structure récursive réelle). */
export interface PokeApiEvolutionChainNode {
  species: PokeApiNamedResource;
  evolves_to: PokeApiEvolutionChainNode[];
  /** Conditions d'évolution ; on n'utilise que min_level pour l'instant. */
  evolution_details: { min_level: number | null }[];
}

export interface PokeApiEvolutionChain {
  id: number;
  chain: PokeApiEvolutionChainNode;
}

/* ======================== Modèles « pour l'UI » ======================== */

/**
 * Prix extraits et normalisés d'une carte : un prix représentatif par
 * plateforme, ou null si indisponible (section 4 : « Prix indisponible »).
 */
export interface CardPrices {
  cardmarket: { eur: number; updated: string } | null;
  tcgplayer: { usd: number; updated: string; finish: string } | null;
}

/** Un maillon de la chaîne d'évolution, prêt à afficher. */
export interface EvolutionStep {
  /** Numéro de Pokédex. */
  dexId: number;
  /** Nom français. */
  name: string;
  /** Nom anglais (stocké comme clé technique). */
  slug: string;
  /** Niveau mini d'évolution vers CE maillon (null pour le 1er). */
  minLevel: number | null;
}
