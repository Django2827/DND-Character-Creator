import { useState } from 'react'
import { ABILITIES, SKILLS, fmt } from '../rules/shared'
import { roll } from '../lib/dice'

export default function Sheet({ character, stats, onStateChange }) {
  const [log, setLog] = useState([])
  const hp = character.state.currentHp ?? stats.maxHp

  function check(label, bonus) {
    const { total } = roll(20)
    setLog((l) => [`${label}: ${total} ${fmt(bonus)} = ${total + bonus}`, ...l].slice(0, 8))
  }

  return (
    <main className="sheet">
      <h1>{character.name || 'Unnamed character'}</h1>

      <section className="vitals">
        <div>AC {stats.ac}</div>
        <div>Initiative {fmt(stats.initiative)}</div>
        <div>Speed {stats.speed}</div>
        <div>Proficiency {fmt(stats.prof)}</div>
        <div>
          HP {hp} / {stats.maxHp}
          <button onClick={() => onStateChange({ currentHp: Math.max(0, hp - 1) })}>−</button>
          <button onClick={() => onStateChange({ currentHp: Math.min(stats.maxHp, hp + 1) })}>+</button>
        </div>
      </section>

      <section className="abilities">
        {ABILITIES.map((a) => (
          <button key={a} onClick={() => check(`${a.toUpperCase()} check`, stats.mods[a])}>
            {a.toUpperCase()} {stats.scores[a]} ({fmt(stats.mods[a])})
          </button>
        ))}
      </section>

      <section className="skills">
        {Object.keys(SKILLS).map((skill) => (
          <button key={skill} onClick={() => check(skill, stats.skills[skill])}>
            {skill} {fmt(stats.skills[skill])}
          </button>
        ))}
      </section>

      {stats.spellSlots.length > 0 && (
        <section className="slots">
          <p>Save DC {stats.spellSaveDc} · Attack {fmt(stats.spellAttack)}</p>
          {stats.spellSlots.map((count, i) => {
            const used = character.state.spellSlotsUsed?.[i + 1] ?? 0
            return (
              <div key={i}>
                Level {i + 1}:{' '}
                {Array.from({ length: count }, (_, n) => (
                  <input
                    key={n}
                    type="checkbox"
                    checked={n < used}
                    onChange={() =>
                      onStateChange({
                        spellSlotsUsed: {
                          ...character.state.spellSlotsUsed,
                          [i + 1]: n < used ? n : n + 1,
                        },
                      })
                    }
                  />
                ))}
              </div>
            )
          })}
        </section>
      )}

      <ul className="log">
        {log.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </main>
  )
}