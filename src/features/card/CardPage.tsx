import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { Smartphone } from "lucide-react";
import { db } from "../../db/database";
import { formatEur } from "../../lib/format";
import { CardImage } from "../../components/CardImage";
import { extractPrices } from "../../api/tcgdex";
import { useCard, useExchangeRate } from "../../api/queries";
import { PriceCompare } from "./PriceCompare";
import { PokemonSection } from "./PokemonSection";
import { CardActions } from "./CardActions";
import { BackLink } from "../../components/BackLink";
import { Badge } from "../../components/ui/Badge";
import { Surface } from "../../components/ui/Surface";
import { typeColor } from "../../config/brand";
import { getHoloTheme } from "../../config/holographic";
import { hasGyroscope, requestGyroscopePermission } from "../../lib/gyroscope";
import { t } from "../../i18n";

/**
 * Fiche carte (fonctionnalité 2), dans l'ordre de la spec :
 * image en grand → prix Cardmarket vs TCGplayer → actions
 * collection/wishlist → détails → Pokémon (docs/DESIGN.md §4.3).
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
      <BackLink to="/recherche" label={t.card.backToSearch} />

      {card.isPending && (
        <div className="grid gap-6 sm:grid-cols-[320px_1fr] sm:items-start">
          <div className="mx-auto aspect-[245/337] w-full max-w-[300px] animate-pulse rounded-card bg-surface-2 sm:mx-0 sm:max-w-none" />
          <div className="hidden animate-pulse rounded-card bg-surface-2 sm:block sm:h-64" />
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
      <Surface className="p-6 text-center">
        <p className="font-medium">{offline ? t.card.offlineTitle : t.card.notFoundTitle}</p>
        <p className="mt-1 text-sm text-ink-muted">
          {offline ? t.card.offlineText : t.card.notFoundText}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-11 items-center rounded-control border border-line/70 bg-glass px-4 text-sm transition-colors hover:bg-surface-2"
          >
            {t.search.retry}
          </button>
          {offline && (
            <Link
              to="/collection"
              className="inline-flex h-11 items-center rounded-control bg-gradient-to-br from-accent to-brand-2 px-4 text-sm font-medium text-on-brand"
            >
              {t.card.seeCollection}
            </Link>
          )}
        </div>
      </Surface>

      {snapshot && (
        <Surface className="mt-4 p-4">
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
              <p className="tabular mt-2 text-sm">
                {snapshot.price ? formatEur(snapshot.price.eur) : t.card.priceUnavailable}
              </p>
              <p className="mt-1 text-xs text-ink-muted">{t.card.localPreviewNote}</p>
            </div>
          </div>
        </Surface>
      )}
    </div>
  );
}

function CardDetail({
  card,
  rate,
  rateSource,
}: {
  card: Card;
  rate: number;
  rateSource: "live" | "fallback";
}) {
  const prices = extractPrices(card);
  const dexId = card.dexId?.[0] ?? null;
  const theme = getHoloTheme(card.rarity);
  const [gyroscope, setGyroscope] = useState(false);

  // Couleur du badge de rareté, alignée sur le thème holographique.
  const rarityTone =
    theme.id === "standard"
      ? "neutral"
      : theme.id === "shiny"
        ? "cyan"
        : theme.id === "ultra"
          ? "gold"
          : "cyan";

  return (
    <article>
      <div className="grid gap-6 sm:grid-cols-[320px_1fr] sm:items-start sm:gap-8">
        {/* 1. Carte en grand, sur un socle lumineux teinté par la rareté */}
        <div className="relative mx-auto w-full max-w-[300px] sm:mx-0 sm:max-w-none">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-6 rounded-[40px] opacity-70 blur-3xl"
            style={{ background: theme.glow }}
          />
          <div className="relative">
            <CardImage
              image={card.image}
              name={card.name}
              quality="high"
              rarity={card.rarity}
              gyroscope={gyroscope}
            />
          </div>

          {hasGyroscope() && (
            <button
              type="button"
              disabled={gyroscope}
              onClick={async () => setGyroscope(await requestGyroscopePermission())}
              className="mx-auto mt-4 flex min-h-11 items-center gap-2 rounded-pill border border-line/70 bg-glass px-4 text-xs text-ink-muted backdrop-blur transition-colors hover:text-ink disabled:opacity-60"
            >
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              {gyroscope ? t.card.tiltPhoneActive : t.card.tiltPhone}
            </button>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan">
            {t.card.eyebrow}
          </p>
          <h1 className="mt-1 text-[28px] font-semibold leading-tight tracking-tight sm:text-[32px]">
            {card.name}
          </h1>

          <div className="mt-3 flex flex-wrap gap-2">
            {card.set?.name && <Badge tone="cyan">{card.set.name}</Badge>}
            {card.localId && <Badge>n° {card.localId}</Badge>}
            {card.rarity && <Badge tone={rarityTone}>{card.rarity}</Badge>}
          </div>

          {/* 2. Prix, juste sous le titre (ordre de la spec) */}
          <div className="mt-5">
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
    [t.card.detailEvolvesFrom, card.evolveFrom ?? null],
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
    <Surface className="p-4">
      {visibleRows.length === 0 && card.attacks?.length === 0 && (
        <p className="text-sm text-ink-muted">{t.card.noDetails}</p>
      )}

      {visibleRows.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-sm">
          {visibleRows.map(([label, value]) => (
            <div key={label} className="col-span-2 grid grid-cols-subgrid">
              <dt className="text-ink-muted">{label}</dt>
              <dd className="text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Talents */}
      {card.abilities && card.abilities.length > 0 && (
        <div className="mt-4 border-t border-line/60 pt-4">
          <h3 className="text-sm font-medium">{t.card.abilitiesTitle}</h3>
          <ul className="mt-1.5 space-y-2 text-sm">
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
        <div className="mt-4 border-t border-line/60 pt-4">
          <h3 className="text-sm font-medium">{t.card.attacksTitle}</h3>
          <ul className="mt-1.5 space-y-3 text-sm">
            {card.attacks.map((attack) => (
              <li key={attack.name}>
                <div className="flex flex-wrap items-baseline gap-2">
                  {attack.cost && (
                    <span className="flex gap-1">
                      {attack.cost.map((energy, index) => (
                        <span
                          key={index}
                          title={energy}
                          className="inline-flex h-5 min-w-5 items-center justify-center rounded-pill px-1.5 text-[10px] font-semibold text-white"
                          style={{ background: typeColor(energy) }}
                        >
                          {energy.slice(0, 1)}
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
    </Surface>
  );
}
