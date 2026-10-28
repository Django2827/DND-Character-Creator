import { useCharacter } from '../../state/store'
import { ALIGNMENTS } from '../../rules/shared'

const AREAS = [
  ['personality', 'Personality traits'],
  ['ideals', 'Ideals'],
  ['bonds', 'Bonds'],
  ['flaws', 'Flaws'],
  ['appearance', 'Appearance'],
  ['notes', 'Notes'],
]

export default function DetailsStep() {
  const character = useCharacter((s) => s.character)
  const update = useCharacter((s) => s.update)
  const updateDetails = useCharacter((s) => s.updateDetails)
  const d = character.details

  return (
    <>
      <h2>Details</h2>
      <label>
        Character name: <input type="text" value={character.name} onChange={(e) => update({ name: e.target.value })} />
      </label>
      <label>
        Player: <input type="text" value={d.playerName} onChange={(e) => updateDetails({ playerName: e.target.value })} />
      </label>
      <label>
        Alignment:{' '}
        <select value={d.alignment} onChange={(e) => updateDetails({ alignment: e.target.value })}>
          <option value="">—</option>
          {ALIGNMENTS.map((a) => <option key={a}>{a}</option>)}
        </select>
      </label>
      {AREAS.map(([k, label]) => (
        <label key={k}>
          {label}
          <textarea value={d[k]} onChange={(e) => updateDetails({ [k]: e.target.value })} />
        </label>
      ))}
    </>
  )
}
