import { describe, it, expect } from 'vitest'
import { derive } from './derive'
import { parseCharacter } from './validate'
import { setup } from './testUtils'
import { getRuleset } from '../rules'
import { getData } from '../rules/data'
import { buildCompendium } from '../rules/compendium'
import fighterJson from './fixtures/test-fighter.json'

describe('derive: 2024 fighter (also tests the v1 -> v2 migration)', () => {
  const fighter = parseCharacter(fighterJson)
  const ruleset = getRuleset('2024')
  const compendium = buildCompendium([{ content: getData('2024') }], '2024')
  const stats = derive(fighter, ruleset, compendium)

  it('migrates old files', () => {
    expect(fighter.schemaVersion).toBe(2)
    expect(fighter.details).toBeDefined()
    expect(fighter.state.deathSaves).toEqual({ successes: 0, failures: 0 })
  })

  it('computes the core numbers', () => {
    expect(stats.prof).toBe(2)
    expect(stats.ac).toBe(18) // chain mail 16 + shield 2
    expect(stats.maxHp).toBe(31) // d10 fighter, +2 con, dwarven toughness +1/level
    expect(stats.saves.str).toBe(5)
    expect(stats.skills.athletics).toBe(5)
    expect(stats.passivePerception).toBe(12)
    expect(stats.spell).toBeNull()
  })

  it('adds background skills automatically', () => {
    expect(stats.grantedSkills).toContain('intimidation')
    expect(stats.skills.intimidation).toBe(0 + 2) // cha 10, proficient
  })

  it('builds attacks from equipped weapons with proficiency', () => {
    const sword = stats.attacks.find((a) => a.name === 'Longsword')
    expect(sword.bonus).toBe(5) // str +3, proficiency +2
    expect(sword.damage).toBe('1d8+3')
    expect(sword.proficient).toBe(true)
  })

  it('lists class features up to the current level', () => {
    const names = stats.features.map((f) => f.name)
    expect(names).toContain('Second Wind')
    expect(stats.hitDice).toEqual({ 10: 3 })
  })
})

describe('derive: spellcasters', () => {
  it('2024 wizard level 5', () => {
    const { stats, compendium } = setup({
      classes: [{ id: 'srd52:wizard', subclass: null, level: 5 }],
      abilityScores: { str: 8, dex: 14, con: 14, int: 15, wis: 12, cha: 10 },
      originBonuses: { int: 2, con: 1 },
    })
    expect(stats.mods.int).toBe(3) // 15 + 2 = 17
    expect(stats.prof).toBe(3)
    expect(stats.spell.saveDc).toBe(14) // 8 + 3 + 3
    expect(stats.spell.attack).toBe(6)
    expect(stats.spell.slots).toEqual([4, 3, 2])
    expect(stats.spell.maxSlotLevel).toBe(3)
    expect(stats.spell.spellbook).toBe(true)
    expect(stats.spell.limit).toBe(compendium.classes['srd52:wizard'].spellcasting.prepared[5])
    expect(stats.spell.cantripsMax).toBe(compendium.classes['srd52:wizard'].spellcasting.cantrips[5])
  })

  it('2014 hill dwarf cleric: race bonuses, toughness, prepared formula', () => {
    const { stats } = setup(
      {
        species: 'srd51:dwarf',
        subspecies: 'srd51:hill-dwarf',
        classes: [{ id: 'srd51:cleric', subclass: null, level: 3 }],
        abilityScores: { str: 10, dex: 10, con: 14, int: 10, wis: 15, cha: 10 },
      },
      '2014'
    )
    expect(stats.scores.con).toBe(16) // +2 dwarf
    expect(stats.scores.wis).toBe(16) // +1 hill dwarf
    expect(stats.maxHp).toBe(8 + 3 + 2 * (5 + 3) + 3) // d8 cleric, +3 con, +1/level from hill dwarf
    expect(stats.speed).toBe(25)
    expect(stats.spell.limit).toBe(6) // wis mod 3 + cleric level 3
  })

  it('2014 sorcerer uses spells known; paladin gets casting at level 2', () => {
    const sorc = setup({ classes: [{ id: 'srd51:sorcerer', subclass: null, level: 3 }] }, '2014')
    expect(sorc.stats.spell.mode).toBe('known')
    expect(sorc.stats.spell.limit).toBe(4)
    const pal1 = setup({ classes: [{ id: 'srd51:paladin', subclass: null, level: 1 }] }, '2014')
    expect(pal1.stats.spell).toBeNull()
    const pal2 = setup({ classes: [{ id: 'srd51:paladin', subclass: null, level: 2 }] }, '2014')
    expect(pal2.stats.spell).not.toBeNull()
  })

  it('warlock uses pact slots', () => {
    const { stats } = setup({ classes: [{ id: 'srd52:warlock', subclass: null, level: 5 }] })
    expect(stats.spell.pact).toBe(true)
    expect(stats.spell.maxSlotLevel).toBe(3)
  })
})

describe('derive: odds and ends', () => {
  it('an empty character does not crash', () => {
    const { stats } = setup()
    expect(stats.maxHp).toBe(0)
    expect(stats.ac).toBe(10)
    expect(stats.attacks).toHaveLength(1) // unarmed strike
  })

  it('barbarian unarmored defense and monk unarmored defense', () => {
    const barb = setup({
      classes: [{ id: 'srd52:barbarian', subclass: null, level: 1 }],
      abilityScores: { str: 10, dex: 14, con: 16, int: 10, wis: 10, cha: 10 },
    })
    expect(barb.stats.ac).toBe(10 + 2 + 3)
    const monk = setup({
      classes: [{ id: 'srd52:monk', subclass: null, level: 1 }],
      abilityScores: { str: 10, dex: 16, con: 10, int: 10, wis: 14, cha: 10 },
    })
    expect(monk.stats.ac).toBe(10 + 3 + 2)
  })

  it('every class works at every level in both rulesets', () => {
    for (const rs of ['2014', '2024']) {
      const base = setup({}, rs)
      for (const id of Object.keys(base.compendium.classes)) {
        for (let level = 1; level <= 20; level++) {
          const { stats } = setup({ classes: [{ id, subclass: null, level }] }, rs)
          expect(stats.maxHp).toBeGreaterThan(0)
          expect(stats.prof).toBeGreaterThanOrEqual(2)
        }
      }
    }
  })
})
