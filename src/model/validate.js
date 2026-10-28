import { z } from 'zod'
import { SCHEMA_VERSION, newCharacter, emptyDetails, emptyState } from './character'

const CharacterSchema = z
  .object({
    schemaVersion: z.number(),
    ruleset: z.enum(['2014', '2024']),
    name: z.string(),
    classes: z.array(z.object({ id: z.string().nullable(), level: z.number() }).passthrough()),
    abilityScores: z.record(z.string(), z.number()),
    state: z.object({}).passthrough(),
  })
  .passthrough()

// one entry per schema change: version N -> N+1
const migrations = {
  // v1 -> v2: subspecies, details, content snapshot, richer play state
  1: (c) => ({
    ...newCharacter(c.ruleset),
    ...c,
    schemaVersion: 2,
    subspecies: c.subspecies ?? null,
    details: { ...emptyDetails(), ...c.details },
    content: c.content ?? c.customContent ?? {},
    state: { ...emptyState(), ...c.state },
  }),
}

export function parseCharacter(json) {
  let c = CharacterSchema.parse(json)
  if (c.schemaVersion > SCHEMA_VERSION) {
    throw new Error('This file was made with a newer version of the builder.')
  }
  while (c.schemaVersion < SCHEMA_VERSION) {
    const fn = migrations[c.schemaVersion]
    if (!fn) throw new Error(`No migration from version ${c.schemaVersion}.`)
    c = fn(c)
  }
  return c
}
