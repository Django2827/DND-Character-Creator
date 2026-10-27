import { describe, it, expect } from 'vitest'
import { abilityMod, proficiencyBonus } from './shared'

describe('shared math', () => {
  it('ability modifiers floor, not truncate', () => {
    expect(abilityMod(10)).toBe(0)
    expect(abilityMod(9)).toBe(-1)
    expect(abilityMod(8)).toBe(-1)
    expect(abilityMod(20)).toBe(5)
  })

  it('proficiency bonus by level', () => {
    expect([1, 4, 5, 8, 9, 12, 13, 16, 17, 20].map(proficiencyBonus)).toEqual([
      2, 2, 3, 3, 4, 4, 5, 5, 6, 6,
    ])
  })
})