import { describe, it, expect } from 'vitest'
import d2014 from './2014/data.json'
import d2024 from './2024/data.json'

describe.each([
  ['2014', d2014],
  ['2024', d2024],
])('SRD data integrity (%s)', (_, data) => {
  it('has the expected kinds with content', () => {
    for (const kind of ['species', 'backgrounds', 'classes', 'subclasses', 'features', 'spells', 'armor', 'weapons', 'gear', 'feats']) {
      expect(Object.keys(data[kind]).length).toBeGreaterThan(0)
    }
    expect(Object.keys(data.classes)).toHaveLength(12)
    expect(data.meta.license).toBe('CC-BY-4.0')
  })

  it('every reference points at something that exists', () => {
    for (const [cid, cls] of Object.entries(data.classes)) {
      expect(cls.hitDie, cid).toBeGreaterThan(0)
      expect(Object.keys(cls.levels), cid).toHaveLength(20)
      for (const lv of Object.values(cls.levels)) {
        for (const f of lv.features) expect(data.features[f], f).toBeDefined()
      }
      for (const s of cls.subclasses) expect(data.subclasses[s], s).toBeDefined()
      expect(cls.subclassLevel).toBeGreaterThanOrEqual(1)
    }
    for (const [sid, sub] of Object.entries(data.subclasses)) {
      for (const f of sub.features) expect(data.features[f], `${sid}: ${f}`).toBeDefined()
    }
    for (const [id, sp] of Object.entries(data.species)) {
      for (const s of sp.subspecies) expect(data.subspecies[s], `${id}: ${s}`).toBeDefined()
    }
    for (const [id, b] of Object.entries(data.backgrounds)) {
      if (b.originFeat) expect(data.feats[b.originFeat], id).toBeDefined()
    }
    for (const [id, spell] of Object.entries(data.spells)) {
      expect(spell.level, id).toBeGreaterThanOrEqual(0)
      for (const c of spell.classes) expect(data.classes[c], `${id}: ${c}`).toBeDefined()
    }
  })

  it('casters have complete tables', () => {
    for (const [cid, cls] of Object.entries(data.classes)) {
      const sc = cls.spellcasting
      if (!sc) continue
      expect(['str', 'dex', 'con', 'int', 'wis', 'cha'], cid).toContain(sc.ability)
      expect(Object.keys(sc.slots).length, cid).toBeGreaterThan(10)
    }
  })

  it('armor and weapons are usable by derive()', () => {
    for (const a of Object.values(data.armor)) {
      expect(['light', 'medium', 'heavy', 'shield']).toContain(a.category)
      expect(a.baseAc).toBeGreaterThan(0)
    }
    for (const w of Object.values(data.weapons)) {
      expect(w.damage).toMatch(/^\d+(d\d+)?$/)
      expect(['simple', 'martial']).toContain(w.category)
    }
  })
})

describe('SRD data: spot checks', () => {
  it('2014 SRD 5.1 has 319 spells; 2024 SRD 5.2 has 339', () => {
    expect(Object.keys(d2014.spells)).toHaveLength(319)
    expect(Object.keys(d2024.spells)).toHaveLength(339)
  })
  it('classic entries exist', () => {
    expect(d2014.spells['srd51:fireball'].level).toBe(3)
    expect(d2024.classes['srd52:fighter'].hitDie).toBe(10)
    expect(d2014.species['srd51:half-elf'].abilityBonusChoice.choose).toBe(2)
  })
})
