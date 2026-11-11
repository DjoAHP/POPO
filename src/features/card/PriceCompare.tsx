import type { CardPrices } from "../../api/types";
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
 */
export function PriceCompare({ prices, rate, rateSource }: PriceCompareProps) {
  const cmEur = prices.cardmarket?.eur ?? null;
  const tcgUsd = prices.tcgplayer?.usd ?? null;
  const tcgEur = tcgUsd !== null ? tcgUsd * rate : null;
  const gap =
    cmEur !== null && tcgEur !== null && cmEur > 0
      ? ((tcgEur - cmEur) / cmEur) * 100
      : null;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <PriceBox
          title={t.card.priceCardmarket}
          main={cmEur !== null ? eurFormatter.format(cmEur) : null}
          sub={prices.cardmarket ? t.card.priceTrend : null}
          highlight={gap !== null && gap < 0}
        />
        <PriceBox
          title={
            prices.tcgplayer
              ? `${t.card.priceTcgplayer} (${prices.tcgplayer.finish})`
              : t.card.priceTcgplayer
          }
          main={tcgEur !== null ? eurFormatter.format(tcgEur) : null}
          sub={tcgUsd !== null ? t.card.priceConverted(tcgUsd.toFixed(2)) : null}
          highlight={gap !== null && gap > 0}
        />
      </div>

      {gap !== null && (
        <p className="mt-2 text-xs text-ink-muted">
          {t.card.priceGap} :{" "}
          <span className={gap >= 0 ? "text-ink" : undefined}>
            {gap >= 0 ? "+" : ""}
            {gap.toFixed(1)} %
          </span>
          {rateSource === "fallback" && " (taux de secours)"}
        </p>
      )}
    </div>
  );
}

function PriceBox({
  title,
  main,
  sub,
  highlight,
}: {
  title: string;
  main: string | null;
  sub: string | null;
  highlight: boolean;
}) {
  return (
    <div className="rounded-standard border border-line bg-surface p-3">
      <p className="text-xs text-ink-muted">{title}</p>
      <p className={["mt-1 font-semibold", highlight ? "text-accent" : undefined].filter(Boolean).join(" ")}>
        {main ?? t.card.priceUnavailable}
      </p>
      {sub && <p className="text-xs text-ink-muted">{sub}</p>}
    </div>
  );
}
