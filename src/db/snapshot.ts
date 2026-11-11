import { extractPrices } from "../api/tcgdex";
import type { TcgdexCard } from "../api/types";
import type { CardSnapshot } from "./schema";

/**
 * Construit l'instantané d'une carte à partir du détail TCGdex.
 *
 * Choix de valorisation : le prix Cardmarket en EUR (marché de référence
 * pour les cartes françaises). Si Cardmarket est absent, on retombe sur
 * TCGplayer converti en EUR avec le taux courant (la provenance et le taux
 * sont conservés, pour rester honnête sur ce qui est affiché).
 */
export function buildSnapshot(card: TcgdexCard, usdToEurRate: number): CardSnapshot {
  const prices = extractPrices(card);

  let price: CardSnapshot["price"] = null;
  if (prices.cardmarket) {
    price = {
      eur: prices.cardmarket.eur,
      source: "cardmarket",
      updatedAt: prices.cardmarket.updated,
    };
  } else if (prices.tcgplayer) {
    price = {
      eur: prices.tcgplayer.usd * usdToEurRate,
      source: "tcgplayer",
      usd: prices.tcgplayer.usd,
      rate: usdToEurRate,
      updatedAt: prices.tcgplayer.updated,
    };
  }

  return {
    name: card.name,
    localId: card.localId,
    setId: card.set?.id ?? null,
    setName: card.set?.name ?? null,
    image: card.image,
    rarity: card.rarity,
    dexId: card.dexId,
    price,
  };
}
