import { useCharacter } from '../../state/store'
import { useRules } from '../../state/useRules'
import { allRulesets } from '../../rules'
import { findProblems } from '../../model/problems'

export default function RulesStep() {
  const { character, compendium } = useRules()
  const update = useCharacter((s) => s.update)
  const newCharacter = useCharacter((s) => s.newCharacter)
  const problems = findProblems(character, compendium)

  return (
    <>
      <h2>Rules</h2>
      <label>
        Ruleset:{' '}
        <select value={character.ruleset} onChange={(e) => update({ ruleset: e.target.value })}>
          {allRulesets.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      </label>
      <p>
        You can switch at any time. Anything that doesn&apos;t exist in the other ruleset
        gets flagged below, and the 2014 and 2024 rules handle ability bonuses differently
        (species in 2014, background in 2024), so revisit the Abilities step after switching.
      </p>
      {problems.length > 0 && (
        <ul className="warn">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
      )}
      <button
        onClick={() => {
          if (confirm('Start a new character? The current one will be cleared (export it first).')) {
            newCharacter(character.ruleset)
          }
        }}
      >
        New character
      </button>
    </>
  )
}
