import { t } from "../i18n";
import type { CardCondition } from "../db/schema";

/** Libellé français d'un état de carte (les valeurs vivent dans db/schema.ts). */
export function conditionLabel(condition: CardCondition): string {
  return t.conditions[condition];
}
