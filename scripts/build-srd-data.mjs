// Converts the SRD data in the 5e-bits/5e-database repo into the builder's data.json format.
//
// usage:
//   git clone --depth 1 https://github.com/5e-bits/5e-database.git /tmp/5e-database
//   node scripts/build-srd-data.mjs /tmp/5e-database
//
// writes src/rules/2014/data.json (SRD 5.1) and src/rules/2024/data.json (SRD 5.2)
//
// Both SRDs are CC-BY-4.0: keep the attribution in your site footer.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const repo = process.argv[2]
const outRoot = process.argv[3] ?? 'src/rules'
if (!repo) {
  console.error('usage: node scripts/build-srd-data.mjs <path-to-5e-database> [outDir]')
  process.exit(1)
}

const EDITIONS = {
  2014: { ns: 'srd51', label: 'SRD 5.1' },
  2024: { ns: 'srd52', label: 'SRD 5.2' },
}

// Numeric effects applied by derive(), keyed by trait index (same in both editions).
const EFFECTS = {
  'dwarven-toughness': { type: 'hpPerLevel', value: 1 },
  'wood-elf-speed-increase': { type: 'speed', value: 5 },
}

// Feats whose benefit is a simple number.
const FEAT_EFFECTS = {
  alert: { type: 'initiativeProf' },
}

const read = async (ed, file) =>
  JSON.parse(await readFile(path.join(repo, 'src', ed, 'en', `5e-SRD-${file}.json`), 'utf8'))

const text = (v) => {
  if (v == null) return ''
  const parts = Array.isArray(v) ? v : [v]
  return parts
    .flatMap((p) => String(p).split('\n'))
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n')
}

const cost = (c) => (c ? `${c.quantity} ${c.unit}` : null)
const skillOf = (idx) => (idx.startsWith('skill-') ? idx.slice(6) : null)
const trimZeros = (arr) => {
  const out = [...arr]
  while (out.length && out[out.length - 1] === 0) out.pop()
  return out
}
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// class_specific values -> flat, displayable values
function flattenSpecific(obj = {}) {
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v == null) continue
    if (typeof v === 'object' && !Array.isArray(v)) {
      if ('dice_count' in v && 'dice_value' in v) out[k] = `${v.dice_count}d${v.dice_value}`
    } else if (!Array.isArray(v)) {
      out[k] = v
    }
  }
  return out
}

function effectsFor(traitIndexes) {
  return traitIndexes.filter((i) => EFFECTS[i]).map((i) => EFFECTS[i])
}

