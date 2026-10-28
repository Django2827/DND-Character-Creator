import { ABILITIES, SKILLS, abilityMod, proficiencyBonus, fmt } from '../rules/shared'

export const totalLevel = (character) =>
  Math.max(1, character.classes.reduce((sum, c) => sum + (c.level || 0), 0))

// "Hand crossbows" and "Crossbow, hand" both become "crossbowhand"
const key = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/s$/, ''))
    .sort()
    .join('')

function weaponProficient(weapon, classProfs) {
  const keys = classProfs.map(key)
  if (weapon.category === 'martial' && keys.includes('martialweapon')) return true
  if (weapon.category === 'simple' && keys.includes('simpleweapon')) return true
  return keys.includes(key(weapon.name))
}

function collectEffects(sources) {
  return [sources.species, sources.sub, ...sources.feats].flatMap((e) => e?.effects ?? [])
}

function maxHp(character, conMod, compendium, bonusPerLevel) {
  let hp = 0
  character.classes.forEach((c, i) => {
    const die = compendium.classes?.[c.id]?.hitDie
    if (!die) return
    for (let lvl = 1; lvl <= c.level; lvl++) {
      // first level of the first class: full die; every other level: the average
      const base = i === 0 && lvl === 1 ? die : Math.floor(die / 2) + 1
      hp += Math.max(1, base + conMod) + bonusPerLevel
    }
  })
  return hp
}

function armorClass(character, classId, mods, compendium, bonus) {
  const worn = (character.equipment ?? [])
    .filter((e) => e.equipped)
    .map((e) => compendium.armor?.[e.id])
    .filter(Boolean)
  const body = worn.find((a) => a.category !== 'shield')
  const shield = worn.find((a) => a.category === 'shield')

  let ac
  if (!body) {
    ac = 10 + mods.dex
    // unarmored defense (identical in both editions)
    if (classId?.endsWith(':barbarian')) ac += mods.con
    if (classId?.endsWith(':monk') && !shield) ac += mods.wis
  } else if (body.category === 'light') ac = body.baseAc + mods.dex
  else if (body.category === 'medium') ac = body.baseAc + Math.min(mods.dex, 2)
  else ac = body.baseAc
  return ac + (shield ? (shield.acBonus ?? 2) : 0) + bonus
}

function buildFeatures(character, compendium, sources, level) {
  const out = []
  for (const c of character.classes) {
    const cls = compendium.classes?.[c.id]
    if (!cls) continue
    for (let lvl = 1; lvl <= c.level; lvl++) {
      for (const fid of cls.levels?.[lvl]?.features ?? []) {
        const f = compendium.features?.[fid]
        if (f) out.push({ source: cls.name, level: lvl, name: f.name, desc: f.desc, options: f.options })
      }
    }
    const sub = compendium.subclasses?.[c.subclass]
    for (const fid of sub?.features ?? []) {
      const f = compendium.features?.[fid]
      if (f && f.level <= c.level) {
        out.push({ source: sub.name, level: f.level, name: f.name, desc: f.desc, options: f.options })
      }
    }
  }
  for (const [label, entry] of [
    [sources.species?.name, sources.species],
    [sources.sub?.name, sources.sub],
  ]) {
    for (const t of entry?.traits ?? []) {
      if (!t.level || t.level <= level) out.push({ source: label, level: 0, name: t.name, desc: t.desc })
    }
  }
  if (sources.bg?.feature?.name) {
    out.push({ source: 'Background', level: 0, name: sources.bg.feature.name, desc: sources.bg.feature.desc })
  }
  for (const f of sources.feats) out.push({ source: 'Feat', level: 0, name: f.name, desc: f.desc })
  return out
}

function buildAttacks(character, mods, prof, classProfs, compendium) {
  const dmgMod = (m) => (m === 0 ? '' : fmt(m))
  const attacks = [
    {
      id: 'unarmed',
      name: 'Unarmed Strike',
      ability: 'str',
      bonus: mods.str + prof,
      damage: `1${dmgMod(mods.str)}`,
      damageType: 'Bludgeoning',
      properties: [],
      mastery: null,
    },
  ]
  for (const e of character.equipment ?? []) {
    const w = compendium.weapons?.[e.id]
    if (!w || !e.equipped) continue
    const finesse = w.properties.includes('Finesse')
    const ability = w.range === 'ranged' ? 'dex' : finesse && mods.dex > mods.str ? 'dex' : 'str'
    const proficient = weaponProficient(w, classProfs)
    attacks.push({
      id: e.id,
      name: w.name,
      ability,
      bonus: mods[ability] + (proficient ? prof : 0),
      damage: `${w.damage}${dmgMod(mods[ability])}`,
      versatile: w.versatileDamage ? `${w.versatileDamage}${dmgMod(mods[ability])}` : null,
      damageType: w.damageType,
      properties: w.properties,
      mastery: w.mastery ?? null,
      proficient,
    })
  }
  return attacks
}

