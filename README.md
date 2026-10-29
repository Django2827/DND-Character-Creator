# D&D Character Creator

A free, static web app for building and playing a D&D 5th Edition character. Pick a species, class and background, watch every number calculate itself, then play from an interactive sheet with dice rolling, HP tracking and spell slot tracking. Characters export to JSON or to a single interactive HTML file you can open anywhere, and homebrew content is supported through content packs.

**Live site:** https://django2827.github.io/DND-Character-Creator/

- Works with both the **2014** rules and the **2024** rules ("5.5e"), with a toggle
- Built-in content from the SRD: all 12 classes and a subclass for each, species/races and lineages, backgrounds, feats, 319 (2014) / 339 (2024) spells, weapons, armor and gear
- Interactive sheet: click any bonus to roll, spend spell slots, track concentration, rest
- Export to **JSON** or a self-contained **interactive HTML** file, and import either one back
- **Homebrew editor** for your own spells, classes, subclasses, species, backgrounds, feats and equipment
- No account, no server, no tracking: everything stays in your browser

---

## Development Fast-Track

Built with React and Vite. To run it locally:

```bash
git clone https://github.com/Django2827/DND-Character-Creator.git
cd DND-Character-Creator
npm install
npm run build:viewer
npm run dev
```

See [DEVELOPMENT.md](DEVELOPMENT.md) for scripts, project layout, and how the SRD data is generated.

---

## Contents

