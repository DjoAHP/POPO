import { fr, type Texts } from "./fr";

/**
 * Point d'entrée des textes. En V1, seule la langue française existe.
 * Plus tard : `const texts: Record<Locale, Texts> = { fr, en }`.
 */
export type Locale = "fr";

export const texts: Texts = fr;
export const t = texts;
