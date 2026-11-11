import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "./fetchJson";

/**
 * Taux de change USD → EUR (section 3.3 de la spec).
 * Frankfurter : gratuit, sans clé, données BCE. Mise en cache 24 h par
 * TanStack Query, avec un taux de secours si l'API échoue.
 */
const BASE_URL = "https://api.frankfurter.dev/v1";

/** Taux de secours (≈ moyenne récente) si Frankfurter est injoignable. */
export const FALLBACK_USD_TO_EUR = 0.9;

interface FrankfurterResponse {
  amount: number;
  base: string;
  date: string;
  rates: { EUR: number };
}

interface FetchedRate {
  rate: number;
  date: string;
}

async function fetchUsdToEur(): Promise<FetchedRate> {
  const data = await fetchJson<FrankfurterResponse>(
    `${BASE_URL}/latest?base=USD&symbols=EUR`,
  );
  const rate = data.rates.EUR;
  if (typeof rate !== "number" || !Number.isFinite(rate)) {
    throw new Error("Taux USD→EUR invalide dans la réponse Frankfurter");
  }
  return { rate, date: data.date };
}

/** Résultat consommé par l'UI. */
export interface ExchangeRate {
  /** Taux à appliquer : EUR = USD × rate. Toujours renseigné (secours si erreur). */
  rate: number;
  /** "live" : taux du jour ; "fallback" : taux de secours (API indisponible). */
  source: "live" | "fallback";
  /** Date officielle des taux BCE (le marché est fermé le week-end). */
  date?: string;
}

export function useUsdToEur(): ExchangeRate {
  const query = useQuery({
    queryKey: ["fx", "usd-eur"],
    queryFn: fetchUsdToEur,
    staleTime: 24 * 60 * 60 * 1000, // 24 h
    retry: 1, // pas de rafale : un seul essai de plus puis secours
  });

  if (query.data) {
    return { rate: query.data.rate, source: "live", date: query.data.date };
  }
  return { rate: FALLBACK_USD_TO_EUR, source: "fallback" };
}
