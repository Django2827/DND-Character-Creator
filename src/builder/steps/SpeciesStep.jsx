import { useCharacter } from '../../state/store'
import { useRules } from '../../state/useRules'
import { Rich } from '../../sheet/parts'

const byName = (a, b) => a[1].name.localeCompare(b[1].name)

export default function SpeciesStep() {
  const { character, compendium } = useRules()
  const update = useCharacter((s) => s.update)
  const species = compendium.species?.[character.species]
  const subs = (species?.subspecies ?? [])
    .map((id) => [id, compendium.subspecies?.[id]])
    .filter(([, s]) => s)
  const sub = compendium.subspecies?.[character.subspecies]
  const is2014 = character.ruleset === '2014'

  return (
    <>
      <h2>{is2014 ? 'Race' : 'Species'}</h2>
      <label>
        <select
          value={character.species ?? ''}
          onChange={(e) =>
            update({
              species: e.target.value || null,
              subspecies: null,
              // 2014: ability choices belong to the race; 2024: they belong to the background
              ...(is2014 ? { originBonuses: {} } : {}),
            })
          }
        >
          <option value="">Choose…</option>
          {Object.entries(compendium.species ?? {}).sort(byName).map(([id, s]) => (
            <option key={id} value={id}>{s.name}</option>
          ))}
        </select>
      </label>

      {subs.length > 0 && (
        <label>
          {is2014 ? 'Subrace' : 'Lineage / ancestry'}:{' '}
          <select
            value={character.subspecies ?? ''}
            onChange={(e) => update({ subspecies: e.target.value || null })}
          >
            <option value="">Choose…</option>
            {subs.sort(byName).map(([id, s]) => (
              <option key={id} value={id}>{s.name}</option>
            ))}
          </select>
        </label>
      )}

      {species && (
        <p>
          {species.size} · speed {species.speed} ft
          {species.languages?.length ? ` · ${species.languages.join(', ')}` : ''}
        </p>
      )}
      {[species, sub].filter(Boolean).map((entry) => (
        <div key={entry.name}>
          {entry.traits.map((t) => (
            <details key={t.name}>
              <summary>{t.name}</summary>
              <Rich text={t.desc} />
            </details>
          ))}
        </div>
      ))}
    </>
  )
}
