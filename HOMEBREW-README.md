# Homebrew screen: create your own spells, classes, species, subclasses and more

Unzip over your project (the folder with `package.json`), overwriting when asked.
This update goes on TOP of the previous one (`dnd-builder-update.zip`).

## What's new

A **Homebrew** button in the header opens a pack editor:

1. Create a pack (a name and a ruleset, 2014 or 2024).
2. Pick a kind: Spell, Species/race, Subrace/lineage, Background, Feat, Class, Subclass,
   Weapon, Armor/shield, Gear.
3. Fill in the form and Save. Entries show up immediately in the builder's dropdowns.
4. Edit or delete entries any time. **Export pack** downloads a JSON backup.

Packs are stored in this browser only (IndexedDB). They are not uploaded or deployed.
Use **Import content pack** on another computer to load an exported pack.

## What the forms can do

- **Spell:** level, school, class spell lists (built-in AND your own classes), concentration,
  ritual, description, "at higher levels", and optional damage dice (adds a Dmg button that
  scales when upcast if your higher-level text says "increases by XdY for each slot level").
- **Class:** hit die, saves, skill choices, proficiencies, level features, subclass level, and
  a spellcasting preset (full / half / pact slots, cantrip steps, prepared or known counts).
- **Subclass:** attaches to ANY class, including the built-in ones. Level features included.
- **Species / lineage:** traits, speed, 2014 ability bonuses and languages, and automatic
  effects (extra HP per level, speed, AC, initiative).
- **Background, feat, weapon, armor, gear:** matching fields; weapons and armor feed the
  attack table and AC.

## Changed files

`src/App.jsx`, `src/App.css`, `src/content/packs.js`, `src/builder/steps/ClassStep.jsx`
and `SpeciesStep.jsx` (they now list homebrew subclasses and lineages under built-in
classes and species), plus the new `src/packs/` folder (with tests: run `npm test`).

## Limits

- Class features are text: automatic effects exist only for the numeric ones on
  species, lineages and feats.
- The class spellcasting preset uses standard slot tables; for unusual progressions,
  edit the exported pack JSON.
- A pack is for one ruleset; to use the same content in both, make a pack for each.
- Only your own material or openly licensed content belongs in a pack you share. Packs
  with book text are for your own use.
