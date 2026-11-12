import { useQuery } from "@tanstack/react-query";
import { getCard, getRarities, getSetDetail, getSets, getTypes, searchCardsFiltered, type SearchFilters } from "./tcgdex";
import {
  getEvolutionLine,
  getPokemon,
  getPokemonSpecies,
} from "./pokeapi";
import { useUsdToEur, type ExchangeRate } from "./exchange";

/**
 * Hooks TanStack Query pour toute l'app (section 9 : durées de cache adaptées).
 * Clés structurées ["domaine", "type", …params] pour un cache propre.
 */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/**
 * Recherche avec filtres serveur (set / rareté / type).
 * La clé de cache inclut les filtres : chaque combinaison a son cache.
 */
export function useCardSearch(name: string, filters: SearchFilters = {}) {
  return useQuery({
    queryKey: [
      "tcgdex",
      "search",
      name,
      filters.set ?? null,
      filters.rarity ?? null,
      filters.type ?? null,
    ],
    queryFn: () => searchCardsFiltered(name, filters),
    enabled: name.trim().length >= 2,
    staleTime: DAY,
  });
}

/** Raretés officielles (français) : quasi statique → 7 jours. */
export function useRarities() {
  return useQuery({
    queryKey: ["tcgdex", "rarities"],
    queryFn: getRarities,
    staleTime: 7 * DAY,
  });
}

/** Types officiels (français) : quasi statique → 7 jours. */
export function useTypes() {
  return useQuery({
    queryKey: ["tcgdex", "types"],
    queryFn: getTypes,
    staleTime: 7 * DAY,
  });
}

/** Détail de carte : contient les PRIX → 1 h maximum. */
export function useCard(id: string | null) {
  return useQuery({
    queryKey: ["tcgdex", "card", id],
    queryFn: () => getCard(id as string),
    enabled: id !== null,
    staleTime: HOUR,
  });
}

/** Liste des sets → 24 h (un nouveau set peut apparaître chaque semaine). */
export function useSets() {
  return useQuery({
    queryKey: ["tcgdex", "sets"],
    queryFn: getSets,
    staleTime: DAY,
  });
}

/** Détail d'un set (avec toutes ses cartes) : statique → 24 h. */
export function useSetDetail(setId: string | null) {
  return useQuery({
    queryKey: ["tcgdex", "set", setId],
    queryFn: () => getSetDetail(setId as string),
    enabled: setId !== null,
    staleTime: DAY,
  });
}

/** Fiche espèce PokéAPI (nom FR, description, évolutions) : statique → 7 jours. */
export function usePokemonSpecies(dexId: number | null) {
  return useQuery({
    queryKey: ["pokeapi", "species", dexId],
    queryFn: () => getPokemonSpecies(dexId as number),
    enabled: dexId !== null,
    staleTime: 7 * DAY,
  });
}

/** Stats et artwork du Pokémon : statique → 7 jours. */
export function usePokemonStats(dexId: number | null) {
  return useQuery({
    queryKey: ["pokeapi", "pokemon", dexId],
    queryFn: () => getPokemon(dexId as number),
    enabled: dexId !== null,
    staleTime: 7 * DAY,
  });
}

/** Ligne d'évolution (noms FR) : statique → 7 jours. */
export function useEvolutionLine(dexId: number | null) {
  return useQuery({
    queryKey: ["pokeapi", "evolution", dexId],
    queryFn: () => getEvolutionLine(dexId as number),
    enabled: dexId !== null,
    staleTime: 7 * DAY,
  });
}

/** Taux de change, en version courte pour l'UI. */
export function useExchangeRate(): ExchangeRate {
  return useUsdToEur();
}
