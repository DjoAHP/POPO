import { useEvolutionLine, usePokemonSpecies, usePokemonStats } from "../../api/queries";
import {
  pokemonArtwork,
  pokemonStats,
  speciesFlavorFr,
  speciesGenusFr,
  speciesNameFr,
  statNameFr,
  typeNameFr,
} from "../../api/pokeapi";
import { Surface } from "../../components/ui/Surface";
import { typeColor } from "../../config/brand";
import { t } from "../../i18n";

/** Valeur de référence pour la longueur des barres de statistiques. */
const STAT_MAX = 255;

/**
 * Fiche du Pokémon, intégrée à la fiche carte (fonctionnalité 3) :
 * nom, catégorie, description, types, stats de base, évolutions.
 * Sources PokéAPI (statiques → cache 7 jours, section 9).
 */
export function PokemonSection({ dexId }: { dexId: number }) {
  const species = usePokemonSpecies(dexId);
  const pokemon = usePokemonStats(dexId);
  const evolution = useEvolutionLine(dexId);

  return (
    <Surface className="mt-8 p-4 sm:p-5">
      <h2 className="text-lg font-semibold">{t.pokemon.sectionTitle}</h2>

      {species.isError && <p className="mt-2 text-xs text-ink-muted">{t.pokemon.unavailable}</p>}

      {species.data && (
        <div className="mt-4 grid gap-5 sm:grid-cols-[140px_1fr] sm:items-start">
          {pokemon.data && pokemonArtwork(pokemon.data) && (
            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-card bg-gradient-to-br from-accent/12 via-glass to-brand-2/12 sm:mx-0">
              <img
                src={pokemonArtwork(pokemon.data) ?? undefined}
                alt={speciesNameFr(species.data)}
                width={120}
                height={120}
                loading="lazy"
                className="h-28 w-28 object-contain"
              />
            </div>
          )}

          <div className="min-w-0">
            <p className="text-lg font-semibold leading-tight">{speciesNameFr(species.data)}</p>
            <p className="text-xs text-ink-muted">
              {speciesGenusFr(species.data)}
              {species.data.is_legendary ? ` · ${t.pokemon.legendary}` : ""}
              {species.data.is_mythical ? ` · ${t.pokemon.mythical}` : ""}
            </p>
            <p className="mt-2 text-sm text-ink-muted">{speciesFlavorFr(species.data)}</p>

            {pokemon.data && (
              <>
                {/* Types : pastilles remplies, couleur officielle du type */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {pokemon.data.types.map((type) => (
                    <span
                      key={type.type.name}
                      className="rounded-pill px-3 py-1 text-xs font-medium text-white shadow-[var(--shadow-soft)]"
                      style={{ background: typeColor(type.type.name) }}
                    >
                      {typeNameFr(type.type.name)}
                    </span>
                  ))}
                </div>

                {/* Statistiques de base : barres proportionnelles */}
                <div className="mt-4 grid gap-2 sm:grid-cols-2 sm:gap-x-5">
                  {Object.entries(pokemonStats(pokemon.data)).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-[64px_1fr_2.2rem] items-center gap-2">
                      <span className="text-[11px] text-ink-muted">{statNameFr(key)}</span>
                      <span className="h-1.5 overflow-hidden rounded-pill bg-surface-2">
                        <span
                          className="block h-full rounded-pill bg-gradient-to-r from-accent to-brand-2"
                          style={{ width: `${Math.min(100, (value / STAT_MAX) * 100)}%` }}
                        />
                      </span>
                      <span className="tabular text-right text-[11px] font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {evolution.data && evolution.data.length > 1 && (
        <div className="mt-5 border-t border-line/60 pt-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {t.pokemon.evolutions}
          </h3>
          <ul className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            {evolution.data.map((step, index) => (
              <li key={step.dexId} className="flex items-center gap-2">
                {index > 0 && (
                  <span className="text-ink-muted" aria-hidden="true">
                    →
                  </span>
                )}
                <span
                  className={[
                    "rounded-pill border px-3 py-1",
                    index === 0
                      ? "border-line/70 bg-glass text-ink-muted"
                      : "border-accent/30 bg-accent/10 text-ink",
                  ].join(" ")}
                >
                  {step.name}
                  {step.minLevel !== null && (
                    <span className="text-xs text-ink-muted"> ({t.pokemon.level(step.minLevel)})</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Surface>
  );
}
