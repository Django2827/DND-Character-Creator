// Logic for the 2024 rules (the data lives in data.json, loaded separately).

export default {
  id: '2024',
  label: 'D&D 2024 (5.5e)',

  // 2024: ability score increases come from the background (+2/+1 or +1/+1/+1),
  // chosen by the player and stored in character.originBonuses
  abilityBonuses(character) {
    return character.originBonuses ?? {}
  },

  // 2024: every spellcaster has a "prepared spells" column in the class table
  spellLimit(sc, level) {
    return sc.prepared[level] ?? 0
  },
}
