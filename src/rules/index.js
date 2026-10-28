import r2014 from './2014'
import r2024 from './2024'

const rulesets = { 2014: r2014, 2024: r2024 }

export const getRuleset = (id) => rulesets[id] ?? r2024
export const allRulesets = Object.values(rulesets)
