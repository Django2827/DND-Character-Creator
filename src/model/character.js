export const SCHEMA_VERSION = 1

export function newCharacter(ruleset = '2024') {
  return {
    id: crypto.randomUUID(),
    schemaVersion: SCHEMA_VERSION,
    ruleset,
    name: '',
    species: null,            // namespaced content id, e.g. "srd52:dwarf"
    background: null,
    classes: [{ id: null, subclass: null, level: 1 }],
    abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    originBonuses: {},        // 2024: e.g. { str: 2, dex: 1 } chosen from the background
    skills: [],               // proficient skill ids
    expertise: [],
    feats: [],
    equipment: [],            // [{ id: "srd52:chain-mail", equipped: true }]
    spells: { known: [], prepared: [] },
    customContent: {},        // snapshot of non-built-in entries, filled on export
    state: { currentHp: null, tempHp: 0, spellSlotsUsed: {} },
  }
}