import Dexie, { type EntityTable } from "dexie";
import type { CollectionItem, SettingRow, WishlistItem } from "./schema";

/**
 * Base IndexedDB via Dexie (section 8 de la spec).
 *
 * Le numéro de version du schéma est porté par `db.version(n)` : pour une
 * future évolution, on AJOUTE `this.version(2).stores({...}).upgrade(...)`
 * sans jamais modifier la version 1 existante (migration propre).
 */
export class PopoDatabase extends Dexie {
  collection!: EntityTable<CollectionItem, "id">;
  wishlist!: EntityTable<WishlistItem, "id">;
  settings!: EntityTable<SettingRow, "key">;

  constructor() {
    super("popo");
    this.version(1).stores({
      // Seules les clés primaires et les index utiles sont déclarés :
      // le reste (snapshot) est stocké tel quel, non indexé.
      collection: "id, addedAt, condition",
      wishlist: "id, addedAt",
      settings: "key",
    });
  }
}

/** Instance unique utilisée par toute l'application. */
export const db = new PopoDatabase();
