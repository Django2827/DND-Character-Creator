import { useMemo } from 'react'
import { useCharacter } from './store'
import { getRuleset } from '../rules'
import { getData } from '../rules/data'
import { buildCompendium } from '../rules/compendium'
import { derive } from '../model/derive'

export function useRules() {
  const character = useCharacter((s) => s.character)
  const packs = useCharacter((s) => s.packs)

  return useMemo(() => {
    const ruleset = getRuleset(character.ruleset)
    // oldest layer first: the character's own snapshot only fills gaps, then the
    // built-in SRD data, then your packs (which win on conflict)
    const compendium = buildCompendium(
      [{ content: character.content }, { content: getData(character.ruleset) }, ...packs],
      character.ruleset
    )
    return { character, ruleset, compendium, stats: derive(character, ruleset, compendium) }
  }, [character, packs])
}
