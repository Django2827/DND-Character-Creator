export function roll(sides = 20, count = 1) {
  const rolls = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides))
  return { rolls, total: rolls.reduce((a, b) => a + b, 0) }
}