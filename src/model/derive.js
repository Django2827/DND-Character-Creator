import { ABILITIES, SKILLS, abilityMod, proficiencyBonus } from '../rules/shared'

export const totalLevel = (character) =>
  Math.max(1, character.classes.reduce((sum, c) => sum + c.level, 0))

function collectEffects(character, compendium) {
  const ids = [character.species, character.background, ...(character.feats ?? [])]
  return ids.flatMap((id) => {
    const entry =
      compendium.species?.[id] ?? compendium.backgrounds?.[id] ?? compendium.feats?.[id]
    return entry?.effects ?? []
  })
}

function maxHp(character, conMod, compendium, bonusPerLevel) {
  let hp = 0
  character.classes.forEach((c, i) => {
    const die = compendium.classes?.[c.id]?.hitDie
    if (!die) return
    for (let lvl = 1; lvl <= c.level; lvl++) {
      // first level of the first class: full die; every other level: average
      const base = i === 0 && lvl === 1 ? die : Math.floor(die / 2) + 1
      hp += Math.max(1, base + conMod) + bonusPerLevel
    }
  })
  return hp
}

function armorClass(character, mods, compendium) {
  const worn = (character.equipment ?? [])
    .filter((e) => e.equipped)
    .map((e) => compendium.armor?.[e.id])
    .filter(Boolean)
  const body = worn.find((a) => a.category !== 'shield')
  const shield = worn.find((a) => a.category === 'shield')

  let ac
  if (!body) ac = 10 + mods.dex
  else if (body.category === 'light') ac = body.baseAc + mods.dex
  else if (body.category === 'medium') ac = body.baseAc + Math.min(mods.dex, 2)
  else ac = body.baseAc
  return ac + (shield ? (shield.acBonus ?? 2) : 0)
}

export function derive(character, ruleset, compendium) {
  const level = totalLevel(character)
  const prof = proficiencyBonus(level)
  const bonuses = ruleset.abilityBonuses(character, compendium)
  const effects = collectEffects(character, compendium)
  const sum = (type) =>
    effects.filter((e) => e.type === type).reduce((s, e) => s + e.value, 0)

  const scores = {}
  const mods = {}
  for (const a of ABILITIES) {
    scores[a] = (character.abilityScores[a] ?? 10) + (bonuses[a] ?? 0)
    mods[a] = abilityMod(scores[a])
  }

  const primary = compendium.classes?.[character.classes[0]?.id]
  const saveProfs = primary?.saves ?? []
  const saves = Object.fromEntries(
    ABILITIES.map((a) => [a, mods[a] + (saveProfs.includes(a) ? prof : 0)])
  )

  const expertise = character.expertise ?? []
  const skills = Object.fromEntries(
    Object.entries(SKILLS).map(([skill, ability]) => {
      const proficient = character.skills.includes(skill)
      const bonus = (proficient ? prof : 0) + (proficient && expertise.includes(skill) ? prof : 0)
      return [skill, mods[ability] + bonus]
    })
  )

  const spellAbility = primary?.spellcasting?.ability ?? null
  const species = compendium.species?.[character.species]
  const classLevel = String(character.classes[0]?.level ?? 1)

  return {
    level,
    prof,
    scores,
    mods,
    saves,
    skills,
    maxHp: maxHp(character, mods.con, compendium, sum('hpPerLevel')),
    ac: armorClass(character, mods, compendium),
    initiative: mods.dex,
    speed: (species?.speed ?? 30) + sum('speed'),
    passivePerception: 10 + skills.perception,
    spellAbility,
    spellSaveDc: spellAbility ? 8 + prof + mods[spellAbility] : null,
    spellAttack: spellAbility ? prof + mods[spellAbility] : null,
    spellSlots: primary?.spellcasting?.slots?.[classLevel] ?? [],
  }
}