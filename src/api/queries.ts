import { useQuery } from "@tanstack/react-query";
import { getCard, getSets, searchCards } from "./tcgdex";
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

/** Recherche : les métadonnées de base changent rarement → 24 h. */
export function useCardSearch(name: string) {
  return useQuery({
    queryKey: ["tcgdex", "search", name],
    queryFn: () => searchCards(name),
    enabled: name.trim().length >= 2,
    staleTime: DAY,
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
