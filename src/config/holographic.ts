/**
 * Configuration de l'effet holographique (section 7 de la spec).
 *
 * Les valeurs de rareté concernées doivent correspondre EXACTEMENT
 * aux valeurs renvoyées par l'API TCGdex en français.
 * Ce fichier est le SEUL endroit à modifier pour ajouter/retirer des raretés.
 *
 * Raretés observées dans l'API (2026-11-11) :
 * - "Rare" (carte holo classique du Set de Base)
 * - "Rare Holo" (ex. Neo, EX)
 * - "Holo Rare" (ex. Sun & Moon)
 * - "Holo Rare V" / "Holo Rare VMAX" / "Holo Rare VSTAR"
 * - "Double rare" (souvent holo)
 * - "Illustration rare" / "Illustration spéciale rare"
 * - "Ultra rare" / "Hyper rare" / "Magnifique rare" / "Shiny rare"...
 * - "Chromatique ultra rare" / "Pikachu Rare" / "RGB Rare" / "Radieux Rare"...
 * - "Deux Étoiles" / "Trois Étoiles" / "Quatre Diamants" / "Couronne"...
 * - "Promo" (certaines promos sont holo)
 * - "LÉGENDE" / "Futuristic Rare" / "HIGH-TECH rare" / "Méga Hyper Rare"...
 *
 * On active l'effet par défaut pour les raretés contenant "Holo", "Rare",
 * "Étoiles", "Diamants", "Couronne", "Illustration", "Shiny", "Radieux",
 * "Chromatique", "LÉGENDE", "Futuristic", "HIGH-TECH", "Mega", "Méga",
 * "Promo" (avec prudence), "Légende", "Ex", "GX", "V", "VMAX", "VSTAR".
 *
 * Pour être précis sans deviner, on liste explicitement les raretés
 * "connues holo" + on active par motif pour les futures extensions.
 */

// Raretés explicitement holographiques (correspondance exacte, insensible à la casse).
export const EXPLICIT_HOLO_RARITIES = new Set<string>([
  // Base / Classique
  "Rare Holo",
  "Rare Holo LV.X",
  "Rare Holo V",
  "Holo Rare V",
  "Holo Rare VMAX",
  "Holo Rare VSTAR",
  "Holo Rare",
  "Rare Prime",
  "Rare Prism",
  "Prism Star",
  "LÉGENDE",
  "Légende",
  
  // Moderne (Sword & Shield, Scarlet & Violet)
  "Double rare",
  "Illustration rare",
  "Illustration spéciale rare",
  "Ultra rare",
  "Hyper rare",
  "Magnifique rare",
  "Shiny rare",
  "Shiny rare V",
  "Shiny rare VMAX",
  "Shiny rare VSTAR",
  "Radieux Rare",
  "Chromatique ultra rare",
  "Pikachu Rare",
  "RGB Rare",
  "Deux Étoiles",
  "Trois Étoiles",
  "Quatre Diamants",
  "Couronne",
  "Futuristic Rare",
  "HIGH-TECH rare",
  "Méga Hyper Rare",
  "Mega Attack Rare",
  "Collection Classique",
  "Deux Chromatiques",
  "Deux Diamants",
  
  // Promos (souvent holo)
  "Promo",
]);

/** Motifs qui déclenchent l'effet (insensibles à la casse, partiels). */
export const HOLO_PATTERNS = [
  "holo",
  "rare",
  "étoile",
  "etoile",   // sans accent
  "diamant",
  "couronne",
  "illustration",
  "shiny",
  "radieux",
  "chromatique",
  "légende",
  "legende",
  "futuristic",
  "high-tech",
  "mega",
  "méga",
  "promo",
  "ex",
  "gx",
  "vmax",
  "vstar",
  "vstar",
  "tag team",
  "tag-team",
];

/**
 * Détermine si une rareté donnée doit avoir l'effet holographique.
 * @param rarity - Valeur brute de l'API (ex. "Rare Holo", "Commune")
 */
export function isHolographicRarity(rarity: string | undefined): boolean {
  if (!rarity) return false;
  const normalized = rarity.trim().toLowerCase();

  // 1. Correspondance exacte (prioritaire)
  for (const explicit of EXPLICIT_HOLO_RARITIES) {
    if (explicit.toLowerCase() === normalized) return true;
  }

  // 2. Motifs partiels
  for (const pattern of HOLO_PATTERNS) {
    if (normalized.includes(pattern.toLowerCase())) return true;
  }

  return false;
}

/**
 * Types d'effets disponibles.
 * - "full" : inclinaison 3D + reflet irisé (cartes rares/holo)
 * - "tilt-only" : inclinaison légère seulement, sans reflet (communes)
 */
export type HolographicEffectType = "full" | "tilt-only";

/** Renvoie le type d'effet selon la rareté. */
export function getHolographicEffectType(rarity: string | undefined): HolographicEffectType {
  return isHolographicRarity(rarity) ? "full" : "tilt-only";
}