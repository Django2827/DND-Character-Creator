import data from './data.json'

export default {
  id: '2024',
  label: 'D&D 2024 (5.5e)',
  data,
  // +2/+1 or +1/+1/+1 from the background; the builder validates the choice
  abilityBonuses(character) {
    return character.originBonuses ?? {}
  },
}