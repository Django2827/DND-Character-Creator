import { describe, it, expect } from 'vitest'
import { setup } from './testUtils'
import { emptyState } from './character'
import {
  applyDamage,
  applyHealing,
  castSpell,
  endConcentration,
  longRest,
  shortRest,
  slotsLeft,
  spendHitDie,
} from './actions'
import { castableSpells, spellDamageDice, spellsForClass } from './spells'

const wizard = () =>
  setup({
    classes: [{ id: 'srd52:wizard', subclass: null, level: 5 }],
    abilityScores: { str: 8, dex: 14, con: 14, int: 17, wis: 12, cha: 10 },
  })

describe('hit points', () => {
  const { stats } = setup({
    classes: [{ id: 'srd52:fighter', subclass: null, level: 3 }],
    abilityScores: { str: 15, dex: 12, con: 14, int: 8, wis: 10, cha: 10 },
  })

  it('temp HP absorbs damage first, and HP stops at 0', () => {
    let s = { ...emptyState(), tempHp: 5 }
    s = applyDamage(s, stats, 8)
    expect(s.tempHp).toBe(0)
    expect(s.currentHp).toBe(stats.maxHp - 3)
    s = applyDamage(s, stats, 999)
    expect(s.currentHp).toBe(0)
  })

  it('healing caps at max HP and clears death saves', () => {
    let s = { ...emptyState(), currentHp: 0, deathSaves: { successes: 1, failures: 2 } }
    s = applyHealing(s, stats, 4)
    expect(s.currentHp).toBe(4)
    expect(s.deathSaves).toEqual({ successes: 0, failures: 0 })
    expect(applyHealing(s, stats, 999).currentHp).toBe(stats.maxHp)
  })

  it('spending hit dice heals and runs out', () => {
    let s = { ...emptyState(), currentHp: 1 }
    s = spendHitDie(s, stats, 10, 6) // 6 + con mod 2
    expect(s.currentHp).toBe(9)
    s = spendHitDie(s, stats, 10, 1)
    s = spendHitDie(s, stats, 10, 1)
    expect(spendHitDie(s, stats, 10, 1)).toBeNull() // only three d10
  })
})

describe('casting', () => {
  const { stats, compendium } = wizard()
  const fireball = compendium.spells['srd52:fireball']
  const fireBolt = compendium.spells['srd52:fire-bolt']

  it('spends the chosen slot level and upcasts', () => {
    let s = emptyState()
    s = castSpell(s, stats, fireball, 'srd52:fireball', { slotLevel: 3 })
    expect(slotsLeft(s, stats, 3)).toBe(1)
    s = castSpell(s, stats, fireball, 'srd52:fireball', { slotLevel: 3 })
    expect(slotsLeft(s, stats, 3)).toBe(0)
    expect(castSpell(s, stats, fireball, 'srd52:fireball', { slotLevel: 3 })).toBeNull()
  })

  it('refuses a slot below the spell level or above what you have', () => {
    expect(castSpell(emptyState(), stats, fireball, 'srd52:fireball', { slotLevel: 2 })).toBeNull()
    expect(castSpell(emptyState(), stats, fireball, 'srd52:fireball', { slotLevel: 4 })).toBeNull()
  })

  it('cantrips and rituals are free', () => {
    const s = castSpell(emptyState(), stats, fireBolt, 'srd52:fire-bolt')
    expect(s.spellSlotsUsed).toEqual({})
    const detect = compendium.spells['srd52:detect-magic']
    const r = castSpell(emptyState(), stats, detect, 'srd52:detect-magic', { ritual: true })
    expect(r.spellSlotsUsed).toEqual({})
  })

  it('concentration swaps and ends', () => {
    const haste = compendium.spells['srd52:haste']
    const fly = compendium.spells['srd52:fly']
    expect(haste.concentration).toBe(true)
    let s = castSpell(emptyState(), stats, haste, 'srd52:haste', { slotLevel: 3 })
    expect(s.concentration).toBe('srd52:haste')
    s = castSpell(s, stats, fly, 'srd52:fly', { slotLevel: 3 })
    expect(s.concentration).toBe('srd52:fly')
    expect(endConcentration(s).concentration).toBeNull()
  })

  it('damage dice follow slot level and character level', () => {
    expect(spellDamageDice(fireball, 3, 5)).toBe('8d6')
    expect(spellDamageDice(fireball, 5, 9)).toBe('10d6')
    expect(spellDamageDice(fireBolt, 0, 1)).toBe('1d10')
    expect(spellDamageDice(fireBolt, 0, 5)).toBe('2d10')
    expect(spellDamageDice(fireBolt, 0, 17)).toBe('4d10')
    const old = setup({}, '2014').compendium.spells['srd51:fire-bolt']
    expect(spellDamageDice(old, 0, 11)).toBe('3d10')
  })
})

describe('resting', () => {
  const { stats } = wizard()

  it('a long rest restores HP, slots, concentration and half the hit dice', () => {
    const state = {
      ...emptyState(),
      currentHp: 3,
      tempHp: 4,
      spellSlotsUsed: { 1: 4, 3: 2 },
      concentration: 'srd52:haste',
      hitDiceUsed: { 6: 4 },
    }
    const next = longRest(state, stats)
    expect(next.currentHp).toBeNull()
    expect(next.tempHp).toBe(0)
    expect(next.spellSlotsUsed).toEqual({})
    expect(next.concentration).toBeNull()
    expect(next.hitDiceUsed[6]).toBe(2) // level 5 -> regain 2
  })

  it('a short rest only restores pact magic', () => {
    const lock = setup({ classes: [{ id: 'srd52:warlock', subclass: null, level: 5 }] }).stats
    const used = { ...emptyState(), spellSlotsUsed: { 3: 2 } }
    expect(shortRest(used, lock).spellSlotsUsed).toEqual({})
    expect(shortRest(used, stats).spellSlotsUsed).toEqual({ 3: 2 })
  })
})

describe('spell lists', () => {
  it('prepared casters cast prepared spells; known casters cast known spells', () => {
    const w = wizard()
    const char = {
      ...w.character,
      spells: {
        known: ['srd52:fire-bolt', 'srd52:fireball', 'srd52:detect-magic'],
        prepared: ['srd52:fireball'],
      },
    }
    const out = castableSpells(char, w.stats, w.compendium)
    expect(out.cantrips).toEqual(['srd52:fire-bolt'])
    expect(out.leveled).toEqual(['srd52:fireball'])
    expect(out.rituals).toEqual(['srd52:detect-magic']) // ritual from the spellbook
  })

  it('class spell lists exist for every caster', () => {
    const { compendium } = setup({}, '2014')
    for (const id of ['srd51:bard', 'srd51:cleric', 'srd51:druid', 'srd51:paladin', 'srd51:ranger', 'srd51:sorcerer', 'srd51:warlock', 'srd51:wizard']) {
      expect(spellsForClass(compendium, id).length).toBeGreaterThan(5)
    }
  })
})
