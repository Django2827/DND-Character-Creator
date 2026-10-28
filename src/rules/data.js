// App-only: the full SRD data for each ruleset. The exported sheet does NOT import
// this file (it carries a snapshot of just the entries the character uses).
import d2014 from './2014/data.json'
import d2024 from './2024/data.json'

const all = { 2014: d2014, 2024: d2024 }

export const getData = (id) => all[id] ?? d2024
