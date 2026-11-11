import { useEffect, useState } from "react";

/**
 * Renvoie la valeur après un délai sans changement (débouncing).
 * Utilisé pour la recherche : on attend ~300 ms après la dernière frappe
 * avant d'appeler l'API (respect des API, section 4 de la spec).
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
