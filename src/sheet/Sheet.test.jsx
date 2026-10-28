import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import Sheet from './Sheet'
import Viewer from '../viewer/Viewer'
import { setup } from '../model/testUtils'
import { characterPayload } from '../io/json'

const noop = () => {}

describe('Sheet renders', () => {
  it('a 2024 wizard with spells and slots', () => {
    const w = setup({
      name: 'Zed the Wise',
      classes: [{ id: 'srd52:wizard', subclass: null, level: 5 }],
      abilityScores: { str: 8, dex: 14, con: 14, int: 17, wis: 12, cha: 10 },
      spells: { known: ['srd52:fire-bolt', 'srd52:fireball'], prepared: ['srd52:fireball'] },
    })
    const html = renderToStaticMarkup(
      <Sheet character={w.character} stats={w.stats} compendium={w.compendium} onStateChange={noop} />
    )
    expect(html).toContain('Zed the Wise')
    expect(html).toContain('Armor Class')
    expect(html).toContain('Spell save DC')
    expect(html).toContain('Fireball')
    expect(html).toContain('Fire Bolt')
    expect(html).toContain('3rd level')
  })

  it('a non-caster has no spell panel; an empty character does not crash', () => {
    const f = setup({ classes: [{ id: 'srd52:fighter', subclass: null, level: 2 }] })
    expect(
      renderToStaticMarkup(<Sheet character={f.character} stats={f.stats} compendium={f.compendium} onStateChange={noop} />)
    ).not.toContain('Spellcasting')
    const e = setup()
    expect(
      renderToStaticMarkup(<Sheet character={e.character} stats={e.stats} compendium={e.compendium} onStateChange={noop} />)
    ).toContain('Unnamed Adventurer')
  })

  it('a 2014 cleric renders', () => {
    const c = setup(
      {
        name: 'Mara',
        species: 'srd51:dwarf',
        subspecies: 'srd51:hill-dwarf',
        classes: [{ id: 'srd51:cleric', subclass: 'srd51:life', level: 3 }],
        spells: { known: ['srd51:sacred-flame'], prepared: ['srd51:cure-wounds'] },
      },
      '2014'
    )
    const html = renderToStaticMarkup(
      <Sheet character={c.character} stats={c.stats} compendium={c.compendium} onStateChange={noop} />
    )
    expect(html).toContain('Mara')
    expect(html).toContain('Cure Wounds')
    expect(html).toContain('Sacred Flame')
  })

  it('the exported viewer renders from the embedded snapshot only', () => {
    const w = setup({
      name: 'Viewer Test',
      classes: [{ id: 'srd52:wizard', subclass: null, level: 3 }],
      spells: { known: ['srd52:fire-bolt', 'srd52:magic-missile'], prepared: ['srd52:magic-missile'] },
    })
    const payload = JSON.parse(JSON.stringify(characterPayload(w.character, w.compendium)))
    const html = renderToStaticMarkup(<Viewer initial={payload} />)
    expect(html).toContain('Viewer Test')
    expect(html).toContain('Magic Missile')
    expect(html).toContain('Download updated JSON')
  })
})
