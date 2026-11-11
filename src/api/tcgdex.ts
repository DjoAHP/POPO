import { fetchJson } from "./fetchJson";
import type {
  CardPrices,
  TcgdexCard,
  TcgdexCardBrief,
  TcgdexSetListItem,
  TcgdexTcgplayerEntry,
  TcgdexTcgplayerPricing,
} from "./types";

/**
 * Client TCGdex, en français (section 3.1 de la spec).
 * Base : https://api.tcgdex.net/v2/fr/
 */
const BASE_URL = "https://api.tcgdex.net/v2/fr";

/** Recherche de cartes par nom. Réponse minimale : {id, localId, name, image?}. */
export function searchCards(name: string): Promise<TcgdexCardBrief[]> {
  return fetchJson<TcgdexCardBrief[]>(
    `${BASE_URL}/cards?name=${encodeURIComponent(name.trim())}`,
  );
}

/** Détail complet d'une carte. */
export function getCard(id: string): Promise<TcgdexCard> {
  return fetchJson<TcgdexCard>(`${BASE_URL}/cards/${encodeURIComponent(id)}`);
}

/** Liste des extensions. */
export function getSets(): Promise<TcgdexSetListItem[]> {
  return fetchJson<TcgdexSetListItem[]>(`${BASE_URL}/sets`);
}

/**
 * Construit l'URL d'image finale depuis l'URL « nue » de la carte.
 * - `low` (245×337) pour les grilles de miniatures ;
 * - `high` (600×825) pour la fiche.
 * webp : format recommandé par TCGdex, avec fond transparent.
 */
export function cardImageUrl(
  image: string | undefined,
  quality: "low" | "high" = "low",
): string | null {
  return image ? `${image}/${quality}.webp` : null;
}

/* ========================= Extraction des prix ========================= */

/** Finitions TCGplayer par ordre de priorité d'affichage. */
const FINISH_PRIORITY = ["holofoil", "normal", "reverse-holofoil"] as const;

/** Libellés français des finitions TCGplayer. */
function finishLabel(key: string): string {
  switch (key) {
    case "holofoil":
      return "Holo";
    case "normal":
      return "Normale";
    case "reverse-holofoil":
      return "Reverse holo";
    default:
      return key;
  }
}

/**
 * Choisit la finition à utiliser pour le prix TCGplayer :
 * priorité holofoil → normal → reverse-holofoil, sinon la première
 * autre finition renseignée (les clés réelles varient selon les cartes).
 */
function pickTcgplayerFinish(pricing: TcgdexTcgplayerPricing): TcgplayerFinish | null {
  for (const key of FINISH_PRIORITY) {
    const entry: TcgdexTcgplayerPricing[string] = pricing[key];
    if (typeof entry === "object" && entry !== null) {
      return { key, entry };
    }
  }
  for (const [key, entry] of Object.entries(pricing)) {
    // `updated` et `unit` sont des chaînes, pas des objets de prix.
    if (typeof entry === "object" && entry !== null) {
      return { key, entry: entry as TcgdexTcgplayerEntry };
    }
  }
  return null;
}

interface TcgplayerFinish {
  key: string;
  entry: TcgdexTcgplayerEntry;
}

/**
 * Extrait un prix représentatif par plateforme, ou null si indisponible
 * (l'affichage montrera « Prix indisponible », jamais un plantage).
 * - Cardmarket : `trend` (prix marché) → sinon `avg` → sinon `low` ;
 * - TCGplayer : `marketPrice` de la finition choisie → sinon `midPrice`.
 */
export function extractPrices(card: TcgdexCard): CardPrices {
  const cm = card.pricing?.cardmarket ?? null;
  const cmEur = cm ? (cm.trend ?? cm.avg ?? cm.low ?? null) : null;
  const cardmarket = cm && cmEur !== null ? { eur: cmEur, updated: cm.updated } : null;

  let tcgplayer: CardPrices["tcgplayer"] = null;
  const tp = card.pricing?.tcgplayer ?? null;
  if (tp) {
    const finish = pickTcgplayerFinish(tp);
    if (finish) {
      const usd = finish.entry.marketPrice ?? finish.entry.midPrice ?? null;
      if (usd !== null) {
        tcgplayer = { usd, updated: tp.updated, finish: finishLabel(finish.key) };
      }
    }
  }

  return { cardmarket, tcgplayer };
}
