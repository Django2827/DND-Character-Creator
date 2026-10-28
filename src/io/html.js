import { downloadFile, safeName } from '../lib/download'
import { characterPayload } from './json'

export async function exportHtml(character, compendium) {
  const res = await fetch(`${import.meta.env.BASE_URL}sheet-template.html`)
  if (!res.ok) throw new Error('Sheet template missing. Run: npm run build:viewer')
  const template = await res.text()

  // escape "<" so the data can never close the <script> tag early
  const json = JSON.stringify(characterPayload(character, compendium)).replace(/</g, '\\u003c')

  // a replacer function avoids "$&"-style patterns in the data being interpreted
  const html = template.replace('__CHARACTER_JSON__', () => json)
  downloadFile(`${safeName(character.name)}.html`, html, 'text/html')
}
