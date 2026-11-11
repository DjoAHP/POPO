import { db } from "./database";
import type { CardSnapshot, WishlistItem } from "./schema";

/** Ajoute une carte à la wishlist (sans doublon). */
export async function addToWishlist(id: string, snapshot: CardSnapshot): Promise<void> {
  const existing = await db.wishlist.get(id);
  if (existing) return;
  await db.wishlist.add({ id, addedAt: new Date().toISOString(), snapshot });
}

/** Retire une carte de la wishlist. */
export async function removeFromWishlist(id: string): Promise<void> {
  await db.wishlist.delete(id);
}

/** Ajoute ou retire selon l'état actuel (bouton bascule de la fiche carte). */
export async function toggleWishlist(id: string, snapshot: CardSnapshot): Promise<void> {
  const existing = await db.wishlist.get(id);
  if (existing) {
    await removeFromWishlist(id);
  } else {
    await addToWishlist(id, snapshot);
  }
}

/** Toutes les cartes voulues, de la plus récente à la plus ancienne. */
export async function listWishlist(): Promise<WishlistItem[]> {
  const items = await db.wishlist.toArray();
  return items.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}

/** Valeur estimée des cartes voulues (même logique que la collection). */
export function wishlistValue(items: WishlistItem[]): { total: number; unpricedCount: number } {
  let total = 0;
  let unpricedCount = 0;
  for (const item of items) {
    if (item.snapshot.price) {
      total += item.snapshot.price.eur;
    } else {
      unpricedCount += 1;
    }
  }
  return { total, unpricedCount };
}
