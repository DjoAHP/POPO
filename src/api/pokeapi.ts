import { fetchJson } from "./fetchJson";
import type {
  EvolutionStep,
  PokeApiEvolutionChain,
  PokeApiEvolutionChainNode,
  PokeApiPokemon,
  PokeApiSpecies,
} from "./types";

/**
 * Client PokéAPI (section 3.2 de la spec).
 * Base : https://pokeapi.co/api/v2/
 * Données 100 % statiques : mise en cache longue (voir queries.ts).
 *
 * PokéAPI ne traduit pas les types et les stats : les libellés français
 * vivent dans ce fichier (constants TYPE_NAMES_FR et STAT_NAMES_FR).
 */
const BASE_URL = "https://pokeapi.co/api/v2";

/** Fiche d'espèce : nom français, description, chaîne d'évolution. */
export function getPokemonSpecies(dexId: number): Promise<PokeApiSpecies> {
  return fetchJson<PokeApiSpecies>(`${BASE_URL}/pokemon-species/${dexId}`);
}

/** Fiche du Pokémon : stats, types, taille, poids, artwork officiel. */
export function getPokemon(dexId: number): Promise<PokeApiPokemon> {
  return fetchJson<PokeApiPokemon>(`${BASE_URL}/pokemon/${dexId}`);
}

/* ========================= Libellés français ========================= */

/** Noms français des types Pokémon (PokéAPI ne les fournit pas). */
export const TYPE_NAMES_FR: Record<string, string> = {
  normal: "Normal",
  fire: "Feu",
  water: "Eau",
  electric: "Électrique",
  grass: "Plante",
  ice: "Glace",
  fighting: "Combat",
  poison: "Poison",
  ground: "Sol",
  flying: "Vol",
  psychic: "Psy",
  bug: "Insecte",
  rock: "Roche",
  ghost: "Spectre",
  dragon: "Dragon",
  dark: "Ténèbres",
  steel: "Acier",
  fairy: "Fée",
  stellar: "Stellaire",
  unknown: "Inconnu",
  shadow: "Ombre",
};

/** Noms français des stats de base. */
export const STAT_NAMES_FR: Record<string, string> = {
  hp: "PV",
  attack: "Attaque",
  defense: "Défense",
  "special-attack": "Atq. Spé.",
  "special-defense": "Déf. Spé.",
  speed: "Vitesse",
};

/** Traduit un type PokéAPI en français, avec repli sur la valeur brute. */
export function typeNameFr(typeName: string): string {
  return TYPE_NAMES_FR[typeName] ?? typeName;
}

/** Traduit une stat PokéAPI en français, avec repli sur la valeur brute. */
export function statNameFr(statName: string): string {
  return STAT_NAMES_FR[statName] ?? statName;
}

/* ===================== Extraction des infos utiles ===================== */

/** Nom français de l'espèce, avec repli sur le nom anglais. */
export function speciesNameFr(species: PokeApiSpecies): string {
  const fr = species.names.find((n) => n.language.name === "fr");
  return fr?.name ?? species.name;
}

/** Catégorie du Pokémon (« Pokémon Flamme »), en français si disponible. */
export function speciesGenusFr(species: PokeApiSpecies): string | null {
  const fr = species.genera.find((g) => g.language.name === "fr");
  return fr?.genus ?? null;
}

/**
 * Description française. On prend la dernière version du jeu qui l'utilise
 * (les réponses sont ordonnées par version). Les sauts de ligne sont
 * nettoyés pour un affichage propre.
 */
export function speciesFlavorFr(species: PokeApiSpecies): string | null {
  const entries = species.flavor_text_entries.filter(
    (f) => f.language.name === "fr",
  );
  const last = entries[entries.length - 1];
  if (!last) return null;
  return last.flavor_text.replace(/[\n\f\r]+/g, " ").trim();
}

/** Stats de base indexées par nom technique, pour un accès simple. */
export function pokemonStats(pokemon: PokeApiPokemon): Record<string, number> {
  return Object.fromEntries(pokemon.stats.map((s) => [s.stat.name, s.base_stat]));
}

/** Artwork officiel (grande image), ou null si absent. */
export function pokemonArtwork(pokemon: PokeApiPokemon): string | null {
  return pokemon.sprites.other?.["official-artwork"]?.front_default ?? null;
}

/* ======================= Chaîne d'évolution ======================= */

/** Extrait l'id de Pokédex d'une URL d'espèce (…/pokemon-species/6/ → 6). */
function dexIdFromUrl(url: string): number | null {
  const match = /\/pokemon-species\/(\d+)\/?$/.exec(url);
  return match ? Number(match[1]) : null;
}

/**
 * Parcourt récursivement la chaîne d'évolution pour en faire une liste
 * plate dans l'ordre d'évolution (ex. Salamèche → Reptincel → Dracaufeu).
 */
function flattenChain(
  node: PokeApiEvolutionChainNode,
  minLevel: number | null,
  steps: EvolutionStep[],
): void {
  const dexId = dexIdFromUrl(node.species.url);
  if (dexId !== null) {
    steps.push({ dexId, name: node.species.name, slug: node.species.name, minLevel });
  }
  for (const child of node.evolves_to) {
    const details = child.evolution_details[0];
    flattenChain(child, details?.min_level ?? null, steps);
  }
}

/**
 * Ligne d'évolution complète, avec les noms FR de chaque maillon
 * (1 requête par maillon — données statiques, mises en cache longtemps).
 */
export async function getEvolutionLine(dexId: number): Promise<EvolutionStep[]> {
  const species = await getPokemonSpecies(dexId);
  const chain = await fetchJson<PokeApiEvolutionChain>(species.evolution_chain.url);

  const steps: EvolutionStep[] = [];
  flattenChain(chain.chain, null, steps);

  // Noms français : une requête par maillon, en parallèle.
  const frNames = await Promise.all(
    steps.map(async (step) => {
      const sp = await getPokemonSpecies(step.dexId);
      return speciesNameFr(sp);
    }),
  );
  return steps.map((step, i) => ({
    ...step,
    name: frNames[i] ?? step.name,
  }));
}
