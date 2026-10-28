# Character Creator update: real sheet, full SRD data, spell tracking

Unzip this over your project folder (the folder that contains `package.json`).
**Commit what you have first** (GitHub Desktop is fine), so you can diff or undo.

## What's in it

- **Data:** every SRD class, subclass, species/race, subrace/lineage, background, feat,
  spell (319 in 5.1, 339 in 5.2), weapon, armor and gear item, for BOTH rulesets
  (`src/rules/2014/data.json`, `src/rules/2024/data.json`).
- **Sheet:** a three-column paper-style sheet (`src/sheet/Sheet.jsx` + `Sheet.css`).
  Click any bonus to roll; advantage/disadvantage selector; attacks and damage;
  HP with temp HP, damage/heal, hit dice, death saves, inspiration; short/long rest.
- **Spell tracking:** slot pips per level, Cast button with upcasting, concentration
  tracking, cantrips, rituals from a spellbook, spell text on demand, attack/damage
  rolls, pact magic (warlock) restored on a short rest.
- **Builder:** Rules, Species, Class, Background, Abilities, Skills, Equipment, Spells,
  Details, Sheet. Class features, spell lists and options come straight from the data.
- **Exports** now carry only what the character uses (about 16 KB of data), so the
  interactive HTML is ~260 KB instead of bundling all the rules.
- **Tests:** 44 tests (`npm test`) covering calculations, spell/rest logic, data
  integrity, and export round-trips.

## Install

1. Unzip over your project (overwrite when asked). Files that get REPLACED:
   `src/App.jsx`, `src/App.css`, `src/index.css`, everything in `src/builder/`,
   `src/sheet/`, `src/viewer/`, `src/model/`, `src/state/`, `src/io/`,
   `src/rules/` (except your `shared.test.js`), `src/lib/dice.js`.
2. In `vite.config.js`, add this inside `defineConfig({ ... })` to silence the
   bundle-size warning (the SRD data is ~1.6 MB unzipped, ~390 KB gzipped):

   ```js
   build: { chunkSizeWarningLimit: 2000 },
   optimizeDeps: { entries: ['index.html', 'viewer.html'] },
   ```

3. In WSL, from the project folder:

   ```bash
   npm test
   npm run build:viewer
   npm run dev
   ```

4. Your saved character in the browser resets once (the format changed). Old exported
   `.json` files still import: they're migrated automatically.

## Regenerating the data (optional)

```bash
git clone --depth 1 https://github.com/5e-bits/5e-database.git /tmp/5e-database
node scripts/build-srd-data.mjs /tmp/5e-database
```

## Licensing

The data comes from the SRD 5.1 and SRD 5.2, which are CC-BY-4.0, via the 5e-bits
5e-database project. The footer in `App.jsx` carries the attribution. Keep it.
Expansion-book content is NOT included; use content packs (see the main guide).

## Known limits

- The UI edits one class (multiclass spell slots aren't calculated).
- "Always prepared" spells from domains/oaths/circles aren't added automatically.
- Only a few numeric effects are automated (Dwarven Toughness, Wood Elf speed,
  Alert, unarmored defense). Everything else shows as text in Features & Traits.
- Half-Elf style "choose any skill" grants aren't automated; tick them in Skills.
- 2024 cantrip damage scales with level by a simple rule (5/11/17).
