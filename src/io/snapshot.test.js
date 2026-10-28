import { describe, it, expect } from 'vitest'
import { setup } from '../model/testUtils'
import { derive } from '../model/derive'
import { getRuleset } from '../rules'
import { buildCompendium } from '../rules/compendium'
import { snapshotContent } from './snapshot'
import { characterPayload } from './json'
import { parseCharacter } from '../model/validate'

describe('self-contained exports', () => {
  const { character, compendium, stats } = setup({
    name: 'Brindle </script> $& test',
    species: 'srd52:dwarf',
    background: 'srd52:sage',
    classes: [{ id: 'srd52:wizard', subclass: 'srd52:evoker', level: 5 }],
    abilityScores: { str: 8, dex: 14, con: 14, int: 15, wis: 12, cha: 10 },
    originBonuses: { int: 2, con: 1 },
    skills: ['arcana', 'history'],
    equipment: [{ id: 'srd52:dagger', equipped: true }],
    spells: {
      known: ['srd52:fire-bolt', 'srd52:fireball', 'srd52:detect-magic'],
      prepared: ['srd52:fireball'],
    },
  })

  it('a viewer built from the snapshot alone computes identical stats', () => {
    const payload = JSON.parse(JSON.stringify(characterPayload(character, compendium)))
    const lean = buildCompendium([{ content: payload.content }], '2024')
    const viewerStats = derive(payload, getRuleset('2024'), lean)
    expect(viewerStats).toEqual(stats)
  })

  it('the snapshot is small compared with the full data', () => {
    const snap = JSON.stringify(snapshotContent(character, compendium))
    const full = JSON.stringify(compendium)
    expect(snap.length).toBeLessThan(full.length / 5)
  })

  it('only includes features up to the class level', () => {
    const snap = snapshotContent(character, compendium)
    const levels = Object.values(snap.features).map((f) => f.level)
    expect(Math.max(...levels.filter((l) => l <= 20))).toBeLessThanOrEqual(20)
    expect(snap.spells['srd52:fireball']).toBeDefined()
    expect(snap.spells['srd52:magic-missile']).toBeUndefined()
  })

  it('the HTML injection survives hostile text and imports back', () => {
    const template =
      '<html><script type="application/json" id="character-data">__CHARACTER_JSON__</script></html>'
    const json = JSON.stringify(characterPayload(character, compendium)).replace(/</g, '\\u003c')
    const html = template.replace('__CHARACTER_JSON__', () => json)

    // the page still has exactly one closing script tag for the data block
    expect(html.match(/<\/script>/g)).toHaveLength(1)
    const match = html.match(/<script type="application\/json" id="character-data">([\s\S]*?)<\/script>/)
    const back = parseCharacter(JSON.parse(match[1]))
    expect(back.name).toBe('Brindle </script> $& test')
    expect(back.content.spells['srd52:fireball']).toBeDefined()
  })
})
