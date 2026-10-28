import { useState } from 'react'
import { useCharacter } from '../../state/store'
import { useRules } from '../../state/useRules'

const KINDS = [
  ['armor', 'Armor'],
  ['weapons', 'Weapons'],
  ['gear', 'Gear'],
]

export default function EquipmentStep() {
  const { character, compendium } = useRules()
  const update = useCharacter((s) => s.update)
  const [kind, setKind] = useState('weapons')
  const [query, setQuery] = useState('')
  const cls = compendium.classes?.[character.classes[0]?.id]
  const bg = compendium.backgrounds?.[character.background]

  const findItem = (id) => compendium.armor?.[id] ?? compendium.weapons?.[id] ?? compendium.gear?.[id]
  const list = Object.entries(compendium[kind] ?? {})
    .filter(([, i]) => i.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a[1].name.localeCompare(b[1].name))

  const add = (id) => update({ equipment: [...character.equipment, { id, equipped: false }] })
  const remove = (n) => update({ equipment: character.equipment.filter((_, i) => i !== n) })
  const toggle = (n) =>
    update({ equipment: character.equipment.map((e, i) => (i === n ? { ...e, equipped: !e.equipped } : e)) })

  return (
    <>
      <h2>Equipment</h2>
      {(cls?.startingEquipment?.length > 0 || bg?.equipment) && (
        <details>
          <summary>Starting equipment options</summary>
          {cls?.startingEquipment?.map((t, i) => <p key={i}>{t}</p>)}
          {bg && <p><b>{bg.name}:</b> {Array.isArray(bg.equipment) ? bg.equipment.join(', ') : bg.equipment}</p>}
        </details>
      )}

      <h3>Carried ({character.equipment.length})</h3>
      {character.equipment.length === 0 && <p className="muted">Nothing yet. Tick &quot;equipped&quot; for worn armor and wielded weapons so AC and attacks update.</p>}
      {character.equipment.map((e, n) => {
        const item = findItem(e.id)
        return (
          <div key={`${e.id}${n}`} className="listrow">
            <label style={{ margin: 0 }}>
              <input type="checkbox" checked={e.equipped} onChange={() => toggle(n)} /> {item?.name ?? e.id}
              {item?.category && ['light', 'medium', 'heavy', 'shield'].includes(item.category) && <small> · {item.category} armor</small>}
            </label>
            <button onClick={() => remove(n)}>Remove</button>
          </div>
        )
      })}

      <h3>Add</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {KINDS.map(([k, label]) => (
          <button key={k} onClick={() => setKind(k)} aria-pressed={kind === k}>{label}</button>
        ))}
        <input type="search" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="scroll">
        {list.map(([id, i]) => (
          <div key={id} className="listrow">
            <span>
              {i.name}{' '}
              <small>
                {i.damage ? `${i.damage} ${i.damageType?.toLowerCase()}` : i.baseAc ? `AC ${i.baseAc}` : ''}
                {i.cost ? ` · ${i.cost}` : ''}
              </small>
            </span>
            <button onClick={() => add(id)}>Add</button>
          </div>
        ))}
      </div>
    </>
  )
}
