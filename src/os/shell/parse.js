// Splits a command line into words, honoring single and double quotes ("cat 'my file'")
export function tokenize(line) {
  const tokens = []
  let current = ''
  let quote = null
  let inToken = false

  for (const char of line) {
    if (quote) {
      if (char === quote) quote = null
      else current += char
    } else if (char === '"' || char === "'") {
      quote = char
      inToken = true
    } else if (/\s/.test(char)) {
      if (inToken) {
        tokens.push(current)
        current = ''
        inToken = false
      }
    } else {
      current += char
      inToken = true
    }
  }
  if (inToken) tokens.push(current)
  return tokens
}

export function parse(line) {
  const [name, ...args] = tokenize(line.trim())
  return name === undefined ? null : { name, args }
}

// "-la" → flags {l, a}; a lone "-" (as in `cd -`) stays an operand
export function splitFlags(args) {
  const flags = new Set()
  const operands = []
  for (const arg of args) {
    if (/^-[a-zA-Z]+$/.test(arg)) [...arg.slice(1)].forEach((flag) => flags.add(flag))
    else operands.push(arg)
  }
  return { flags, operands }
}
