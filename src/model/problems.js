// Things in a character that don't exist in the current ruleset's compendium.
export function findProblems(character, compendium) {
  const problems = []
  const missing = (kind, id) => id && !compendium[kind]?.[id]
  if (missing('species', character.species)) problems.push('Species is not available in this ruleset')
  if (missing('subspecies', character.subspecies)) problems.push('Subspecies is not available in this ruleset')
  if (missing('backgrounds', character.background)) problems.push('Background is not available in this ruleset')
  for (const c of character.classes) {
    if (missing('classes', c.id)) problems.push('Class is not available in this ruleset')
    if (missing('subclasses', c.subclass)) problems.push('Subclass is not available in this ruleset')
  }
  for (const id of [...(character.spells?.known ?? []), ...(character.spells?.prepared ?? [])]) {
    if (missing('spells', id)) {
      problems.push('Some spells are not available in this ruleset')
      break
    }
  }
  return problems
}
