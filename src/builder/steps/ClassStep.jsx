import { useCharacter } from '../../state/store'
import { useRules } from '../../state/useRules'
import { ABILITY_NAMES, titleCase } from '../../rules/shared'
import { Rich } from '../../sheet/parts'

export default function ClassStep() {
  const { character, compendium, stats } = useRules()
  const update = useCharacter((s) => s.update)
  const c = character.classes[0]
  const cls = compendium.classes?.[c.id]
  const subs = (cls?.subclasses ?? []).map((id) => [id, compendium.subclasses?.[id]]).filter(([, s]) => s)
  const setClass = (patch) => update({ classes: [{ ...c, ...patch }] })

  return (
    <>
      <h2>Class</h2>
      <label>
        <select
          value={c.id ?? ''}
          onChange={(e) => {
            update({
              classes: [{ id: e.target.value || null, subclass: null, level: c.level }],
              skills: [],
              spells: { known: [], prepared: [] },
            })
          }}
        >
          <option value="">Choose…</option>
          {Object.entries(compendium.classes ?? {}).map(([id, k]) => (
            <option key={id} value={id}>{k.name}</option>
          ))}
        </select>
      </label>
      <label>
        Level:{' '}
        <input
          type="number"
          min="1"
          max="20"
          value={c.level}
          onChange={(e) => {
            const level = Math.min(20, Math.max(1, Number(e.target.value) || 1))
            setClass({ level, subclass: cls && level < cls.subclassLevel ? null : c.subclass })
          }}
        />
      </label>

      {cls && (
        <>
          <p>
            Hit die d{cls.hitDie} · saves {cls.saves.map((s) => ABILITY_NAMES[s]).join(', ')}
            {cls.primaryAbility ? ` · primary ability ${cls.primaryAbility}` : ''}
          </p>
          <p>Proficiencies: {cls.proficiencies.join(', ') || 'none'}</p>
          {cls.skillChoices.choose > 0 && (
            <p>Choose {cls.skillChoices.choose} skills (Skills step): {cls.skillChoices.from.map(titleCase).join(', ')}</p>
          )}

          {subs.length > 0 && (
            <label>
              Subclass (from level {cls.subclassLevel}):{' '}
              <select
                disabled={c.level < cls.subclassLevel}
                value={c.subclass ?? ''}
                onChange={(e) => setClass({ subclass: e.target.value || null })}
              >
                <option value="">Choose…</option>
                {subs.map(([id, s]) => (
                  <option key={id} value={id}>{s.name}</option>
                ))}
              </select>
            </label>
          )}

          {cls.startingEquipment.length > 0 && (
            <details>
              <summary>Starting equipment</summary>
              <ul>{cls.startingEquipment.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </details>
          )}

          <h3>Features up to level {c.level}</h3>
          {stats.features
            .filter((f) => f.source === cls.name || f.source === compendium.subclasses?.[c.subclass]?.name)
            .map((f, i) => (
              <details key={`${f.name}${i}`}>
                <summary>{f.name} <small>level {f.level}</small></summary>
                <Rich text={f.desc} />
                {f.options?.map((o) => (
                  <details key={o.name} style={{ marginLeft: 14 }}>
                    <summary>{o.name}</summary>
                    <Rich text={o.desc} />
                  </details>
                ))}
              </details>
            ))}
        </>
      )}
    </>
  )
}
