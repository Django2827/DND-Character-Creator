import { useCharacter } from '../../state/store'
import { useRules } from '../../state/useRules'
import {
  ABILITIES,
  ABILITY_NAMES,
  POINT_BUY_BUDGET,
  STANDARD_ARRAY,
  fmt,
  pointsSpent,
} from '../../rules/shared'

// valid 2024 background bonus: +2/+1, or +1/+1/+1
function originProblem(bonuses) {
  const vals = Object.values(bonuses).filter((v) => v > 0).sort((a, b) => b - a)
  const ok = (vals.length === 2 && vals[0] === 2 && vals[1] === 1) || (vals.length === 3 && vals.every((v) => v === 1))
  return ok ? null : 'Choose +2 to one ability and +1 to another, or +1 to three abilities.'
}

export default function AbilitiesStep() {
  const { character, compendium, stats } = useRules()
  const update = useCharacter((s) => s.update)
  const is2024 = character.ruleset === '2024'
  const bg = compendium.backgrounds?.[character.background]
  const species = compendium.species?.[character.species]
  const scores = character.abilityScores

  const setScore = (a, v) =>
    update({ abilityScores: { ...scores, [a]: Math.min(20, Math.max(3, Number(v) || 3)) } })
  const spent = pointsSpent(scores)
  const pointBuyShape = Object.values(scores).every((v) => v >= 8 && v <= 15)

  // the player-chosen part of the bonuses
  const chosen = character.originBonuses ?? {}
  const setChosen = (a, v) => {
    const next = { ...chosen, [a]: v }
    if (!v) delete next[a]
    update({ originBonuses: next })
  }
  const choice2014 = species?.abilityBonusChoice
  const picked2014 = Object.keys(chosen).length

  return (
    <>
      <h2>Ability scores</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => update({ abilityScores: Object.fromEntries(ABILITIES.map((a) => [a, 8])) })}>
          Point buy (reset to 8s)
        </button>
        <button
          onClick={() =>
            update({ abilityScores: Object.fromEntries(ABILITIES.map((a, i) => [a, STANDARD_ARRAY[i]])) })
          }
        >
          Standard array
        </button>
      </div>
      <p className={pointBuyShape && spent > POINT_BUY_BUDGET ? 'warn' : ''}>
        {pointBuyShape
          ? `Point buy: ${spent} / ${POINT_BUY_BUDGET} points spent`
          : 'Scores outside 8–15 (rolled or custom): the point-buy tally is hidden.'}
      </p>

      <table>
        <thead>
          <tr><th>Ability</th><th>Base</th><th>Bonus</th><th>Total</th><th>Mod</th></tr>
        </thead>
        <tbody>
          {ABILITIES.map((a) => (
            <tr key={a}>
              <td>{ABILITY_NAMES[a]}</td>
              <td>
                <input
                  type="number"
                  min="3"
                  max="20"
                  style={{ width: '4.5em' }}
                  value={scores[a]}
                  onChange={(e) => setScore(a, e.target.value)}
                />
              </td>
              <td>{stats.scores[a] - scores[a] > 0 ? `+${stats.scores[a] - scores[a]}` : '—'}</td>
              <td>{stats.scores[a]}</td>
              <td>{fmt(stats.mods[a])}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {is2024 && bg?.abilityOptions && (
        <>
          <h3>Background bonus ({bg.name})</h3>
          <div className="chips">
            {bg.abilityOptions.map((a) => (
              <label key={a}>
                {ABILITY_NAMES[a]}{' '}
                <select value={chosen[a] ?? 0} onChange={(e) => setChosen(a, Number(e.target.value))}>
                  <option value={0}>+0</option>
                  <option value={1}>+1</option>
                  <option value={2}>+2</option>
                </select>
              </label>
            ))}
          </div>
          {originProblem(chosen) && <p className="warn">{originProblem(chosen)}</p>}
        </>
      )}
      {is2024 && !bg && <p className="muted">Pick a background first to get its ability bonuses.</p>}

      {!is2024 && (
        <>
          <p>Racial bonuses are applied automatically from your race and subrace.</p>
          {choice2014 && (
            <>
              <h3>
                {species.name}: choose {choice2014.choose} abilities for +{choice2014.amount}
              </h3>
              <div className="chips">
                {choice2014.from.map((a) => (
                  <label key={a}>
                    <input
                      type="checkbox"
                      checked={!!chosen[a]}
                      disabled={!chosen[a] && picked2014 >= choice2014.choose}
                      onChange={(e) => setChosen(a, e.target.checked ? choice2014.amount : 0)}
                    />{' '}
                    {ABILITY_NAMES[a]}
                  </label>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </>
  )
}
