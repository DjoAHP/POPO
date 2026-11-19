import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { CardPrices } from "../../api/types";
import { Surface } from "../../components/ui/Surface";
import { t } from "../../i18n";

const eurFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

interface PriceCompareProps {
  prices: CardPrices;
  /** Taux USD → EUR à appliquer (du hook useExchangeRate). */
  rate: number;
  rateSource: "live" | "fallback";
}

/**
 * Comparaison des prix (fonctionnalité 4) : Cardmarket (EUR) vs
 * TCGplayer (USD converti en EUR), avec l'écart mis en évidence.
 * Prix absent → « Prix indisponible », jamais de plantage.
 *
 * Convention de couleur : Cardmarket est le marché de référence, donc un
 * écart positif (TCGplayer plus cher) est affiché en `success` — la carte
 * coûte moins cher là où l'on achète.
 */
export function PriceCompare({ prices, rate, rateSource }: PriceCompareProps) {
  const cardmarketEur = prices.cardmarket?.eur ?? null;
  const tcgplayerUsd = prices.tcgplayer?.usd ?? null;
  const tcgplayerEur = tcgplayerUsd !== null ? tcgplayerUsd * rate : null;
  const gap =
    cardmarketEur !== null && tcgplayerEur !== null && cardmarketEur > 0
      ? ((tcgplayerEur - cardmarketEur) / cardmarketEur) * 100
      : null;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <PriceBox
          title={t.card.priceCardmarket}
          main={cardmarketEur !== null ? eurFormatter.format(cardmarketEur) : null}
          sub={prices.cardmarket ? t.card.priceTrend : null}
          tone="gold"
        />
        <PriceBox
          title={
            prices.tcgplayer
              ? `${t.card.priceTcgplayer} (${prices.tcgplayer.finish})`
              : t.card.priceTcgplayer
          }
          main={tcgplayerEur !== null ? eurFormatter.format(tcgplayerEur) : null}
          sub={tcgplayerUsd !== null ? t.card.priceConverted(tcgplayerUsd.toFixed(2)) : null}
          tone="accent"
        />
      </div>

      {gap !== null && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
          <span>{t.card.priceGap}</span>
          <span
            className={[
              "inline-flex items-center gap-0.5 rounded-pill px-2 py-0.5 font-medium",
              gap >= 0 ? "bg-success/12 text-success" : "bg-danger/12 text-danger",
            ].join(" ")}
          >
            {gap >= 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {gap >= 0 ? "+" : ""}
            {gap.toFixed(1)} %
          </span>
          {rateSource === "fallback" && <span>(taux de secours)</span>}
        </div>
      )}
    </div>
  );
}

function PriceBox({
  title,
  main,
  sub,
  tone,
}: {
  title: string;
  main: string | null;
  sub: string | null;
  tone: "gold" | "accent";
}) {
  return (
    <Surface variant="glass" className="p-3.5">
      <p className="text-[11px] uppercase tracking-wide text-ink-muted">{title}</p>
      <p
        className={[
          "tabular mt-1 text-xl font-semibold tracking-tight sm:text-2xl",
          main ? (tone === "gold" ? "text-gold" : "text-accent") : "text-ink-muted",
        ].join(" ")}
      >
        {main ?? t.card.priceUnavailable}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-ink-muted">{sub}</p>}
    </Surface>
  );
}
