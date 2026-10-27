// pack = { id, name, source, ruleset: '2014' | '2024' | null, content: { kind: { id: entry } } }
export function buildCompendium(ruleset, packs = []) {
  const merged = { ...ruleset.data }
  for (const pack of packs) {
    if (pack.ruleset && pack.ruleset !== ruleset.id) continue
    for (const [kind, entries] of Object.entries(pack.content ?? {})) {
      merged[kind] = { ...(merged[kind] ?? {}), ...entries }
    }
  }
  return merged
}