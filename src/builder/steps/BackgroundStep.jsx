import { useCharacter } from '../../state/store'
import { useRules } from '../../state/useRules'
import { titleCase } from '../../rules/shared'
import { Rich } from '../../sheet/parts'

export default function BackgroundStep() {
  const { character, compendium } = useRules()
  const update = useCharacter((s) => s.update)
  const bg = compendium.backgrounds?.[character.background]
  const feat = compendium.feats?.[bg?.originFeat]
  const is2024 = character.ruleset === '2024'

  return (
    <>
      <h2>Background</h2>
      <label>
        <select
          value={character.background ?? ''}
          onChange={(e) =>
            update({
              background: e.target.value || null,
              // 2024: the background decides your ability bonuses, so start them over
              ...(is2024 ? { originBonuses: {} } : {}),
            })
          }
        >
          <option value="">Choose…</option>
          {Object.entries(compendium.backgrounds ?? {}).map(([id, b]) => (
            <option key={id} value={id}>{b.name}</option>
          ))}
        </select>
      </label>

      {bg && (
        <>
          {bg.skills.length > 0 && <p>Skills: {bg.skills.map(titleCase).join(', ')} (added automatically)</p>}
          {bg.tools?.length > 0 && <p>Tools: {bg.tools.join(', ')}</p>}
          {bg.abilityOptions && <p>Ability bonus options: {bg.abilityOptions.join(', ').toUpperCase()} (set in the Abilities step)</p>}
          {feat && (
            <details>
              <summary>Origin feat: {feat.name}{bg.featNote ? ` (${bg.featNote})` : ''}</summary>
              <Rich text={feat.desc} />
            </details>
          )}
          {bg.feature?.name && (
            <details>
              <summary>Feature: {bg.feature.name}</summary>
              <Rich text={bg.feature.desc} />
            </details>
          )}
          {bg.equipment && (
            <details>
              <summary>Starting equipment</summary>
              {Array.isArray(bg.equipment) ? (
                <ul>{bg.equipment.map((t) => <li key={t}>{t}</li>)}{bg.gold && <li>{bg.gold}</li>}</ul>
              ) : (
                <Rich text={bg.equipment} />
              )}
            </details>
          )}
        </>
      )}
    </>
  )
}
