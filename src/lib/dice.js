export function roll(sides = 20, count = 1) {
  const rolls = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides))
  return { rolls, total: rolls.reduce((a, b) => a + b, 0) }
}

// mode: 'normal' | 'adv' | 'dis'
export function rollD20(mode = 'normal') {
  const a = roll(20).total
  if (mode === 'normal') return { total: a, rolls: [a] }
  const b = roll(20).total
  return { total: mode === 'adv' ? Math.max(a, b) : Math.min(a, b), rolls: [a, b] }
}

// "2d6+3", "1d8", "8d6", and flat values like "1" or "1+3" -> { total, rolls, mod }
// (null if it isn't a dice expression)
export function rollExpr(expr) {
  const m = /^\s*(\d+)(?:d(\d+))?\s*([+-]\s*\d+)?\s*$/.exec(expr ?? '')
  if (!m) return null
  const mod = m[3] ? Number(m[3].replace(/\s/g, '')) : 0
  if (!m[2]) return { rolls: [], mod, total: Number(m[1]) + mod } // flat damage, e.g. a blowgun
  const { rolls, total } = roll(Number(m[2]), Number(m[1]))
  return { rolls, mod, total: total + mod }
}
