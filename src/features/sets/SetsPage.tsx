import { Link } from "react-router-dom";
import { Layers } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState } from "../../components/EmptyState";
import { useSets } from "../../api/queries";
import { t } from "../../i18n";

/**
 * Liste des extensions (fonctionnalité 7) :
 * - progression (possédées / total officiel) calculée côté client
 * - lien vers le détail du set.
 */
export default function SetsPage() {
  const setsQuery = useSets();

  const loading = setsQuery.isPending;
  const sets = setsQuery.data ?? [];

  if (loading) {
    return (
      <div>
        <PageHeader title={t.sets.title} description={t.sets.description} />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 rounded-standard border border-line bg-surface p-3">
              <div className="h-12 w-12 rounded-standard bg-surface-2" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-surface-2 rounded" />
                <div className="h-3 w-1/2 bg-surface-2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <div>
        <PageHeader title={t.sets.title} description={t.sets.description} />
        <EmptyState icon={Layers} title={t.sets.emptyTitle} text={t.sets.emptyText} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={t.sets.title} description={t.sets.description} />

      <ul className="space-y-3" role="list">
        {sets.map((set) => (
          <li key={set.id}>
            <Link
              to={`/set/${encodeURIComponent(set.id)}`}
              className="flex items-center gap-3 rounded-standard border border-line bg-surface p-3 transition-colors hover:bg-surface-2"
            >
              <div className="h-12 w-12 shrink-0 rounded-standard bg-surface-2 flex items-center justify-center">
                {set.logo && (
                  <img
                    src={`${set.logo}.webp`}
                    alt=""
                    loading="lazy"
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-standard object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{set.name}</p>
                <p className="text-xs text-ink-muted">
                  {set.cardCount.official ?? set.cardCount.total ?? 0} cartes
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}