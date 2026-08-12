export type Token = {
  type: 'word' | 'other'
  value: string
}

const WORD_REGEX = /\p{L}+/gu

export function tokenizeText(text: string): Token[] {
  const tokens: Token[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  WORD_REGEX.lastIndex = 0

  match = WORD_REGEX.exec(text)
  while (match !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'other', value: text.slice(lastIndex, match.index) })
    }

    tokens.push({ type: 'word', value: match[0] })
    lastIndex = match.index + match[0].length

    match = WORD_REGEX.exec(text)
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'other', value: text.slice(lastIndex) })
  }

  return tokens
}
