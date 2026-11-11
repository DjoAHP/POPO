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
import { t } from "../../i18n";

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
    <section className="mt-8 rounded-standard border border-line bg-surface p-4">
      <h2 className="text-sm font-medium">{t.pokemon.sectionTitle}</h2>

      {species.isError && <p className="mt-2 text-xs text-ink-muted">{t.pokemon.unavailable}</p>}

      {species.data && (
        <div className="mt-3 grid gap-4 sm:grid-cols-[120px_1fr]">
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
              {species.data.is_legendary ? ` · ${t.pokemon.legendary}` : ""}
              {species.data.is_mythical ? ` · ${t.pokemon.mythical}` : ""}
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

      {evolution.data && evolution.data.length > 1 && (
        <div className="mt-4 border-t border-line pt-3">
          <h3 className="text-xs font-medium text-ink-muted">{t.pokemon.evolutions}</h3>
          <ul className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            {evolution.data.map((step, i) => (
              <li key={step.dexId} className="flex items-center gap-2">
                {i > 0 && <span className="text-ink-muted">→</span>}
                <span>
                  {step.name}
                  {step.minLevel !== null && (
                    <span className="text-xs text-ink-muted">
                      {" "}
                      ({t.pokemon.level(step.minLevel)})
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
