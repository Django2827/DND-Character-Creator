import { useCharacter } from '../../state/store'
import { useRules } from '../../state/useRules'

export default function SpeciesStep() {
  const { character, compendium } = useRules()
  const update = useCharacter((s) => s.update)

  return (
    <section>
      <h2>Species</h2>
      <select
        value={character.species ?? ''}
        onChange={(e) => update({ species: e.target.value || null })}
      >
        <option value="">Choose a species…</option>
        {Object.entries(compendium.species ?? {}).map(([id, s]) => (
          <option key={id} value={id}>{s.name}</option>
        ))}
      </select>
    </section>
  )
}