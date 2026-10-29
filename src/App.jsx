import { useEffect, useState } from 'react'
import { useCharacter } from './state/store'
import { loadPacks, savePack } from './content/packs'
import Builder from './builder/Builder'
import PackEditor from './packs/PackEditor'
import './App.css'

function App() {
  const setPacks = useCharacter((s) => s.setPacks)
  const [view, setView] = useState('builder') // 'builder' | 'homebrew'

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
        <nav style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setView('builder')} aria-current={view === 'builder' ? 'step' : undefined}>Character</button>
          <button onClick={() => setView('homebrew')} aria-current={view === 'homebrew' ? 'step' : undefined}>Homebrew</button>
        </nav>
        <label>
          Import content pack: <input type="file" accept=".json" onChange={onPackFile} />
        </label>
      </header>

      {view === 'builder' ? <Builder /> : <PackEditor />}

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
