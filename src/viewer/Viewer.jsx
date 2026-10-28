import { useMemo, useState } from 'react'
import { getRuleset } from '../rules'
import { buildCompendium } from '../rules/compendium'
import { derive } from '../model/derive'
import Sheet from '../sheet/Sheet'
import { downloadFile, safeName } from '../lib/download'

const key = (c) => `dnd-sheet-state:${c.id}`

function loadState(c) {
  try {
    return { ...c.state, ...JSON.parse(localStorage.getItem(key(c))) }
  } catch {
    return c.state
  }
}

function saveState(c, state) {
  try {
    localStorage.setItem(key(c), JSON.stringify(state))
  } catch {
    // storage blocked (private mode, some file:// setups): changes last for this session only
  }
}

export default function Viewer({ initial }) {
  const [character, setCharacter] = useState(() => ({ ...initial, state: loadState(initial) }))

  // the exported file carries every entry it needs, so no rules data is bundled here
  const { stats, compendium } = useMemo(() => {
    const ruleset = getRuleset(character.ruleset)
    const compendium = buildCompendium([{ content: character.content ?? {} }], character.ruleset)
    return { compendium, stats: derive(character, ruleset, compendium) }
  }, [character])

  function onStateChange(patch) {
    const state = { ...character.state, ...patch }
    saveState(character, state)
    setCharacter({ ...character, state })
  }

  return (
    <>
      <Sheet character={character} stats={stats} compendium={compendium} onStateChange={onStateChange} />
      <p style={{ textAlign: 'center' }}>
        <button
          onClick={() =>
            downloadFile(`${safeName(character.name)}.json`, JSON.stringify(character, null, 2))
          }
        >
          Download updated JSON
        </button>
      </p>
    </>
  )
}
