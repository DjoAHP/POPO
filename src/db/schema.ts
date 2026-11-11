/**
 * Schéma des données locales (section 8 de la spec).
 *
 * Principe clé : chaque carte stockée embarque un INSTANTANÉ (snapshot)
 * des informations nécessaires à son affichage — nom, set, image, rareté,
 * dernier prix connu. C'est ce qui permet de consulter sa collection
 * hors ligne, sans appeler l'API.
 */

/** États possibles d'une carte (section 4, fonctionnalité 5). */
export const CARD_CONDITIONS = ["nm", "excellent", "good", "played", "damaged"] as const;

export type CardCondition = (typeof CARD_CONDITIONS)[number];

/** Vérifie qu'une valeur quelconque est un état de carte valide. */
export function isCardCondition(value: unknown): value is CardCondition {
  return typeof value === "string" && (CARD_CONDITIONS as readonly string[]).includes(value);
}

/** Dernier prix connu d'une carte, avec sa provenance. */
export interface SnapshotPrice {
  /** Valeur en euros (toujours convertie si la source est en USD). */
  eur: number;
  /** Source du prix : Cardmarket (EUR) ou TCGplayer (USD converti). */
  source: "cardmarket" | "tcgplayer";
  /** Prix d'origine en USD, si la source est TCGplayer. */
  usd?: number;
  /** Taux USD→EUR utilisé pour la conversion, si pertinent. */
  rate?: number;
  /** Date de mise à jour du prix fournie par l'API (ISO), si connue. */
  updatedAt: string | null;
}

/** Instantané minimal d'une carte, pour l'affichage hors ligne. */
export interface CardSnapshot {
  name: string;
  localId: string;
  setId: string | null;
  setName: string | null;
  /** URL TCGdex « nue » (sans extension) ; absente si pas de visuel. */
  image?: string;
  rarity?: string;
  dexId?: number[];
  price: SnapshotPrice | null;
}

/** Une carte possédée. La clé primaire est l'id TCGdex de la carte. */
export interface CollectionItem {
  id: string;
  quantity: number;
  condition: CardCondition;
  /** Date d'ajout (ISO 8601). */
  addedAt: string;
  snapshot: CardSnapshot;
}

/** Une carte voulue. */
export interface WishlistItem {
  id: string;
  addedAt: string;
  snapshot: CardSnapshot;
}

/** Petite table clé/valeur pour les préférences et métadonnées. */
export interface SettingRow {
  key: string;
  value: string;
}

/** Version du schéma : à incrémenter à chaque changement de structure. */
export const SCHEMA_VERSION = 1;
