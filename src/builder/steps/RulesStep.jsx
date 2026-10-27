import { useCharacter } from '../../state/store'
import { useRules } from '../../state/useRules'
import { allRulesets } from '../../rules'
import { findProblems } from '../../model/problems'

export default function RulesStep() {
  const { character, compendium } = useRules()
  const update = useCharacter((s) => s.update)
  const problems = findProblems(character, compendium)

  return (
    <section>
      <h2>Rules</h2>
      <select value={character.ruleset} onChange={(e) => update({ ruleset: e.target.value })}>
        {allRulesets.map((r) => (
          <option key={r.id} value={r.id}>{r.label}</option>
        ))}
      </select>

      {problems.length > 0 && (
        <ul>
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
    </section>
  )
}