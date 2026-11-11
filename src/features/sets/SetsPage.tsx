import { Layers } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { t } from "../../i18n";

/**
 * Écran Sets (fonctionnalité 7).
 * Phase 0 : écran vide. La liste des extensions et la progression
 * arrivent à la phase 4.
 */
export default function SetsPage() {
  return (
    <div>
      <PageHeader title={t.sets.title} description={t.sets.description} />
      <EmptyState icon={Layers} title={t.sets.emptyTitle} text={t.sets.emptyText} />
    </div>
  );
}
