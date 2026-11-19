/**
 * Couleurs métier de POPO (docs/DESIGN.md §1.3).
 * Les clés correspondent aux noms techniques renvoyés par PokéAPI.
 * Seul endroit à modifier pour ajuster les couleurs de types / raretés.
 */

import { TYPE_NAMES_FR } from "../api/pokeapi";

export const POKEMON_TYPE_COLORS: Record<string, string> = {
  normal: "hsl(40 12% 60%)",
  fire: "hsl(18 90% 58%)",
  water: "hsl(210 85% 58%)",
  electric: "hsl(48 95% 55%)",
  grass: "hsl(135 60% 48%)",
  ice: "hsl(185 70% 62%)",
  fighting: "hsl(5 75% 55%)",
  poison: "hsl(285 65% 58%)",
  ground: "hsl(38 65% 52%)",
  flying: "hsl(210 70% 70%)",
  psychic: "hsl(335 80% 62%)",
  bug: "hsl(85 55% 45%)",
  rock: "hsl(45 40% 48%)",
  ghost: "hsl(265 55% 50%)",
  dragon: "hsl(255 75% 60%)",
  dark: "hsl(240 25% 35%)",
  steel: "hsl(210 20% 60%)",
  fairy: "hsl(330 75% 72%)",
  stellar: "hsl(280 80% 65%)",
  unknown: "hsl(220 10% 55%)",
  shadow: "hsl(265 40% 35%)",
};

/** Couleur d'un type, avec repli neutre. Accepte « fire » ou « Feu ». */
export function typeColor(type: string): string {
  const value = type.trim().toLowerCase();

  // 1. Clé technique de l'API ("fire", "water"…)
  if (POKEMON_TYPE_COLORS[value]) return POKEMON_TYPE_COLORS[value];

  // 2. Libellé français ("Feu", "Eau"…) — utilisé par les coûts d'attaque
  const key = Object.entries(TYPE_NAMES_FR).find(
    ([, label]) => label.toLowerCase() === value,
  )?.[0];

  return (key && POKEMON_TYPE_COLORS[key]) || "hsl(220 10% 55%)";
}

/** Couleur d'accent d'une rareté (badges). */
export function rarityColor(rarity: string | undefined): string {
  if (!rarity) return "hsl(220 12% 60%)";
  const r = rarity.toLowerCase();
  if (r.includes("hyper") || r.includes("magnifique")) return "hsl(42 95% 60%)";
  if (r.includes("ultra") || r.includes("illustration")) return "hsl(357 85% 62%)";
  if (r.includes("shiny") || r.includes("chromatique")) return "hsl(188 92% 62%)";
  if (r.includes("holo") || r.includes("rare")) return "hsl(42 90% 62%)";
  return "hsl(220 12% 60%)";
}
