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
 * Thème holographique d'une carte (docs/DESIGN.md §5.4).
 * - `standard` : aucune iridescence, inclinaison très légère ;
 * - `holo` : cyan / or / blanc glacé ;
 * - `ultra` : or / rouge / cyan ;
 * - `shiny` : argent / cyan / or.
 */
export interface HoloTheme {
  id: "standard" | "holo" | "ultra" | "shiny";
  /** Couleurs du foil iridescent (3 arrêts). */
  foil: [string, string, string];
  /** Halo extérieur teinté par la rareté. */
  glow: string;
  /** 0 → 1 : opacité du foil et du reflet. */
  intensity: number;
}

export const HOLO_THEMES: Record<HoloTheme["id"], HoloTheme> = {
  standard: {
    id: "standard",
    foil: ["transparent", "transparent", "transparent"],
    glow: "hsl(0 0% 60% / 0.22)",
    intensity: 0,
  },
  holo: {
    id: "holo",
    foil: ["hsl(188 92% 68%)", "hsl(42 95% 64%)", "hsl(195 90% 88%)"],
    glow: "hsl(188 92% 55% / 0.45)",
    intensity: 0.6,
  },
  ultra: {
    id: "ultra",
    foil: ["hsl(42 95% 64%)", "hsl(357 85% 62%)", "hsl(188 92% 68%)"],
    glow: "hsl(42 95% 60% / 0.5)",
    intensity: 0.72,
  },
  shiny: {
    id: "shiny",
    foil: ["hsl(0 0% 96%)", "hsl(188 92% 78%)", "hsl(42 95% 70%)"],
    glow: "hsl(0 0% 90% / 0.42)",
    intensity: 0.66,
  },
};

/**
 * Choisit le thème holographique d'une rareté.
 * Seul endroit à modifier pour ajuster les palettes par rareté.
 */
export function getHoloTheme(rarity: string | undefined): HoloTheme {
  const normalized = rarity?.trim().toLowerCase() ?? "";

  if (normalized.includes("shiny") || normalized.includes("chromatique")) {
    return HOLO_THEMES.shiny;
  }
  if (
    normalized.includes("hyper") ||
    normalized.includes("ultra") ||
    normalized.includes("illustration") ||
    normalized.includes("magnifique")
  ) {
    return HOLO_THEMES.ultra;
  }
  if (isHolographicRarity(rarity)) return HOLO_THEMES.holo;
  return HOLO_THEMES.standard;
}