function spellInfo(character, cls, ruleset, mods, prof) {
  const sc = cls?.spellcasting
  const level = character.classes[0]?.level ?? 1
  if (!sc || level < (sc.startLevel ?? 1)) return null
  const slots = sc.slots[level] ?? []
  let maxSlotLevel = 0
  slots.forEach((n, i) => {
    if (n > 0) maxSlotLevel = i + 1
  })
  return {
    ability: sc.ability,
    saveDc: 8 + prof + mods[sc.ability],
    attack: prof + mods[sc.ability],
    mode: sc.mode,
    spellbook: !!sc.spellbook,
    pact: !!sc.pact,
    slots,
    maxSlotLevel,
    cantripsMax: sc.cantrips[level] ?? 0,
    limit: ruleset.spellLimit(sc, level, mods), // spells known (or prepared) limit
  }
}

export function derive(character, ruleset, compendium) {
  const level = totalLevel(character)
  const prof = proficiencyBonus(level)
  const bonuses = ruleset.abilityBonuses(character, compendium)

  const sources = {
    species: compendium.species?.[character.species],
    sub: compendium.subspecies?.[character.subspecies],
    bg: compendium.backgrounds?.[character.background],
    feats: [compendium.backgrounds?.[character.background]?.originFeat, ...(character.feats ?? [])]
      .filter(Boolean)
      .map((id) => compendium.feats?.[id])
      .filter(Boolean),
  }
  const effects = collectEffects(sources)
  const sum = (type) => effects.filter((e) => e.type === type).reduce((s, e) => s + (e.value ?? 0), 0)

  const scores = {}
  const mods = {}
  for (const a of ABILITIES) {
    scores[a] = (character.abilityScores[a] ?? 10) + (bonuses[a] ?? 0)
    mods[a] = abilityMod(scores[a])
  }

  const primaryId = character.classes[0]?.id
  const cls = compendium.classes?.[primaryId]

  const saveProf = Object.fromEntries(ABILITIES.map((a) => [a, !!cls?.saves?.includes(a)]))
  const saves = Object.fromEntries(ABILITIES.map((a) => [a, mods[a] + (saveProf[a] ? prof : 0)]))

  const granted = [...new Set([...(sources.species?.skills ?? []), ...(sources.bg?.skills ?? [])])]
  const expertise = character.expertise ?? []
  const skillProf = {}
  const skills = {}
  for (const [skill, ability] of Object.entries(SKILLS)) {
    const proficient = granted.includes(skill) || character.skills.includes(skill)
    skillProf[skill] = proficient && expertise.includes(skill) ? 2 : proficient ? 1 : 0
    skills[skill] = mods[ability] + skillProf[skill] * prof
  }

  const classProfs = cls?.proficiencies ?? []
  const spell = spellInfo(character, cls, ruleset, mods, prof)

  // hit dice grouped by die size: { 10: 3 }
  const hitDice = {}
  for (const c of character.classes) {
    const die = compendium.classes?.[c.id]?.hitDie
    if (die) hitDice[die] = (hitDice[die] ?? 0) + c.level
  }

  return {
    level,
    prof,
    scores,
    mods,
    saves,
    saveProf,
    skills,
    skillProf,
    grantedSkills: granted,
    maxHp: maxHp(character, mods.con, compendium, sum('hpPerLevel')),
    hitDice,
    ac: armorClass(character, primaryId, mods, compendium, sum('acBonus')),
    initiative: mods.dex + (effects.some((e) => e.type === 'initiativeProf') ? prof : 0) + sum('initiative'),
    speed: (sources.species?.speed ?? 30) + sum('speed'),
    passivePerception: 10 + skills.perception,
    languages: sources.species?.languages ?? [],
    proficiencies: classProfs,
    attacks: buildAttacks(character, mods, prof, classProfs, compendium),
    features: buildFeatures(character, compendium, sources, level),
    classSpecific: cls?.levels?.[character.classes[0]?.level]?.specific ?? {},
    spell,
    // flat spellcasting fields kept for simple lookups and older tests
    spellAbility: spell?.ability ?? null,
    spellSaveDc: spell?.saveDc ?? null,
    spellAttack: spell?.attack ?? null,
    spellSlots: spell?.slots ?? [],
  }
}