async function build(ed) {
  const { ns, label } = EDITIONS[ed]
  const id = (idx) => `${ns}:${idx}`
  const is2014 = ed === '2014'

  const [classes, levels, subclasses, features, traits, spells, equipment, feats, backgrounds] =
    await Promise.all([
      read(ed, 'Classes'),
      read(ed, 'Levels'),
      read(ed, 'Subclasses'),
      read(ed, 'Features'),
      read(ed, 'Traits'),
      read(ed, 'Spells'),
      read(ed, 'Equipment'),
      read(ed, 'Feats'),
      read(ed, 'Backgrounds'),
    ])
  const speciesList = await read(ed, is2014 ? 'Races' : 'Species')
  const subList = await read(ed, is2014 ? 'Subraces' : 'Subspecies')

  const data = {
    meta: {
      source: label,
      license: 'CC-BY-4.0',
      attribution: `This work includes material from the System Reference Document ${
        is2014 ? '5.1' : '5.2'
      } by Wizards of the Coast LLC, licensed under the Creative Commons Attribution 4.0 International License.`,
    },
    species: {},
    subspecies: {},
    backgrounds: {},
    classes: {},
    subclasses: {},
    features: {},
    spells: {},
    armor: {},
    weapons: {},
    gear: {},
    feats: {},
  }

  // ---------- species ----------
  const traitById = Object.fromEntries(traits.map((t) => [t.index, t]))
  const traitEntry = (ref) => {
    const t = traitById[ref.index]
    const entry = { name: t?.name ?? ref.name, desc: text(t?.desc ?? t?.description) }
    if (ref.level) entry.level = ref.level
    return entry
  }

  for (const r of speciesList) {
    const refs = r.traits ?? []
    const entry = {
      name: r.name,
      size: r.size,
      speed: r.speed,
      traits: refs.map(traitEntry),
      subspecies: (r.subraces ?? []).map((s) => id(s.index)),
      effects: effectsFor(refs.map((t) => t.index)),
    }
    if (r.type) entry.type = r.type
    if (is2014) {
      entry.abilityBonuses = Object.fromEntries(
        (r.ability_bonuses ?? []).map((b) => [b.ability_score.index, b.bonus])
      )
      if (r.ability_bonus_options) {
        entry.abilityBonusChoice = {
          choose: r.ability_bonus_options.choose,
          amount: r.ability_bonus_options.from.options[0]?.bonus ?? 1,
          from: r.ability_bonus_options.from.options.map((o) => o.ability_score.index),
        }
      }
      entry.languages = (r.languages ?? []).map((l) => l.name)
      entry.skills = (r.starting_proficiencies ?? [])
        .map((p) => skillOf(p.index))
        .filter(Boolean)
    }
    data.species[id(r.index)] = entry
  }
  // 2024 lists subspecies under the parent via the subspecies file
  for (const s of subList) {
    const parentIdx = (is2014 ? s.race : s.species).index
    const refs = (is2014 ? s.racial_traits : s.traits) ?? []
    const entry = {
      name: s.name,
      parent: id(parentIdx),
      traits: refs.map(traitEntry),
      effects: effectsFor(refs.map((t) => t.index)),
    }
    if (is2014) {
      entry.desc = text(s.desc)
      entry.abilityBonuses = Object.fromEntries(
        (s.ability_bonuses ?? []).map((b) => [b.ability_score.index, b.bonus])
      )
    }
    data.subspecies[id(s.index)] = entry
    const parent = data.species[id(parentIdx)]
    if (parent && !parent.subspecies.includes(id(s.index))) parent.subspecies.push(id(s.index))
  }

  // ---------- backgrounds ----------
  for (const b of backgrounds) {
    if (is2014) {
      data.backgrounds[id(b.index)] = {
        name: b.name,
        skills: (b.starting_proficiencies ?? []).map((p) => skillOf(p.index)).filter(Boolean),
        feature: { name: b.feature?.name ?? '', desc: text(b.feature?.desc) },
        equipment: (b.starting_equipment ?? []).map((e) => `${e.equipment.name} x${e.quantity}`),
        gold: b.starting_gold ? `${b.starting_gold.quantity} ${b.starting_gold.unit}` : null,
        languagesChoose: b.language_options?.choose ?? 0,
      }
    } else {
      const profs = b.proficiencies ?? []
      data.backgrounds[id(b.index)] = {
        name: b.name,
        abilityOptions: (b.ability_scores ?? []).map((a) => a.index),
        originFeat: b.feat ? id(b.feat.index) : null,
        featNote: b.feat?.note ?? null,
        skills: profs.map((p) => skillOf(p.index)).filter(Boolean),
        tools: profs.filter((p) => p.index.startsWith('tool-')).map((p) => p.name.replace(/^Tool: /, '')),
        equipment: text((b.equipment_options ?? []).map((o) => o.desc)),
      }
    }
  }

  // ---------- features ----------
  const featureById = {}
  const childrenOf = {}
  if (is2014) {
    for (const f of features) {
      featureById[f.index] = f
      if (f.parent) (childrenOf[f.parent.index] ??= []).push(f)
    }
    for (const f of features) {
      if (f.parent) continue
      const entry = {
        name: f.name,
        level: f.level,
        class: id(f.class.index),
        desc: text(f.desc),
      }
      if (f.subclass) entry.subclass = id(f.subclass.index)
      const kids = childrenOf[f.index]
      if (kids?.length) entry.options = kids.map((k) => ({ name: k.name, desc: text(k.desc) }))
      data.features[id(f.index)] = entry
    }
  } else {
    for (const f of features) {
      data.features[id(f.index)] = {
        name: f.name,
        level: Number(f.level.index.split('-').pop()),
        class: id(f.class.index),
        desc: text(f.description),
      }
    }
  }

  // ---------- subclasses ----------
  for (const s of subclasses) {
    const sid = id(s.index)
    let featureIds = []
    if (is2014) {
      featureIds = Object.entries(data.features)
        .filter(([, f]) => f.subclass === sid)
        .sort((a, b) => a[1].level - b[1].level)
        .map(([fid]) => fid)
    } else {
      for (const f of s.features ?? []) {
        const fid = id(`${s.index}-${slugify(f.name)}`)
        data.features[fid] = {
          name: f.name,
          level: f.level,
          class: id(s.class.index),
          subclass: sid,
          desc: text(f.description),
        }
        featureIds.push(fid)
      }
    }
    data.subclasses[sid] = {
      name: s.name,
      class: id(s.class.index),
      flavor: is2014 ? s.subclass_flavor : s.summary,
      desc: text(s.desc ?? s.description),
      features: featureIds,
    }
  }

  // ---------- classes ----------
  for (const c of classes) {
    const own = levels.filter((l) => l.index === `${c.index}-${l.level}`)
    const profList = (c.proficiencies ?? []).filter(
      (p) => !p.index.startsWith('saving-throw-') && !p.index.startsWith('skill-')
    )
    const skillChoice = (c.proficiency_choices ?? []).find((pc) =>
      pc.from?.options?.some((o) => o.item?.index?.startsWith('skill-'))
    )

    const entry = {
      name: c.name,
      hitDie: c.hit_die,
      saves: c.saving_throws.map((s) => s.index),
      skillChoices: skillChoice
        ? {
            choose: skillChoice.choose,
            from: skillChoice.from.options.map((o) => skillOf(o.item.index)).filter(Boolean),
          }
        : { choose: 0, from: [] },
      proficiencies: profList.map((p) => p.name),
      startingEquipment: (c.starting_equipment_options ?? []).map((o) => o.desc).filter(Boolean),
      spellcasting: null,
      levels: {},
      subclasses: subclasses.filter((s) => s.class.index === c.index).map((s) => id(s.index)),
    }
    if (c.primary_ability?.desc) entry.primaryAbility = c.primary_ability.desc

    for (const l of own) {
      entry.levels[l.level] = {
        prof: l.prof_bonus,
        features: l.features.map((f) => id(f.index)).filter((fid) => data.features[fid]),
        specific: flattenSpecific(l.class_specific),
      }
    }

    entry.subclassLevel =
      Math.min(
        ...entry.subclasses.flatMap((sid) => data.subclasses[sid].features.map((f) => data.features[f].level))
      ) || 3

    if (c.spellcasting) {
      const sc = {
        ability: c.spellcasting.spellcasting_ability.index,
        startLevel: c.spellcasting.level,
        mode: 'prepared',
        spellbook: c.index === 'wizard',
        pact: c.index === 'warlock',
        info: (c.spellcasting.info ?? []).map((i) => ({ name: i.name, desc: text(i.desc) })),
        cantrips: {},
        known: {},
        prepared: {},
        slots: {},
      }
      if (is2014 && c.index === 'paladin') sc.preparedFormula = 'half'
      for (const l of own) {
        const s = l.spellcasting
        if (!s) continue
        if (s.cantrips_known != null) sc.cantrips[l.level] = s.cantrips_known
        if (s.spells_known != null) {
          sc.known[l.level] = s.spells_known
          sc.mode = 'known'
        }
        if (s.prepared_spells != null) sc.prepared[l.level] = s.prepared_spells
        const slots = trimZeros(
          Array.from({ length: 9 }, (_, i) => s[`spell_slots_level_${i + 1}`] ?? 0)
        )
        if (slots.length) sc.slots[l.level] = slots
      }
      entry.spellcasting = sc
    }
    data.classes[id(c.index)] = entry
  }

  // ---------- spells ----------
  for (const s of spells) {
    const dmgRaw = Array.isArray(s.damage) ? s.damage[0] : s.damage
    const entry = {
      name: s.name,
      level: s.level,
      school: s.school.name,
      classes: s.classes.map((c) => id(c.index)),
      castingTime: s.casting_time,
      range: s.range,
      components: (s.components ?? []).join(', '),
      material: s.material ?? null,
      duration: s.duration,
      concentration: !!s.concentration,
      ritual: !!s.ritual,
      desc: text(s.desc ?? s.description),
      higherLevel: text(s.higher_level),
    }
    if (dmgRaw?.damage_type) {
      entry.damage = {
        type: dmgRaw.damage_type.name,
        bySlot: dmgRaw.damage_at_slot_level ?? null,
        byLevel: dmgRaw.damage_at_character_level ?? null,
      }
    }
    data.spells[id(s.index)] = entry
  }

  // ---------- equipment ----------
  for (const e of equipment) {
    const cats = is2014
      ? [e.equipment_category?.index, e.gear_category?.index]
      : (e.equipment_categories ?? []).map((c) => c.index)

    if (e.armor_class) {
      let category
      if (is2014) category = e.armor_category.toLowerCase()
      else if (cats.includes('shields') || e.name === 'Shield') category = 'shield'
      else if (cats.includes('light-armor')) category = 'light'
      else if (cats.includes('medium-armor')) category = 'medium'
      else if (cats.includes('heavy-armor')) category = 'heavy'
      else if (e.armor_class.dex_bonus && e.armor_class.max_bonus == null) category = 'light'
      else if (e.armor_class.dex_bonus) category = 'medium'
      else category = 'heavy'

      data.armor[id(e.index)] = {
        name: e.name,
        category,
        baseAc: e.armor_class.base,
        ...(category === 'shield' ? { acBonus: e.armor_class.base } : {}),
        strMin: e.str_minimum || 0,
        stealthDisadvantage: !!e.stealth_disadvantage,
        weight: e.weight ?? null,
        cost: cost(e.cost),
      }
    } else if (e.damage?.damage_dice) {
      const martial = is2014 ? e.weapon_category === 'Martial' : cats.includes('martial-weapons')
      const ranged = is2014 ? e.weapon_range === 'Ranged' : cats.includes('ranged-weapons')
      data.weapons[id(e.index)] = {
        name: e.name,
        category: martial ? 'martial' : 'simple',
        range: ranged ? 'ranged' : 'melee',
        damage: e.damage.damage_dice,
        damageType: e.damage.damage_type.name,
        properties: (e.properties ?? []).map((p) => p.name),
        ...(e.two_handed_damage ? { versatileDamage: e.two_handed_damage.damage_dice } : {}),
        rangeNormal: e.range?.normal ?? null,
        rangeLong: e.range?.long ?? null,
        ...(e.mastery ? { mastery: e.mastery.name } : {}),
        weight: e.weight ?? null,
        cost: cost(e.cost),
      }
    } else {
      const catName = is2014
        ? (e.gear_category?.name ?? e.equipment_category?.name)
        : e.equipment_categories?.[0]?.name
      const desc = text(e.desc ?? e.description)
      data.gear[id(e.index)] = {
        name: e.name,
        category: catName ?? 'Gear',
        weight: e.weight ?? null,
        cost: cost(e.cost),
        ...(desc && desc.length < 400 ? { desc } : {}),
      }
    }
  }

  // ---------- feats ----------
  for (const f of feats) {
    const entry = {
      name: f.name,
      desc: text(f.desc ?? f.description),
      effects: FEAT_EFFECTS[f.index] ? [FEAT_EFFECTS[f.index]] : [],
    }
    if (f.type) entry.type = f.type
    if (f.prerequisites?.length) {
      entry.prerequisites = f.prerequisites
        .map((p) => (p.ability_score ? `${p.ability_score.name} ${p.minimum_score}+` : ''))
        .filter(Boolean)
        .join(', ')
    }
    data.feats[id(f.index)] = entry
  }

  const dir = path.join(outRoot, ed)
  await mkdir(dir, { recursive: true })
  const file = path.join(dir, 'data.json')
  await writeFile(file, JSON.stringify(data))
  const counts = Object.fromEntries(
    Object.entries(data)
      .filter(([k]) => k !== 'meta')
      .map(([k, v]) => [k, Object.keys(v).length])
  )
  console.log(`${ed} (${label}) -> ${file}`, counts)
}

for (const ed of Object.keys(EDITIONS)) await build(ed)
