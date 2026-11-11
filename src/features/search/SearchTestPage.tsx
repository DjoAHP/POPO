import { useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { cardImageUrl, extractPrices } from "../../api/tcgdex";
import { useCard, useCardSearch, useExchangeRate, useEvolutionLine, usePokemonSpecies, usePokemonStats } from "../../api/queries";
import {
  pokemonArtwork,
  pokemonStats,
  speciesFlavorFr,
  speciesGenusFr,
  speciesNameFr,
  statNameFr,
  typeNameFr,
} from "../../api/pokeapi";
import { useDebouncedValue } from "../../lib/useDebouncedValue";
import type { TcgdexCardBrief } from "../../api/types";

/**
 * PAGE DE TEST TEMPORAIRE (phase 1), cachée : pas dans la navigation.
 * Permet de vérifier visuellement que la couche de données fonctionne :
 * recherche TCGdex, détail + prix, conversion EUR/USD, fiche Pokémon.
 * Sera retirée à la phase 2, remplacée par le vrai écran Recherche.
 */

const eurFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

export default function SearchTestPage() {
  // ?q=… permet de préremplir la recherche (pratique pour tester sans clavier).
  const [input, setInput] = useState(() => new URLSearchParams(window.location.search).get("q") ?? "");
  const [selectedId, setSelectedId] = useState<string | null>("base1-4");
  const debounced = useDebouncedValue(input.trim(), 300);

  const search = useCardSearch(debounced);
  const card = useCard(selectedId);
  const exchange = useExchangeRate();

  return (
    <div>
      <PageHeader
        title="Test API"
        description="Page temporaire de la phase 1 : vérification de la couche de données."
        action={
          <Link to="/" className="text-sm text-ink-muted underline-offset-2 hover:underline">
            ← Accueil
          </Link>
        }
      />

      {/* ---------- Recherche ---------- */}
      <section className="mb-8">
        <label htmlFor="test-search" className="mb-2 block text-sm font-medium">
          Recherche par nom
        </label>
        <input
          id="test-search"
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex. Dracaufeu"
          className="h-11 w-full rounded-standard border border-line bg-surface px-4 text-base outline-none placeholder:text-ink-muted"
        />
        <p className="mt-1 text-xs text-ink-muted">
          Taux USD→EUR : 1 USD = {exchange.rate.toFixed(4)} EUR ({exchange.source === "live" ? `taux du jour, ${exchange.date}` : "taux de secours"})
        </p>

        {debounced.length < 2 ? (
          <p className="mt-4 text-sm text-ink-muted">Tape au moins 2 caractères.</p>
        ) : search.isPending ? (
          <p className="mt-4 text-sm text-ink-muted">Chargement…</p>
        ) : search.isError ? (
          <SearchError onRetry={() => void search.refetch()} />
        ) : (
          <ResultsGrid results={search.data ?? []} onPick={setSelectedId} selectedId={selectedId} />
        )}
      </section>

      {/* ---------- Détail carte ---------- */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Carte sélectionnée</h2>
        {card.isPending && <p className="text-sm text-ink-muted">Chargement…</p>}
        {card.isError && <SearchError onRetry={() => void card.refetch()} />}
        {card.data && <CardDetail card={card.data} rate={exchange.rate} />}
      </section>
    </div>
  );
}

function SearchError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mt-4 rounded-standard border border-line bg-surface p-4 text-sm">
      <p className="text-ink-muted">Erreur réseau ou API indisponible.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 inline-flex h-9 items-center gap-2 rounded-standard border border-line px-3 text-xs font-medium hover:bg-surface-2"
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
        Réessayer
      </button>
    </div>
  );
}

function ResultsGrid({
  results,
  onPick,
  selectedId,
}: {
  results: TcgdexCardBrief[];
  onPick: (id: string) => void;
  selectedId: string | null;
}) {
  if (results.length === 0) {
    return <p className="mt-4 text-sm text-ink-muted">Aucun résultat.</p>;
  }
  return (
    <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
      {results.map((brief) => {
        const thumb = cardImageUrl(brief.image, "low");
        const selected = brief.id === selectedId;
        return (
          <button
            key={brief.id}
            type="button"
            onClick={() => onPick(brief.id)}
            className={[
              "flex flex-col items-center rounded-standard border p-2 text-center transition-colors",
              selected ? "border-accent bg-surface-2" : "border-line bg-surface hover:bg-surface-2",
            ].join(" ")}
          >
            {thumb ? (
              <img
                src={thumb}
                alt={brief.name}
                loading="lazy"
                width={98}
                height={135}
                className="h-auto w-full max-w-25"
              />
            ) : (
              <div className="flex h-33.5 w-full items-center justify-center rounded-standard bg-surface-2 text-[10px] text-ink-muted">
                Pas de visuel
              </div>
            )}
            <span className="mt-2 w-full truncate text-xs">{brief.name}</span>
            <span className="text-[10px] text-ink-muted">{brief.id}</span>
          </button>
        );
      })}
    </div>
  );
}

