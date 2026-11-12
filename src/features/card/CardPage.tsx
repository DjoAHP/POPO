import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft } from "lucide-react";
import { db } from "../../db/database";
import { formatEur } from "../../lib/format";
import { CardImage } from "../../components/CardImage";
import { extractPrices } from "../../api/tcgdex";
import { useCard, useExchangeRate } from "../../api/queries";
import { PriceCompare } from "./PriceCompare";
import { PokemonSection } from "./PokemonSection";
import { CardActions } from "./CardActions";
import { t } from "../../i18n";

/**
 * Fiche carte (fonctionnalité 2), dans l'ordre de la spec :
 * image en grand → prix Cardmarket vs TCGplayer → boutons
 * collection/wishlist (non branchés jusqu'à la phase 3) → détails → Pokémon.
 */
export default function CardPage() {
  const { id } = useParams<{ id: string }>();
  const cardId = id ?? null;

  const card = useCard(cardId);
  const exchange = useExchangeRate();

  // Titre de l'onglet avec le nom de la carte dès qu'il est connu.
  useEffect(() => {
    document.title = card.data ? `${card.data.name} — POPO` : "POPO — Collection Pokémon";
    return () => {
      document.title = "POPO — Collection Pokémon";
    };
  }, [card.data]);

  return (
    <div>
      <nav className="mb-5" aria-label="Fil d'ariane">
        <Link
          to="/recherche"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t.card.backToSearch}
        </Link>
      </nav>

      {card.isPending && (
        <div className="grid gap-6 sm:grid-cols-[260px_1fr]">
          <div className="aspect-[245/337] w-full animate-pulse rounded-standard bg-surface-2" />
          <div className="hidden animate-pulse rounded-standard bg-surface-2 sm:block" />
        </div>
      )}

      {card.isError && <CardErrorState cardId={cardId} onRetry={() => void card.refetch()} />}

      {card.data && <CardDetail card={card.data} rate={exchange.rate} rateSource={exchange.source} />}
    </div>
  );
}

type Card = NonNullable<ReturnType<typeof useCard>["data"]>;

/**
 * État d'erreur de la fiche carte.
 * Deux cas bien distincts : hors ligne (internet manquant) et carte
 * réellement introuvable. Si la carte est dans la collection ou la wishlist,
 * on affiche son APERÇU LOCAL (instantané enregistré) plutôt que rien :
 * l'utilisateur voit au moins ce qu'il possède, même sans réseau.
 */
