import data from './data.json'

export default {
  id: '2014',
  label: 'D&D 5e (2014)',
  data,
  abilityBonuses(character, compendium) {
    return compendium.species?.[character.species]?.abilityBonuses ?? {}
  },
}