function CardDetail({ card, rate }: { card: NonNullable<ReturnType<typeof useCard>["data"]>; rate: number }) {
  const prices = extractPrices(card);
  const dexId = card.dexId?.[0] ?? null;

  return (
    <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
      <div>
        <img
          src={cardImageUrl(card.image, "high") ?? undefined}
          alt={card.name}
          width={220}
          height={302}
          className="w-full"
        />
      </div>

      <div className="min-w-0">
        <h3 className="text-xl font-semibold">{card.name}</h3>
        <p className="text-sm text-ink-muted">
          {card.set?.name} · n° {card.localId} {card.rarity ? `· ${card.rarity}` : ""}
          {card.dexId ? ` · Pokédex n°${card.dexId.join(", ")}` : ""}
        </p>

        {/* Prix Cardmarket vs TCGplayer, l'écart mis en évidence */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <PriceBox
            title="Cardmarket"
            main={prices.cardmarket ? eurFormatter.format(prices.cardmarket.eur) : null}
            sub={prices.cardmarket ? "EUR · tendance" : null}
          />
          <PriceBox
            title={`TCGplayer${prices.tcgplayer ? ` (${prices.tcgplayer.finish})` : ""}`}
            main={
              prices.tcgplayer
                ? eurFormatter.format(prices.tcgplayer.usd * rate)
                : null
            }
            sub={
              prices.tcgplayer
                ? `${prices.tcgplayer.usd.toFixed(2)} USD convertis`
                : null
            }
          />
        </div>
        {prices.cardmarket && prices.tcgplayer && (
          <p className="mt-2 text-xs text-ink-muted">
            Écart Cardmarket ↔ TCGplayer :{" "}
            {(((prices.tcgplayer.usd * rate - prices.cardmarket.eur) / prices.cardmarket.eur) * 100).toFixed(1)} %
          </p>
        )}

        {/* Attaques et infos de la carte */}
        {card.attacks && card.attacks.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium">Attaques</h4>
            <ul className="mt-1 space-y-1 text-sm text-ink-muted">
              {card.attacks.map((a) => (
                <li key={a.name}>
                  <span className="text-ink">{a.name}</span>
                  {a.damage ? ` — ${a.damage}` : ""}
                  {a.effect ? ` : ${a.effect}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        {dexId !== null && <PokemonSection dexId={dexId} />}
      </div>
    </div>
  );
}

function PriceBox({ title, main, sub }: { title: string; main: string | null; sub: string | null }) {
  return (
    <div className="rounded-standard border border-line bg-surface p-3">
      <p className="text-xs text-ink-muted">{title}</p>
      <p className="mt-1 font-semibold">{main ?? "Prix indisponible"}</p>
      {sub && <p className="text-xs text-ink-muted">{sub}</p>}
    </div>
  );
}

/* ---------- Fiche Pokémon (PokéAPI) ---------- */

function PokemonSection({ dexId }: { dexId: number }) {
  const species = usePokemonSpecies(dexId);
  const pokemon = usePokemonStats(dexId);
  const evolution = useEvolutionLine(dexId);

  return (
    <div className="mt-6 rounded-standard border border-line bg-surface p-4">
      <h4 className="text-sm font-medium">Fiche Pokémon (PokéAPI)</h4>

      {species.isError && <p className="mt-2 text-xs text-ink-muted">PokéAPI indisponible.</p>}

      {species.data && (
        <div className="mt-2 grid gap-4 sm:grid-cols-[120px_1fr]">
          {pokemon.data && (
            <img
              src={pokemonArtwork(pokemon.data) ?? undefined}
              alt={speciesNameFr(species.data)}
              width={120}
              height={120}
              loading="lazy"
              className="w-30"
            />
          )}
          <div className="min-w-0">
            <p className="font-medium">{speciesNameFr(species.data)}</p>
            <p className="text-xs text-ink-muted">
              {speciesGenusFr(species.data)}
              {species.data.is_legendary ? " · Légendaire" : ""}
              {species.data.is_mythical ? " · Mythique" : ""}
            </p>
            <p className="mt-2 text-sm text-ink-muted">{speciesFlavorFr(species.data)}</p>
            {pokemon.data && (
              <div className="mt-3 flex flex-wrap gap-2">
                {pokemon.data.types.map((tp) => (
                  <span key={tp.type.name} className="rounded-full bg-surface-2 px-3 py-1 text-xs">
                    {typeNameFr(tp.type.name)}
                  </span>
                ))}
                {Object.entries(pokemonStats(pokemon.data)).map(([key, value]) => (
                  <span key={key} className="rounded-full bg-surface-2 px-3 py-1 text-xs">
                    {statNameFr(key)} {value}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Évolutions */}
      {evolution.data && evolution.data.length > 1 && (
        <div className="mt-4 border-t border-line pt-3">
          <h5 className="text-xs font-medium text-ink-muted">Évolutions</h5>
          <ul className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            {evolution.data.map((step, i) => (
              <li key={step.dexId} className="flex items-center gap-2">
                {i > 0 && <span className="text-ink-muted">→</span>}
                <span>
                  {step.name}
                  {step.minLevel !== null && (
                    <span className="text-xs text-ink-muted"> (Nv. {step.minLevel})</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