1. [Using the site](#using-the-site)
2. [The character sheet](#the-character-sheet)
3. [Character files (JSON)](#character-files-json)
4. [Content packs (homebrew)](#content-packs-homebrew)
5. [How the numbers are calculated](#how-the-numbers-are-calculated)
6. [2014 vs 2024 rules](#2014-vs-2024-rules)
7. [Privacy and storage](#privacy-and-storage)
8. [Development](#development)
9. [License and attribution](#license-and-attribution)

---

## Using the site

The **Character** view is a step-by-step builder. Move between steps with the buttons at the top, or Back / Next at the bottom. You can revisit any step at any time.

| Step | What you do |
|---|---|
| **1. Rules** | Choose the 2014 or 2024 ruleset. You can switch later; anything that doesn't exist in the other ruleset is flagged. |
| **2. Species** | Pick a species (a "race" in 2014) and, where one exists, a subrace or lineage. Traits are shown and applied. |
| **3. Class** | Pick a class, level (1 to 20) and, once you reach the subclass level, a subclass. Class features up to your level are listed. |
| **4. Background** | Pick a background. Its skills are added automatically; in 2024 it also sets your ability score bonuses and origin feat. |
| **5. Abilities** | Enter base scores (point buy, standard array, or your own rolls). Species or background bonuses are added on top. |
| **6. Skills** | Choose your class skills. Skills granted by your species or background are locked on. |
| **7. Equipment** | Add weapons, armor and gear, and tick **equipped** for worn armor and wielded weapons. |
| **8. Spells** | Choose cantrips, spells known, or spells prepared, depending on your class. Counters show your limits. |
| **9. Details** | Name, alignment, personality, ideals, bonds, flaws, appearance and notes. |
| **10. Sheet** | Your finished, interactive sheet, plus export, import and print. |

Your character is saved automatically in your browser. To keep it safely, or to move it to another device, use **Export** on the Sheet step.

The **Homebrew** view (header) is the content pack editor; see [Content packs](#content-packs-homebrew).

---

## The character sheet

The sheet is laid out like a paper sheet, in three columns (one column on a phone). Everything on it is calculated from your choices; you only ever click to roll or to track things that change during play.

### Rolling dice

Click almost any number to roll a d20 and add that bonus: ability boxes, saving throws, skills, initiative, attack bonuses and spell attacks. Damage buttons roll the damage dice. Results appear in the **roll log** at the bottom.

The **Rolls** selector at the top switches d20 rolls between **Normal**, **Advantage** and **Disadvantage**.

### Left column

- **Ability boxes:** the big number is the modifier, the small one is the score. Click to roll an ability check.
- **Inspiration**, **proficiency bonus** and **passive Perception**.
- **Saving throws and skills:** a filled dot means proficient; a dot with a ring means expertise. Click to roll.
- **Proficiencies and languages.**

### Middle column

- **Armor Class, Initiative, Speed.**
- **Hit points:** current / max, plus temporary HP. Type an amount and press **Damage** or **Heal**. Temporary HP absorbs damage first, HP can't drop below 0 or rise above the maximum, and healing from 0 clears death saves.
- **Hit dice:** **Spend** rolls the die, adds your Constitution modifier and heals you.
- **Death saves:** tick the successes and failures.
- **Attacks:** unarmed strike plus every equipped weapon, with attack bonus and damage. Finesse and ranged weapons use Dexterity when it's better. Two-handed damage for versatile weapons has its own button. A weapon you aren't proficient with is marked.
- **Equipment** list.

### Right column

- Personality traits, ideals, bonds and flaws.
- **Class resources** for your current level (for example rage uses or sneak attack dice).
- **Features & traits:** class, subclass, species, background and feat features. Click any entry to expand its text.
- Notes.

### Spellcasting panel

Shown for spellcasting classes (and appears once a half-caster reaches their first casting level).

- **Spellcasting ability, spell save DC and spell attack bonus.**
- **Spell slots:** one checkbox per slot, grouped by level. Tick a box to mark a slot as used. Warlock **Pact Magic** slots are shown with their slot level.
- **Cantrips and spells:** cantrips, then spells grouped by level. Click a spell's name to read it (casting time, range, components, duration, full text and "at higher levels").
- **Cast:** spends a slot. If you have slots of several levels available, a dropdown lets you **upcast**. Cantrips cost nothing. Ritual spells in a wizard's spellbook can be cast as a **Ritual** with no slot.
- **Atk / Dmg buttons** roll a spell attack or the spell's damage when the spell has them. Damage scales with the slot you used where the spell says how, and cantrip damage scales with your level.
- **Concentration:** casting a concentration spell shows a banner, and starting a new concentration spell replaces the old one. Press **End** to drop it.
- Which spells appear depends on your class: prepared casters see their prepared spells, known-spell casters see everything they know.

### Resting

| Button | What it does |
|---|---|
| **Short rest** | Restores Pact Magic slots (warlocks). Spend hit dice yourself with the **Spend** buttons. |
| **Long rest** | Restores all hit points, clears temporary HP and death saves, restores all spell slots, ends concentration, and gives back half your hit dice (minimum one). |

### Saving your play state

HP, slots, concentration and the rest of your play state is part of the character. In the site it saves automatically. In an exported HTML sheet it is remembered in that browser (per character); use **Download updated JSON** to keep a copy you can import elsewhere.

---

## Character files (JSON)

On the Sheet step:

- **Export JSON** downloads `<character name>.json`.
- **Export interactive HTML** downloads a single `.html` file that contains your sheet. It opens offline with a double-click, needs no internet and no install, and everything above works in it.
- **Import** accepts either kind of file (`.json` or `.html`). The HTML file works because the character's JSON is embedded inside it.

The best way to make a character file is to export one. If you edit or write one by hand, this is the format.

### Format

```json
{
  "id": "0b8e7c52-6f1d-4d29-9c7a-2d6d1f0c9a11",
  "schemaVersion": 2,
  "ruleset": "2024",
  "name": "Brindle",
  "species": "srd52:dwarf",
  "subspecies": null,
  "background": "srd52:soldier",
  "classes": [{ "id": "srd52:fighter", "subclass": null, "level": 3 }],
  "abilityScores": { "str": 15, "dex": 12, "con": 14, "int": 8, "wis": 10, "cha": 10 },
  "originBonuses": { "str": 2, "con": 1 },
  "skills": ["perception"],
  "expertise": [],
  "feats": [],
  "equipment": [
    { "id": "srd52:chain-mail", "equipped": true },
    { "id": "srd52:shield", "equipped": true },
    { "id": "srd52:longsword", "equipped": true }
  ],
  "spells": { "known": [], "prepared": [] },
  "details": {
    "playerName": "",
    "alignment": "Lawful Good",
    "personality": "",
    "ideals": "",
    "bonds": "",
    "flaws": "",
    "appearance": "",
    "notes": ""
  },
  "content": {},
  "state": {
    "currentHp": null,
    "tempHp": 0,
    "hitDiceUsed": {},
    "deathSaves": { "successes": 0, "failures": 0 },
    "spellSlotsUsed": {},
    "concentration": null,
    "inspiration": false
  }
}
```

### Field reference

| Field | Type | Meaning |
|---|---|---|
| `id` | string | A unique id. The exported HTML uses it to remember play state in the browser. |
| `schemaVersion` | number | Format version (currently `2`). Older files are upgraded on import; files from a newer version are refused. |
| `ruleset` | `"2014"` or `"2024"` | Which rules to apply. |
| `name` | string | Character name. |
| `species`, `subspecies`, `background` | content id or `null` | See [content ids](#content-ids). `subspecies` is the subrace (2014) or lineage (2024). |
| `classes` | array | `{ "id", "subclass", "level" }`. The builder edits one class; the sheet reads the first. |
| `abilityScores` | object | **Base** scores for `str dex con int wis cha`, before any bonuses. Never store the totals. |
| `originBonuses` | object | Player-chosen ability bonuses: the 2024 background bonus (+2/+1 or +1/+1/+1), or choices such as the 2014 Half-Elf's two +1s. Fixed bonuses (like a dwarf's +2 Con in 2014) are applied automatically and are not listed here. |
| `skills` | array | Extra skill proficiencies you chose. Skills granted by species or background are added automatically. |
| `expertise` | array | Skills with expertise (must also be proficient). |
| `feats` | array | Feat ids beyond the background's origin feat. |
| `equipment` | array | `{ "id", "equipped" }`. Equipped armor sets AC; equipped weapons appear in the attack table. |
| `spells` | object | `known`: cantrips, plus spells known or in your spellbook. `prepared`: prepared spells. |
| `details` | object | Free-text fields shown on the sheet. |
| `content` | object | A snapshot of every content entry the character uses (see below). Filled in on export. |
| `state` | object | Play state, below. |

`state` fields:

| Field | Meaning |
|---|---|
| `currentHp` | Current hit points, or `null` for "at full HP". |
| `tempHp` | Temporary hit points. |
| `hitDiceUsed` | Spent hit dice by die size, e.g. `{ "10": 1 }` is one d10 spent. |
| `deathSaves` | `{ "successes", "failures" }`, each 0 to 3. |
| `spellSlotsUsed` | Used slots by spell level, e.g. `{ "1": 2 }` is two 1st-level slots used. |
| `concentration` | The id of the spell being concentrated on, or `null`. |
| `inspiration` | `true` or `false`. |

**Calculated values are never stored.** AC, HP, modifiers, saves, skill bonuses, spell DC, attack bonuses and slot counts are all worked out from the fields above every time, so a file can't go out of date.

### Content ids

Every piece of content has an id of the form `namespace:name`:

| Namespace | Source |
|---|---|
| `srd51:` | Built-in 2014 content (SRD 5.1), e.g. `srd51:hill-dwarf` |
| `srd52:` | Built-in 2024 content (SRD 5.2), e.g. `srd52:fighter` |
| `<pack-id>:` | An entry from one of your content packs, e.g. `my-homebrew:stoneborn` |

### The `content` snapshot

When you export, the file includes the full text and data of every entry the character uses (its class, features, species, spells, equipment, and so on). That makes the file **self-contained**: the exported HTML sheet needs no rules data of its own, and a character that uses homebrew opens correctly on a computer that doesn't have your pack installed.

When a file is imported into the site, the snapshot only fills gaps. Built-in data and your own packs take priority.

A consequence worth knowing: if a character uses homebrew or other non-SRD text, **that text is inside the exported file**. Share such files accordingly.

### Import rules and errors

- The file must be valid JSON with at least `schemaVersion`, `ruleset` (`"2014"` or `"2024"`), `name`, `classes`, `abilityScores` and `state`.
- If you write a file by hand, include all the fields shown in the example above; fields that are missing are not filled in for you (files from the older version 1 format are the exception, and are upgraded automatically).
- Ids that don't exist in the current compendium are not an error on import, but the Rules step will list them as unavailable. They are most often caused by switching rulesets or by a missing content pack.
- Messages you may see: *"This file was made with a newer version of the builder"* (update the site), *"No character data found in that HTML file"* (it isn't an exported sheet), or a validation message naming the field that is wrong.

### The exported HTML file

The HTML export is the site's sheet viewer with your character's JSON embedded in a `<script type="application/json" id="character-data">` block. Because it is just that, you can:

- open it on any device with a browser, offline;
- import it back into the site (the site reads the embedded JSON);
- unpack it by hand if you ever need to: copy the contents of that `<script>` block into a `.json` file.

Its play-state changes (HP, slots, and so on) are remembered by the browser, per character. They are not written back into the file; press **Download updated JSON** to save a copy of the current state.

---

## Content packs (homebrew)

A content pack is a JSON file that adds your own content on top of the built-in SRD data. Packs show up in the builder's dropdowns next to the built-in options.

### Creating content in the app

1. Open the **Homebrew** view and create a pack (a name and a ruleset: 2014 or 2024).
2. Choose a kind (spell, species, subrace/lineage, background, feat, class, subclass, weapon, armor/shield, gear) and fill in the form.
3. Save. The entry is available straight away in the **Character** view.

You can edit or delete entries at any time. **Export pack** downloads the pack as JSON for backup or to move it to another computer. **Import content pack** (in the header) loads one.

Packs are stored in your browser's IndexedDB. They are never uploaded and they are not part of this repository.

### Pack file format

```json
{
  "id": "my-homebrew",
  "name": "My Homebrew",
  "source": "Homebrew",
  "ruleset": "2024",
  "content": {
    "spells": {
      "my-homebrew:frost-lance": { "name": "Frost Lance", "level": 2 }
    }
  }
}
```

| Field | Meaning |
|---|---|
| `id` | Lowercase letters, digits and hyphens. Becomes the id prefix for everything in the pack. |
| `name` | Display name. |
| `source` | Free text, such as the origin of the material. |
| `ruleset` | `"2014"`, `"2024"`, or `null` for both. A pack for one ruleset is only loaded when that ruleset is active. |
| `content` | Entries grouped by kind, then by id: `species`, `subspecies`, `backgrounds`, `classes`, `subclasses`, `features`, `spells`, `armor`, `weapons`, `gear`, `feats`. |

Ids inside a pack are `<pack-id>:<name>`, and an id must be unique across the whole pack. Entries refer to each other by id (a spell lists class ids, a subclass names its class, and so on), and they can refer to built-in content as well as to your own.

**Text formatting.** Descriptions can use blank lines for paragraphs, lines starting with `- ` for bullet lists, and `**bold**`.

**Skills** use these ids: `acrobatics`, `animal-handling`, `arcana`, `athletics`, `deception`, `history`, `insight`, `intimidation`, `investigation`, `medicine`, `nature`, `perception`, `performance`, `persuasion`, `religion`, `sleight-of-hand`, `stealth`, `survival`. **Abilities** are `str`, `dex`, `con`, `int`, `wis`, `cha`.

### Effects

Species, lineages and feats can carry `effects`, which the sheet applies automatically:

| Effect | Example | Result |
|---|---|---|
| `hpPerLevel` | `{ "type": "hpPerLevel", "value": 1 }` | Extra max HP per level |
| `speed` | `{ "type": "speed", "value": 5 }` | Speed bonus in feet |
| `acBonus` | `{ "type": "acBonus", "value": 1 }` | Bonus to AC |
| `initiative` | `{ "type": "initiative", "value": 2 }` | Bonus to initiative |
| `initiativeProf` | `{ "type": "initiativeProf" }` | Adds your proficiency bonus to initiative |

Anything else a feature does is written in its description; features are text on the sheet.

### Entry reference

The examples below show one entry each (the object you would put under its id).

**Spell** (`spells`)

```json
{
  "name": "Frost Lance",
  "level": 2,
  "school": "Evocation",
  "classes": ["srd52:wizard", "srd52:sorcerer"],
  "castingTime": "1 action",
  "range": "60 feet",
  "components": "V, S, M",
  "material": "a sliver of ice",
  "duration": "Concentration, up to 1 minute",
  "concentration": true,
  "ritual": false,
  "desc": "A lance of ice streaks toward a creature you can see.",
  "higherLevel": "The damage increases by 1d8 for each slot level above 2.",
  "damage": { "type": "Cold", "bySlot": { "2": "3d8" }, "byLevel": null }
}
```

`classes` is the list of class spell lists the spell appears on. `damage` is optional; with it, the cast row gets a damage button. If `higherLevel` contains text like *"increases by 1d8 for each slot level above 2"*, the dice scale when upcast.

**Species** (`species`) and **subspecies** (`subspecies`)

```json
{
  "name": "Stoneborn",
  "size": "Medium",
  "speed": 30,
  "traits": [{ "name": "Rooted", "desc": "You are hard to move." }],
  "subspecies": [],
  "skills": [],
  "effects": [{ "type": "hpPerLevel", "value": 1 }]
}
```

For the **2014** rules, species also take `"abilityBonuses": { "con": 2 }` and `"languages": ["Common", "Terran"]`. A 2014 species can offer a choice with `"abilityBonusChoice": { "choose": 2, "amount": 1, "from": ["str", "dex", "con", "int", "wis", "cha"] }`.

A subspecies names its parent species and is listed under it:

```json
{
  "name": "Cliffborn",
  "parent": "srd52:dwarf",
  "traits": [{ "name": "Climber", "desc": "Climbing is easy for you." }],
  "effects": [{ "type": "speed", "value": 5 }]
}
```

**Background** (`backgrounds`): the two rulesets differ.

```jsonc
// 2024
{
  "name": "Lamplighter",
  "abilityOptions": ["dex", "wis", "con"],
  "originFeat": "srd52:alert",
  "featNote": null,
  "skills": ["insight", "stealth"],
  "tools": [],
  "equipment": "A lantern and a ladder."
}
```

```jsonc
// 2014
{
  "name": "Lamplighter",
  "skills": ["insight", "stealth"],
  "feature": { "name": "City Lights", "desc": "You know the streets." },
  "equipment": ["A lantern", "Oil"],
  "gold": "10 gp",
  "languagesChoose": 0
}
```

**Feat** (`feats`)

```json
{
  "name": "Night Eyes",
  "desc": "You see well in dim light.",
  "effects": [{ "type": "initiativeProf" }],
  "type": "General",
  "prerequisites": "Level 4"
}
```

`type` is used by the 2024 rules ("Origin", "General", "Fighting Style", "Epic Boon"); `prerequisites` is optional.

**Class** (`classes`) and **features** (`features`)

A class lists its level features by id, and the features live in the separate `features` section.

```jsonc
// classes["my-homebrew:spellblade"]  (levels abbreviated: real files list 1 to 20)
{
  "name": "Spellblade",
  "hitDie": 10,
  "saves": ["str", "int"],
  "skillChoices": { "choose": 2, "from": ["arcana", "athletics", "history"] },
  "proficiencies": ["Simple Weapons", "Martial Weapons", "Light Armor"],
  "startingEquipment": ["A martial weapon", "Leather armor"],
  "subclassLevel": 3,
  "subclasses": [],
  "levels": {
    "1": { "prof": 2, "features": ["my-homebrew:spellblade-arcane-strike"], "specific": {} },
    "2": { "prof": 2, "features": [], "specific": {} }
  },
  "spellcasting": {
    "ability": "int",
    "startLevel": 1,
    "mode": "prepared",
    "spellbook": false,
    "pact": false,
    "info": [],
    "cantrips": { "1": 2, "4": 3, "10": 4 },
    "prepared": { "1": 2, "2": 3 },
    "slots": { "1": [2], "2": [2], "5": [4, 2] }
  }
}
```

```json
{
  "name": "Arcane Strike",
  "level": 1,
  "class": "my-homebrew:spellblade",
  "desc": "Channel magic through your weapon."
}
```

- Use `"Simple Weapons"` and `"Martial Weapons"` in `proficiencies` so weapon attacks get your proficiency bonus.
- Set `"spellcasting": null` for a non-caster.
- **`slots`**: one entry per class level, each an array of slot counts for spell levels 1, 2, 3 and so on (`[4, 2]` is four 1st-level and two 2nd-level slots). Pact Magic uses `"pact": true` with a single slot level, written with leading zeros (`[0, 0, 2]` is two 3rd-level slots).
- **`cantrips`**, **`known`** and **`prepared`** are tables with one key per level from `startLevel` to 20 (the example above is abbreviated).
- **Spells limit by ruleset:** in the 2024 rules the `prepared` table sets how many spells a class prepares. In the 2014 rules, `"mode": "prepared"` uses ability modifier plus class level (`"preparedFormula": "half"` for half the level), and `"mode": "known"` uses the `known` table.
- `"spellbook": true` gives the class a wizard-style spellbook (choose spells for the book, then prepare from it, and cast rituals from it).

**Subclass** (`subclasses`)

A subclass names its class, which can be a built-in class, and lists its feature ids. Its features go in the `features` section with the subclass id attached.

```json
{
  "name": "Rune Knight Redux",
  "class": "srd52:fighter",
  "flavor": "Carved runes of giant power.",
  "desc": "Fighters of this tradition inscribe runes on their gear.",
  "features": ["my-homebrew:rune-knight-redux-rune-carver"]
}
```

```json
{
  "name": "Rune Carver",
  "level": 3,
  "class": "srd52:fighter",
  "subclass": "my-homebrew:rune-knight-redux",
  "desc": "You can carve runes into your equipment."
}
```

**Weapon** (`weapons`)

```json
{
  "name": "Gale Blade",
  "category": "martial",
  "range": "melee",
  "damage": "1d8",
  "damageType": "Slashing",
  "properties": ["Finesse", "Light", "Versatile"],
  "versatileDamage": "1d10",
  "rangeNormal": null,
  "rangeLong": null,
  "weight": 3,
  "cost": "25 gp"
}
```

`category` is `"simple"` or `"martial"`; `range` is `"melee"` or `"ranged"`. `damage` is dice such as `1d8`, or a flat number. 2024 weapons may add `"mastery": "Nick"`.

**Armor** (`armor`)

```json
{
  "name": "Mooncloth",
  "category": "light",
  "baseAc": 12,
  "strMin": 0,
  "stealthDisadvantage": false,
  "weight": 8,
  "cost": "100 gp"
}
```

`category` is `"light"`, `"medium"`, `"heavy"` or `"shield"`. Light armor adds your full Dexterity modifier, medium adds up to +2, heavy adds none. A shield uses `"category": "shield"` with `"acBonus": 2`.

**Gear** (`gear`)

```json
{
  "name": "Lamp Oil Flask",
  "category": "Adventuring Gear",
  "weight": 1,
  "cost": "1 sp",
  "desc": "Burns for 6 hours."
}
```

### Rules for what goes in a pack

Packs are for your own material, or for content you have the right to use. The SRDs are the only parts of the game this project redistributes. If you add text from books you own, keep it in your own browser and don't commit it or publish it. Exported characters embed the entries they use, so share those files with that in mind.

---

## How the numbers are calculated

Everything on the sheet comes from one function that turns your choices into stats. The rules it applies:

- **Ability modifier:** `floor((score - 10) / 2)`, after species or background bonuses.
- **Proficiency bonus:** +2 at levels 1 to 4, rising by 1 every four levels, to +6 at level 17.
- **Saving throws:** modifier, plus proficiency for the saves your first class grants.
- **Skills:** modifier, plus proficiency if granted (species or background) or chosen, doubled for expertise.
- **Hit points:** maximum die at first level, the average (die / 2 + 1) at later levels, plus your Constitution modifier each level (at least 1 per level), plus any `hpPerLevel` effects such as Dwarven Toughness.
- **Armor Class:** 10 + Dex with no armor; light armor adds full Dex; medium adds Dex up to +2; heavy adds none; a shield adds its bonus. Barbarian and Monk **Unarmored Defense** apply when you wear no armor (the Monk's not with a shield).
- **Initiative:** Dexterity modifier, plus any initiative effects.
- **Attacks:** ability modifier plus proficiency if your class is proficient (by weapon category or by the weapon's name), using Dexterity for ranged weapons and for finesse weapons when it is higher.
- **Spellcasting:** save DC = 8 + proficiency + casting ability modifier; spell attack = proficiency + casting ability modifier. Slots, cantrips and prepared or known counts come from the class table.

### Current limits

- The builder edits **one class**. Multiclass spell slots are not calculated.
- Spells that are always prepared by a subclass (domain, oath and circle spells) are not added automatically; add them in the Spells step.
- Only the numeric effects above are automated. Other features, such as fighting styles and most class abilities, are text on the sheet.
- Choices a feature grants that aren't modeled (extra skills from a trait, tool proficiencies) can be added by ticking the boxes in the Skills step.

---

## 2014 vs 2024 rules

| | 2014 | 2024 |
|---|---|---|
| Ability score increases | From your species/race (and subrace) | From your **background** (+2/+1 or +1/+1/+1) |
| Origin feat | None | Granted by your background |
| Backgrounds | One in the SRD (Acolyte) | Four in the SRD |
| Species with choices | Subraces | Lineages and ancestries |
| Spells | Prepared or known, depending on the class | Every caster prepares spells; the class table sets how many |
| Weapon mastery | No | Weapons list a mastery property |

You can switch rulesets on the Rules step at any time. The same character file format is used for both.

---

## Privacy and storage

- The site is static. There is no server, no account, no analytics and no network requests for your data.
- Your character and pack data live in your browser (localStorage for the current character, IndexedDB for content packs). Clearing site data removes them, so **export what you care about**.
- Exported files go to your device; nothing is uploaded.

---

## Development

The app is React with Vite. It is deployed as a static site to GitHub Pages.

### Setup

```bash
git clone git@github.com:Django2827/DND-Character-Creator.git
cd DND-Character-Creator
npm install
npm run build:viewer     # builds the exportable sheet template (needed once, and after changing the sheet)
npm run dev              # http://localhost:5173/DND-Character-Creator/
```

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm test` | Unit tests (calculations, spell and rest logic, data integrity, export round-trips, homebrew) |
| `npm run build:viewer` | Builds `viewer.html` into a single file and copies it to `public/sheet-template.html` |
| `npm run build` | Production build into `dist/` |
| `npm run deploy` | Builds the viewer and the app, then publishes `dist/` to the `gh-pages` branch |

`public/sheet-template.html` and `dist-viewer/` are generated and are git-ignored.

### Project layout

```
src/
├── App.jsx                  character / homebrew views
├── builder/                 the step-by-step wizard (steps/*.jsx)
├── sheet/                   the interactive sheet and spell panel
├── packs/                   the homebrew editor (kinds.js defines every form)
├── model/
│   ├── character.js         the character format and defaults
│   ├── derive.js            choices -> every calculated number
│   ├── actions.js           damage, healing, casting, resting
│   ├── spells.js            spell lists and damage dice
│   └── validate.js          import validation and version migrations
├── rules/
│   ├── 2014/, 2024/         ruleset logic + data.json (generated SRD data)
│   ├── compendium.js        merges built-in data, packs and snapshots
│   └── shared.js            ability, skill and level math
├── io/                      JSON / HTML export, import, content snapshots
├── content/packs.js         pack storage (IndexedDB) and validation
├── viewer/                  entry point of the exported HTML sheet
└── state/                   zustand store and the useRules hook
scripts/build-srd-data.mjs   regenerates the data.json files
```

Two ideas hold it together:

- **Store choices, derive numbers.** A character is a small JSON document; `derive()` turns it into everything on the sheet.
- **Exports are self-contained.** The exported HTML bundles the sheet code but no rules data. The character file carries a snapshot of just the entries it uses.

### Regenerating the SRD data

The built-in data is generated from the 5e-bits [5e-database](https://github.com/5e-bits/5e-database) project:

```bash
git clone --depth 1 https://github.com/5e-bits/5e-database.git /tmp/5e-database
node scripts/build-srd-data.mjs /tmp/5e-database
```

This rewrites `src/rules/2014/data.json` and `src/rules/2024/data.json`. Run `npm test` afterwards; the data tests check that every reference points at something that exists.

### Changing the character format

Bump `SCHEMA_VERSION` in `src/model/character.js` and add a migration to `src/model/validate.js` so existing exported files keep importing.

### Deploying

Pushing source to `main` does not update the live site. Run `npm run deploy`, then wait a minute or two for GitHub Pages. In the repository settings, Pages should serve the `gh-pages` branch.

---

## License and attribution

This project is unofficial fan content. It is not affiliated with, endorsed by, or sponsored by Wizards of the Coast.

This work includes material taken from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC, available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.

This work includes material from the System Reference Document 5.2 ("SRD 5.2") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.

The SRD data in `src/rules/*/data.json` was converted from the 5e-bits [5e-database](https://github.com/5e-bits/5e-database) project.

The application code in this repository is licensed under the terms in the `LICENSE` file.
