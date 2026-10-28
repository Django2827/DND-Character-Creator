import { useState } from 'react'
import { Box, Pips, Rich } from './parts'
import { ordinal, fmt, ABILITY_NAMES } from '../rules/shared'
import { castableSpells, spellDamageDice, hasSpellAttack } from '../model/spells'
import { castSpell, endConcentration, slotsLeft } from '../model/actions'

export default function SpellPanel({ character, stats, compendium, onStateChange, onRoll }) {
  const sp = stats.spell
  const [choice, setChoice] = useState({}) // spellId -> chosen slot level
  const state = character.state

  const { cantrips, leveled, rituals } = castableSpells(character, stats, compendium)
  const byLevel = {}
  for (const id of leveled) (byLevel[compendium.spells[id].level] ??= []).push(id)

  const options = (spell) => {
    const out = []
    for (let l = spell.level; l <= 9; l++) if (slotsLeft(state, stats, l) > 0) out.push(l)
    return out
  }

  function cast(id, opts = {}) {
    const spell = compendium.spells[id]
    const next = castSpell(state, stats, spell, id, opts)
    if (!next) return onRoll(`No spell slot left for ${spell.name}`)
    onStateChange(next)
    const how = opts.ritual ? ' (ritual)' : spell.level > 0 ? ` at ${ordinal(opts.slotLevel ?? spell.level)} level` : ''
    onRoll(`Cast ${spell.name}${how}${spell.concentration ? ' - concentrating' : ''}`)
  }

  function damage(id, slotLevel) {
    const spell = compendium.spells[id]
    const dice = spellDamageDice(spell, slotLevel ?? spell.level, stats.level)
    if (dice) onRoll({ expr: dice, label: `${spell.name} ${spell.damage.type.toLowerCase()} damage` })
  }

  const row = (id, { ritual = false } = {}) => {
    const spell = compendium.spells[id]
    const opts = spell.level > 0 && !ritual ? options(spell) : []
    const slotLevel = choice[id] && opts.includes(choice[id]) ? choice[id] : opts[0]
    const canCast = spell.level === 0 || ritual || opts.length > 0
    const dice = spellDamageDice(spell, slotLevel ?? spell.level, stats.level)

    return (
      <li key={`${id}${ritual ? '-r' : ''}`} className="spell">
        <details>
          <summary>
            <span className="spell__name">{spell.name}</span>
            <span className="spell__tags">
              {spell.concentration && <abbr title="Concentration">C</abbr>}
              {spell.ritual && <abbr title="Ritual">R</abbr>}
              <span>{spell.school}</span>
            </span>
          </summary>
          <p className="spell__meta">
            {spell.castingTime} · {spell.range} · {spell.components}
            {spell.material ? ` (${spell.material})` : ''} · {spell.duration}
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
          <button disabled={!canCast} onClick={() => cast(id, ritual ? { ritual: true } : { slotLevel })}>
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

  const concentrating = state.concentration ? compendium.spells?.[state.concentration] : null

  return (
    <Box className="spellpanel" title="Spellcasting">
      <div className="spellpanel__head">
        <div>
          <strong>{ABILITY_NAMES[sp.ability]}</strong>
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
                onChange={(n) => onStateChange({ spellSlotsUsed: { ...state.spellSlotsUsed, [i + 1]: n } })}
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
