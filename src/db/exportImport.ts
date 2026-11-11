import { db } from "./database";
import {
  isCardCondition,
  SCHEMA_VERSION,
  type CardSnapshot,
  type CollectionItem,
  type SnapshotPrice,
  type WishlistItem,
} from "./schema";

/**
 * Export / import de la collection (fonctionnalité 9).
 * Le fichier est versionné ; l'import VALIDE tout avant d'écraser quoi que
 * ce soit (section 8 : « l'import valide le fichier avant d'écraser »).
 */

export interface PopoExport {
  app: "popo";
  schemaVersion: number;
  exportedAt: string;
  collection: CollectionItem[];
  wishlist: WishlistItem[];
}

const LAST_EXPORT_KEY = "lastExportAt";
const LAST_IMPORT_KEY = "lastImportAt";

/** Construit le contenu de l'export à partir de la base locale. */
export async function buildExport(): Promise<PopoExport> {
  const [collection, wishlist] = await Promise.all([
    db.collection.toArray(),
    db.wishlist.toArray(),
  ]);
  return {
    app: "popo",
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    collection,
    wishlist,
  };
}

/** Nom de fichier proposé au téléchargement (ex. popo-export-2026-11-11.json). */
export function exportFileName(date = new Date()): string {
  const iso = date.toISOString().slice(0, 10);
  return `popo-export-${iso}.json`;
}

/** Lance le téléchargement du fichier JSON dans le navigateur. */
export async function downloadExport(): Promise<void> {
  const payload = await buildExport();
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = exportFileName();
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  await db.settings.put({ key: LAST_EXPORT_KEY, value: new Date().toISOString() });
}

/* ============================ Validation ============================ */

/** Erreur de validation d'un fichier d'import, avec message clair en français. */
export class ImportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportValidationError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validatePrice(value: unknown): SnapshotPrice | null {
  if (value === null || value === undefined) return null;
  if (!isRecord(value)) throw new ImportValidationError("Prix invalide dans le fichier.");
  const eur = value.eur;
  const source = value.source;
  if (typeof eur !== "number" || !Number.isFinite(eur)) {
    throw new ImportValidationError("Prix en euros invalide dans le fichier.");
  }
  if (source !== "cardmarket" && source !== "tcgplayer") {
    throw new ImportValidationError("Source de prix inconnue dans le fichier.");
  }
  return {
    eur,
    source,
    usd: typeof value.usd === "number" ? value.usd : undefined,
    rate: typeof value.rate === "number" ? value.rate : undefined,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
  };
}

function validateSnapshot(value: unknown): CardSnapshot {
  if (!isRecord(value)) throw new ImportValidationError("Instantané de carte manquant.");
  const name = value.name;
  if (typeof name !== "string" || name.length === 0) {
    throw new ImportValidationError("Nom de carte manquant dans le fichier.");
  }
  return {
    name,
    localId: typeof value.localId === "string" ? value.localId : "",
    setId: typeof value.setId === "string" ? value.setId : null,
    setName: typeof value.setName === "string" ? value.setName : null,
    image: typeof value.image === "string" ? value.image : undefined,
    rarity: typeof value.rarity === "string" ? value.rarity : undefined,
    dexId: Array.isArray(value.dexId)
      ? value.dexId.filter((d): d is number => typeof d === "number")
      : undefined,
    price: validatePrice(value.price),
  };
}

function validateCollectionItem(value: unknown): CollectionItem {
  if (!isRecord(value)) throw new ImportValidationError("Carte de collection invalide.");
  const id = value.id;
  const quantity = value.quantity;
  const condition = value.condition;
  if (typeof id !== "string" || id.length === 0) {
    throw new ImportValidationError("Identifiant de carte manquant.");
  }
  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
    throw new ImportValidationError(`Quantité invalide pour la carte « ${id} ».`);
  }
  if (!isCardCondition(condition)) {
    throw new ImportValidationError(`État inconnu pour la carte « ${id} ».`);
  }
  return {
    id,
    quantity,
    condition,
    addedAt: typeof value.addedAt === "string" ? value.addedAt : new Date().toISOString(),
    snapshot: validateSnapshot(value.snapshot),
  };
}

function validateWishlistItem(value: unknown): WishlistItem {
  if (!isRecord(value)) throw new ImportValidationError("Carte de wishlist invalide.");
  const id = value.id;
  if (typeof id !== "string" || id.length === 0) {
    throw new ImportValidationError("Identifiant de carte manquant dans la wishlist.");
  }
  return {
    id,
    addedAt: typeof value.addedAt === "string" ? value.addedAt : new Date().toISOString(),
    snapshot: validateSnapshot(value.snapshot),
  };
}

/**
 * Valide le contenu d'un fichier JSON et renvoie les données prêtes à écrire.
 * Lève une ImportValidationError avec un message clair si le fichier est refusé.
 */
export function parseExport(rawText: string): PopoExport {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new ImportValidationError("Ce fichier n'est pas un JSON valide.");
  }
  if (!isRecord(parsed)) {
    throw new ImportValidationError("Contenu de fichier inattendu.");
  }
  if (parsed.app !== "popo") {
    throw new ImportValidationError("Ce fichier ne vient pas de POPO.");
  }
  if (parsed.schemaVersion !== SCHEMA_VERSION) {
    throw new ImportValidationError(
      `Version de fichier non prise en charge (${String(parsed.schemaVersion)} au lieu de ${SCHEMA_VERSION}).`,
    );
  }
  if (!Array.isArray(parsed.collection) || !Array.isArray(parsed.wishlist)) {
    throw new ImportValidationError("Le fichier ne contient pas de collection valide.");
  }

  return {
    app: "popo",
    schemaVersion: SCHEMA_VERSION,
    exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : new Date().toISOString(),
    collection: parsed.collection.map(validateCollectionItem),
    wishlist: parsed.wishlist.map(validateWishlistItem),
  };
}

/**
 * Remplace les données locales par celles du fichier (après confirmation
 * de l'utilisateur dans l'interface). Tout est écrit dans une transaction :
 * si une écriture échoue, rien n'est modifié.
 */
export async function applyImport(data: PopoExport): Promise<void> {
  await db.transaction("rw", db.collection, db.wishlist, db.settings, async () => {
    await db.collection.clear();
    await db.wishlist.clear();
    await db.collection.bulkAdd(data.collection);
    await db.wishlist.bulkAdd(data.wishlist);
    await db.settings.put({ key: LAST_IMPORT_KEY, value: new Date().toISOString() });
  });
}

/** Dates du dernier export / import, pour l'écran Réglages. */
export async function getSyncDates(): Promise<{ lastExport: string | null; lastImport: string | null }> {
  const [exp, imp] = await Promise.all([
    db.settings.get(LAST_EXPORT_KEY),
    db.settings.get(LAST_IMPORT_KEY),
  ]);
  return { lastExport: exp?.value ?? null, lastImport: imp?.value ?? null };
}
