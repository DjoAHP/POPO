/** Formatage monétaire en euros, à la française (ex. « 402,26 € »). */
const eurFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

export function formatEur(value: number): string {
  return eurFormatter.format(value);
}

/** Formatage d'une date ISO en date courte française (ex. « 11 nov. 2026 »). */
const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
});

export function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : dateFormatter.format(date);
}
