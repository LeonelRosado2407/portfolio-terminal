// Levenshtein distance with a single rolling row
export function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const above = row[j]
      row[j] = Math.min(above + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1))
      diagonal = above
    }
  }
  return row[b.length]
}

// Closest candidate within `max` edits, or null ("lss" → "ls")
export function suggest(input, candidates, max = 2) {
  const needle = input.toLowerCase()
  let best = null
  let bestScore = max + 1
  for (const candidate of candidates) {
    const score = distance(needle, candidate)
    if (score < bestScore) {
      best = candidate
      bestScore = score
    }
  }
  return best
}
