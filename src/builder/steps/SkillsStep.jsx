import { useCharacter } from '../../state/store'
import { useRules } from '../../state/useRules'
import { SKILLS, ABILITY_NAMES, titleCase } from '../../rules/shared'

export default function SkillsStep() {
  const { character, compendium, stats } = useRules()
  const update = useCharacter((s) => s.update)
  const cls = compendium.classes?.[character.classes[0]?.id]
  const classOptions = cls?.skillChoices?.from ?? []
  const allowed = cls?.skillChoices?.choose ?? 0
  const chosenFromClass = character.skills.filter((s) => classOptions.includes(s)).length

  const toggle = (skill) =>
    update({
      skills: character.skills.includes(skill)
        ? character.skills.filter((s) => s !== skill)
        : [...character.skills, skill],
    })

  return (
    <>
      <h2>Skills</h2>
      {cls ? (
        <p className={chosenFromClass > allowed ? 'warn' : chosenFromClass === allowed ? 'ok' : ''}>
          {cls.name}: {chosenFromClass} / {allowed} class skills chosen (marked ★).
        </p>
      ) : (
        <p className="muted">Pick a class to see its skill choices.</p>
      )}
      <p>Skills from your species and background are locked on. Use the other boxes for anything else you gain, like feats.</p>

      <div className="chips" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
        {Object.entries(SKILLS).map(([skill, ability]) => {
          const granted = stats.grantedSkills.includes(skill)
          return (
            <label key={skill}>
              <input
                type="checkbox"
                checked={granted || character.skills.includes(skill)}
                disabled={granted}
                onChange={() => toggle(skill)}
              />{' '}
              {titleCase(skill)} <small>({ABILITY_NAMES[ability].slice(0, 3)})</small>
              {classOptions.includes(skill) && ' ★'}
              {granted && ' (granted)'}
            </label>
          )
        })}
      </div>
    </>
  )
}
