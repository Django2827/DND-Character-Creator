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
      <header className="app__header">
        <h1>Character Creator</h1>
        <label>
          Import content pack: <input type="file" accept=".json" onChange={onPackFile} />
        </label>
      </header>

      <Builder />

      <footer className="app__footer">
        This work includes material from the System Reference Document 5.1 and the System
        Reference Document 5.2 by Wizards of the Coast LLC, which are licensed under the
        Creative Commons Attribution 4.0 International License
        (https://creativecommons.org/licenses/by/4.0/legalcode). SRD data via the 5e-bits
        5e-database project.
      </footer>
    </>
  )
}

export default App
