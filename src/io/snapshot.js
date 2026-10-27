const REFS = [
  ['species', (c) => [c.species]],
  ['backgrounds', (c) => [c.background]],
  ['classes', (c) => c.classes.map((x) => x.id)],
  ['feats', (c) => c.feats ?? []],
  ['armor', (c) => (c.equipment ?? []).map((e) => e.id)],
  ['weapons', (c) => (c.equipment ?? []).map((e) => e.id)],
  ['spells', (c) => [...(c.spells?.known ?? []), ...(c.spells?.prepared ?? [])]],
]

export function snapshotCustomContent(character, ruleset, compendium) {
  const out = {}
  for (const [kind, pick] of REFS) {
    for (const id of pick(character)) {
      const entry = compendium[kind]?.[id]
      const builtIn = ruleset.data[kind]?.[id]
      if (id && entry && !builtIn) out[kind] = { ...(out[kind] ?? {}), [id]: entry }
    }
  }
  return out
}