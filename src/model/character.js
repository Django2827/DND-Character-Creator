export const SCHEMA_VERSION = 2

export const emptyDetails = () => ({
  playerName: '',
  alignment: '',
  personality: '',
  ideals: '',
  bonds: '',
  flaws: '',
  appearance: '',
  notes: '',
})

export const emptyState = () => ({
  currentHp: null, // null = at full HP
  tempHp: 0,
  hitDiceUsed: {}, // { "10": 1 } = one d10 spent
  deathSaves: { successes: 0, failures: 0 },
  spellSlotsUsed: {}, // { "1": 2 } = two 1st-level slots spent
  concentration: null, // spell id
  inspiration: false,
})

export function newCharacter(ruleset = '2024') {
  return {
    id: crypto.randomUUID(),
    schemaVersion: SCHEMA_VERSION,
    ruleset,
    name: '',
    species: null, // namespaced content id, e.g. "srd52:dwarf"
    subspecies: null, // lineage / subrace
    background: null,
    classes: [{ id: null, subclass: null, level: 1 }],
    abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    originBonuses: {}, // 2024: background +2/+1 or +1/+1/+1; 2014: the Half-Elf's chosen +1s
    skills: [], // chosen proficient skills (species/background grants are added automatically)
    expertise: [],
    feats: [],
    equipment: [], // [{ id: "srd52:chain-mail", equipped: true }]
    spells: { known: [], prepared: [] },
    details: emptyDetails(),
    content: {}, // snapshot of every compendium entry this character uses (filled on export)
    state: emptyState(),
  }
}
