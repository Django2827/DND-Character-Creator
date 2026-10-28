import { useState } from 'react'
import RulesStep from './steps/RulesStep'
import SpeciesStep from './steps/SpeciesStep'
import ClassStep from './steps/ClassStep'
import BackgroundStep from './steps/BackgroundStep'
import AbilitiesStep from './steps/AbilitiesStep'
import SkillsStep from './steps/SkillsStep'
import EquipmentStep from './steps/EquipmentStep'
import SpellsStep from './steps/SpellsStep'
import DetailsStep from './steps/DetailsStep'
import ReviewStep from './steps/ReviewStep'

const STEPS = [
  { id: 'rules', label: 'Rules', Component: RulesStep },
  { id: 'species', label: 'Species', Component: SpeciesStep },
  { id: 'class', label: 'Class', Component: ClassStep },
  { id: 'background', label: 'Background', Component: BackgroundStep },
  { id: 'abilities', label: 'Abilities', Component: AbilitiesStep },
  { id: 'skills', label: 'Skills', Component: SkillsStep },
  { id: 'equipment', label: 'Equipment', Component: EquipmentStep },
  { id: 'spells', label: 'Spells', Component: SpellsStep },
  { id: 'details', label: 'Details', Component: DetailsStep },
  { id: 'sheet', label: 'Sheet', Component: ReviewStep },
]

export default function Builder() {
  const [step, setStep] = useState(0)
  const { Component } = STEPS[step]
  const onSheet = STEPS[step].id === 'sheet'

  return (
    <div className="builder">
      <nav className="builder__nav" aria-label="Builder steps">
        {STEPS.map((s, i) => (
          <button key={s.id} onClick={() => setStep(i)} aria-current={i === step ? 'step' : undefined}>
            {i + 1}. {s.label}
          </button>
        ))}
      </nav>

      {onSheet ? <Component /> : <section className="step"><Component /></section>}

      <div className="builder__pager">
        <button disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
        <button disabled={step === STEPS.length - 1} onClick={() => setStep(step + 1)}>Next</button>
      </div>
    </div>
  )
}
