import { db } from "./database";
import type { CardCondition, CardSnapshot, CollectionItem } from "./schema";

/** Ajoute une carte à la collection (quantité 1, état Neuf/NM). */
export async function addToCollection(id: string, snapshot: CardSnapshot): Promise<void> {
  const existing = await db.collection.get(id);
  if (existing) return; // déjà présente : la quantité se modifie dans la Collection
  await db.collection.add({
    id,
    quantity: 1,
    condition: "nm",
    addedAt: new Date().toISOString(),
    snapshot,
  });
}

/** Retire complètement une carte de la collection. */
export async function removeFromCollection(id: string): Promise<void> {
  await db.collection.delete(id);
}

/** Change la quantité (minimum 1 : pour retirer, utiliser removeFromCollection). */
export async function setQuantity(id: string, quantity: number): Promise<void> {
  const safe = Math.max(1, Math.min(99, Math.round(quantity)));
  await db.collection.update(id, { quantity: safe });
}

/** Change l'état d'une carte. */
export async function setCondition(id: string, condition: CardCondition): Promise<void> {
  await db.collection.update(id, { condition });
}

/** Toutes les cartes possédées, de la plus récente à la plus ancienne. */
export async function listCollection(): Promise<CollectionItem[]> {
  const items = await db.collection.toArray();
  return items.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}

/**
 * Valeur totale estimée (fonctionnalité 5) : somme des derniers prix connus
 * multipliés par les quantités. Les cartes sans prix comptent pour 0, et on
 * indique combien n'ont pas de prix pour rester transparent.
 */
export function collectionValue(items: CollectionItem[]): {
  total: number;
  pricedCount: number;
  unpricedCount: number;
} {
  let total = 0;
  let pricedCount = 0;
  let unpricedCount = 0;

  for (const item of items) {
    if (item.snapshot.price) {
      total += item.snapshot.price.eur * item.quantity;
      pricedCount += 1;
    } else {
      unpricedCount += 1;
    }
  }
  return { total, pricedCount, unpricedCount };
}

/** Nombre total de cartes (somme des quantités). */
export function collectionCardCount(items: CollectionItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/** Types de tri disponibles (fonctionnalité 5 : tri par date, nom, valeur). */
export type CollectionSort = "addedAt" | "name" | "value";

/** Trie une liste selon le critère choisi (sans modifier l'originale). */
export function sortCollection(items: CollectionItem[], sort: CollectionSort): CollectionItem[] {
  const copy = [...items];
  switch (sort) {
    case "name":
      return copy.sort((a, b) => a.snapshot.name.localeCompare(b.snapshot.name, "fr"));
    case "value":
      return copy.sort(
        (a, b) =>
          (b.snapshot.price?.eur ?? 0) * b.quantity -
          (a.snapshot.price?.eur ?? 0) * a.quantity,
      );
    case "addedAt":
    default:
      return copy.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  }
}

/** Déplace une carte de la wishlist vers la collection (si pas déjà possédée). */
export async function moveWishlistItemToCollection(id: string): Promise<void> {
  const item = await db.wishlist.get(id);
  if (!item) return;
  await addToCollection(id, item.snapshot);
  await db.wishlist.delete(id);
}
