/** Erreur réseau typée, pour afficher un message clair + bouton réessayer. */
export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Petit client fetch partagé par toutes les API. */
export async function fetchJson<T>(url: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    // Erreur réseau (hors ligne, DNS…) — fetch ne renvoie pas de status.
    throw new ApiError("Connexion impossible. Vérifie ta connexion internet.");
  }
  if (!response.ok) {
    throw new ApiError(`Requête échouée (${response.status})`, response.status);
  }
  return (await response.json()) as T;
}
