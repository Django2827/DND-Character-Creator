// Collect every compendium entry a character uses, so an exported file is
// self-contained: the viewer needs no rules data of its own.
export function snapshotContent(character, compendium) {
  const out = {}
  const add = (kind, id) => {
    const entry = id ? compendium[kind]?.[id] : null
    if (entry) (out[kind] ??= {})[id] = entry
    return entry
  }

  add('species', character.species)
  add('subspecies', character.subspecies)
  const bg = add('backgrounds', character.background)
  add('feats', bg?.originFeat)
  for (const f of character.feats ?? []) add('feats', f)

  for (const c of character.classes) {
    const cls = add('classes', c.id)
    for (const [lvl, data] of Object.entries(cls?.levels ?? {})) {
      if (Number(lvl) <= c.level) for (const fid of data.features) add('features', fid)
    }
    const sub = add('subclasses', c.subclass)
    for (const fid of sub?.features ?? []) add('features', fid)
  }

  for (const id of [...(character.spells?.known ?? []), ...(character.spells?.prepared ?? [])]) {
    add('spells', id)
  }
  for (const e of character.equipment ?? []) {
    add('armor', e.id)
    add('weapons', e.id)
    add('gear', e.id)
  }
  return out
}
