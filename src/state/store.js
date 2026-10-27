import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { newCharacter } from '../model/character'

export const useCharacter = create(
  persist(
    (set) => ({
      character: newCharacter('2024'),
      packs: [],                       // loaded from IndexedDB at startup, not persisted here
      update: (patch) => set((s) => ({ character: { ...s.character, ...patch } })),
      updateState: (patch) =>
        set((s) => ({
          character: { ...s.character, state: { ...s.character.state, ...patch } },
        })),
      setCharacter: (character) => set({ character }),
      setPacks: (packs) => set({ packs }),
    }),
    { name: 'dnd-character', partialize: (s) => ({ character: s.character }) }
  )
)