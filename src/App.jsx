import { useEffect } from 'react'
import { useCharacter } from './state/store'
import { loadPacks, savePack } from './content/packs'
import Builder from './builder/Builder'
import './App.css'

function App() {
  const setPacks = useCharacter((s) => s.setPacks)

  // load saved content packs from IndexedDB once at startup
  useEffect(() => {
    loadPacks().then(setPacks)
  }, [setPacks])

  async function onPackFile(e) {
    const file = e.target.files[0]
    if (!file) return
    try {
      await savePack(JSON.parse(await file.text()))
      setPacks(await loadPacks())
    } catch (err) {
      alert(`That file isn't a valid pack: ${err.message}`)
    }
    e.target.value = '' // lets you re-import the same file
  }

  return (
    <>
      <header>
        <label>
          Import content pack: <input type="file" accept=".json" onChange={onPackFile} />
        </label>
      </header>

      <Builder />

      <footer>
        {/* paste the exact attribution text from the SRD preamble here */}
      </footer>
    </>
  )
}

export default App
