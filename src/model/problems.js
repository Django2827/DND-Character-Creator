export function findProblems(character, compendium) {
  const problems = []
  if (character.species && !compendium.species?.[character.species])
    problems.push('Species is not available in this ruleset')
  if (character.background && !compendium.backgrounds?.[character.background])
    problems.push('Background is not available in this ruleset')
  for (const c of character.classes)
    if (c.id && !compendium.classes?.[c.id])
      problems.push('Class is not available in this ruleset')
  return problems
}