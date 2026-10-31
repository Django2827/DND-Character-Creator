import { useState } from 'react'
import { Box, Pips, Rich } from './parts'
import { ordinal, fmt, ABILITY_NAMES } from '../rules/shared'
import { castableSpells, spellDamageDice, hasSpellAttack } from '../model/spells'
import { castSpell, endConcentration, slotsLeft } from '../model/actions'
import { getSubclassSpells } from '../model/derive'
import { useRules } from '../state/useRules.js'

export default function SpellPanel({ character, stats, compendium, onStateChange, onRoll }) {
  const sp = stats.spell
  const [choice, setChoice] = useState({}) // spellId -> chosen slot level
  const state = character?.state || {}
  const rules = useRules()

  // 1. Retrieve subclass domain / granted spells for character level
  const domainSpellIds = getSubclassSpells(character, rules)
  const isDomainSpell = (spellId) => domainSpellIds.includes(spellId)

  // 2. Safely normalize prepared spells regardless of legacy data type (Array vs Object vs null)
  const preparedSpellIds = Array.isArray(character?.spells)
    ? character.spells
    : character?.spells && typeof character.spells === 'object'
      ? Object.keys(character.spells)
      : []

  // Combine active prepared spells and domain spells without duplicates
  const allActiveSpellIds = Array.from(new Set([...preparedSpellIds, ...domainSpellIds]))

  // 3. Inject normalized spells array so castableSpells processes both sets seamlessly
  const characterWithNormalizedSpells = {
    ...character,
    spells: allActiveSpellIds,
  }

  // 4. Compute castable spells
  const { cantrips, leveled, rituals } = castableSpells(characterWithNormalizedSpells, stats, compendium)

  const byLevel = {}
  for (const id of leveled) {
    const spellData = compendium?.spells?.[id] || rules?.spells?.[id]
    const level = spellData?.level ?? 0
    ;(byLevel[level] ??= []).push(id)
  }

  const options = (spell) => {
    const out = []
    for (let l = spell.level; l <= 9; l++) if (slotsLeft(state, stats, l) > 0) out.push(l)
    return out
  }

  function cast(id, opts = {}) {
    const spell = compendium?.spells?.[id] || rules?.spells?.[id]
    if (!spell) return onRoll(`Spell definition missing for ${id}`)

    const next = castSpell(state, stats, spell, id, opts)
    if (!next) return onRoll(`No spell slot left for ${spell.name}`)
    
    onStateChange(next)
    const how = opts.ritual
      ? ' (ritual)'
      : spell.level > 0
        ? ` at ${ordinal(opts.slotLevel ?? spell.level)} level`
        : ''
    onRoll(`Cast ${spell.name}${how}${spell.concentration ? ' - concentrating' : ''}`)
  }

  function damage(id, slotLevel) {
    const spell = compendium?.spells?.[id] || rules?.spells?.[id]
    if (!spell) return
    const dice = spellDamageDice(spell, slotLevel ?? spell.level, stats.level)
    if (dice) onRoll({ expr: dice, label: `${spell.name} ${spell.damage?.type?.toLowerCase() || ''} damage` })
  }

  const row = (id, { ritual = false } = {}) => {
    // Lookup spell with a safe fallback object for missing definitions
    const spell = compendium?.spells?.[id] || rules?.spells?.[id] || {
      id,
      name: id.includes(':') ? id.split(':').slice(1).join(':') : id,
      level: 0,
      school: 'Unknown',
      desc: 'Spell details not found in active rules or packs.',
      isMissing: true,
    }

    const opts = spell.level > 0 && !ritual ? options(spell) : []
    const slotLevel = choice[id] && opts.includes(choice[id]) ? choice[id] : opts[0]
    const canCast = spell.level === 0 || ritual || opts.length > 0
    const dice = spell.damage ? spellDamageDice(spell, slotLevel ?? spell.level, stats.level) : null

    return (
      <li key={`${id}${ritual ? '-r' : ''}`} className={`spell ${spell.isMissing ? 'spell--missing' : ''}`}>
        <details>
          <summary>
            <span className="spell__name">{spell.name}</span>
            <span className="spell__tags">
              {spell.concentration && <abbr title="Concentration">C</abbr>}
              {spell.ritual && <abbr title="Ritual">R</abbr>}
              {isDomainSpell(id) && <abbr className="domain-abbr" title="Domain / Subclass Spell">Domain</abbr>}
              {spell.isMissing && <abbr className="missing-abbr" title="Missing Spell Data">?</abbr>}
              <span>{spell.school}</span>
            </span>
          </summary>
          <p className="spell__meta">
            {spell.castingTime || '1 action'} · {spell.range || 'Self'} · {spell.components || 'V, S'}
            {spell.material ? ` (${spell.material})` : ''} · {spell.duration || 'Instantaneous'}
          </p>
          <Rich text={spell.desc} />
          {spell.higherLevel && <Rich text={`**At higher levels.** ${spell.higherLevel}`} />}
        </details>
        <span className="spell__actions">
          {opts.length > 1 && (
            <select
              aria-label={`Slot level for ${spell.name}`}
              value={slotLevel}
              onChange={(e) => setChoice({ ...choice, [id]: Number(e.target.value) })}
            >
              {opts.map((l) => (
                <option key={l} value={l}>
                  {ordinal(l)} ({slotsLeft(state, stats, l)} left)
                </option>
              ))}
            </select>
          )}
          <button disabled={!canCast || spell.isMissing} onClick={() => cast(id, ritual ? { ritual: true } : { slotLevel })}>
            {ritual ? 'Ritual' : 'Cast'}
          </button>
          {hasSpellAttack(spell) && (
            <button onClick={() => onRoll({ d20: true, bonus: sp.attack, label: `${spell.name} attack` })}>
              Atk
            </button>
          )}
          {dice && <button onClick={() => damage(id, slotLevel)}>Dmg {dice}</button>}
        </span>
      </li>
    )
  }

  const concentrating = state.concentration
    ? compendium?.spells?.[state.concentration] || rules?.spells?.[state.concentration]
    : null

  return (
    <Box className="spellpanel" title="Spellcasting">
      <div className="spellpanel__head">
        <div>
          <strong>{ABILITY_NAMES[sp.ability] || 'INT'}</strong>
          <small>Spellcasting ability</small>
        </div>
        <div>
          <strong>{sp.saveDc}</strong>
          <small>Spell save DC</small>
        </div>
        <div>
          <strong>{fmt(sp.attack)}</strong>
          <small>Spell attack</small>
        </div>
      </div>

      {concentrating && (
        <p className="concentration">
          Concentrating on <strong>{concentrating.name}</strong>
          <button onClick={() => onStateChange(endConcentration(state))}>End</button>
        </p>
      )}

      <div className="slots">
        {sp.slots.map((total, i) =>
          total > 0 ? (
            <div key={i} className="slots__row">
              <span>{sp.pact ? `Pact slots (${ordinal(i + 1)} level)` : `${ordinal(i + 1)} level`}</span>
              <Pips
                total={total}
                used={state.spellSlotsUsed?.[i + 1] ?? 0}
                label={`${ordinal(i + 1)} level slot`}
                onChange={(n) => onStateChange({ ...state, spellSlotsUsed: { ...state.spellSlotsUsed, [i + 1]: n } })}
              />
            </div>
          ) : null
        )}
      </div>

      {cantrips.length > 0 && (
        <>
          <h4>Cantrips</h4>
          <ul className="spells">{cantrips.map((id) => row(id))}</ul>
        </>
      )}
      {Object.keys(byLevel)
        .map(Number)
        .sort((a, b) => a - b)
        .map((lvl) => (
          <div key={lvl}>
            <h4>{ordinal(lvl)} level</h4>
            <ul className="spells">{byLevel[lvl].map((id) => row(id))}</ul>
          </div>
        ))}
      {rituals.length > 0 && (
        <>
          <h4>Rituals from spellbook</h4>
          <ul className="spells">{rituals.map((id) => row(id, { ritual: true }))}</ul>
        </>
      )}
      {cantrips.length + leveled.length === 0 && (
        <p className="muted">No spells chosen yet. Add some in the Spells step.</p>
      )}
    </Box>
  )
}