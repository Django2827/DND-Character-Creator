import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { newCharacter } from '../model/character'

export const useCharacter = create(
  persist(
    (set) => ({
      character: newCharacter('2024'),
      packs: [], // content packs loaded from IndexedDB at startup (not persisted here)

      update: (patch) => set((s) => ({ character: { ...s.character, ...patch } })),
      updateDetails: (patch) =>
        set((s) => ({
          character: { ...s.character, details: { ...s.character.details, ...patch } },
        })),
      updateState: (patch) =>
        set((s) => ({
          character: { ...s.character, state: { ...s.character.state, ...patch } },
        })),
      setCharacter: (character) => set({ character }),
      newCharacter: (ruleset) => set({ character: newCharacter(ruleset) }),
      setPacks: (packs) => set({ packs }),
    }),
    {
      name: 'dnd-character',
      version: 2,
      partialize: (s) => ({ character: s.character }),
      // the character format changed in v2: start fresh rather than load a broken one
      migrate: () => ({ character: newCharacter('2024') }),
    }
  )
)
