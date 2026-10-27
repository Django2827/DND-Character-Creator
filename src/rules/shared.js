export const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha']

export const SKILLS = {
  acrobatics: 'dex', 'animal-handling': 'wis', arcana: 'int', athletics: 'str',
  deception: 'cha', history: 'int', insight: 'wis', intimidation: 'cha',
  investigation: 'int', medicine: 'wis', nature: 'int', perception: 'wis',
  performance: 'cha', persuasion: 'cha', religion: 'int',
  'sleight-of-hand': 'dex', stealth: 'dex', survival: 'wis',
}

export const abilityMod = (score) => Math.floor((score - 10) / 2)
export const proficiencyBonus = (level) => Math.ceil(level / 4) + 1
export const fmt = (n) => (n >= 0 ? `+${n}` : `${n}`)

// Point buy: 27 points, scores 8 to 15
export const POINT_BUY_COST = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 }
export const pointsSpent = (scores) =>
  Object.values(scores).reduce((sum, v) => sum + (POINT_BUY_COST[v] ?? Infinity), 0)