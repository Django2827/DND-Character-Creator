import { get, set } from 'idb-keyval'
import { z } from 'zod'

const PackSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  source: z.string().optional(), // book or origin, shown in the UI
  ruleset: z.enum(['2014', '2024']).nullable().optional(),
  content: z.record(z.string(), z.record(z.string(), z.any())),
})

const KEY = 'content-packs'

export async function loadPacks() {
  return (await get(KEY)) ?? []
}

export async function savePack(raw) {
  const pack = PackSchema.parse(raw)
  const others = (await loadPacks()).filter((p) => p.id !== pack.id)
  await set(KEY, [...others, pack])
  return pack
}

export async function removePack(id) {
  await set(KEY, (await loadPacks()).filter((p) => p.id !== id))
}
