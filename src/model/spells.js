// Spell helpers: lists, what you can cast, damage dice.

export function spellsForClass(compendium, classId) {
  return Object.entries(compendium.spells ?? {})
    .filter(([, s]) => s.classes?.includes(classId))
    .sort((a, b) => a[1].level - b[1].level || a[1].name.localeCompare(b[1].name))
}

// Which spells can be cast right now? Cantrips are always available; leveled spells
// come from "known" (known-casters) or "prepared" (everyone else).
export function castableSpells(character, stats, compendium) {
  const level = (id) => compendium.spells?.[id]?.level ?? -1
  const known = character.spells?.known ?? []
  const prepared = character.spells?.prepared ?? []
  const leveledSource = stats.spell?.mode === 'known' && !stats.spell?.spellbook ? known : prepared
  return {
    cantrips: known.filter((id) => level(id) === 0),
    leveled: leveledSource.filter((id) => level(id) > 0),
    // ritual spells in a spellbook can be cast as rituals without being prepared
    rituals: stats.spell?.spellbook
      ? known.filter((id) => level(id) > 0 && compendium.spells?.[id]?.ritual)
      : [],
  }
}

// "8d6" cast two levels higher with "+1d6 for each slot level above 3" -> "10d6"
function scaled(base, fromLevel, slotLevel, higherLevel) {
  const inc = /(\d+)d(\d+)\s+for each/i.exec(higherLevel ?? '')
  const m = /^(\d+)d(\d+)$/.exec(base)
  if (!inc || !m || inc[2] !== m[2] || slotLevel <= fromLevel) return base
  return `${Number(m[1]) + Number(inc[1]) * (slotLevel - fromLevel)}d${m[2]}`
}

// Dice for a spell at a given slot level / character level, or null if it has none.
export function spellDamageDice(spell, slotLevel, charLevel) {
  const d = spell?.damage
  if (!d) return null
  // the table entry for the highest key not above n
  const pick = (table, n) => {
    const keys = Object.keys(table)
      .map(Number)
      .filter((k) => k <= n)
      .sort((a, b) => b - a)
    return keys.length ? [keys[0], table[keys[0]]] : [null, null]
  }
  if (d.byLevel) return pick(d.byLevel, charLevel)[1]
  if (d.bySlot) {
    const [key, base] = pick(d.bySlot, slotLevel)
    if (!base) return null
    // 2024 cantrips list only their base dice; they grow at levels 5, 11 and 17
    if (spell.level === 0 && Object.keys(d.bySlot).length === 1) {
      const tier = 1 + (charLevel >= 5) + (charLevel >= 11) + (charLevel >= 17)
      return base.replace(/^(\d+)d/, (_, n) => `${Number(n) * tier}d`)
    }
    return scaled(base, key, slotLevel, spell.higherLevel)
  }
  return null
}

export const hasSpellAttack = (spell) => /spell attack/i.test(spell?.desc ?? '')
