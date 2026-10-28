// Pure state transitions for play: damage, healing, casting, resting.
// Each takes the character's `state` object and returns a new one (or null if the
// action isn't possible), so they're easy to test and work the same in the app
// and in the exported sheet.

export const currentHp = (state, stats) => state.currentHp ?? stats.maxHp

export function applyDamage(state, stats, amount) {
  let left = Math.max(0, amount)
  const absorbed = Math.min(state.tempHp ?? 0, left)
  left -= absorbed
  const hp = Math.max(0, currentHp(state, stats) - left)
  return { ...state, tempHp: (state.tempHp ?? 0) - absorbed, currentHp: hp }
}

export function applyHealing(state, stats, amount) {
  const hp = Math.min(stats.maxHp, currentHp(state, stats) + Math.max(0, amount))
  // healing from 0 HP ends the death save count
  const deathSaves = hp > 0 ? { successes: 0, failures: 0 } : state.deathSaves
  return { ...state, currentHp: hp, deathSaves }
}

export const slotsTotal = (stats, level) => stats.spell?.slots?.[level - 1] ?? 0
export const slotsUsed = (state, level) => state.spellSlotsUsed?.[level] ?? 0
export const slotsLeft = (state, stats, level) => slotsTotal(stats, level) - slotsUsed(state, level)

// Cast a spell. Cantrips and rituals cost nothing. Returns null if there is no slot.
export function castSpell(state, stats, spell, spellId, { slotLevel = spell.level, ritual = false } = {}) {
  let next = { ...state }
  if (spell.level > 0 && !ritual) {
    if (slotLevel < spell.level || slotsLeft(state, stats, slotLevel) <= 0) return null
    next.spellSlotsUsed = { ...state.spellSlotsUsed, [slotLevel]: slotsUsed(state, slotLevel) + 1 }
  }
  // starting a new concentration spell ends the old one
  if (spell.concentration) next.concentration = spellId
  return next
}

export const endConcentration = (state) => ({ ...state, concentration: null })

export function spendHitDie(state, stats, die, rolled) {
  const used = state.hitDiceUsed?.[die] ?? 0
  if (used >= (stats.hitDice[die] ?? 0)) return null
  const healed = Math.max(0, rolled + stats.mods.con)
  const healedState = applyHealing(state, stats, healed)
  return { ...healedState, hitDiceUsed: { ...state.hitDiceUsed, [die]: used + 1 } }
}

// Short rest: pact magic slots come back. (Hit dice are spent one at a time.)
export function shortRest(state, stats) {
  return stats.spell?.pact ? { ...state, spellSlotsUsed: {} } : state
}

// Long rest: full HP, all slots, and half your total hit dice (at least one).
export function longRest(state, stats) {
  const total = Object.values(stats.hitDice).reduce((a, b) => a + b, 0)
  let regain = Math.max(1, Math.floor(total / 2))
  const hitDiceUsed = { ...state.hitDiceUsed }
  for (const die of Object.keys(hitDiceUsed).sort((a, b) => b - a)) {
    const back = Math.min(regain, hitDiceUsed[die])
    hitDiceUsed[die] -= back
    regain -= back
  }
  return {
    ...state,
    currentHp: null,
    tempHp: 0,
    hitDiceUsed,
    spellSlotsUsed: {},
    concentration: null,
    deathSaves: { successes: 0, failures: 0 },
  }
}
