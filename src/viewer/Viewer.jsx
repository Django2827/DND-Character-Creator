import { useMemo, useState } from 'react'
import { getRuleset } from '../rules'
import { buildCompendium } from '../rules/compendium'
import { derive } from '../model/derive'
import Sheet from '../sheet/Sheet'
import { downloadFile, safeName } from '../lib/download'

const key = (c) => `dnd-sheet-state:${c.id}`

function loadState(c) {
  try {
    return JSON.parse(localStorage.getItem(key(c))) ?? c.state
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

  const stats = useMemo(() => {
    const ruleset = getRuleset(character.ruleset)
    const compendium = buildCompendium(ruleset, [
      { ruleset: null, content: character.customContent ?? {} },
    ])
    return derive(character, ruleset, compendium)
  }, [character])

  function onStateChange(patch) {
    const state = { ...character.state, ...patch }
    saveState(character, state)
    setCharacter({ ...character, state })
  }

  return (
    <>
      <Sheet character={character} stats={stats} onStateChange={onStateChange} />
      <button
        onClick={() =>
          downloadFile(`${safeName(character.name)}.json`, JSON.stringify(character, null, 2))
        }
      >
        Download updated JSON
      </button>
    </>
  )
}