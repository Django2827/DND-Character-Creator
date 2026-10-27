import { z } from 'zod'
import { SCHEMA_VERSION } from './character'

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

// add an entry each time the schema changes: version N → N+1
const migrations = {
  // 1: (c) => ({ ...c, schemaVersion: 2, someNewField: [] }),
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