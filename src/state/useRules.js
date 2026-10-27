import { useMemo } from 'react'
import { useCharacter } from './store'
import { getRuleset } from '../rules'
import { buildCompendium } from '../rules/compendium'
import { derive } from '../model/derive'

export function useRules() {
  const character = useCharacter((s) => s.character)
  const packs = useCharacter((s) => s.packs)

  return useMemo(() => {
    const ruleset = getRuleset(character.ruleset)
    // the character's own snapshot first, then your packs (packs win on conflict)
    const compendium = buildCompendium(ruleset, [
      { ruleset: null, content: character.customContent ?? {} },
      ...packs,
    ])
    return { character, ruleset, compendium, stats: derive(character, ruleset, compendium) }
  }, [character, packs])
}