import { useCharacter } from '../../state/store'
import { useRules } from '../../state/useRules'
import Sheet from '../../sheet/Sheet'
import { exportJson, importCharacter } from '../../io/json'
import { exportHtml } from '../../io/html'

export default function ReviewStep() {
  const { character, compendium, stats } = useRules()
  const updateState = useCharacter((s) => s.updateState)
  const setCharacter = useCharacter((s) => s.setCharacter)

  async function onImport(e) {
    const file = e.target.files[0]
    if (!file) return
    try {
      setCharacter(await importCharacter(file))
    } catch (err) {
      alert(`Couldn't import that file: ${err.message}`)
    }
    e.target.value = ''
  }

  async function onExportHtml() {
    try {
      await exportHtml(character, compendium)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <>
      <Sheet character={character} stats={stats} compendium={compendium} onStateChange={updateState} />
      <p style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        <button onClick={() => exportJson(character, compendium)}>Export JSON</button>
        <button onClick={onExportHtml}>Export interactive HTML</button>
        <button onClick={() => window.print()}>Print</button>
        <label>
          Import (.json or .html): <input type="file" accept=".json,.html" onChange={onImport} />
        </label>
      </p>
    </>
  )
}
