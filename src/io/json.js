import { downloadFile, safeName } from '../lib/download'
import { parseCharacter } from '../model/validate'
import { snapshotContent } from './snapshot'

export function characterPayload(character, compendium) {
  return { ...character, content: snapshotContent(character, compendium) }
}

export function exportJson(character, compendium) {
  downloadFile(
    `${safeName(character.name)}.json`,
    JSON.stringify(characterPayload(character, compendium), null, 2)
  )
}

export async function importCharacter(file) {
  const text = await file.text()
  let json
  if (file.name.toLowerCase().endsWith('.html')) {
    const match = text.match(
      /<script type="application\/json" id="character-data">([\s\S]*?)<\/script>/
    )
    if (!match) throw new Error('No character data found in that HTML file.')
    json = JSON.parse(match[1])
  } else {
    json = JSON.parse(text)
  }
  return parseCharacter(json)
}
