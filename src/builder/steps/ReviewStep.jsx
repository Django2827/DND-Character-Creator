import { useCharacter } from '../../state/store'
import { useRules } from '../../state/useRules'
import Sheet from '../../sheet/Sheet'
import { exportJson, importCharacter } from '../../io/json'
import { exportHtml } from '../../io/html'

export default function ReviewStep() {
  const { character, ruleset, compendium, stats } = useRules()
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
      await exportHtml(character, ruleset, compendium)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <>
      <Sheet character={character} stats={stats} onStateChange={updateState} />

      <button onClick={() => exportJson(character, ruleset, compendium)}>Export JSON</button>
      <button onClick={onExportHtml}>Export HTML</button>
      <label>
        Import <input type="file" accept=".json,.html" onChange={onImport} />
      </label>
    </>
  )
}