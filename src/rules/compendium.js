// layers = [{ ruleset?: '2014' | '2024' | null, content: { kind: { id: entry } } }, ...]
// Later layers win on conflict, so list the oldest/least-trusted layer first.
export function buildCompendium(layers, rulesetId = null) {
  const merged = {}
  for (const layer of layers) {
    if (layer.ruleset && rulesetId && layer.ruleset !== rulesetId) continue
    for (const [kind, entries] of Object.entries(layer.content ?? {})) {
      merged[kind] = { ...(merged[kind] ?? {}), ...entries }
    }
  }
  return merged
}
