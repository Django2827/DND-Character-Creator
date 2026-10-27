import { describe, it, expect } from 'vitest'
import { derive } from './derive'
import { getRuleset } from '../rules'
import { buildCompendium } from '../rules/compendium'
import fighter from './fixtures/test-fighter.json'

describe('derive', () => {
  it('computes a level 3 fighter under the 2024 rules', () => {
    const ruleset = getRuleset('2024')
    const stats = derive(fighter, ruleset, buildCompendium(ruleset))

    expect(stats.prof).toBe(2)
    expect(stats.ac).toBe(18)
    expect(stats.maxHp).toBe(31)
    expect(stats.saves.str).toBe(5)
    expect(stats.skills.athletics).toBe(5)
    expect(stats.passivePerception).toBe(12)
  })
})