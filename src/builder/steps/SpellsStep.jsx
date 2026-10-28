import { useState } from 'react'
import { useCharacter } from '../../state/store'
import { useRules } from '../../state/useRules'
import { spellsForClass } from '../../model/spells'
import { ordinal } from '../../rules/shared'
import { Rich } from '../../sheet/parts'

export default function SpellsStep() {
  const { character, compendium, stats } = useRules()
  const update = useCharacter((s) => s.update)
  const [query, setQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')

  const sp = stats.spell
  const classId = character.classes[0]?.id
  const cls = compendium.classes?.[classId]

  if (!sp) {
    const start = cls?.spellcasting?.startLevel
    return (
      <>
        <h2>Spells</h2>
        <p className="muted">
          {!cls
            ? 'Pick a class first.'
            : start
              ? `${cls.name}s gain spellcasting at level ${start}.`
              : `${cls.name}s don't cast spells.`}
        </p>
      </>
    )
  }

  const known = new Set(character.spells.known)
  const prepared = new Set(character.spells.prepared)
  const levelOf = (id) => compendium.spells[id]?.level ?? -1
  const count = (set, pred) => [...set].filter((id) => pred(levelOf(id))).length

  const setList = (key, id, on) => {
    const set = new Set(character.spells[key])
    if (on) set.add(id)
    else set.delete(id)
    const next = { ...character.spells, [key]: [...set] }
    // dropping a spell from the spellbook also un-prepares it
    if (key === 'known' && !on) next.prepared = next.prepared.filter((p) => p !== id)
    update({ spells: next })
  }

  const hasKnownColumn = sp.mode === 'known' || sp.spellbook
  const hasPreparedColumn = sp.mode === 'prepared'
  const counters = [
    { label: 'Cantrips', n: count(known, (l) => l === 0), max: sp.cantripsMax },
    sp.mode === 'known' && !sp.spellbook
      ? { label: 'Spells known', n: count(known, (l) => l > 0), max: sp.limit }
      : { label: 'Spells prepared', n: count(prepared, (l) => l > 0), max: sp.limit },
    sp.spellbook ? { label: 'In spellbook', n: count(known, (l) => l > 0), max: null } : null,
  ].filter(Boolean)

  const rows = spellsForClass(compendium, classId)
    .filter(([, s]) => s.level <= sp.maxSlotLevel)
    .filter(([, s]) => levelFilter === 'all' || s.level === Number(levelFilter))
    .filter(([, s]) => s.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <>
      <h2>Spells</h2>
      <p className="chips">
        {counters.map((c) => (
          <span key={c.label} className={c.max != null && c.n > c.max ? 'warn' : c.n === c.max ? 'ok' : ''}>
            <b>{c.label}:</b> {c.n}{c.max != null ? ` / ${c.max}` : ''}
          </span>
        ))}
      </p>
      <p className="muted">
        {sp.spellbook
          ? 'Add spells to your spellbook, then prepare some of them.'
          : sp.mode === 'known'
            ? 'You know a fixed number of spells and can cast any of them.'
            : 'You prepare spells from your whole class list.'}
        {' '}Spell slots come from your class level ({sp.slots.length ? 'see the sheet' : 'none yet'}).
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input type="search" placeholder="Search spells…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} aria-label="Spell level">
          <option value="all">All levels</option>
          {Array.from({ length: sp.maxSlotLevel + 1 }, (_, l) => (
            <option key={l} value={l}>{l === 0 ? 'Cantrips' : ordinal(l)}</option>
          ))}
        </select>
      </div>

      <div className="scroll">
        {rows.map(([id, s]) => (
          <details key={id} className="listrow" style={{ display: 'block' }}>
            <summary style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <span>
                {s.name} <small>{s.level === 0 ? 'cantrip' : ordinal(s.level)} · {s.school}</small>
              </span>
              <span onClick={(e) => e.stopPropagation()}>
                {(s.level === 0 || hasKnownColumn) && (
                  <label style={{ display: 'inline', marginRight: 10 }}>
                    <input type="checkbox" checked={known.has(id)} onChange={(e) => setList('known', id, e.target.checked)} />{' '}
                    {s.level === 0 ? 'Known' : sp.spellbook ? 'Spellbook' : 'Known'}
                  </label>
                )}
                {s.level > 0 && hasPreparedColumn && (
                  <label style={{ display: 'inline' }}>
                    <input
                      type="checkbox"
                      checked={prepared.has(id)}
                      disabled={sp.spellbook && !known.has(id)}
                      onChange={(e) => setList('prepared', id, e.target.checked)}
                    />{' '}
                    Prepared
                  </label>
                )}
              </span>
            </summary>
            <p><small>{s.castingTime} · {s.range} · {s.components} · {s.duration}{s.concentration ? ' · concentration' : ''}{s.ritual ? ' · ritual' : ''}</small></p>
            <Rich text={s.desc} />
            {s.higherLevel && <Rich text={`**At higher levels.** ${s.higherLevel}`} />}
          </details>
        ))}
        {rows.length === 0 && <p className="muted">No spells match.</p>}
      </div>
    </>
  )
}
