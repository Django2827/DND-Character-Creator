import { useState } from 'react'
import { ABILITIES, ABILITY_NAMES, SKILLS, fmt, titleCase } from '../rules/shared'
import { roll, rollD20, rollExpr } from '../lib/dice'
import {
  applyDamage,
  applyHealing,
  currentHp,
  longRest,
  shortRest,
  spendHitDie,
} from '../model/actions'
import { Box, Pips, Rich } from './parts'
import SpellPanel from './SpellPanel'
import './Sheet.css'

const findItem = (compendium, id) =>
  compendium.armor?.[id] ?? compendium.weapons?.[id] ?? compendium.gear?.[id]

export default function Sheet({ character, stats, compendium, onStateChange }) {
  const [log, setLog] = useState([])
  const [mode, setMode] = useState('normal') // normal | adv | dis
  const [amount, setAmount] = useState('')
  const state = character.state
  const hp = currentHp(state, stats)

  const push = (line) => setLog((l) => [line, ...l].slice(0, 12))

  // one entry point for every roll button: a message, a d20 check, or a dice expression
  function onRoll(r) {
    if (typeof r === 'string') return push(r)
    if (r.d20) {
      const { total, rolls } = rollD20(mode)
      push(`${r.label}: ${rolls.join(' / ')} ${fmt(r.bonus)} = ${total + r.bonus}`)
    } else if (r.expr) {
      const res = rollExpr(r.expr)
      if (res) push(`${r.label}: [${res.rolls.join('+')}]${res.mod ? fmt(res.mod) : ''} = ${res.total}`)
    }
  }

  const check = (label, bonus) => onRoll({ d20: true, bonus, label })
  const classes = character.classes
    .map((c) => {
      const cls = compendium.classes?.[c.id]
      const sub = compendium.subclasses?.[c.subclass]
      return cls ? `${cls.name}${sub ? ` (${sub.name})` : ''} ${c.level}` : null
    })
    .filter(Boolean)
    .join(' / ')
  const species = compendium.species?.[character.species]
  const sub = compendium.subspecies?.[character.subspecies]
  const background = compendium.backgrounds?.[character.background]
  const d = character.details ?? {}

  const apply = (fn) => onStateChange(fn(state, stats, Number(amount) || 0))
  const groups = {}
  for (const f of stats.features) (groups[f.source] ??= []).push(f)

  return (
    <main className="sheet">
      <header className="sheet__header">
        <h1>{character.name || 'Unnamed Adventurer'}</h1>
        <dl className="sheet__meta">
          <div><dt>Class &amp; Level</dt><dd>{classes || '—'}</dd></div>
          <div><dt>Background</dt><dd>{background?.name ?? '—'}</dd></div>
          <div><dt>Species</dt><dd>{species ? `${species.name}${sub ? ` (${sub.name})` : ''}` : '—'}</dd></div>
          <div><dt>Alignment</dt><dd>{d.alignment || '—'}</dd></div>
          <div><dt>Player</dt><dd>{d.playerName || '—'}</dd></div>
        </dl>
        <div className="sheet__rolls">
          <label>
            Rolls:{' '}
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="normal">Normal</option>
              <option value="adv">Advantage</option>
              <option value="dis">Disadvantage</option>
            </select>
          </label>
          <button onClick={() => onStateChange(shortRest(state, stats))}>Short rest</button>
          <button onClick={() => onStateChange(longRest(state, stats))}>Long rest</button>
        </div>
      </header>

      <div className="sheet__cols">
        {/* ---------- left: abilities, saves, skills ---------- */}
        <div className="col">
          <div className="abilities">
            {ABILITIES.map((a) => (
              <button
                key={a}
                className="ability"
                title={`${ABILITY_NAMES[a]} check`}
                onClick={() => check(`${ABILITY_NAMES[a]} check`, stats.mods[a])}
              >
                <span className="ability__name">{ABILITY_NAMES[a]}</span>
                <span className="ability__mod">{fmt(stats.mods[a])}</span>
                <span className="ability__score">{stats.scores[a]}</span>
              </button>
            ))}
          </div>

          <Box className="statrow">
            <label className="stat">
              <input
                type="checkbox"
                checked={!!state.inspiration}
                onChange={(e) => onStateChange({ inspiration: e.target.checked })}
              />
              <span>Inspiration</span>
            </label>
            <div className="stat"><strong>{fmt(stats.prof)}</strong><span>Proficiency bonus</span></div>
            <div className="stat"><strong>{stats.passivePerception}</strong><span>Passive Perception</span></div>
          </Box>

          <Box title="Saving Throws">
            <ul className="proflist">
              {ABILITIES.map((a) => (
                <li key={a}>
                  <button onClick={() => check(`${ABILITY_NAMES[a]} save`, stats.saves[a])}>
                    <span className={`dot ${stats.saveProf[a] ? 'dot--on' : ''}`} />
                    <b>{fmt(stats.saves[a])}</b> {ABILITY_NAMES[a]}
                  </button>
                </li>
              ))}
            </ul>
          </Box>

          <Box title="Skills">
            <ul className="proflist">
              {Object.entries(SKILLS).map(([skill, ab]) => (
                <li key={skill}>
                  <button onClick={() => check(titleCase(skill), stats.skills[skill])}>
                    <span className={`dot ${stats.skillProf[skill] ? 'dot--on' : ''} ${stats.skillProf[skill] === 2 ? 'dot--x2' : ''}`} />
                    <b>{fmt(stats.skills[skill])}</b> {titleCase(skill)} <small>({ab})</small>
                  </button>
                </li>
              ))}
            </ul>
          </Box>

          <Box title="Proficiencies &amp; Languages">
            {stats.proficiencies.length > 0 && <p>{stats.proficiencies.join(', ')}</p>}
            {stats.languages.length > 0 && <p><b>Languages:</b> {stats.languages.join(', ')}</p>}
            {stats.proficiencies.length + stats.languages.length === 0 && <p className="muted">None yet.</p>}
          </Box>
        </div>

        {/* ---------- middle: combat ---------- */}
        <div className="col">
          <div className="vitals">
            <div className="vital"><strong>{stats.ac}</strong><span>Armor Class</span></div>
            <button className="vital" onClick={() => check('Initiative', stats.initiative)}>
              <strong>{fmt(stats.initiative)}</strong><span>Initiative</span>
            </button>
            <div className="vital"><strong>{stats.speed}</strong><span>Speed (ft)</span></div>
          </div>

          <Box title="Hit Points">
            <div className="hp">
              <div className="hp__now"><strong>{hp}</strong> / {stats.maxHp}</div>
              <label className="hp__temp">
                Temp
                <input
                  type="number"
                  min="0"
                  value={state.tempHp ?? 0}
                  onChange={(e) => onStateChange({ tempHp: Math.max(0, Number(e.target.value) || 0) })}
                />
              </label>
            </div>
            <div className="hp__controls">
              <input
                type="number"
                min="0"
                placeholder="Amount"
                aria-label="Hit point amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button onClick={() => apply(applyDamage)}>Damage</button>
              <button onClick={() => apply(applyHealing)}>Heal</button>
            </div>
          </Box>

          <div className="twocol">
            <Box title="Hit Dice">
              {Object.entries(stats.hitDice).map(([die, total]) => {
                const used = state.hitDiceUsed?.[die] ?? 0
                return (
                  <div key={die} className="hitdie">
                    <span>d{die}: {total - used}/{total}</span>
                    <button
                      disabled={used >= total}
                      onClick={() => {
                        const rolled = roll(Number(die)).total
                        const next = spendHitDie(state, stats, die, rolled)
                        if (next) {
                          onStateChange(next)
                          push(`Hit die d${die}: ${rolled} ${fmt(stats.mods.con)}`)
                        }
                      }}
                    >
                      Spend
                    </button>
                  </div>
                )
              })}
              {Object.keys(stats.hitDice).length === 0 && <p className="muted">Pick a class.</p>}
            </Box>
            <Box title="Death Saves">
              <div className="death"><span>Successes</span>
                <Pips total={3} used={state.deathSaves?.successes ?? 0} label="Death save success"
                  onChange={(n) => onStateChange({ deathSaves: { ...state.deathSaves, successes: n } })} /></div>
              <div className="death"><span>Failures</span>
                <Pips total={3} used={state.deathSaves?.failures ?? 0} label="Death save failure"
                  onChange={(n) => onStateChange({ deathSaves: { ...state.deathSaves, failures: n } })} /></div>
            </Box>
          </div>

          <Box title="Attacks">
            <table className="attacks">
              <thead><tr><th>Name</th><th>Atk</th><th>Damage</th></tr></thead>
              <tbody>
                {stats.attacks.map((a) => (
                  <tr key={a.id}>
                    <td>
                      {a.name}
                      {a.mastery && <small> · {a.mastery}</small>}
                      {a.proficient === false && <small> · not proficient</small>}
                    </td>
                    <td><button onClick={() => check(`${a.name} attack`, a.bonus)}>{fmt(a.bonus)}</button></td>
                    <td>
                      <button onClick={() => onRoll({ expr: a.damage, label: `${a.name} damage` })}>
                        {a.damage} {a.damageType.toLowerCase()}
                      </button>
                      {a.versatile && (
                        <button onClick={() => onRoll({ expr: a.versatile, label: `${a.name} (two-handed)` })}>
                          {a.versatile}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          <Box title="Equipment">
            {character.equipment.length === 0 && <p className="muted">Nothing yet.</p>}
            <ul className="items">
              {character.equipment.map((e) => {
                const item = findItem(compendium, e.id)
                return item ? (
                  <li key={e.id}>{item.name}{e.equipped ? <small> · equipped</small> : null}</li>
                ) : null
              })}
            </ul>
          </Box>
        </div>

        {/* ---------- right: personality, features ---------- */}
        <div className="col">
          {[['Personality Traits', d.personality], ['Ideals', d.ideals], ['Bonds', d.bonds], ['Flaws', d.flaws]].map(
            ([title, value]) => (
              <Box key={title} title={title}><p className="pre">{value || ' '}</p></Box>
            )
          )}

          {Object.keys(stats.classSpecific).length > 0 && (
            <Box title="Class Resources">
              <ul className="items">
                {Object.entries(stats.classSpecific).map(([k, v]) => (
                  <li key={k}><b>{titleCase(k)}:</b> {String(v)}</li>
                ))}
              </ul>
            </Box>
          )}

          <Box title="Features &amp; Traits">
            {Object.keys(groups).length === 0 && <p className="muted">Pick a species and class.</p>}
            {Object.entries(groups).map(([source, list]) => (
              <details key={source} className="featgroup">
                <summary>{source}</summary>
                {list.map((f, i) => (
                  <details key={`${f.name}${i}`} className="feature">
                    <summary>{f.name}{f.level > 0 && <small> · level {f.level}</small>}</summary>
                    <Rich text={f.desc} />
                    {f.options?.map((o) => (
                      <details key={o.name} className="feature feature--option">
                        <summary>{o.name}</summary>
                        <Rich text={o.desc} />
                      </details>
                    ))}
                  </details>
                ))}
              </details>
            ))}
          </Box>

          {(d.appearance || d.notes) && (
            <Box title="Notes"><p className="pre">{[d.appearance, d.notes].filter(Boolean).join('\n\n')}</p></Box>
          )}
        </div>
      </div>

      {stats.spell && (
        <SpellPanel
          character={character}
          stats={stats}
          compendium={compendium}
          onStateChange={onStateChange}
          onRoll={onRoll}
        />
      )}

      <aside className="rolllog" aria-live="polite">
        <h3>Roll log</h3>
        {log.length === 0 ? <p className="muted">Click any bonus to roll.</p> : (
          <ul>{log.map((line, i) => <li key={i}>{line}</li>)}</ul>
        )}
      </aside>
    </main>
  )
}
