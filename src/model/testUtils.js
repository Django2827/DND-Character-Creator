// helpers for tests: build a character + its full compendium
import { newCharacter } from './character'
import { getRuleset } from '../rules'
import { getData } from '../rules/data'
import { buildCompendium } from '../rules/compendium'
import { derive } from './derive'

export function setup(overrides = {}, rulesetId = '2024') {
  const character = { ...newCharacter(rulesetId), ...overrides }
  const ruleset = getRuleset(rulesetId)
  const compendium = buildCompendium([{ content: getData(rulesetId) }], rulesetId)
  return { character, ruleset, compendium, stats: derive(character, ruleset, compendium) }
}
