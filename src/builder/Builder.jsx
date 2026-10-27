import { useState } from 'react'
import RulesStep from './steps/RulesStep'
import SpeciesStep from './steps/SpeciesStep'
import ReviewStep from './steps/ReviewStep'

// add class, background, abilities, skills, equipment here as you build them
const STEPS = [
  { id: 'rules', label: 'Rules', Component: RulesStep },
  { id: 'species', label: 'Species', Component: SpeciesStep },
  { id: 'review', label: 'Review', Component: ReviewStep },
]

export default function Builder() {
  const [step, setStep] = useState(0)
  const { Component } = STEPS[step]

  return (
    <div>
      <nav>
        {STEPS.map((s, i) => (
          <button key={s.id} onClick={() => setStep(i)} disabled={i === step}>
            {s.label}
          </button>
        ))}
      </nav>

      <Component />

      <button disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
      <button disabled={step === STEPS.length - 1} onClick={() => setStep(step + 1)}>Next</button>
    </div>
  )
}