// Logic for the 2014 rules. The data (species, classes, spells...) lives in data.json
// and is loaded separately so the exported sheet doesn't have to bundle all of it.

export default {
  id: '2014',
  label: 'D&D 5e (2014)',

  // 2014: ability score increases come from species and subspecies (plus any
  // player choices, like the Half-Elf's two +1s, stored in character.originBonuses)
  abilityBonuses(character, compendium) {
    const species = compendium.species?.[character.species]
    const sub = compendium.subspecies?.[character.subspecies]
    const out = {}
    for (const src of [species?.abilityBonuses, sub?.abilityBonuses, character.originBonuses]) {
      for (const [a, v] of Object.entries(src ?? {})) out[a] = (out[a] ?? 0) + v
    }
    return out
  },

  // how many spells can you know / prepare at this class level?
  spellLimit(sc, level, mods) {
    if (sc.mode === 'known') return sc.known[level] ?? 0
    const half = sc.preparedFormula === 'half'
    return Math.max(1, mods[sc.ability] + (half ? Math.floor(level / 2) : level))
  },
}