function CardErrorState({ cardId, onRetry }: { cardId: string | null; onRetry: () => void }) {
  const localItem = useLiveQuery(
    async () => {
      if (!cardId) return null;
      return (await db.collection.get(cardId)) ?? (await db.wishlist.get(cardId)) ?? null;
    },
    [cardId],
  );

  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  const snapshot = localItem?.snapshot ?? null;

  return (
    <div>
      <div className="rounded-standard border border-line bg-surface p-6 text-center">
        <p className="font-medium">{offline ? t.card.offlineTitle : t.card.notFoundTitle}</p>
        <p className="mt-1 text-sm text-ink-muted">
          {offline ? t.card.offlineText : t.card.notFoundText}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-11 items-center rounded-standard border border-line px-4 text-sm hover:bg-surface-2"
          >
            {t.search.retry}
          </button>
          {offline && (
            <Link
              to="/collection"
              className="inline-flex h-11 items-center rounded-standard bg-accent px-4 text-sm font-medium text-accent-ink hover:opacity-90"
            >
              {t.card.seeCollection}
            </Link>
          )}
        </div>
      </div>

      {snapshot && (
        <section className="mt-4 rounded-standard border border-line bg-surface p-4">
          <h2 className="text-xs font-medium text-ink-muted">{t.card.localPreviewTitle}</h2>
          <div className="mt-3 flex gap-4">
            <div className="w-24 shrink-0">
              <CardImage image={snapshot.image} name={snapshot.name} />
            </div>
            <div className="min-w-0">
              <p className="font-medium">{snapshot.name}</p>
              <p className="text-xs text-ink-muted">
                {snapshot.setName}
                {snapshot.localId ? ` · n° ${snapshot.localId}` : ""}
                {snapshot.rarity ? ` · ${snapshot.rarity}` : ""}
              </p>
              <p className="mt-2 text-sm">
                {snapshot.price ? formatEur(snapshot.price.eur) : t.card.priceUnavailable}
              </p>
              <p className="mt-1 text-xs text-ink-muted">{t.card.localPreviewNote}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function CardDetail({ card, rate, rateSource }: { card: Card; rate: number; rateSource: "live" | "fallback" }) {
  const prices = extractPrices(card);
  const dexId = card.dexId?.[0] ?? null;

  return (
    <article>
      <div className="grid gap-6 sm:grid-cols-[260px_1fr] sm:items-start">
        {/* 1. Image en grand (haute qualité) */}
        <div>
          <CardImage image={card.image} name={card.name} quality="high" rarity={card.rarity} />
        </div>

        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{card.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {card.set?.name}
            {card.localId ? ` · n° ${card.localId}` : ""}
            {card.rarity ? ` · ${card.rarity}` : ""}
          </p>

          {/* 2. Prix, juste sous l'image (ordre de la spec) */}
          <div className="mt-4">
            <PriceCompare prices={prices} rate={rate} rateSource={rateSource} />
          </div>

          {/* 3. Actions, branchées sur la base locale (Dexie) */}
          <CardActions card={card} rate={rate} />
        </div>
      </div>

      {/* 4. Détails de la carte */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">{t.card.detailsTitle}</h2>
        <CardDetails card={card} />
      </section>

      {/* 5. Fiche Pokémon (si la carte montre un Pokémon) */}
      {dexId !== null && <PokemonSection dexId={dexId} />}
    </article>
  );
}

function CardDetails({ card }: { card: Card }) {
  const rows: [string, string | null][] = [
    [t.card.detailSet, card.set?.name ?? null],
    [
      t.card.detailNumber,
      card.localId
        ? `${card.localId}${card.set?.cardCount?.total ? ` / ${card.set.cardCount.total}` : ""}`
        : null,
    ],
    [t.card.detailRarity, card.rarity ?? null],
    [t.card.detailHp, card.hp ? String(card.hp) : null],
    [t.card.detailArtist, card.illustrator ?? null],
    [t.card.detailStage, card.stage ?? null],
    [
      t.card.detailEvolvesFrom,
      card.evolveFrom ?? null,
    ],
    [
      t.card.detailWeakness,
      card.weaknesses?.map((w) => `${w.type} ${w.value}`).join(" · ") ?? null,
    ],
    [
      t.card.detailResistance,
      card.resistances?.map((r) => `${r.type} ${r.value}`).join(" · ") ?? null,
    ],
    [t.card.detailRetreat, card.retreat ? `${card.retreat} énergie${card.retreat > 1 ? "s" : ""}` : null],
    [
      t.card.detailLegal,
      card.legal
        ? `${t.card.legalStandard} ${card.legal.standard ? "✓" : "✗"} · ${t.card.legalExpanded} ${card.legal.expanded ? "✓" : "✗"}`
        : null,
    ],
  ];
  const visibleRows = rows.filter(([, value]) => value !== null);

  return (
    <div className="rounded-standard border border-line bg-surface p-4">
      {visibleRows.length === 0 && card.attacks?.length === 0 && (
        <p className="text-sm text-ink-muted">{t.card.noDetails}</p>
      )}

      {visibleRows.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
          {visibleRows.map(([label, value]) => (
            <div key={label} className="col-span-2 grid grid-cols-subgrid">
              <dt className="text-ink-muted">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Talents */}
      {card.abilities && card.abilities.length > 0 && (
        <div className="mt-4 border-t border-line pt-4">
          <h3 className="text-sm font-medium">{t.card.abilitiesTitle}</h3>
          <ul className="mt-1 space-y-2 text-sm">
            {card.abilities.map((ability) => (
              <li key={ability.name}>
                <span className="font-medium">{ability.name}</span>
                {ability.effect && <span className="text-ink-muted"> — {ability.effect}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Attaques */}
      {card.attacks && card.attacks.length > 0 && (
        <div className="mt-4 border-t border-line pt-4">
          <h3 className="text-sm font-medium">{t.card.attacksTitle}</h3>
          <ul className="mt-1 space-y-2 text-sm">
            {card.attacks.map((attack) => (
              <li key={attack.name}>
                <div className="flex flex-wrap items-baseline gap-2">
                  {attack.cost && (
                    <span className="flex gap-1">
                      {attack.cost.map((energy, i) => (
                        <span key={i} className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px]">
                          {energy}
                        </span>
                      ))}
                    </span>
                  )}
                  <span className="font-medium">{attack.name}</span>
                  {attack.damage && <span className="font-semibold">{attack.damage}</span>}
                </div>
                {attack.effect && <p className="mt-0.5 text-ink-muted">{attack.effect}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
